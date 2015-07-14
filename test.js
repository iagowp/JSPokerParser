var expect = require('chai').expect;
var handParser = require('./parser.js').handParser;
var testHands = require('./testHands').testHands;

describe("About Expects", function() {

  var hand1 = handParser(testHands[0]);
  var hand2 = handParser(testHands[1]);

  it("should learn where the hand came from" ,function(){
    expect(hand1.platforms === "PS").to.be.true;
  });

  it("should learn the game style" ,function(){
    expect(hand1.gameStyle).to.equal("Hold'em No Limit");
  });

  it("should learn the ammount of players" ,function(){
    expect(hand1.players.length).to.equal(6);
  });

  it("should learn the ammount of chips players have" ,function(){
    expect(hand1.players[0][1]).to.equal(500);
  });

  it("should learn the flop cards" ,function(){
    expect(hand1.flop).to.eql(["8c", "2d", "6s"]);
  });

  it("should learn the turn card", function(){
    expect(hand2.turn).to.equal("Ac");
  });


});
