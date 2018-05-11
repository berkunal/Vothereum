//var Voting = artifacts.require("./Voting.sol");
var ballot = artifacts.require("./ballot.sol");
var admin = artifacts.require("./admin.sol");
var ownable = artifacts.require("./ownable.sol");
module.exports = function(deployer) {
  //deployer.deploy(Voting, ['Rama', 'Nick', 'Jose'], {gas: 670000});
  deployer.deploy(ballot, '0x4da21e53c579732ea8d6b30cffb5d97c23268e34').then(() => console.log("Ballot adress: "+ballot.address));
  //deployer.deploy(admin).then(() => console.log("Admin adress: "+admin.address));
  deployer.deploy(ownable);
};
