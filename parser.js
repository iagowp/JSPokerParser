var _ = require('underscore');

var parsedHand;
var bigBlindName;

var Player = function(name, chips){
  this.name = name;
  // force it to string so it has a return pattern, regardless if chips is cash, indicated by $ or just chips
  this.chips = chips + "";
  this.position = "";
  this.hand = [];
  this.invested = 0;
};

var TABLEMAP = ['BB', 'SB', 'BTN', 'CO', 'HJ', 'MP+1', 'MP', 'UTG+1', 'UTG'];

// poorly tested
var mapPlayers = function(players, bigBlindName){
  var i = 0;
  while(players[i].name !== bigBlindName){
    i++;
  }

  for(var j = 0; j < players.length; j++){
    // send i to the end of the array
    if(i < 0) i = players.length-1;
    players[i].position = TABLEMAP[j];
    i--;
  }
};

var createParsedHand = function(){
  // object with all the relevant info to be displayed
  var parsedHand = {};
  parsedHand.platforms = parsedHand.gameStyle = parsedHand.language = parsedHand.turn = parsedHand.river = parsedHand.pot = parsedHand.ante = parsedHand.blinds = "";

  parsedHand.flopPot = parsedHand.turnPot = parsedHand.riverPot = 0
  // todo: refactor players to use objects called players inside the array. object should contain name, chips properties and hand if available
  parsedHand.players = [];
  parsedHand.ownHand = [];
  parsedHand.preFlopActions = [];
  parsedHand.table = [];
  parsedHand.flop = [];
  parsedHand.flopActions = [];
  parsedHand.turnActions = [];
  parsedHand.riverActions = [];
  parsedHand.hero = {};
  return parsedHand;
};

var checkRunTwice = function(parsedHand, handHistory){
  // indexof is faster
  // regex to search for a hand was run twice on the whole text
  var runTwiceRegex = /Hand was run twice/ig;
  parsedHand.runTwice = runTwiceRegex.test(handHistory);
  // in case its a run it twice
  if(parsedHand.runTwice){
    parsedHand.secondFlop = [];
    parsedHand.secondTurn = "";
    parsedHand.secondRiver = "";
  }
};

// not being tested
var getPot = function(parsedHand ,handHistory){
  // var potRegex = /.+collected \$?\w+(\.\w\w)? from (side |main )?pot/g;
  var potRegex = /Total pot \$?\d+(\.\d\d)? \| Rake \$?\d(\.\d\d)?/ig
  var match = handHistory.match(potRegex)
  // not tested
  if(!match) return null;
  parsedHand.pot = match[0] +".";
};


var prepareHandHistory = function(handHistory){
  // not being tested
  if(handHistory.indexOf("\n") === -1) return null;
  //not being tested
  var bigBlindRegex = /(.+)\: posts big blind/g
  bigBlindName = bigBlindRegex.exec(handHistory)[1];

  handHistory = handHistory.split("\n");
  // not being tested
  if(handHistory[0].indexOf("file") !== -1 || handHistory[0].indexOf("File") !== -1){
    handHistory.shift();
  }
  return handHistory;
};

var getHandIdentifier = function(handHistory){
  return handHistory[0];
};

// accepting only hold'em and no limit
var getHandStyle = function(handIdentifier){
  if(handIdentifier.indexOf("Hold'em No Limit") !== -1){
    return "Hold'em No Limit";
  } else if(handIdentifier.indexOf("Omaha Pot Limit") !== -1){
    return "Omaha Pot Limit";
  } else {
    return false;
  }
};

// not tested
var getBlinds = function(handIdentifier){
  var blindsRegex = /\((.+)\)/;
  parsedHand.blinds = blindsRegex.exec(handIdentifier)[1];
};


var config = function(handHistory){
  parsedHand = createParsedHand();

  checkRunTwice(parsedHand, handHistory);

  getPot(parsedHand, handHistory);

  return prepareHandHistory(handHistory);
};

