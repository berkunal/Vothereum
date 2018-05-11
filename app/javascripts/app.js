// Import the page's CSS. Webpack will know what to do with it.
import "../stylesheets/app.css";

// Import libraries we need.
import { default as Web3} from 'web3';
import { default as contract } from 'truffle-contract';
import { default as forge} from 'node-forge';

/*
 * When you compile and deploy your Voting contract,
 * truffle stores the abi and deployed address in a json
 * file in the build directory. We will use this information
 * to setup a Voting abstraction. We will use this abstraction
 * later to create an instance of the Voting contract.
 * Compare this against the index.js from our previous tutorial to see the difference
 * https://gist.github.com/maheshmurthy/f6e96d6b3fff4cd4fa7f892de8a1a1b4#file-index-js
 */

import ballot_artifacts from '../../build/contracts/Ballot.json'
import admin_artifacts from '../../build/contracts/Admin.json'

var Ballot = contract(ballot_artifacts);
var Admin = contract(admin_artifacts);

//var adminAddress = '0x08d5330a5ace3102e9752d00bde28af09a23d610';

// Admin page function
// Add new ballot to admin
window.addBallot = function() {
  Admin.deployed().then(function(contractInstance) {
    var ballotAddress = document.getElementById("ballotAddress").value;
    contractInstance.addBallot(ballotAddress, {gas: 1000000, from: web3.eth.accounts[0]})
    alert("Submitted transaction");
  })
}

// Admin page function
// Calls initCand and initVoter
window.initializeBallot = function() {
  var candidateList = document.getElementById("candList").value.split("-");
  var voterList = document.getElementById("voterList").value.split("-");
  for(var i=0; i<voterList.length; i++) { voterList[i] = +voterList[i]; }

  var ballotId = document.getElementById("ballotId").value;

  initCand(ballotId, candidateList);
  initVoter(ballotId, voterList);
  alert("Submitted transaction");
}

// Admin page function
// Init candidates function
function initCand(ballotId, p1) {
  Admin.deployed().then(function(contractInstance) {
    contractInstance.initializeCandidates(ballotId, p1, {gas: 1000000, from: web3.eth.accounts[0]})
  });
}

// Admin page function
// Init voters function
function initVoter(ballotId, p1) {
  Admin.deployed().then(function(contractInstance) {
    contractInstance.initializeVoters(ballotId, p1, {gas: 1000000, from: web3.eth.accounts[0]})
  });
}

// Admin page function
// Count Votes
window.countVotes = function() {
  Admin.deployed().then(function(contractInstance) {
    contractInstance.countVotes({gas: 1000000, from: web3.eth.accounts[0]});
    alert("Submitted transaction");
  });
}

// Admin page function
// Add Public Key
window.addPublicKey = function() {
  Admin.deployed().then(function(contractInstance) {
    var voterId = document.getElementById("voterID").value;
    var publicKeyPem = document.getElementById("publicKeyPem").value;
    contractInstance.addPublicKey(voterId ,publicKeyPem, {gas: 1000000, from: web3.eth.accounts[0]});
    alert("Submitted transaction");
  });
}

// Auth page function
// Authenticate user with his/hers private key and ID
window.authenticate = function() {
  Admin.deployed().then(function(adminContractInstance) {
    var voterId = document.getElementById("voterID").value;
    var ballotId = document.getElementById("ballotId").value;
    
    adminContractInstance.getBallotAddressById(ballotId).then(function(ballotAddress) {
      Ballot.at(ballotAddress).then(function(contractInstance) {
        var voterId = document.getElementById("voterID").value;
        contractInstance.voterExists(voterId).then(function(exist) {
          if (exist) {
            var voterId = document.getElementById("voterID").value;
            adminContractInstance.getPublicKey(voterId).then(function(publicKeyPem) {
              var voterId = document.getElementById("voterID").value;
              var ballotId = document.getElementById("ballotId").value;
              var privKeyPem = document.getElementById("voterPrivKeyPem").value;
              var pki = forge.pki;
            
              var privateKey = pki.privateKeyFromPem(privKeyPem);
            
              var md = forge.md.sha1.create();
              md.update('sign this', 'utf8');
              var pss = forge.pss.create({
                md: forge.md.sha1.create(),
                mgf: forge.mgf.mgf1.create(forge.md.sha1.create()),
                saltLength: 20
              });
              var signature = privateKey.sign(md, pss);
        
              var publicKey = pki.publicKeyFromPem(hexToString(publicKeyPem));
              
              if (publicKey.verify(md.digest().getBytes(), signature, pss)) {
                alert("You have been authenticated");
                redirectToBallotPage(ballotId, voterId, privateKey);
              }
            });
          } else {
            alert("Voter doesn't exist in this Ballot");
          }
        });
      });
    });
  });
}

// Auth page function
// Get Results
window.getResult = function() {
  var ballotId = document.getElementById("ballotId").value;
  Admin.deployed().then(function(adminContractInstance) {
    adminContractInstance.getBallotAddressById(ballotId).then(function(ballotAddress) {
      Ballot.at(ballotAddress).then(function(contractInstance) {
        var resultDiv = document.getElementById("result");
        contractInstance.getResults().then(function(resultList) {
          for (var i = 0; i < resultList.length; i+=2) {
            console.log(document.getElementById("cand"+resultList[i].toString()));
            var t = document.createTextNode(document.getElementById("cand"+resultList[i].toString()).value + ": " + resultList[i+1].toString());
            resultDiv.appendChild(t);
            var spaceBr= document.createElement("br");
            resultDiv.appendChild(spaceBr);
          }
        })
      });
    })
  })
}

