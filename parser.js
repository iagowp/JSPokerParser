exports.handParser = function(handHistory){
  // object with all the relevant info to be displayed
  var parsedHand = {};

  handHistory = handHistory.split("/n");
  metaHand = handHistory[0];
  // prepare for other platforms
  if(metaHand.indexOf('PokerStars') !== -1) parsedHand.platforms = "PS";
  // prepare for different styles
  parsedHand.gameStyle = metaHand.indexOf("Hold'em No Limit") != -1 ? "Hold'em No Limit" : false;

  var row = 2;

  parsedHand.players =[];
  // create a new function for this
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

  var ownHand = handHistory[++row].split('[');
  ownHand = ownHand[ownHand.length-1].substring(0, 5).split(" ");

  parsedHand.hands = [ownHand];

  // todo: check if there are other hands available

  //advance to the next event
  while( handHistory[row].indexOf("*** ") !== 0 ){
    row++;
  }

  //check if there's a FLOP
  if(handHistory[row].indexOf("FLOP") !== -1){
    parsedHand.flop = handHistory[row].split('[');
    parsedHand.flop = parsedHand.flop[1].substring(0, 8).split(" ");
    parsedHand.table = parsedHand.flop.slice();
    row++;

    // advance to the next event
    while( handHistory[row].indexOf("*** ") !== 0 ){
      row++;
    }

    // check if there's a TURN
    if( handHistory[row].indexOf("TURN") === 4){
      parsedHand.turn = handHistory[row].split('[');
      parsedHand.turn = parsedHand.turn[2].substring(0, 2);
      parsedHand.table.push(parsedHand.turn);
      row++;


      // advance to the next event
      while( handHistory[row].indexOf("*** ") !== 0 ){
        row++;
      }

      // check if there's a RIVER
      if( handHistory[row].indexOf("RIVER") === 4){
        parsedHand.river = handHistory[row].split('[');
        parsedHand.river = parsedHand.river[2].substring(0, 2);
        parsedHand.table.push(parsedHand.river);
        row++;
      }

    }

  }
  

  return parsedHand;
}