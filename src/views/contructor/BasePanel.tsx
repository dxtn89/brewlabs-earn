import { EXCHANGE_MAP } from "@brewlabs/sdk";
import { useWeb3Modal } from "@web3modal/wagmi/react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Tooltip as ReactTooltip } from "react-tooltip";
import styled from "styled-components";
import { useAccount } from "wagmi";

import { getChainLogo, getDexLogo, getEmptyTokenLogo, getRemoveLiquidityUrl, numberWithCommas } from "utils/functions";
import getTokenLogoURL from "utils/getTokenLogoURL";

import StyledButton from "views/directory/StyledButton";

import { CircleRightSVG, InfoSVG, RightSVG, checkCircleSVG } from "components/dashboard/assets/svgs";
import TokenLogo from "components/logo/TokenLogo";

const LoadingText = () => {
  const [dotCount, setDotCount] = useState([]);
  useEffect(() => {
    setInterval(() => {
      let temp = [];
      for (let i = 0; i < Math.floor(Date.now() / 1000) % 4; i++) temp.push(i);
      setDotCount(temp);
    }, 1000);
  }, []);
  return (
    <div>
      Loading LPs
      {dotCount.map(() => {
        return ".";
      })}
    </div>
  );
};

export function TokenItem({ data, i }) {
  const isNew = data.timeStamp >= Date.now() / 1000 - 3600 * 24;
  return (
    <div className="mx-2 my-1.5 rounded-[30px] border border-[#FFFFFF80] p-[20px_12px_20px_12px] transition-all duration-300 hover:border-yellow sm:mx-4 sm:my-2.5  sm:p-6">
      <ReactTooltip anchorId={"appValue" + i} place="top" content="Approximate value in USD" />
      <div className="flex items-center justify-between ">
        <div className="mx-auto flex items-center xmd:mx-0">
          <img src={getChainLogo(data.chainId)} alt={""} className="h-10 w-10 rounded-full border border-black" />
          <img src={getDexLogo(data.a)} alt={""} className="-ml-3 mr-3 h-10 w-10 rounded-full sm:mr-5" />

          <div className="relative mr-3 hidden w-[34px] flex-col items-center text-[#EEBB19] xmd:flex sm:mr-5">
            {isNew ? (
              <>
                <div className="scale-[50%]">{checkCircleSVG}</div>
                <div className="absolute -bottom-2.5 text-xs">New</div>
              </>
            ) : (
              ""
            )}
          </div>
          <div className="flex flex-1 items-center">
            <div className="flex">
              <TokenLogo
                src={getTokenLogoURL(data.token0.address, data.chainId)}
                alt={""}
                classNames="h-10 w-10 rounded-full"
                onError={(e: any) => {
                  e.target.src = getEmptyTokenLogo(data.chainId);
                }}
              />
              <TokenLogo
                src={getTokenLogoURL(data.token1.address, data.chainId)}
                alt={""}
                classNames="-ml-3 h-10 w-10 rounded-full"
                onError={(e: any) => {
                  e.target.src = getEmptyTokenLogo(data.chainId);
                }}
              />
            </div>
            <div className="relative ml-2 flex-1 overflow-hidden text-ellipsis whitespace-nowrap text-white">
              {data.token0.symbol}-{data.token1.symbol}
              <div className="absolute whitespace-nowrap text-[10px]">
                Vol. ${numberWithCommas(data.volume.toFixed(2))}
              </div>
            </div>
          </div>
        </div>
        <div className="relative mt-0 hidden h-[36px] w-[110px] xmd:block">
          <Link href={getRemoveLiquidityUrl(data.a, data.token0, data.token1, data.chainId)} target="_blank">
            <StyledButton type={"quinary"}>
              <div className="-ml-4 font-brand text-xs leading-none">Remove</div>
              <div className="absolute right-2 scale-125 text-[#EEBB19]">{CircleRightSVG}</div>
            </StyledButton>
          </Link>
          <div className="absolute -bottom-[18px] left-2 flex items-center">
            <div className="text-white" id={"appValue" + i}>
              {InfoSVG}
            </div>
            <div className="ml-1 mt-0.5 text-[10px]">${numberWithCommas((data.balance * data.price).toFixed(2))}</div>
          </div>
        </div>
      </div>
      <div className=" flex items-center xmd:hidden">
        {isNew ? (
          <div className="relative mx-3 flex w-[34px] flex-col items-center text-[#EEBB19] sm:mx-5">
            <div className="scale-[50%]">{checkCircleSVG}</div>
            <div className="absolute -bottom-2.5 text-xs">New</div>
          </div>
        ) : (
          ""
        )}
        <div className="relative mx-auto mb-3 mt-5 h-[36px] w-full max-w-[160px]">
          <Link
            href={getRemoveLiquidityUrl(
              data.symbol.toLowerCase().includes("brew") ? "brewlabs" : "default",
              data.token0,
              data.token1,
              data.chainId
            )}
            target="_blank"
          >
            <StyledButton type={"quinary"}>
              <div className="-ml-4 font-brand text-xs leading-none">Remove</div>
              <div className="absolute right-2 scale-125 text-[#EEBB19]">{CircleRightSVG}</div>
            </StyledButton>
          </Link>
          <div className="absolute -bottom-[18px] z-10 flex w-full items-center justify-center">
            <div className="text-white" id={"appValue" + i}>
              {InfoSVG}
            </div>
            <div className="ml-1 mt-0.5 text-[10px]">${numberWithCommas((data.balance * data.price).toFixed(2))}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function BasePanel({
  setCurAction,
  sortedTokens,
  showCount,
  setShowCount,
  isLoading: lpLoading,
  count,
}) {
  const { address: account } = useAccount();
  const { open } = useWeb3Modal();
  return (
    <>
      <div
        className="mt-3.5 flex h-[140px] w-full cursor-pointer items-center justify-center rounded-[30px] border border-dashed border-[#FFFFFF80] hover:border-white hover:text-white"
        onClick={() => setCurAction("addLiquidity")}
      >
        <span className="-mt-1 text-xl leading-none">+</span>&nbsp;
        <div className="leading-none">Construct a liquidity pair</div>
      </div>
      {!account ? (
        <div
          className="mt-4 flex h-[210px] cursor-pointer items-center justify-center rounded-[30px] border border-[#FFFFFF80] hover:border-white hover:text-white"
          onClick={() => open({ view: "Connect" })}
        >
          <span className="text-[#FFFFFF80]">Connect </span>&nbsp;a wallet to view liquidity pairs
        </div>
      ) : (
        <StyledContainer
          className="mt-4 max-h-[512px] overflow-hidden  rounded-[30px] border border-[#FFFFFF80]"
          showCount={showCount}
        >
          <div className={`max-h-[512px] ${showCount >= 4 ? "overflow-y-scroll" : ""}`}>
            {!lpLoading ? (
              sortedTokens.length ? (
                sortedTokens.map((data: any, i: number) => {
                  return <TokenItem key={i} data={data} i={i} />;
                })
              ) : (
                <div className="flex h-full max-h-[210px] min-h-[210px] w-full items-center justify-center">
                  No liquidity tokens found.
                </div>
              )
            ) : (
              <div className="flex h-full max-h-[210px] min-h-[210px] w-full items-center justify-center">
                <LoadingText />
              </div>
            )}
            {count > 3 ? (
              <div
                className="my-5 flex cursor-pointer items-center justify-center text-[#FFFFFF80] transition hover:text-white"
                onClick={() => setShowCount(showCount < count ? count : 3)}
              >
                <div className="leading-none">{showCount < count ? "View more" : "View less"}</div>
                <div className="ml-2 mt-0.5">{RightSVG}</div>
              </div>
            ) : (
              ""
            )}
          </div>
        </StyledContainer>
      )}
    </>
  );
}

const StyledContainer = styled.div<{ showCount: number }>`
  > div {
    ::-webkit-scrollbar {
      width: 16px;
      height: 16px;
      display: block !important;
    }
    ::-webkit-scrollbar-track {
    }
    ::-webkit-scrollbar-thumb:vertical {
      border: 6px solid rgba(0, 0, 0, 0);
      background-clip: padding-box;
      border-radius: 9999px;
      background-color: #eebb19;
    }
    transition: all 0.3s;
    height: ${({ showCount }) => `${showCount > 4 ? `${showCount * 106 + 36}px` : "fit-content"}`};
  }
  .react-tooltip {
    z-index: 100;
    font-size: 14px;
    opacity: 1;
  }
`;
