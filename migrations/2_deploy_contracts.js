//var Voting = artifacts.require("./Voting.sol");
var ballot = artifacts.require("./ballot.sol");
var admin = artifacts.require("./admin.sol");
var ownable = artifacts.require("./ownable.sol");
module.exports = function(deployer) {
  //deployer.deploy(Voting, ['Rama', 'Nick', 'Jose'], {gas: 670000});
  deployer.deploy(ballot, '0xf21679219d81100e643260348f32ed14980f373e').then(() => console.log("Ballot adress: "+ballot.address));
  //deployer.deploy(admin).then(() => console.log("Admin adress: "+admin.address));
  //deployer.deploy(ownable);
};
