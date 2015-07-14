var expect = require('chai').expect;
var handParser = require('./parser.js').handParser;
var testHands = require('./testHands').testHands;

describe("About Expects", function() {

  


var parsedHand = handParser(testHands[0]);
var parsedHand2 = handParser(testHands[1]);

  it("should learn where the hand came from" ,function(){
    expect(parsedHand.platforms === "PS").to.be.true;
  });

  it("should learn the game style" ,function(){
    expect(parsedHand.gameStyle).to.equal("Hold'em No Limit");
  });

  it("should learn the ammount of players" ,function(){
    expect(parsedHand.players.length).to.equal(6);
  });

  it("should learn the ammount of chips players have" ,function(){
    expect(parsedHand.players[0][1]).to.equal(500);
  });

  it("should learn the flop cards" ,function(){
    expect(parsedHand.flop).to.eql(["8c", "2d", "6s"]);
  });

  it("should learn the turn card", function(){
    expect(parsedHand2.turn).to.equal("Ac");
  });


});
