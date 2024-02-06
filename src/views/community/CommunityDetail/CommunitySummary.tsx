import { FixedSVG, LinkSVG, MinusSVG, PlusSVG, checkCircleSVG } from "@components/dashboard/assets/svgs";
import { Tooltip as ReactTooltip } from "react-tooltip";
import TokenLogo from "@components/logo/TokenLogo";
import { getChainLogo, numberWithCommas } from "utils/functions";
import getTokenLogoURL from "utils/getTokenLogoURL";
import StyledButton from "views/directory/StyledButton";
import { BASE_URL } from "config";
import { useActiveChainId } from "@hooks/useActiveChainId";
import { getMultiChainTotalBalances, useTotalUserBalance } from "@hooks/useTokenMultiChainBalance";
import { useContext, useEffect, useState } from "react";
import { CommunityContext } from "contexts/CommunityContext";
import { toast } from "react-toastify";
import { isAddress } from "utils";
import { useAccount } from "wagmi";

const CommunitySummary = ({ community }: { community: any }) => {
  const { chainId } = useActiveChainId();
  const { address: account } = useAccount();
  // const account = "0x330518cc95c92881bCaC1526185a514283A5584D";
  const [isCopied, setIsCopied] = useState(false);

  const { joinOrLeaveCommunity }: any = useContext(CommunityContext);
  const totalBalance = useTotalUserBalance(
    Object.keys(community.currencies).map((key) => community.currencies[key]),
    account
  );
  const totalSupply = community.totalSupply / Math.pow(10, community.currencies[community.coreChainId].decimals);

  const onShareCommunity = () => {
    setIsCopied(true);
    setTimeout(() => {
      setIsCopied(false);
    }, 1000);
    navigator.clipboard.writeText(`${BASE_URL}${location.pathname}`);
  };

  const isJoined = community.members.includes(account?.toLowerCase());

  return (
    <div className="mt-10 flex flex-col flex-wrap items-center justify-between sm:flex-row sm:items-start lg:mt-0">
      <div className="primary-shadow flex h-[200px] w-[200px] items-center justify-center overflow-hidden rounded bg-[#0e2130]">
        <img src={community.logo} className="w-[120px] rounded" alt={""} />
      </div>
      <div className="mx-0 mt-6 sm:mx-6 sm:mt-0">
        <StyledButton
          className={`!h-fit !w-full p-[16px_12px] !font-black sm:!w-fit ${isJoined ? "!bg-danger" : ""}`}
          onClick={() => {
            if (!account) toast.error("Please Connect Wallet");
            else joinOrLeaveCommunity(account, community.pid);
          }}
        >
          <div className="flex items-center">
            <div className="mr-[18px]">{isJoined ? MinusSVG : PlusSVG}</div>
            <div>
              {isJoined ? "Leave" : "Join"} <span className="font-normal">{community.name} Community</span>
            </div>
          </div>
        </StyledButton>
        <a href={`${BASE_URL}/swap?outputCurrency=${community.currencies[chainId]?.address}`} target="_blank">
          <StyledButton className="mt-3 !h-fit !w-full p-[10px_12px] !font-normal leading-[1.2] sm:!w-fit">
            <span className="font-semibold">Buy</span>&nbsp;{community.name}
          </StyledButton>
        </a>
        <div className="mt-3.5 flex items-center">
          <div className="relative">
            <TokenLogo
              src={getTokenLogoURL(
                isAddress(community.currencies[community.coreChainId].address),
                community.coreChainId
              )}
              classNames="w-8"
            />
          </div>
          <div className="ml-3 text-sm text-[#FFFFFFBF]">
            {numberWithCommas(totalBalance.toFixed(2))} {community.currencies[community.coreChainId].symbol} in my
            wallet.
          </div>
        </div>
        <div className="mt-3 flex items-center">
          <div
            className="flex w-8 justify-center text-primary [&>*:first-child]:!h-5 [&>*:first-child]:!w-5"
            id={"Voting power."}
          >
            {FixedSVG}
          </div>
          <div className="ml-3 text-sm text-[#FFFFFFBF]">
            {((totalBalance / totalSupply) * 100).toFixed(4)}% {community.currencies[community.coreChainId].symbol}{" "}
          </div>
        </div>
        <div className="mt-3 flex items-center">
          <div
            className="flex w-8 justify-center text-[#FFFFFFBF] [&>*:first-child]:!h-4 [&>*:first-child]:!w-4"
            id={"Measured by how active this wallet is voting on proposals."}
          >
            {checkCircleSVG}
          </div>
          <div className="ml-3 text-sm text-[#FFFFFFBF]">Contributor Score </div>
        </div>
      </div>
      <div className="mt-10 w-full lg:mt-0 lg:w-[300px]">
        <div className="flex items-center justify-between text-white">
          <div className="text-lg">{community.name}</div>
          <div className="text-xs uppercase">{community.type}</div>
        </div>
        <div className="mt-1 text-sm leading-[1.2] text-[#FFFFFF80]">
          {community.description.split("\n").map((data: any, i: number) => {
            return data === "" ? <br key={i} /> : data;
          })}
        </div>
        <StyledButton className="mt-3 !h-fit !w-fit p-[7px_12px]" onClick={() => onShareCommunity()}>
          {isCopied ? (
            "Copied"
          ) : (
            <div className="flex items-center font-normal">
              <div>
                <span className="font-black">Share</span> {community.name} Commuinty
              </div>
              <div className="ml-2.5 text-tailwind">{LinkSVG}</div>
            </div>
          )}
        </StyledButton>
      </div>
      <ReactTooltip anchorId={"Voting power."} place="top" content="Voting power." />
      <ReactTooltip
        anchorId={"Measured by how active this wallet is voting on proposals."}
        place="top"
        content="Measured by how active this wallet is voting on proposals."
      />
    </div>
  );
};

export default CommunitySummary;
