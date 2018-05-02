pragma solidity ^0.4.18;

import "./ownable.sol";
import "./admin.sol";

contract Ballot is Ownable {

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
        uint candidateId; // To who
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
    Vote[] private votes;

    // Voting done or not
    bool private counted;
    
    // Admin address
    address private admin;
    
    // ID of the ballot
    uint private ballotId;
    
    function setBallotId(uint _ballotId) public onlyAdmin {
        ballotId = _ballotId;
    }
    
    function getBallotId() public view returns (uint) {
        return ballotId;
    }
    
    // Function modifier to restrict function calls only to Admin
    modifier onlyAdmin() {
        require(msg.sender == admin);
        _;
    }
    
    function initializeAdmin(address adminAddress) public onlyOwner {
        admin = adminAddress;
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
    function vote(uint _voterId, uint _candidateId) external onlyOwner {
        // check if _voterId or _candidateId is exists
        require(voterExists(_voterId) && candidateExists(_candidateId));

        // terminate if voted
        require(!voters[_voterId].voted);

        // Create new vote
        votes.push(Vote({
                voterId: _voterId, 
                candidateId: _candidateId, 
                counted: false
            }));

        // Mark voter as voted
        voters[_voterId].voted = true;
    }

    // Admin
    function countVotes() public onlyAdmin {
        // Update the votecount of candidates and mark votes counted
        for (uint i = 0; i < votes.length; i++) {
            candidates[votes[i].candidateId].voteCount++;
            votes[i].counted = true;
        }
        counted = true;
        // Fill the results array
        for (i = 0; i < candidates.length; i++) {
            results.push(i);
            results.push(candidates[i].voteCount);
        }
    }

    // Return the results of counting
    function getResults() public view returns (uint[]) {
        if (!counted) {
            return;
        } else {
            return results;
        }
    }

    // Voter's vote counted or not?
    function validateVote(uint _voterId) public view returns (bool) {
        for (uint i = 0; i < votes.length; i++) {
            if (votes[i].voterId == _voterId) {
                return votes[i].counted;
            }
        }
        return false;
    }

    // Return candidate name associated with the given candidate id
    function getCandidateName(uint _candidateId) public view returns (bytes32) {
        return candidates[_candidateId].name;
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
    function voterExists(uint _voterId) private view returns (bool) {
        uint i;
        for (i = 0; i < votersKeys.length; i++) {
            if (votersKeys[i] == _voterId) {
                break;
            }
        }
        return i != votersKeys.length;
    }

    // Return true if Candidate associated with given candidate id is exist
    function candidateExists(uint _candidateId) private view returns (bool) {
        uint i;
        for (i = 0; i < candidates.length; i++) {
            if (candidates[i].id == _candidateId) {
                break;
            }
        }
        return i != candidates.length;
    }
}