// not tested
var findHero = function(players, text){
  var hero = text.substring(9, text.length-1);
  for(var i = 0; i < players.length; i++){
    if(players[i].name === hero){
      parsedHand.hero = players[i];
      break;
    }
  }
};

// go throgh all actions, and find out the value of the pot
var updatePot = function(players, actions, pot){
  // todo: refactor handle functions into a single function changing regex depending on a argument with the action
  var handlePosts = function(text){
    var postsRegex = /blind \$?(\d+\.?\d?\d?)/;
    var textvalue = postsRegex.exec(text)[1];
    return parseFloat(textvalue, 10);
  };

  var handleCalls = function(text){
    var callsRegex = /calls \$?(\d+\.?\d?\d?)/;
    var textvalue = callsRegex.exec(text)[1];
    return parseFloat(textvalue, 10);
  };

  var handleRaises = function(text){
    var raisesRegex = /\d to \$?(\d+\.?\d?\d?)/;
    var textvalue = raisesRegex.exec(text)[1];
    return parseFloat(textvalue, 10);
  };

  var handleBets = function(text){
    var betsRegex = /bets \$?(\d+\.?\d?\d?)/;
    var textvalue = betsRegex.exec(text)[1];
    return parseFloat(textvalue, 10);
  };

  // sort by the name of the player, not loosing original order of actions from same player
  var orderedActions = _.sortBy(actions, function(action){
    return action.split(": ")[0];
  });

  var currentPlayer = orderedActions[0].split(": ")[0];
  var currentSum = 0;


  _.forEach(orderedActions, function(val){
    if(val.indexOf('folds') !== -1) return null;

    if(val.split(": ")[0] !== currentPlayer){
      pot += currentSum;
      // todo: update the player with the ammount invested in the pot so far
      currentPlayer = val.split(": ")[0];
      currentSum = 0;
    }

    if(val.indexOf('posts') !== -1) {
      currentSum += handlePosts(val);
    } else if(val.indexOf('calls') !== -1) {
      currentSum += handleCalls(val);
    } else if(val.indexOf('raises') !== -1) {
      // not += because its easier to just get the final value its raised to
      currentSum = handleRaises(val);
    } else if(val.indexOf('bets') !== -1){
      currentSum += handleBets(val);
    }

  });

  pot += currentSum;

  return pot;
};


