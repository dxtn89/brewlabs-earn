import PollCard from "./PollCard";
import ProposalCard from "./ProposalCard";

const ProposalList = ({ community, proposals }: { community: any; proposals: any }) => {
  const sortedProposal = proposals.sort((a, b) => b.createdTime - a.createdTime);
  return sortedProposal ? (
    sortedProposal.map((data, i) => {
      return data.type === "proposal" ? (
        <ProposalCard key={i} proposal={data} community={community} index={sortedProposal.length - i - 1} />
      ) : (
        <PollCard key={i} poll={data} community={community} index={sortedProposal.length - i - 1} />
      );
    })
  ) : (
    <div className="primary-shadow flex h-[180px]  items-center justify-center rounded bg-[#B9B8B80D] text-2xl text-primary">
      No proposals{" "}
    </div>
  );
};

export default ProposalList;
