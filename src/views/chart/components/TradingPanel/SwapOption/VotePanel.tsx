import { InfoSVG, NFTSVG } from "@components/dashboard/assets/svgs";
import { usePairVoteInfo } from "../../TokenInfo/hooks/usePairInfo";
import { useAccount } from "wagmi";
import { Tooltip as ReactTooltip } from "react-tooltip";
import NFTComponent from "@components/NFTComponent";
import { useActiveNFT } from "views/nft/hooks/useActiveNFT";

export default function VotePanel({ selectedPair }) {
  const voteColors = ["#DC4545", "#E96E6E", "#FFDE00", "#32FFB5", "#2FD35D"];

  const { voteOrAgainst, info } = usePairVoteInfo(selectedPair.address, selectedPair.chainId);
  const { address: account } = useAccount();

  const isVoted = info?.votedList.find((voted) => voted.account === account?.toLowerCase());

  let rates = [
    { index: 0, value: 0 },
    { index: 1, value: 0 },
    { index: 2, value: 0 },
    { index: 3, value: 0 },
    { index: 4, value: 0 },
  ];
  info?.votedList.map((voted, i) => rates[voted.rate].value++);
  const bestVoted = info?.votedList.length ? rates.sort((a, b) => b.value - a.value)[0].index : 2;

  const activeRarity = useActiveNFT();

  return (
    <div className="primary-shadow mt-2 rounded-md bg-[#B9B8B80D] p-[8px_16px_16px_16px]">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <div className="text-base font-bold text-white">Vibe</div>
        </div>
        <div className="flex items-center">
          <div
            className={`text-xs ${isVoted ? "" : "hidden"} mr-2`}
            style={{ color: isVoted ? voteColors[isVoted.rate] : "" }}
          >
            VOTED
          </div>
          <NFTComponent />
        </div>
      </div>
      <div className="my-3 text-sm text-[#FFFFFFBF]">Community perspective on this pair.</div>
      <div className="mx-auto flex max-w-[288px] items-center text-sm">
        <div className="text-[#FFFFFF80]">Avoid</div>
        <div className="mx-2 flex flex-1 items-center">
          {voteColors.map((color, i) => {
            return (
              <div
                key={i}
                className={`mx-[1px] ${
                  bestVoted === i ? "h-4 w-10" : "h-2 flex-1"
                }  primary-shadow cursor-pointer transition-all hover:scale-[1.2]`}
                style={{ background: color }}
                onClick={() =>
                  activeRarity >= 1 && voteOrAgainst(selectedPair.address, account, selectedPair.chainId, i)
                }
              />
            );
          })}
        </div>
        <div className="text-white">Great</div>
      </div>
    </div>
  );
}
