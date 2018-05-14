pragma solidity ^0.4.18;

import "./admin.sol";

contract Ballot {

    struct Voter {
        uint id; // like tc no
        bool voted;  // if true, that person already voted
    }

    struct Candidate {
        uint id;
        bytes32 name;
        uint voteCount;
    }

    struct Vote {
        uint voterId; // Who voted
        bytes encryptedCandidateId; // To who
        bytes signature;
        bool counted; // Counted or not
    }

    // Voter map. id to Voter object
    mapping (uint => Voter) private voters;
    uint[] private votersKeys;

    // Candidate array
    Candidate[] private candidates;
    uint[] private candidateIdList;
    uint[] private results;

    // Vote array
    mapping (uint => Vote) private votes;
    uint[] private votesKeys;

    // Voting done or not
    bool private counted;
    
    // Admin address
    address private admin;
    
    // ID of the ballot
    uint private ballotId;

    // Function modifier to restrict function calls only to Admin
    modifier onlyAdmin() {
        require(msg.sender == admin);
        _;
    }

    function Ballot(address _adminAddress) public {
        admin = _adminAddress;
    }
    
    function setBallotId(uint _ballotId) public onlyAdmin {
        ballotId = _ballotId;
    }
    
    function getBallotId() public view returns (uint) {
        return ballotId;
    }
    
    function setAdmin(address _adminAddress) public onlyAdmin {
        admin = _adminAddress;
    }

    // Admin
    function initializeCandidates(bytes32[] _candidates) public onlyAdmin {
        for (uint i = 0; i < _candidates.length; i++) {
            candidates.push(Candidate({
                id: i, 
                name: _candidates[i], 
                voteCount: 0
            }));
            candidateIdList.push(i);
        }
        counted = false;
    }

    // Admin
    function initializeVoters(uint[] _voters) public onlyAdmin {
        for (uint i = 0; i < _voters.length; i++) {
            voters[_voters[i]].id = _voters[i];
            voters[_voters[i]].voted = false;
            votersKeys.push(_voters[i]);
        }
    }

    // User
    function vote(uint _voterId, bytes _encryptedCandidateId, bytes _signature) external {
        // check if _voterId or _candidateId is exists
        require(voterExists(_voterId));

        // terminate if voted
        require(!voters[_voterId].voted);

        // Create new vote
        votes[_voterId].voterId = _voterId;
        votes[_voterId].encryptedCandidateId = _encryptedCandidateId;
        votes[_voterId].signature = _signature;
        votes[_voterId].counted = false;
        votesKeys.push(_voterId);

        // Mark voter as voted
        voters[_voterId].voted = true;
    }

    // Return votes' keys
    function getVotesKeys() public view returns (uint[]) {
        return votesKeys;
    }
    
    // Get encrypted and signed Votes
    function getVote(uint _voterId) public view returns (uint, bytes, bytes) {
        return (votes[_voterId].voterId, votes[_voterId].encryptedCandidateId, votes[_voterId].signature);
    }

    // Set votes counted status to true
    function setVoteCountedTrue(uint _voteId) public onlyAdmin {
        votes[_voteId].counted = true;
    }

    // Voter's vote counted or not?
    function validateVote(uint _voterId) public view returns (bool) {
        return votes[_voterId].counted;
    }

    // Return candidate name associated with the given candidate id
    function getCandidateName(uint _candidateId) public view returns (bytes32, uint) {
        return (candidates[_candidateId].name, _candidateId);
    }

    function incrementCandidateVoteCount(uint _candidateId) public onlyAdmin {
        uint i;
        for (i = 0; i < candidates.length; i++) {
            if (candidates[i].id == _candidateId) {
                break;
            }
        }
        require(i != candidates.length);

        candidates[i].voteCount++;
    }

    // Return candidate vote count associated with the given candidate id
    function getCandidateVoteCount(uint _candidateId) public view returns (uint, uint) {
        return (candidates[_candidateId].voteCount, _candidateId);
    }

    // Return candidate id list
    function getCandidateIdList() public view returns (uint[]) {
        return candidateIdList;
    }

    // Return voters' keys
    function getVotersKeys() public view returns (uint[]) {
        return votersKeys;
    }

    // Return true if Voter associated with given voter id is exist
    function voterExists(uint _voterId) public view returns (bool) {
        uint i;
        for (i = 0; i < votersKeys.length; i++) {
            if (votersKeys[i] == _voterId) {
                break;
            }
        }
        return i != votersKeys.length;
    }

    // Return true if Candidate associated with given candidate id is exist
    function candidateExists(uint _candidateId) public view returns (bool) {
        uint i;
        for (i = 0; i < candidates.length; i++) {
            if (candidates[i].id == _candidateId) {
                break;
            }
        }
        return i != candidates.length;
    }
}
