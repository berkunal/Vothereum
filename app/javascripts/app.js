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
  var t0 = performance.now();
  Admin.deployed().then(function(contractInstance) {
    var ballotAddress = document.getElementById("ballotAddress").value;
    contractInstance.addBallot(ballotAddress, {gas: 1000000, from: web3.eth.accounts[0]})
    var t1 = performance.now();
    console.log("Call to addBallot took " + (t1 - t0) + " milliseconds.")
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
  var t0 = performance.now();
  Admin.deployed().then(function(contractInstance) {
    contractInstance.initializeCandidates(ballotId, p1, {gas: 1000000, from: web3.eth.accounts[0]})
    var t1 = performance.now();
    console.log("Call to initCand "+ballotId+" took " + (t1 - t0) + " milliseconds.")
  });
}

// Admin page function
// Init voters function
function initVoter(ballotId, p1) {
  var t0 = performance.now();
  Admin.deployed().then(function(contractInstance) {
    contractInstance.initializeVoters(ballotId, p1, {gas: 1000000, from: web3.eth.accounts[0]})
    var t1 = performance.now();
    console.log("Call to initVoter "+ballotId+" took " + (t1 - t0) + " milliseconds.")
  });
}

// Admin page function
// Count Votes
window.countVotes = function() {
  Admin.deployed().then(function(adminContractInstance) {
    adminContractInstance.getBallots().then(function(ballotList) {
      for (var i = 0; i < ballotList.length; i++) {
        countBallot(i, ballotList[i]);
        //console.log("countBallot called with parameters: " + i + " " + ballotList[i]);
      }
    });
  });
}

function countBallot(ballotId, ballotAddress) {
  Ballot.at(ballotAddress).then(function(contractInstance) {
    contractInstance.getVotesKeys().then(function(votesKeys) {
      for (var j = 0; j < votesKeys.length; j++) {
        //console.log("calling countSingleVote with parameters: " + ballotId +" "+ ballotAddress +" "+ votesKeys[j]);
        countSingleVote(ballotId, ballotAddress, votesKeys[j]);
      }
    });
  });
}

function countSingleVote(ballotId, ballotAddress, voteId) {
  var t0 = performance.now();
  Admin.deployed().then(function(adminContractInstance) {
    Ballot.at(ballotAddress).then(function(contractInstance) {
      contractInstance.getVote(voteId).then(function(result) {
        //console.log(result[0] + " Signature: " + hexToString(result[2]) + " ---- Encrypted: " + hexToString(result[1]));
        var encrypted = forge.util.decode64(hexToString(result[1]));
        var signature = forge.util.decode64(hexToString(result[2]));
        adminContractInstance.getVoterPublicKey(voteId).then(function(publicKeyPem) {
          var publicKey = forge.pki.publicKeyFromPem(hexToString(publicKeyPem));
          var md = forge.md.sha1.create();
          md.update('sign this', 'utf8');

          if (publicKey.verify(md.digest().getBytes(), signature)) {
            console.log(result[0] + ": Valid Vote");
            var serverPrivateKeyPem = document.getElementById("serverPrivateKeyPem").value;
            var privateKey = forge.pki.privateKeyFromPem(serverPrivateKeyPem);

            var decrypted = forge.util.decodeUtf8(privateKey.decrypt(encrypted));
            //increment
            adminContractInstance.incrementCandidateVoteCount(ballotId, decrypted, {gas: 1000000, from: web3.eth.accounts[0]});
            //counted
            adminContractInstance.setVoteCountedTrue(ballotId, result[0], {gas: 1000000, from: web3.eth.accounts[0]});
            var t1 = performance.now();
            console.log("Call to countSingleVote "+voteId+" took " + (t1 - t0) + " milliseconds.")
          } else {
            console.log(result[0] + ": Not Valid");
          }
        });
      });
    });
  });
}

// Admin page function
// Add Public Key
window.addVoterPublicKey = function() {
  var t0 = performance.now();
  Admin.deployed().then(function(contractInstance) {
    var voterId = document.getElementById("voterID").value;
    var publicKeyPem = document.getElementById("publicKeyPem").value;
    contractInstance.addVoterPublicKey(voterId ,publicKeyPem, {gas: 1000000, from: web3.eth.accounts[0]});
    var t1 = performance.now();
    console.log("Call to addVoterPublicKey took " + (t1 - t0) + " milliseconds.")
    alert("Submitted transaction");
  });
}

// Admin page function
// Set Public Key for All Ballots
window.setServerPublicKey = function() {
  var t0 = performance.now();
  Admin.deployed().then(function(contractInstance) {
    var publicKeyPem = document.getElementById("serverPublicKeyPem").value;
    contractInstance.setServerPublicKey(publicKeyPem, {gas: 1000000, from: web3.eth.accounts[0]});
    var t1 = performance.now();
    console.log("Call to setServerPublicKey took " + (t1 - t0) + " milliseconds.")
    alert("Submitted transaction");
  });
}

// Auth page function
// Authenticate user with his/hers private key and ID
window.authenticate = function() {
  var t0 = performance.now();
  Admin.deployed().then(function(adminContractInstance) {
    var voterId = document.getElementById("voterID").value;
    var ballotId = document.getElementById("ballotId").value;
    
    adminContractInstance.getBallotAddressById(ballotId).then(function(ballotAddress) {
      Ballot.at(ballotAddress).then(function(contractInstance) {
        var voterId = document.getElementById("voterID").value;
        contractInstance.voterExists(voterId).then(function(exist) {
          if (exist) {
            var voterId = document.getElementById("voterID").value;
            adminContractInstance.getVoterPublicKey(voterId).then(function(publicKeyPem) {
              var voterId = document.getElementById("voterID").value;
              var ballotId = document.getElementById("ballotId").value;
              var privKeyPem = document.getElementById("voterPrivKeyPem").value;
            
              var privateKey = forge.pki.privateKeyFromPem(privKeyPem);
            
              var md = forge.md.sha1.create();
              md.update('sign this', 'utf8');
              var signature = privateKey.sign(md);
        
              var publicKey = forge.pki.publicKeyFromPem(hexToString(publicKeyPem));
              
              if (publicKey.verify(md.digest().getBytes(), signature)) {              
                var t1 = performance.now();
                console.log("Call to authenticate took " + (t1 - t0) + " milliseconds.")

                alert("You have been authenticated");
                redirectToBallotPage(ballotId, voterId, forge.util.encode64(signature));
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
  var t0 = performance.now();
  var ballotId = document.getElementById("ballotId").value;
  Admin.deployed().then(function(adminContractInstance) {
    adminContractInstance.getBallotAddressById(ballotId).then(function(ballotAddress) {
      Ballot.at(ballotAddress).then(function(contractInstance) {
        contractInstance.getCandidateIdList().then(function(candList){
          var resultTable = document.getElementById('result');
          for (var i = 0; i < candList.length; i++) {
            var row = resultTable.insertRow(0);
            var cell1 = row.insertCell(0);
            var cell2 = row.insertCell(1);
            
            insertNameCell(cell1, candList[i], ballotId);
            insertVoteCountCell(cell2, candList[i], ballotId);
            
            var t1 = performance.now();
            console.log("Call to insertCells "+i+" took " + (t1 - t0) + " milliseconds.")
          }
        })
      });
    });
  });
}

function insertNameCell(cell, candidateId, ballotId) {
  var t0 = performance.now();
  Admin.deployed().then(function(adminContractInstance) {
    adminContractInstance.getBallotAddressById(ballotId).then(function(ballotAddress) {
      Ballot.at(ballotAddress).then(function(contractInstance) {   
        contractInstance.getCandidateName(candidateId).then(function(nameResult){
          cell.innerHTML = hexToString(nameResult[0]);
          var t1 = performance.now();
          console.log("Call to insertNameCell "+hexToString(nameResult[0])+" took " + (t1 - t0) + " milliseconds.")
        });
      });
    });
  });
}

function insertVoteCountCell(cell, candidateId, ballotId) {
  var t0 = performance.now();
  Admin.deployed().then(function(adminContractInstance) {
    adminContractInstance.getBallotAddressById(ballotId).then(function(ballotAddress) {
      Ballot.at(ballotAddress).then(function(contractInstance) {  
        contractInstance.getCandidateVoteCount(candidateId).then(function(voteResult){
          cell.innerHTML = voteResult[0].toString();
          var t1 = performance.now();
          console.log("Call to insertVoteCountCell "+voteResult[0].toString()+" took " + (t1 - t0) + " milliseconds.")
        });
      });
    });
  });
}

// Ballot page function
// Vote function
window.vote = function() {
  var t0 = performance.now();
  var candidateId, voterId, signature, ballotId;
  for (let i = 0; i < document.getElementsByName('candidate').length; i++) {
    if ( document.getElementsByName('candidate')[i].checked ) {
      candidateId = document.getElementsByName('candidate')[i].id.replace('cand','');
      break;
    } 
  }
  voterId = document.getElementById("voterId").value;
  signature = document.getElementById("signature").value;
  ballotId = document.getElementById("ballotId").value;
  var serverPublicKeyPem = document.getElementById("serverPub").value;
  var serverPublicKey = forge.pki.publicKeyFromPem(serverPublicKeyPem);

  // Encrypt candidate
  var encryptedCandidateId = forge.util.encode64(serverPublicKey.encrypt(forge.util.encodeUtf8(candidateId)));
  //console.log(voterId + " Signature: " + signature + " ---- Encrypted: " + encryptedCandidateId);

  Admin.deployed().then(function(adminContractInstance) {
    adminContractInstance.getBallotAddressById(ballotId).then(function(ballotAddress) {
      Ballot.at(ballotAddress).then(function(contractInstance) {
        contractInstance.vote(voterId, encryptedCandidateId, signature, {gas: 1000000, from: web3.eth.accounts[0]});
        var t1 = performance.now();
        console.log("Call to vote took " + (t1 - t0) + " milliseconds.")
        alert("Submitted transaction");
      });
    })
  })
}

// Ballot page function
// Validate Vote
window.validateVote = function() {
  var t0 = performance.now();
  var ballotId = document.getElementById("ballotId").value;
  Admin.deployed().then(function(adminContractInstance) {
    adminContractInstance.getBallotAddressById(ballotId).then(function(ballotAddress) {
      Ballot.at(ballotAddress).then(function(contractInstance) {
        contractInstance.validateVote(document.getElementById("voterId").value).then(function(value) {
          var t1 = performance.now();
          console.log("Call to validateVote took " + (t1 - t0) + " milliseconds.")
          alert(value);
        });
      });
    });
  });
}

// Initial admin and ballot selection page
function selectionDivision() {
    var initialSelectionDiv = document.getElementById("ButtonSelectionDiv");
    initialSelectionDiv.innerHTML = "";

    // Admin button
    var adminButton = document.createElement("input");
    adminButton.type = "button";
    adminButton.value = "Admin";
    adminButton.className = "btn btn-default";
    adminButton.onclick = function() {
      var t0 = performance.now();
      redirectToAdminPage();
      var t1 = performance.now();
      console.log("Call to redirectToAdminPage took " + (t1 - t0) + " milliseconds.")
    };
    initialSelectionDiv.appendChild(adminButton);

    // Ballot buttons
    Admin.deployed().then(function(contractInstance) {
      contractInstance.getBallots().then(function(ballotList) {
        for (var i = 0; i < ballotList.length; i++) {
          var ballotButton = document.createElement("input");
          ballotButton.type = "button";
          ballotButton.value = "Ballot " + i;
          ballotButton.id = i;
          ballotButton.className = "btn btn-default";
          ballotButton.onclick = function() {
            var t0 = performance.now();
            redirectToAuthPage(this.id);
            var t1 = performance.now();
            console.log("Call to redirectToAuthPage "+this.id+" took " + (t1 - t0) + " milliseconds.")
          };
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
function redirectToBallotPage(ballotId, voterId, signature) {
  Admin.deployed().then(function(adminContractInstance) {
    adminContractInstance.getBallotAddressById(ballotId).then(function(ballotAddress) {
      Ballot.at(ballotAddress).then(function(contractInstance) {
        document.getElementById("MainDiv").innerHTML = document.getElementById("ballotHTML").innerHTML;
        document.getElementById("ballotId").innerHTML = "Ballot " + ballotId;
        document.getElementById("ballotId").value = ballotId;
        document.getElementById("voterId").innerHTML = "Voter ID: " + voterId;
        document.getElementById("voterId").value = voterId;
        document.getElementById("signature").value = signature;
        
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
        s.className = "btn btn-primary";
        submitButtonDiv.appendChild(s);
      });
    })
  })
}

// Initialization
$( document ).ready(function() {
  if (typeof web3 !== 'undefined') {
    //console.warn("Using web3 detected from external source like Metamask")
    // Use Mist/MetaMask's provider
    window.web3 = new Web3(web3.currentProvider);
  } else {
    //console.warn("No web3 detected. Falling back to http://localhost:8545. You should remove this fallback when you deploy live, as it's inherently insecure. Consider switching to Metamask for development. More info here: http://truffleframework.com/tutorials/truffle-and-metamask");
    // fallback - use your fallback strategy (local node / hosted node + in-dapp id mgmt / fail)
    window.web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));
  }
  console.log("Page loaded");
  Ballot.setProvider(web3.currentProvider);
  Admin.setProvider(web3.currentProvider);

  Admin.deployed().then(function(adminContractInstance) {
    adminContractInstance.getServerPublicKey().then(function(pubKey) {
      document.getElementById("serverPub").value = hexToString(pubKey);
    });
  });

  var t0 = performance.now();
  selectionDivision();
  var t1 = performance.now();
  console.log("Call to selectionDivision took " + (t1 - t0) + " milliseconds.")
});

function hexToString(hexx) {
  var hex = hexx.toString();//force conversion
  var str = '';
  for (var i = 2; (i < hex.length && hex.substr(i, 2) !== '00'); i += 2)
      str += String.fromCharCode(parseInt(hex.substr(i, 2), 16));
  return str;
}
