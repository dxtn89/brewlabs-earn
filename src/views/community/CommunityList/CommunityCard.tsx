import Notification from "@components/Notification";
import { SkeletonComponent } from "@components/SkeletonComponent";
import { StarIcon as StarOutlineIcon, TrashIcon } from "@heroicons/react/24/outline";
import { StarIcon } from "@heroicons/react/24/solid";
import useTokenBalances from "@hooks/useTokenMultiChainBalance";
import Link from "next/link";
import StyledButton from "views/directory/StyledButton";
import { useAccount } from "wagmi";

const CommunityCard = ({
  community,
  favourites,
  getFavourites,
}: {
  community: any;
  favourites: any;
  getFavourites: any;
}) => {
  const { address: account } = useAccount();

  let tokens = new Object();
  Object.keys(community.currencies).map(
    (key, i) => (tokens[key] = community.treasuries[key].map((data) => community.currencies[key]))
  );
  const { totalBalance } = useTokenBalances(tokens, community.treasuries);

  const totalSupply = community.totalSupply / Math.pow(10, community.currencies[community.coreChainId].decimals);

  const totalProposals = [...community.proposals, ...(community?.polls ?? [])];

  const archivedProposalCount = totalProposals.filter(
    (data) => data.createdTime / 1 + data.duration / 1 < Date.now()
  ).length;
  const activeProposalCount = totalProposals.length - archivedProposalCount;

  let addresses = new Object();
  tokens = new Object();
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

  const { totalBalance: totalVoteBalance } = useTokenBalances(tokens, addresses);

  const totalVotePercent = totalProposals.length ? (totalVoteBalance / totalProposals.length / totalSupply) * 100 : 0;

  const newCount = account
    ? community.proposals.filter(
        (proposal) =>
          community.members.includes(account.toLowerCase()) &&
          ![...proposal.yesVoted, ...proposal.noVoted].includes(account?.toLowerCase()) &&
          proposal.createdTime / 1 + proposal.duration / 1 >= Date.now()
      ).length
    : 0;

  const onFavourites = (_address: string, type: number) => {
    if (type === 1) {
      localStorage.setItem(`communityfavourites`, JSON.stringify([...favourites, _address]));
      getFavourites();
    }
    if (type === 2) {
      let temp = [...favourites];
      temp.splice(favourites.indexOf(_address), 1);
      localStorage.setItem(`communityfavourites`, JSON.stringify(temp));
      getFavourites();
    }
  };

  return (
    <div className="primary-shadow mt-2.5 flex w-full cursor-pointer flex-col items-start justify-between rounded bg-[#B9B8B80D] p-[15px_12px] hover:bg-[#b9b8b81c] sm:p-[15px_44px] xl:flex-row xl:items-center">
      <div className="mr-10 flex w-full max-w-full flex-1 flex-col items-start justify-between sm:flex-row sm:items-center xl:w-[45%] xl:max-w-[380px]">
        <div className="flex items-center justify-between xl:justify-start">
          <div className="text-primary">
            {!favourites.includes(community.pid) ? (
              <StarOutlineIcon
                className={"h-[18px] hover:opacity-70"}
                onClick={() => {
                  onFavourites(community.pid, 1);
                }}
              />
            ) : (
              <StarIcon
                className={"h-[18px]"}
                onClick={() => {
                  onFavourites(community.pid, 2);
                }}
              />
            )}
          </div>
          <div className="primary-shadow mx-[30px] flex h-[68px] w-[80px] items-center justify-center overflow-hidden rounded bg-[#0e2130]">
            <img src={community.logo} alt={""} className=" w-[48px]  rounded" />
          </div>
          <div className="flex-1 leading-[1.2] text-white">
            <div className="text-lg uppercase leading-[1.2]">{community.name}</div>
            <div className="mt-1 text-xs text-[#FFFFFFBF]">{community.communityType}</div>
          </div>
        </div>
        <div className="leading-[1.2] text-white">
          <div className="text-lg">{community.members.length}</div>
          <div className="text-xs text-[#FFFFFFBF]">Members</div>
        </div>
      </div>
      <div className="mt-4 flex w-full max-w-full flex-col items-start justify-between sm:flex-row sm:items-center xl:mt-0 xl:w-[55%] xl:max-w-[600px]">
        <div className="relative mb-4 leading-[1.2] text-white xl:mb-0">
          <div className="text-lg">{activeProposalCount}</div>
          <div className="text-xs text-[#FFFFFFBF]">Active proposals</div>
          <Notification count={newCount} />
        </div>
        <div className="mb-4 leading-[1.2] text-white xl:mb-0">
          <div className="text-lg">{archivedProposalCount}</div>
          <div className="text-xs text-[#FFFFFFBF]">Archived proposals</div>
        </div>
        <div className="mb-4 leading-[1.2] text-white xl:mb-0">
          <div className="flex text-lg">
            {totalVoteBalance === null && totalBalance === null ? (
              <SkeletonComponent />
            ) : (
              `${totalVotePercent.toFixed(2)}%`
            )}
          </div>
          <div className="text-xs text-[#FFFFFFBF] text-[#FFFFFFBF]">Engagement</div>
        </div>
        <Link href={`/communities/${community.pid}`} className=" mb-4 xl:mb-0">
          <StyledButton className="!w-fit p-[5px_12px] !text-sm !font-normal !leading-[1.2]">
            Enter community
          </StyledButton>
        </Link>
      </div>
    </div>
  );
};

export default CommunityCard;
