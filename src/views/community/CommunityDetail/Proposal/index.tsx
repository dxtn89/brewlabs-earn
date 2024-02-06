/* eslint-disable react-hooks/exhaustive-deps */

import { useEffect, useState } from "react";
import SelectionPanel from "./SelectionPanel";
import ProposalList from "./ProposalList";
import { useAccount } from "wagmi";
import { getBalances } from "@hooks/useTokenMultiChainBalance";

const Proposal = ({ community }: { community: any }) => {
  const [curFilter, setCurFilter] = useState(0);
  const [criteria, setCriteria] = useState("");
  const { address: account } = useAccount();

  let addresses = new Object();
  let tokens = new Object();

  Object.keys(community.currencies).map((key, i) => {
    let result = [];
    community.proposals.map((proposal) => (result = [...result, ...proposal.yesVoted, ...proposal.noVoted]));
    (community?.polls ?? []).map((poll) => {
      let totalVotes = [];
      poll.voted.map((vote) => (totalVotes = [...totalVotes, ...vote]));
      result = [...result, ...totalVotes];
    });
    addresses[key] = result;
    tokens[key] = new Array(result.length).fill(community.currencies[key]);
  });

  const totalSupply = community.totalSupply / Math.pow(10, community.currencies[community.coreChainId].decimals);

  const [balances, setBalances] = useState(null);

  const strigifiedTokens = JSON.stringify(tokens);
  const strigifiedAddresses = JSON.stringify(addresses);
  useEffect(() => {
    getBalances(tokens, addresses)
      .then((result) => setBalances(result.balances))
      .catch((e) => console.log(e));
  }, [strigifiedTokens, strigifiedAddresses]);

  const totalProposals = [
    ...community.proposals.map((proposal) => ({ type: "proposal", ...proposal })),
    ...(community?.polls ?? []).map((poll) => ({ type: "poll", ...poll })),
  ];
  const filteredProposals = totalProposals
    .filter(
      (data) =>
        data.title.toLowerCase().includes(criteria.toLowerCase()) ||
        data.description.toLowerCase().includes(criteria.toLowerCase())
    )
    .filter((data) => {
      let totalVoteBalance = 0,
        totalVotes = [];
      if (data.type === "proposal") totalVotes = [...data.yesVoted, ...data.noVoted];
      else for (let i = 0; i < data.voted.length; i++) totalVotes = [...totalVotes, ...data.voted[i]];
      totalVotes.map((account, i) => {
        balances &&
          Object.keys(balances).map((key, j) => {
            const exsitingAccount = balances[key].find((balance, j) => balance.account === account);
            if (exsitingAccount) totalVoteBalance += exsitingAccount.balance;
          });
      });

      totalVoteBalance = (totalVoteBalance / totalSupply) * 100;
      if (curFilter === 0) return true;
      if (curFilter === 1) return data.createdTime + data.duration >= Date.now();
      if (curFilter === 2)
        return data.createdTime + data.duration < Date.now() && totalVoteBalance >= community.quoroumReq / 1;
      if (curFilter === 3)
        return data.createdTime + data.duration < Date.now() && totalVoteBalance < community.quoroumReq / 1;
      return data.owner === account?.toLowerCase();
    });

  return (
    <div>
      <div className="flex justify-end">
        <SelectionPanel
          curFilter={curFilter}
          setCurFilter={setCurFilter}
          criteria={criteria}
          setCriteria={setCriteria}
          proposals={totalProposals}
          community={community}
          balances={balances}
          totalSupply={totalSupply}
        />
      </div>
      <div className="mt-9" />
      <ProposalList community={community} proposals={filteredProposals} />
    </div>
  );
};

export default Proposal;
