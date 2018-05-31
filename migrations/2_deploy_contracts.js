//var Voting = artifacts.require("./Voting.sol");
var ballot = artifacts.require("./ballot.sol");
var admin = artifacts.require("./admin.sol");
var ownable = artifacts.require("./ownable.sol");
module.exports = function(deployer) {
  //deployer.deploy(Voting, ['Rama', 'Nick', 'Jose'], {gas: 670000});
  deployer.deploy(ballot, '0x5fdcaff733bc6a68fd09621feeeef5b08df2d223').then(() => console.log("Ballot adress: "+ballot.address));
  //deployer.deploy(admin).then(() => console.log("Admin adress: "+admin.address));
  //deployer.deploy(ownable);
};