// TODO: make it oop
// TODO: Ignore 'uncalled bet' and 'collected from pot' on actions
// TODO: make tests for errors
var handParser = function(handHistory){ 
  handHistory =  config(handHistory);

  var partialPot = 0;

  // if handHistory is not a valid input, return null; not being tested
  // TODO: better error feedback
  if(!handHistory) return null;

  var handIdentifier = getHandIdentifier(handHistory);

  // TODO: prepare code for other platforms
  if(handIdentifier.indexOf('PokerStars') !== -1){
    parsedHand.platforms = "PS"
  } else {
    // if platform is not identified, not being tested
    return null;
  }

  getBlinds(handIdentifier);


  // TODO: prepare for different styles
  // need to improve this part
  parsedHand.gameStyle = getHandStyle(handIdentifier);
  // TODO: need to test for a input of an unidentified game style
  if(!parsedHand.gameStyle) return null;


  parsedHand.language = handHistory[1].indexOf("Hand") !== -1 ? null  : 'en';

  var row = 2;

  if(parsedHand.language === 'en'){
    //prevent rebuys from getting in the way
    while( handHistory[row].indexOf('re-buys and receives') !== -1 ){
      row++;
    }

    var player;
    var chips;
    while( handHistory[row].indexOf('Seat ') === 0 ){
      // TODO: Get chips with a regex the same regex used to get the player
      var endOfNumber = handHistory[row].indexOf(' in chips');
      var numIndex = endOfNumber;
      while( handHistory[row][numIndex] !== '('){
        numIndex--;
      }
      chips = handHistory[row].substring(numIndex +1, endOfNumber);

      var playerRegex = /Seat \w\: (.+) \(\$?\w+/;
      playerName = playerRegex.exec(handHistory[row])[1];

      player = new Player(playerName, chips);
      parsedHand.players.push(player);
      row++;
    }

    mapPlayers(parsedHand.players, bigBlindName);


    //advance to the hand row, needs to save actions
    while( handHistory[row].indexOf(" ") !== 0 && handHistory[row].indexOf("*** ") !== 0){
      // ignores ante
      if( handHistory[row].indexOf("posts the ante") === -1){
        parsedHand.preFlopActions.push(handHistory[row]);
      } else if(!parsedHand.ante) {
        var anteRegex = /posts the ante (\w+)/i;
        parsedHand.ante = anteRegex.exec(handHistory[row])[1];
        partialPot = parseInt(parsedHand.ante, 10) * parsedHand.players.length;
      }
      row++;
    }

    // treating for when no hand is initially known
    if(handHistory[row+1].indexOf('Dealt to') === 0){
      var ownHand = handHistory[++row].split('[');

      findHero(parsedHand.players, ownHand[0]);

      if(parsedHand.gameStyle == 'Omaha Pot Limit'){
        parsedHand.ownHand = ownHand[ownHand.length-1].substring(0, 11).split(" ");
      } else {
        parsedHand.ownHand = ownHand[ownHand.length-1].substring(0, 5).split(" ");
      }
    }
    
    row++;

    //advance to the next event
    while( handHistory[row].indexOf(" ") !== 0 && handHistory[row].indexOf("*** ") !== 0 ){
      parsedHand.preFlopActions.push(handHistory[row]);
      row++;
    }

    // todo: test this
    parsedHand.flopPot = updatePot(parsedHand.players, parsedHand.preFlopActions, partialPot)
    parsedHand.riverPot = parsedHand.turnPot = parsedHand.flopPot

    //check if there's a FLOP
    if(handHistory[row].indexOf("FLOP") !== -1){
      //get the FLOP cards
      parsedHand.flop = handHistory[row].split('[');
      parsedHand.flop = parsedHand.flop[1].substring(0, 8).split(" ");
      parsedHand.table = parsedHand.flop.slice();
      row++;

      // advance to the next event
      while( handHistory[row].indexOf(" ") !== 0 && handHistory[row].indexOf("*** ") !== 0 ){
        parsedHand.flopActions.push(handHistory[row]);
        row++;
      }

      // todo: test this
      if(parsedHand.flopActions.length){
        parsedHand.riverPot = parsedHand.turnPot = updatePot(parsedHand.players, parsedHand.flopActions, parsedHand.flopPot);
      }

      // check if there's a TURN
      if( handHistory[row].indexOf("TURN") !== -1){
        //get the TURN card
        parsedHand.turn = handHistory[row].split('[');
        parsedHand.turn = parsedHand.turn[2].substring(0, 2);
        parsedHand.table.push(parsedHand.turn);
        row++;

        // advance to the next event
        while( handHistory[row].indexOf(" ") !== 0 && handHistory[row].indexOf("*** ") !== 0 ){
          parsedHand.turnActions.push(handHistory[row]);
          row++;
        }

        // todo: test this
        if(parsedHand.turnActions.length){
          parsedHand.riverPot = updatePot(parsedHand.players, parsedHand.turnActions, parsedHand.turnPot);
        }

        if( handHistory[row].indexOf("RIVER") !== -1){
          //get the RIVER card
          parsedHand.river = handHistory[row].split('[');
          parsedHand.river = parsedHand.river[2].substring(0, 2);
          parsedHand.table.push(parsedHand.river);
          row++;

          // advance to the next event
          while( handHistory[row].indexOf(" ") !== 0 && handHistory[row].indexOf("*** ") !== 0){
            parsedHand.riverActions.push(handHistory[row]);
            row++;
          }

          // get the others if it was a run in twice
          if(parsedHand.runTwice){
            // check if there is a second flop
            if(handHistory[row].indexOf("FLOP") !== -1){
              parsedHand.secondFlop = handHistory[row].split('[');
              parsedHand.secondFlop = parsedHand.secondFlop[1].substring(0, 8).split(" ");
              row++;
            }

            // check if there is a second turn
            if(handHistory[row].indexOf("TURN") !== -1){
              //get the TURN card
              parsedHand.secondTurn = handHistory[row].split('[');
              parsedHand.secondTurn = parsedHand.secondTurn[2].substring(0, 2);
              row++;
            }

            // doesnt need to check, there will always be a second river
            parsedHand.secondRiver = handHistory[row].split('[');
            parsedHand.secondRiver = parsedHand.secondRiver[2].substring(0, 2);
            row++;

          }
        }
      }
    }
    // commented portuguese code for now, so it reduces complexity while developing new features and refactoring code
  } /* else {
    // code for portuguese
    // need to create a new function for this
    while( handHistory[row].indexOf('Lugar ') === 0 ){
      var endOfNumber = handHistory[row].indexOf(' em fichas');
      var numIndex = endOfNumber;
      while( handHistory[row][numIndex] !== '('){
        numIndex--;
      }

      var chips = Number(handHistory[row].substring(numIndex +1, endOfNumber))

      parsedHand.players.push(["player " + (parsedHand.players.length+1), chips]);
      row++;
    }

    //advance to the hand row
    while( handHistory[row].indexOf("*** ") !== 0 ){
      row++;
    }

    // need to be prepared for hand history where no hand is known

    // this part is not correct TODO

    // var ownHand = handHistory[++row].split('[');
    // ownHand = ownHand[ownHand.length-1].substring(0, 5).split(" ");

    // parsedHand.hands.push(ownHand);

    // filling in
    row++;
    // delete ^^

    // todo: check if there are other hands available

    //advance to the next event
    while( handHistory[row].indexOf("*** ") !== 0 ){
      parsedHand.preFlopActions.push(handHistory[row]);
      row++;
    }

    //check if there's a FLOP
    if(handHistory[row].indexOf("FLOP") !== -1){
      //get the FLOP cards
      parsedHand.flop = handHistory[row].split('[');
      parsedHand.flop = parsedHand.flop[1].substring(0, 8).split(" ");
      parsedHand.table = parsedHand.flop.slice();
      row++;

      // advance to the next event
      while( handHistory[row].indexOf("*** ") !== 0 ){
        parsedHand.flopActions.push(handHistory[row]);
        row++;
      }

      // check if there's a TURN
      if( handHistory[row].indexOf("TURN") === 4){
        //get the TURN card
        parsedHand.turn = handHistory[row].split('[');
        parsedHand.turn = parsedHand.turn[2].substring(0, 2);
        parsedHand.table.push(parsedHand.turn);
        row++;


        // advance to the next event
        while( handHistory[row].indexOf("*** ") !== 0 ){
          parsedHand.turnActions.push(handHistory[row]);
          row++;
        }

        // check if there's a RIVER
        if( handHistory[row].indexOf("RIVER") === 4){
          //get the RIVER card
          parsedHand.river = handHistory[row].split('[');
          parsedHand.river = parsedHand.river[2].substring(0, 2);
          parsedHand.table.push(parsedHand.river);
          row++;

          // advance to the next event
          while( handHistory[row].indexOf("*** ") !== 0 ){
            parsedHand.riverActions.push(handHistory[row]);
            row++;
          }

        }

      }

    }
  } */

  return parsedHand;
}

exports.Player = Player;
exports.createParsedHand = createParsedHand;
exports.checkRunTwice = checkRunTwice;
exports.prepareHandHistory = prepareHandHistory;
exports.getHandIdentifier = getHandIdentifier;
exports.getHandStyle = getHandStyle;
exports.handParser = handParser;