// Ballot page function
// Vote function
window.vote = function() {
  var candidateId, voterId;
  for (let i = 0; i < document.getElementsByName('candidate').length; i++) {
    if ( document.getElementsByName('candidate')[i].checked ) {
      candidateId = document.getElementsByName('candidate')[i].id.replace('cand','');
      break;
    } 
  }
  voterId = document.getElementById("voterId").value;

  var ballotId = document.getElementById("ballotId").value;

  Admin.deployed().then(function(adminContractInstance) {
    adminContractInstance.getBallotAddressById(ballotId).then(function(ballotAddress) {
      Ballot.at(ballotAddress).then(function(contractInstance) {
        contractInstance.vote(voterId, candidateId, {gas: 1000000, from: web3.eth.accounts[0]});
        alert("Submitted transaction");
      });
    })
  })
}

// Ballot page function
// Validate Vote
window.validateVote = function() {
  var ballotId = document.getElementById("ballotId").value;
  Admin.deployed().then(function(adminContractInstance) {
    adminContractInstance.getBallotAddressById(ballotId).then(function(ballotAddress) {
      Ballot.at(ballotAddress).then(function(contractInstance) {
        contractInstance.validateVote(document.getElementById("voterId").value).then(function(value) {
          alert(value);
        })
      })
    })
  })
}

// Initial admin and ballot selection page
function selectionDivision() {
    var initialSelectionDiv = document.getElementById("ButtonSelectionDiv");
    initialSelectionDiv.innerHTML = "";

    // Admin button
    var adminButton = document.createElement("input");
    adminButton.type = "button";
    adminButton.value = "Admin";
    adminButton.onclick = function() {redirectToAdminPage()};
    initialSelectionDiv.appendChild(adminButton);

    // Ballot buttons
    Admin.deployed().then(function(contractInstance) {
      contractInstance.getBallots().then(function(ballotList) {
        for (var i = 0; i < ballotList.length; i++) {
          var ballotButton = document.createElement("input");
          ballotButton.type = "button";
          ballotButton.value = "Ballot " + i;
          ballotButton.id = i;
          ballotButton.onclick = function() {redirectToAuthPage(this.id)};
          initialSelectionDiv.appendChild(ballotButton);
        }
      })
    })
}

// Set main div to Admin page
function redirectToAdminPage() {
  document.getElementById("MainDiv").innerHTML = document.getElementById("adminHTML").innerHTML;
}

function redirectToAuthPage(ballotId) {
  document.getElementById("MainDiv").innerHTML = document.getElementById("authHTML").innerHTML;

  document.getElementById("ballotId").innerHTML = "Ballot " + ballotId;
  document.getElementById("ballotId").value = ballotId;
}

// Set main div to spesific Ballot page
function redirectToBallotPage(ballotId, voterId, privateKey) {
  Admin.deployed().then(function(adminContractInstance) {
    adminContractInstance.getBallotAddressById(ballotId).then(function(ballotAddress) {
      Ballot.at(ballotAddress).then(function(contractInstance) {
        document.getElementById("MainDiv").innerHTML = document.getElementById("ballotHTML").innerHTML;
        document.getElementById("ballotId").innerHTML = "Ballot " + ballotId;
        document.getElementById("ballotId").value = ballotId;
        document.getElementById("voterId").innerHTML = "Voter ID: " + voterId;
        document.getElementById("voterId").value = voterId;
        var candidatesDiv = document.getElementById("CandidatesDiv");
        var submitButtonDiv = document.getElementById("SubmitButtonDiv");

        // Candidate Radio Buttons
        contractInstance.getCandidateIdList().then(function(candList){
          for (var i = 0; i < candList.length; i++) {
            contractInstance.getCandidateName(candList[i]).then(function(result){
              var c = document.createElement("input");
              c.type = "radio";
              c.id = "cand"+result[1];
              c.name = "candidate";
              c.value = hexToString(result[0]);
              candidatesDiv.appendChild(c);
              var t = document.createTextNode(" "+hexToString(result[0]));
              candidatesDiv.appendChild(t);

              var spaceBr= document.createElement("br");
              candidatesDiv.appendChild(spaceBr);
            })
          }
        })

        // Submit Button
        var s = document.createElement("input");
        s.type = "submit";
        s.value = "Submit";
        submitButtonDiv.appendChild(s);
      });
    })
  })
}

// Initialization
$( document ).ready(function() {
  if (typeof web3 !== 'undefined') {
    console.warn("Using web3 detected from external source like Metamask")
    // Use Mist/MetaMask's provider
    window.web3 = new Web3(web3.currentProvider);
  } else {
    console.warn("No web3 detected. Falling back to http://localhost:8545. You should remove this fallback when you deploy live, as it's inherently insecure. Consider switching to Metamask for development. More info here: http://truffleframework.com/tutorials/truffle-and-metamask");
    // fallback - use your fallback strategy (local node / hosted node + in-dapp id mgmt / fail)
    window.web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));
  }

  Ballot.setProvider(web3.currentProvider);
  Admin.setProvider(web3.currentProvider);

  selectionDivision();
});

function hexToString(hexx) {
  var hex = hexx.toString();
    var str = '';
    for (var i = 2; (i < hex.length && hex.substr(i, 2) !== '00'); i += 2)
        str += String.fromCharCode(parseInt(hex.substr(i, 2), 16));
    return str;
}
