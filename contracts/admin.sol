pragma solidity ^0.4.18;

import "./ownable.sol";

contract BallotInterface {
    function setBallotId(uint _ballotId) public;
    function initializeCandidates(bytes32[] _candidates) public;
    function initializeVoters(uint[] _voters) public;
    function setVoteCountedTrue(uint _voteId) public;
    function incrementCandidateVoteCount(uint _candidateId) public;
}

contract Admin is Ownable {
    // Ballot map ballotID(incremental) to ballotAddress
    address[] private ballots;

    // PublicKeys is a map. Key: voter id, Value: public key
    mapping (uint => bytes) private publicKeys;
    
    // Server Public Key
    bytes private serverPublicKeyPem;

    function addVoterPublicKey(uint _voterId, bytes _publicKey) public onlyOwner {
        publicKeys[_voterId] = _publicKey;
    }

    function getVoterPublicKey(uint _voterId) public view returns (bytes) {
        return publicKeys[_voterId];
    }

    function setServerPublicKey(bytes _serverPublicKeyPem) public onlyOwner {
        serverPublicKeyPem = _serverPublicKeyPem;
    }

    function getServerPublicKey() public view returns (bytes) {
        return serverPublicKeyPem;
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

    function setVoteCountedTrue(uint _ballotID, uint _voteId) public onlyOwner {
        BallotInterface ballotContract = BallotInterface(ballots[_ballotID]);
        ballotContract.setVoteCountedTrue(_voteId);
    }

    function incrementCandidateVoteCount(uint _ballotID, uint _candidateId) public onlyOwner {
        BallotInterface ballotContract = BallotInterface(ballots[_ballotID]);
        ballotContract.incrementCandidateVoteCount(_candidateId);
    }
}
