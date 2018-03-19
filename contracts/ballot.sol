pragma solidity ^0.4.18;

import "./ownable.sol";

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

    // Candidate array
    Candidate[] private candidates;

    // Vote array
    Vote[] private votes;

    // Temporary Constructor
    function Ballot(bytes32[] _candidateNames, uint[] _voterIds) public {
        initializeCandidates(_candidateNames);
        initializeVoters(_voterIds);
    }

    function initializeCandidates(bytes32[] _candidates) public onlyOwner {
        for (uint i = 0; i < _candidates.length; i++) {
            candidates.push(Candidate({
                id: i, 
                name: _candidates[i], 
                voteCount: 0
            }));
        }
    }

    function initializeVoters(uint[] _voters) public onlyOwner {
        for (uint i = 0; i < _voters.length; i++) {
            voters[_voters[i]].id = _voters[i];
            voters[_voters[i]].voted = false;
        }
    }

    function vote(uint _voterId, uint _candidateId) external onlyOwner {
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

    function countVotes() private onlyOwner returns (Candidate[]) {
        for (uint i = 0; i < votes.length; i++) {
            candidates[votes[i].candidateId].voteCount++;
            votes[i].counted = true;
        }
        return candidates;
    }

    function getCandidates() public view returns (Candidate[]) {
        return candidates;
    }

    function getVoterVoted(uint i) public view returns (bool) {
        return voters[i].voted;
    }

    function getVotes() public view returns (Vote[]) {
        return votes;
    }
}