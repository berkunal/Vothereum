//var Voting = artifacts.require("./Voting.sol");
var ballot = artifacts.require("./ballot.sol");
var admin = artifacts.require("./admin.sol");
var ownable = artifacts.require("./ownable.sol");
module.exports = function(deployer) {
  //deployer.deploy(Voting, ['Rama', 'Nick', 'Jose'], {gas: 670000});
  deployer.deploy(ballot, '0x3b08a543fbf65ddd0d2bea0e710e5b8a5c47e3eb').then(() => console.log("Ballot adress: "+ballot.address));
  //deployer.deploy(admin).then(() => console.log("Admin adress: "+admin.address));
  deployer.deploy(ownable);
};
/* As you can see above, the deployer expects the first argument to   be the name of the contract followed by constructor arguments. In our case, there is only one argument which is an array of
candidates. The third argument is a hash where we specify the gas required to deploy our code. The gas amount varies depending on the size of your contract.
*/