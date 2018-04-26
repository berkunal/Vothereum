// Import the page's CSS. Webpack will know what to do with it.
import "../stylesheets/app.css";

// Import libraries we need.
import { default as Web3} from 'web3';
import { default as contract } from 'truffle-contract'

/*
 * When you compile and deploy your Voting contract,
 * truffle stores the abi and deployed address in a json
 * file in the build directory. We will use this information
 * to setup a Voting abstraction. We will use this abstraction
 * later to create an instance of the Voting contract.
 * Compare this against the index.js from our previous tutorial to see the difference
 * https://gist.github.com/maheshmurthy/f6e96d6b3fff4cd4fa7f892de8a1a1b4#file-index-js
 */

import voting_artifacts from '../../build/contracts/Ballot.json'

var Ballot = contract(voting_artifacts);

// Vote function
window.vote = function() {
  var candidateId, voterId;
  for (let i = 0; i < document.getElementsByName('candidate').length; i++) {
    if ( document.getElementsByName('candidate')[i].checked ) {
      candidateId = i;
      break;
    } 
  }
  voterId = document.getElementById("voter").value;
  try {
    Ballot.deployed().then(function(contractInstance) {
      contractInstance.vote(voterId, candidateId, {gas: 1000000, from: web3.eth.accounts[0]});
    });
  } catch (err) {
    console.log(err);
  }
}

// Calls initCand and initVoter
window.initializeBallot = function() {
  console.log("hey1");
  var candidateList = document.getElementById("candList").value.split("-");
  var voterList = document.getElementById("voterList").value.split("-");
  for(var i=0; i<voterList.length; i++) { voterList[i] = +voterList[i]; }

  initCand(candidateList);
  initVoter(voterList);
}


// Init candidates function
function initCand(p1) {
  try {
    Ballot.deployed().then(function(contractInstance) {
      contractInstance.initializeCandidates(p1, {gas: 1000000, from: web3.eth.accounts[0]});
    });
  } catch (err) {
    console.log(err);
  }
}

// Init voters function
function initVoter(p1) {
  try {
    Ballot.deployed().then(function(contractInstance) {
      contractInstance.initializeVoters(p1, {gas: 1000000, from: web3.eth.accounts[0]});
    });
  } catch (err) {
    console.log(err);
  }
}

// Count Votes
window.countVotes = function() {
  Ballot.deployed().then(function(contractInstance) {
    contractInstance.countVotes({gas: 1000000, from: web3.eth.accounts[0]});
  });
}

// Get Results (Free)
window.getResult = function() {
  Ballot.deployed().then(function(contractInstance) {
    var resultDiv = document.getElementById("result");

    // Get the names first
    var nameArray = [];
    var resultList = [];
    contractInstance.getResults().then(function(resList) {
      resultList = resList;
      for (var i = 0; i < resultList.length; i+=2) {
        contractInstance.getCandidateName(resultList[i]).then(function(name){
          nameArray.push(hexToString(name));
        })
      }
    }).then(function() {
      for (var i = 0; i < resultList.length; i+=2) {
        var r = resultList[i+1].toString();
        var t = document.createTextNode(nameArray[i] + ": " + r);
        resultDiv.appendChild(t);
        var spaceBr= document.createElement("br");
        resultDiv.appendChild(spaceBr);
      }
    });
  });
}

// Validate Vote (Free)
window.validateVote = function() {
  Ballot.deployed().then(function(contractInstance) {
    contractInstance.validateVote(document.getElementById("voterID").value).then(function(value) {
      alert(value);
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

  Ballot.deployed().then(function(contractInstance) {
    var voterDiv = document.getElementById("VoterDiv");
    var candidatesDiv = document.getElementById("CandidatesDiv");
    var submitButtonDiv = document.getElementById("SubmitButtonDiv");
    var voterListDiv = document.getElementById("VoterListDiv");

    // Get voter IDs
    contractInstance.getVotersKeys().then(function(voterList){
      var t = document.createTextNode("Voter IDs: " + voterList);
      voterListDiv.appendChild(t);    
    })

    // Voter ID Input
    var i = document.createElement("input");
    i.type = "text";
    i.name = "voter";
    i.id = "voter";
    voterDiv.appendChild(i);

    // Candidate Radio Buttons
    contractInstance.getCandidateIdList().then(function(candList){
      for (var i = 0; i < candList.length; i++) {
        contractInstance.getCandidateName(candList[i]).then(function(name){
          var c = document.createElement("input");
          c.type = "radio";
          c.id = "candidate_"+i;
          c.name = "candidate";
          c.value = i;
          candidatesDiv.appendChild(c);
          var t = document.createTextNode(" "+hexToString(name));
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
});

function hexToString(hexx) {
  var hex = hexx.toString();
    var str = '';
    for (var i = 2; (i < hex.length && hex.substr(i, 2) !== '00'); i += 2)
        str += String.fromCharCode(parseInt(hex.substr(i, 2), 16));
    return str;
}
