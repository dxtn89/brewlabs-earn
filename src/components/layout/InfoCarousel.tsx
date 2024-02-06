import { WNATIVE } from "@brewlabs/sdk";
import { SkeletonComponent } from "@components/SkeletonComponent";
import {
  BarChartSVG,
  ChevronDownSVG,
  CommunitySVG,
  DetailSVG,
  FixedSVG,
  InfoSVG,
  LockSVG,
  NFTFillSVG,
  UpDownSVG,
  chevronLeftSVG,
} from "@components/dashboard/assets/svgs";
import useActiveWeb3React from "@hooks/useActiveWeb3React";
import useTokenPrice from "@hooks/useTokenPrice";
import { BLOCK_TIMES, SECONDS_PER_YEAR } from "config";
import { CommunityContext } from "contexts/CommunityContext";
import { formatEther, formatUnits } from "ethers/lib/utils.js";
import React, { useContext } from "react";
import Carousel from "react-multi-carousel";
import { Tooltip } from "react-tooltip";
import { useAllHomeData } from "state/home/hooks";
import { useIndexes } from "state/indexes/hooks";
import { useAllNftData } from "state/nfts/hooks";
import { numberWithCommas } from "utils/functions";

const responsive = {
  1: {
    breakpoint: { max: 10000, min: 1280 },
    items: 5,
  },
  2: {
    breakpoint: { max: 1280, min: 1024 },
    items: 4,
  },
  3: {
    breakpoint: { max: 1024, min: 768 },
    items: 3,
  },
  4: {
    breakpoint: { max: 768, min: 500 },
    items: 2,
  },
  5: {
    breakpoint: { max: 500, min: 0 },
    items: 1,
  },
};

