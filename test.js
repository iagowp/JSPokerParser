var expect = require('chai').expect;
var handParser = require('./parser').handParser;
var testHands = require('./testHands').testHands;

var createParsedHand = require('./parser').createParsedHand;

describe("About Expects", function() {

  var hand1 = handParser(testHands[0]);
  var hand2 = handParser(testHands[1]);
  var hand3 = handParser(testHands[2]);
  var hand4 = handParser(testHands[3]);
  var hand5 = handParser(testHands[4]);

  // omaha
  var hand6 = handParser(testHands[5]);
  var hand7 = handParser(testHands[6]);

  // run it twice
  var hand8 = handParser(testHands[7]);

  it("should learn where the hand came from" ,function(){
    expect(hand1.platforms === "PS").to.be.true;
    expect(hand3.platforms === "PS").to.be.true;
    expect(hand4.platforms === "PS").to.be.true;
    expect(hand6.platforms === "PS").to.be.true;
  });

  it("should learn the game style" ,function(){
    expect(hand1.gameStyle).to.equal("Hold'em No Limit");
    expect(hand3.gameStyle).to.equal("Hold'em No Limit");
    expect(hand4.gameStyle).to.equal("Hold'em No Limit");
    expect(hand5.gameStyle).to.equal("Hold'em No Limit");
    expect(hand6.gameStyle).to.equal("Omaha Pot Limit");
    expect(hand7.gameStyle).to.equal("Omaha Pot Limit");
  });

  it("should learn the game's language", function(){
    expect(hand1.language).to.equal("pt");
    expect(hand2.language).to.equal("pt");
    expect(hand3.language).to.equal("en");
    expect(hand4.language).to.equal("en");
    expect(hand5.language).to.equal("en");
    expect(hand6.language).to.equal("en");
  });

  it("should learn the ammount of players" ,function(){
    expect(hand1.players.length).to.equal(6);
    expect(hand2.players.length).to.equal(2);
    expect(hand3.players.length).to.equal(4);
    expect(hand4.players.length).to.equal(9);
    expect(hand6.players.length).to.equal(6);
    expect(hand7.players.length).to.equal(6);
  });

  it("should learn the ammount of chips players have" ,function(){
    expect(hand1.players[0][1]).to.equal(500);
    expect(hand2.players[0][1]).to.equal(1140);
    expect(hand3.players[0][1]).to.equal('$574.70');
    expect(hand4.players[0][1]).to.equal('3000');
    expect(hand5.players[0][1]).to.equal('3370');
    expect(hand6.players[5][1]).to.equal('$105.05');
    expect(hand7.players[2][1]).to.equal('$200');
    expect(hand8.players[2][1]).to.equal('$513.38');
  });

  it("should learn the guy's hand if its available", function(){
    expect(hand3.ownHand).to.eql(["Ad","Ts"]);
    expect(hand5.ownHand).to.eql(["Ad","2d"]);
    expect(hand6.ownHand).to.eql(["6h", "Ad", "4s", "5d"]);
    expect(hand8.ownHand).to.eql([]);
  });

  it("should store the pre flop actions", function(){
    expect(hand3.preFlopActions[0]).to.eql("sphinmx: posts small blind $2.50");
    expect(hand3.preFlopActions[2]).to.eql("zerfer03: folds");
    expect(hand4.preFlopActions[0]).to.eql("Llkee: posts small blind 10");
    expect(hand4.preFlopActions[2]).to.eql("Hinrekas: folds ");
    expect(hand5.preFlopActions[0]).to.eql("ruslanmd: posts small blind 10");
    expect(hand5.preFlopActions[2]).to.eql("MaximSG: folds ");
    expect(hand6.preFlopActions[0]).to.eql("10K-in-Clay: posts small blind $1");
    expect(hand6.preFlopActions[2]).to.eql("Runchuks: folds ");
    expect(hand7.preFlopActions[4]).to.eql("Roxie Hart: raises $4 to $6");
    expect(hand8.preFlopActions[11]).to.eql("Flufferd: calls $410.21");
  });

  it("should learn the flop cards" ,function(){
    expect(hand1.flop).to.eql(["8c", "2d", "6s"]);
    expect(hand2.flop).to.eql(["Qs", "3c", "Kc"]);
    expect(hand3.flop).to.eql(["Tc", "8d", "Td"]);
    expect(hand4.flop).to.eql([]);
    expect(hand5.flop).to.eql(["3h", "Th", "Jc"]);
    expect(hand6.flop).to.eql([]);
    expect(hand7.flop).to.eql(["2s", "5s", "4d"]);
    expect(hand8.flop).to.eql(["3d", "2h", "7h"]);
  });

  it("should store the flop actions", function(){
    expect(hand3.flopActions[0]).to.eql('sphinmx: checks');
    expect(hand4.flopActions[0]).to.be.undefined;
    expect(hand5.flopActions[1]).to.eql("konnh4nd: bets 68");
    expect(hand7.flopActions[2]).to.eql("lipreTTT: raises $32.42 to $42.42");
    expect(hand8.flopActions[2]).to.be.undefined;
  });

  it("should learn the turn card", function(){
    expect(hand1.turn).to.equal("");
    expect(hand2.turn).to.equal("Ac");
    expect(hand3.turn).to.equal("Js");
    expect(hand5.turn).to.equal("8d");
    expect(hand7.turn).to.equal("Ks");
    expect(hand8.turn).to.equal("6h");
  });

  it("should store the turn actions", function(){
    expect(hand3.turnActions[0]).to.eql('sphinmx: bets $458.48 and is all-in');
    expect(hand5.turnActions[0]).to.eql('jordanblg: checks ');
    expect(hand7.turnActions[0]).to.be.undefined;
  });

  it("should learn the river card", function(){
    expect(hand1.river).to.eql("");
    expect(hand3.river).to.eql("Qs");
    expect(hand5.river).to.eql("6d");
    expect(hand7.river).to.eql("Ac");
    expect(hand8.river).to.eql("9c");
  });

  it("should store the river actions", function(){
    expect(hand1.riverActions[0]).to.be.undefined;
    expect(hand3.riverActions[0]).to.be.undefined;
    expect(hand5.riverActions[0]).to.eql("jordanblg: bets 140");
    expect(hand7.riverActions[0]).to.be.undefined;
    expect(hand8.riverActions[0]).to.be.undefined;
  });

  it("should know if the hand was run twice", function(){
    expect(hand1.runTwice).to.be.false;
    expect(hand4.runTwice).to.be.false;
    expect(hand7.runTwice).to.be.false;
    expect(hand8.runTwice).to.be.true;
  });

  it("should learn the second flop cards", function(){
    expect(hand1.secondFlop).to.be.undefined;
    expect(hand8.secondFlop).to.eql(["6d", "Qs", "8d"]);
  });

  it("should learn the second turn cards", function(){
    expect(hand1.secondTurn).to.be.undefined;
    expect(hand8.secondTurn).to.eql('9d');
  });

  it("should learn the second river cards", function(){
    expect(hand1.secondRiver).to.be.undefined;
    expect(hand8.secondRiver).to.eql('2d');
  });

  it("should create parsedHand", function(){
    var parsed = createParsedHand();

    expect(parsed).to.be.an('object');
    expect(parsed).to.eql({
      platforms: '',
      gameStyle: '',
      language: '',
      turn: '',
      river: '',
      players: [],
      ownHand: [],
      preFlopActions: [],
      table: [],
      flop: [],
      flopActions: [],
      turnActions: [],
      riverActions: []
    });
  });

  
});
