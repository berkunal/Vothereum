pragma solidity ^0.4.18;

import "./ownable.sol";

contract BallotInterface {
    function setBallotId(uint _ballotId) public;
    function initializeCandidates(bytes32[] _candidates) public;
    function initializeVoters(uint[] _voters) public;
    function countVotes() public;
}

contract Admin is Ownable {
    // Ballot map ballotID(incremental) to ballotAddress
    address[] private ballots;
    
    function Admin()public {
    }
    
    function addBallot(address _ballotAddress) public onlyOwner {
        ballots.push(_ballotAddress);
        BallotInterface ballotContract = BallotInterface(_ballotAddress);
        ballotContract.setBallotId(ballots.length-1);
    }

    function getBallots() public view returns (address[]) {
        return ballots;
    }
    
    function getBallotAddressById(uint _ballotID) public view returns (address) {
        return ballots[_ballotID];
    }
    
    function initializeCandidates(uint _ballotID, bytes32[] _candidates) public onlyOwner {
        BallotInterface ballotContract = BallotInterface(ballots[_ballotID]);
        ballotContract.initializeCandidates(_candidates);
    }

    function initializeCandidatesForAllBallots(bytes32[] _candidates) public onlyOwner {
        for (uint i = 0; i < ballots.length; i++) {
            BallotInterface ballotContract = BallotInterface(ballots[i]);
            ballotContract.initializeCandidates(_candidates);
        }
    }
    
    function initializeVoters(uint _ballotID, uint[] _voters) public onlyOwner {
        BallotInterface ballotContract = BallotInterface(ballots[_ballotID]);
        ballotContract.initializeVoters(_voters);
    }
    
    function countVotes() public onlyOwner {
        for (uint i = 0; i < ballots.length; i++) {
            BallotInterface ballotContract = BallotInterface(ballots[i]);
            ballotContract.countVotes();
        }
    }
    
}
