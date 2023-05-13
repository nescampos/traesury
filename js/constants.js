var investmentContractCode = `

@compiler >= 6

include "String.aes"
include "List.aes"


payable contract InvestmentClub =
  record member = {
    address : address,
    balance : int
    }

  record proposal = {
    id : int,
    creator : address,
    amount : int,
    destination : address,
    status : string,
    description: string,
    votesFor : int,
    votesAgainst : int,
    voted : map(address, bool)
    }

  record club = {
    id : int,
    name : string,
    members : map(address, member),
    pool : int,
    proposals : map(int, proposal),
    proposalCounter : int
    }

  record state = {
    clubs : map(int, club),
    clubCounter : int
    }

  stateful entrypoint init() : state =
    { clubs = {}, clubCounter = 0 }

  entrypoint getClubById(clubId : int) : club =
    switch(Map.member(clubId, state.clubs))
      true => state.clubs[clubId]
      false => abort("the club does not exist")

  stateful entrypoint createClub(name : string) : int =
    let clubId = state.clubCounter + 1
    let club = { id = clubId, name = name, members = {}, pool = 0, proposals = {}, proposalCounter = 0 }
    put(state{ clubs[clubId] = club, clubCounter = clubId })
    let member = { address = Call.caller, balance = 0 }
    put(state{ clubs[clubId].members[Call.caller] = member })
    clubId

  stateful entrypoint joinClub(clubId : int) =
    require(Map.member(clubId, state.clubs), "The club does not exist")
    let club = state.clubs[clubId]
    require(Map.size(club.members) < 99, "The club is full, no more members can be added")
    require(!Map.member(Call.caller, club.members), "You are already a member of the club")
    let member = { address = Call.caller, balance = 0 }
    put(state{ clubs[clubId].members[Call.caller] = member })

  payable stateful entrypoint contributeToClub(clubId : int) =
    require(Map.member(clubId, state.clubs), "the club does not exist")
    let club = state.clubs[clubId]
    require(Map.member(Call.caller, club.members), "You are not a member of the club")
    require(Call.value > 0, "You must submit AE to contribute")
    let member = club.members[Call.caller]
    //Chain.spend(member.address, amount)
    let newBalance = member.balance + Call.value
    put(state{ clubs[clubId].members[Call.caller].balance = newBalance })
    let newPool = club.pool + Call.value
    put(state{ clubs[clubId].pool = newPool })
    

  stateful entrypoint createProposal(clubId : int, amount : int, destination : address, description: string) =
    require(Map.member(clubId, state.clubs), "the club does not exist")
    let club = state.clubs[clubId]
    require(Map.member(Call.caller, club.members), "You are not a member of the club")
    require(club.pool >= amount, "The amount exceeds the pool of the club")
    require(amount > 0, "The amount of the proposal must be greater than 0")
    require(getBalanceByClub(Call.caller, clubId), "Your balance in the club must be greater than 0")

    let proposalId = club.proposalCounter + 1
    let proposal = { id = proposalId, creator = Call.caller, amount = amount, destination = destination, status = "Pending", description = description, votesFor = 0,
      votesAgainst = 0,
      voted = {} }

    put(state{ clubs[clubId].proposals[proposalId] = proposal})
    put(state{ clubs[clubId].proposalCounter = proposalId })
    proposalId

  entrypoint getVotesForProposal(clubId: int, proposalId: int): map(address, bool) =
    require(Map.member(clubId, state.clubs), "the club does not exist")
    let proposal = getProposalById(clubId, proposalId)
    proposal.voted

  stateful entrypoint voteOnProposal(clubId : int, proposalId : int, vote : bool) =
    require(Map.member(clubId, state.clubs), "the club does not exist")
    let club = state.clubs[clubId]
    require(Map.member(Call.caller, club.members), "You are not a member of the club")
    require(Map.member(proposalId, club.proposals), "The proposal does not exist")
    require(getBalanceByClub(Call.caller, clubId), "Your balance in the club must be greater than 0")
    let proposal = club.proposals[proposalId]
    require(!Map.member(Call.caller, proposal.voted), "You have already voted on this proposal")
    require(proposal.status == "Pending", "The proposal is no longer pending")
    let updatedProposal =  proposal{voted[Call.caller] = vote, votesFor = proposal.votesFor +(if (vote) 1 else 0), votesAgainst = proposal.votesAgainst + (if (vote) 0 else 1) }
    put(state{ clubs[clubId].proposals[proposalId] = updatedProposal })

  payable stateful entrypoint executeProposal(clubId : int, proposalId : int) =
    require(Map.member(clubId, state.clubs), "the club does not exist")
    let club = state.clubs[clubId]
    require(Map.member(Call.caller, club.members), "You are not a member of the club")
    require(Map.member(proposalId, club.proposals), "The proposal does not exist")
    require(isValidExecutor(clubId, proposalId), "Only the creator of the proposal can execute it")
    let proposal = club.proposals[proposalId]
    require(club.pool >= proposal.amount, "The amount exceeds the pool of the club")
    let votesFor = proposal.votesFor
    let votesAgainst = proposal.votesAgainst

    require(votesFor > votesAgainst, "The proposal has not been approved")

    put(state{ clubs[clubId].proposals[proposalId].status = "Executed" })
    //let member = club.members[Call.caller]
    let updatedPool = club.pool - proposal.amount
    Chain.spend(proposal.destination, proposal.amount)
    put(state{ clubs[clubId].pool = updatedPool })

  stateful entrypoint closeProposal(clubId: int, proposalId: int) =
    require(Map.member(clubId, state.clubs), "the club does not exist")
    let proposal = getProposalById(clubId, proposalId)
    require(proposal.status == "Pending", "The proposal is not in pending status")
    require(isValidExecutor(clubId, proposalId), "Only the proposal creator can close the proposal")
    put(state{ clubs[clubId].proposals[proposalId].status = "Closed" })

  entrypoint getProposalById(clubId : int, proposalId : int) : proposal =
    switch(Map.member(clubId, state.clubs))
      true =>
        let club = state.clubs[clubId]
        switch(Map.member(proposalId, club.proposals))
          true => club.proposals[proposalId]
          false => abort("The proposal does not exist")
      false => abort("the club does not exist")

  entrypoint getProposalsByClub(clubId : int) : map(int, proposal) =
    switch(Map.member(clubId, state.clubs))
      true => state.clubs[clubId].proposals
      false => abort("the club does not exist")

  entrypoint listClubs() : map(int, club) =
    state.clubs

  entrypoint isUserInClub(userAddress: address, clubId: int) : bool =
    let clubs = state.clubs
    switch(Map.lookup(clubId, clubs))
        None => false
        Some(club) => Map.member(userAddress, club.members)

  stateful entrypoint leaveClub(clubId: int) =
    require(Map.member(clubId, state.clubs), "the club does not exist")
    let club = state.clubs[clubId]
    require(Map.member(Call.caller, club.members), "You are not a member of the club")
    
    let updatedMembers = Map.delete(Call.caller, club.members)
    let updatedClub = club{ members = updatedMembers }
    
    put(state{ clubs[clubId] = updatedClub })

  function isValidExecutor(clubId: int, proposalId: int) : bool =
    let club = state.clubs[clubId]
    let proposal = getProposalById(clubId, proposalId)
    Call.caller == proposal.creator

  entrypoint getBalanceByClub(userAddress: address, clubId: int) : bool =
    let club = state.clubs[clubId]
    let member = club.members[Call.caller]
    member.balance >= 0

`;

var investmentContractAddress = 'ct_yDEFosoW9EsrXDTGs2rq7WwaxvR2XXB8hw1tZgkEaDZyUGaNY';