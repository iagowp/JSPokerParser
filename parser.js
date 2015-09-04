var handParser = function(handHistory){
  // object with all the relevant info to be displayed
  var parsedHand = {};
  parsedHand.platforms = parsedHand.gameStyle = parsedHand.language = parsedHand.turn = parsedHand.river = "";
  // todo: refactor players to use objects called players inside the array. object should contain name, chips properties and hand if available
  parsedHand.players = [];
  parsedHand.ownHand = [];
  parsedHand.preFlopActions = [];
  parsedHand.table = [];
  parsedHand.flop = [];
  parsedHand.flopActions = [];
  parsedHand.turnActions = [];
  parsedHand.riverActions = [];

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

  handHistory = handHistory.split("\n");
  var metaHand = handHistory[0];

  // need to prepare for other platforms
  if(metaHand.indexOf('PokerStars') !== -1) parsedHand.platforms = "PS";
  // need prepare for different styles
  parsedHand.gameStyle = metaHand.indexOf("Hold'em No Limit") !== -1 ? "Hold'em No Limit" : false;
  // need to improve this part
  parsedHand.gameStyle = parsedHand.gameStyle || "Omaha Pot Limit";
  parsedHand.language = handHistory[1].indexOf("Mesa") === 0 ? 'pt' : 'en'

  var row = 2;

  if(parsedHand.language === 'en'){

    //prevent rebuys from getting in the way
    while( handHistory[row].indexOf('re-buys and receives') !== -1 ){
      row++;
    }

    while( handHistory[row].indexOf('Seat ') === 0 ){
      var endOfNumber = handHistory[row].indexOf(' in chips');
      var numIndex = endOfNumber;
      while( handHistory[row][numIndex] !== '('){
        numIndex--;
      }
      var chips = handHistory[row].substring(numIndex +1, endOfNumber);

      parsedHand.players.push(["player " + (parsedHand.players.length+1), chips]);
      row++;
    }

    //advance to the hand row, needs to save actions
    while( handHistory[row].indexOf(" ") !== 0 && handHistory[row].indexOf("*** ") !== 0){
      parsedHand.preFlopActions.push(handHistory[row]);
      row++;
    }

    // treating for when no hand is initially known
    if(handHistory[row+1].indexOf('Dealt to') === 0){
      var ownHand = handHistory[++row].split('[');
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

  } else {
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
  }

  return parsedHand;
}

exports.handParser = handParser;