const InfoCarousel = () => {
  const { totalStakedValues, communities }: any = useContext(CommunityContext);

  const homeDatas = useAllHomeData();
  const { indexes } = useIndexes();
  const { flaskNft: flaskNfts, data } = useAllNftData();

  const chainId = 56;
  let flaskNft = flaskNfts.find((p) => p.chainId === chainId);
  flaskNft = flaskNft ?? flaskNfts[0];

  const ethPrice = useTokenPrice(chainId, WNATIVE[chainId].address);
  const brewsPrice = useTokenPrice(chainId, flaskNft.brewsToken.address);
  const pool = data.find((p) => p.chainId === 56);

  const apr =
    flaskNft.mintFee && pool?.totalStaked
      ? (((+formatEther(pool?.rewardPerBlock ?? "0") * ethPrice * SECONDS_PER_YEAR) / BLOCK_TIMES[chainId]) * 100) /
        ((+formatUnits(flaskNft.mintFee.stable, flaskNft.stableTokens[0].decimals) +
          +formatUnits(flaskNft.mintFee.brews, flaskNft.brewsToken.decimals) * brewsPrice) *
          (pool?.totalStaked ?? 0))
      : 0;

  const recentIndexes = indexes.filter(
    (index) => new Date(index.createdAt).getTime() / 1000 > Date.now() / 1000 - 3600 * 24
  );
  const recentCommunities = communities.filter(
    (community) => new Date(community.createdAt).getTime() / 1000 > Date.now() / 1000 - 3600 * 24
  );

  const items = [
    {
      name: "Treasury Value",
      suffix: "USD",
      icon: BarChartSVG,
      value:
        homeDatas.treasuryValues.value === null ? (
          <SkeletonComponent className="!min-w-[100px]" />
        ) : (
          `$${numberWithCommas(homeDatas.treasuryValues.value.toFixed(2))}`
        ),
      tooltip: "Total treasury value across all chains.",
      subItem: {
        value:
          homeDatas.treasuryValues.value24h === null ? (
            <SkeletonComponent className="!min-w-[60px]" />
          ) : (
            `$${numberWithCommas(homeDatas.treasuryValues.value24h.toFixed(2))}`
          ),
        suffix: "USD",
      },
    },
    {
      name: "Total Value Locked",
      suffix: "USD",
      icon: LockSVG,
      value:
        totalStakedValues.value === null ? (
          <SkeletonComponent className="!min-w-[100px]" />
        ) : (
          `$${numberWithCommas(totalStakedValues.value.toFixed(2))}`
        ),
      tooltip: "TotaTVL or Total Value Locked across all chains.",
      subItem: {
        value:
          totalStakedValues.changedValue === null ? (
            <SkeletonComponent className="!min-w-[60px]" />
          ) : (
            `$${numberWithCommas(totalStakedValues.changedValue.toFixed(2))}`
          ),
        suffix: "USD",
      },
    },

    {
      name: "Fee’s collected",
      suffix: "USD",
      icon: UpDownSVG,
      value:
        homeDatas.feeCollected.fee === null ? (
          <SkeletonComponent className="!min-w-[100px]" />
        ) : (
          `$${numberWithCommas(homeDatas.feeCollected.fee.toFixed(2))}`
        ),
      tooltip: "Total fees collected.",
      subItem: {
        value:
          homeDatas.feeCollected.fee24h === null ? (
            <SkeletonComponent className="!min-w-[60px]" />
          ) : (
            `$${numberWithCommas(homeDatas.feeCollected.fee24h.toFixed(2))}`
          ),
        suffix: "USD",
      },
    },
    {
      name: "Transactions",
      suffix: "Tx",
      icon: FixedSVG,
      value:
        homeDatas.transactions.count === null ? (
          <SkeletonComponent className="!min-w-[100px]" />
        ) : (
          `${numberWithCommas(homeDatas.transactions.count)}`
        ),
      tooltip: "Total transactions made across Brewlabs dAPP.",
      subItem: {
        value:
          homeDatas.transactions.count24h === null ? (
            <SkeletonComponent className="!min-w-[60px]" />
          ) : (
            `${numberWithCommas(homeDatas.transactions.count24h)}`
          ),
        suffix: "Tx",
      },
    },
    {
      name: "Communities",
      suffix: "",
      icon: CommunitySVG,
      value: numberWithCommas(communities.length),
      tooltip: "Total communities added.",
      subItem: {
        value: numberWithCommas(recentCommunities.length),
        suffix: "ADDED",
      },
    },
    {
      name: "User Indexes",
      suffix: "",
      icon: DetailSVG,
      value: numberWithCommas(indexes.length),
      tooltip: "Total user indexes active.",
      subItem: {
        value: numberWithCommas(recentIndexes.length),
        suffix: "ADDED",
      },
    },
    {
      name: "Brewlabs NFT Staking",
      suffix: "APR",
      icon: NFTFillSVG,
      value: !apr ? <SkeletonComponent className="!min-w-[100px]" /> : `${apr.toFixed(2)}%`,
      tooltip:
        "NFT minting fees (stablecoin) are designated to the following categories: 50% of mint fee to NFT staking protocol, 25% of mint fees to Brewlabs Treasury, 25% of mint fees to Brewlabs development fund. 100% of all BREWLABS tokens used in mint fees are sent to Brewlabs Treasury.",
      subItem: {
        value:
          homeDatas.nftStakings.stakedCount === null ? (
            <SkeletonComponent className="!min-w-[60px]" />
          ) : (
            `${numberWithCommas(homeDatas.nftStakings.stakedCount)}`
          ),
        suffix: "STAKED",
      },
    },
  ];
  const CustomRightArrow = ({ onClick }) => {
    return (
      <div onClick={() => onClick()} className="absolute  -right-5 -scale-125 cursor-pointer text-[#7a7a7c]">
        {chevronLeftSVG}
      </div>
    );
  };

  const CustomLeftArrow = ({ onClick }) => {
    return (
      <div onClick={() => onClick()} className="absolute -left-5 scale-125 cursor-pointer text-[#7a7a7c]">
        {chevronLeftSVG}
      </div>
    );
  };
  return (
    <div className="relative mx-3 mb-20">
      <Carousel
        responsive={responsive}
        infinite={true}
        draggable={false}
        autoPlay={true}
        autoPlaySpeed={2500}
        arrows={true}
        customRightArrow={<CustomRightArrow onClick={undefined} />}
        customLeftArrow={<CustomLeftArrow onClick={undefined} />}
        className="!static !overflow-visible !overflow-x-clip"
        itemClass="flex justify-center"
      >
        {items.map((data, i) => {
          return (
            <div key={i} className="p-2">
              <div className="primary-shadow relative h-[80px] w-[210px] cursor-pointer rounded-[12px] bg-[linear-gradient(180deg,#35353B_1.04%,rgba(35,35,38,0.00)_100%)] p-4 [&>*:first-child]:hover:!opacity-100">
                <div className="primary-shadow absolute -bottom-4 right-4 flex items-center rounded-[10px] bg-[#262629] p-[6px_16px] opacity-0 transition">
                  <div className="mr-1.5 -scale-y-100 text-primary [&>svg]:!h-2 [&>svg]:!w-2">{ChevronDownSVG}</div>
                  <div className="flex items-end text-xs text-white">
                    {data.subItem.value}&nbsp;
                    <span className="text-[10px] leading-[1.2] text-[#FFFFFF80]">{data.subItem.suffix} 24hrs</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="text-sm text-primary">{data.name}</div>
                  <div className="text-tailwind [&>svg]:!h-4 [&>svg]:!w-4">{data.icon}</div>
                </div>
                <div className="flex h-[30px] items-center justify-between text-xl text-white">
                  <div className="flex items-end">
                    {data.value}&nbsp;<span className="text-base text-sm text-[#FFFFFF80]">{data.suffix}</span>
                  </div>
                  <div
                    className="mt-1 cursor-pointer text-tailwind transition hover:text-[#FFFFFF80] [&>svg]:!h-4 [&>svg]:!w-4 [&>svg]:!opacity-100 "
                    data-tooltip-id={"my-tooltip"}
                    data-tooltip-content={data.tooltip}
                    data-tooltip-place="top"
                  >
                    {InfoSVG}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </Carousel>
      <Tooltip id={"my-tooltip"} />
    </div>
  );
};

export default InfoCarousel;
