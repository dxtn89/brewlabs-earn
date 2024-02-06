import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useAccount } from "wagmi";

import { API_URL } from "config/constants";
import { useFastRefreshEffect } from "@hooks/useRefreshEffect";
import { useCommunuityValues } from "./useCommunityValues";

const CommunityContext: any = React.createContext({
  communities: [],
  joinOrLeaveCommunity: () => {},
  treasuryValue: 0,
});

const CommunityContextProvider = ({ children }: any) => {
  const [communities, setCommunities] = useState([]);
  const [newProposalCount, setNewProposalCount] = useState(0);

  const { address: account } = useAccount();

  const { totalStakedValues } = useCommunuityValues();

  const handleError = (data, successText = "") => {
    if (!data.success) toast.error(data.msg);
    else if (successText) toast.success(successText);
  };
  async function getCommunities() {
    axios.post(`${API_URL}/community/getCommunities`, {}).then((data) => {
      setCommunities(data.data);
    });
  }

  async function addCommunity(community) {
    const result = await axios.post(`${API_URL}/community/addCommunities`, { community });
    handleError(result.data, "Community Added");
    getCommunities();
  }

  async function joinOrLeaveCommunity(address, pid) {
    const result = await axios.post(`${API_URL}/community/joinOrLeaveCommunity`, {
      address: address.toLowerCase(),
      pid,
    });
    handleError(result.data);
    getCommunities();
  }

  async function addProposal(proposal, pid) {
    const result = await axios.post(`${API_URL}/community/addProposal`, { proposal, pid });
    handleError(result.data, "Proposal Submitted");
    getCommunities();
  }

  async function addPoll(poll, pid) {
    const result = await axios.post(`${API_URL}/community/addPoll`, { poll, pid });
    handleError(result.data, "Poll Submitted");
    getCommunities();
  }

  async function voteOrAgainst(address, pid, index, type) {
    const result = await axios.post(`${API_URL}/community/voteOrAgainst`, {
      address: address.toLowerCase(),
      pid,
      index,
      type,
    });
    handleError(result.data, "Voted Successfully");
    getCommunities();
    return result.data.success;
  }

  async function voteOnPoll(address, pid, index, optionIndex) {
    const result = await axios.post(`${API_URL}/community/voteOnPoll`, {
      address: address.toLowerCase(),
      pid,
      index,
      optionIndex,
    });
    handleError(result.data, "Voted Successfully");
    getCommunities();
    return result.data.success;
  }

  useFastRefreshEffect(() => {
    getCommunities();
  }, []);

  const stringifiedCommunities = JSON.stringify(communities);

  useEffect(() => {
    let proposalCount = 0;
    account &&
      communities.map(
        (community) =>
          (proposalCount += community.members.includes(account.toLowerCase())
            ? community.proposals.filter(
                (proposal) =>
                  ![...proposal.yesVoted, ...proposal.noVoted].includes(account?.toLowerCase()) &&
                  proposal.createdTime / 1 + proposal.duration / 1 >= Date.now()
              ).length
            : 0)
      );
    setNewProposalCount(proposalCount);
  }, [stringifiedCommunities]);

  return (
    <CommunityContext.Provider
      value={{
        communities,
        joinOrLeaveCommunity,
        addProposal,
        voteOrAgainst,
        addCommunity,
        addPoll,
        voteOnPoll,
        newProposalCount,
        totalStakedValues: totalStakedValues,
      }}
    >
      {children}
    </CommunityContext.Provider>
  );
};

export { CommunityContext, CommunityContextProvider };
