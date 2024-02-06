import { ChartSVG, FilledFixedSVG, LiquiditySVG, VolumeSVG, downSVG, upSVG } from "@components/dashboard/assets/svgs";
import TokenLogo from "@components/logo/TokenLogo";
import { StarIcon } from "@heroicons/react/24/solid";
import { isAddress } from "utils";
import { numberWithCommas } from "utils/functions";
import getTokenLogoURL from "utils/getTokenLogoURL";
import { useContext } from "react";
import { ChartContext } from "contexts/ChartContext";
import StyledPrice from "@components/StyledPrice";

export default function TokenInfo({ selectedPair, showReverse, marketInfos }) {
  const { favourites, onFavourites }: any = useContext(ChartContext);
  const price = selectedPair.priceUsd;

  const infos = [
    {
      icon: LiquiditySVG,
      value: `$${numberWithCommas((selectedPair.liquidity.usd ?? 0).toFixed(2))} Liquidity`,
    },
    {
      icon: FilledFixedSVG,
      value: `${numberWithCommas(marketInfos?.holders ?? 0)} Holders`,
    },
    {
      icon: VolumeSVG,
      value: (
        <span>
          {`$${numberWithCommas((selectedPair.volume.h24 ?? 0)?.toFixed(2))} Volume`}&nbsp;&nbsp;&nbsp;
          <span className={marketInfos.volume24hChange >= 0 ? "text-[#32FFB5]" : "text-[#DC4545]"}>{`${
            marketInfos.volume24hChange >= 0 ? "+" : ""
          }${(marketInfos.volume24hChange ?? 0).toFixed(2)}% (24H)`}</span>
        </span>
      ),
    },
    {
      icon: ChartSVG,
      value: `$${numberWithCommas(((marketInfos.totalSupply ?? 0) * (price ?? 0))?.toFixed(2))} Marketcap`,
    },
  ];

  const makePricePanel = () => {
    return (
      <div className="flex items-center">
        <div className={`flex items-center ${selectedPair.priceChange.h24 >= 0 ? "text-green" : "text-danger"}`}>
          <div className="mr-1 whitespace-nowrap text-sm">
            {selectedPair.priceChange.h24 >= 0 ? "+" : ""}
            {(selectedPair.priceChange.h24 ?? 0).toFixed(2)}% (24h)
          </div>
          <div className="scale-[80%]">{selectedPair.priceChange.h24 >= 0 ? upSVG : downSVG}</div>
        </div>
        <div className="ml-2 text-lg font-bold text-white">
          <StyledPrice price={price} />
        </div>
      </div>
    );
  };

  return (
    <div
      className={`relative z-0 mr-0 mt-2 flex flex-col items-start justify-between lg:flex-row lg:items-center ${
        showReverse ? "2xl:mr-[332px]" : "2xl:mr-[292px]"
      }`}
    >
      <div className="flex w-full flex-col items-start xl:flex-row xl:items-center">
        <div className="flex w-full flex-col items-start justify-between sm:flex-row sm:items-center xl:w-fit">
          <div className="flex flex-col items-center lg:flex-row ">
            <div className={`flex w-fit items-center ${showReverse ? "2xl:w-[280px]" : "2xl:w-[320px]"}`}>
              <div className="cursor-pointer" onClick={() => onFavourites(selectedPair, 1)}>
                <StarIcon
                  className={`h-5 w-5 ${
                    favourites.find(
                      (favourite) =>
                        favourite.address === selectedPair.address && favourite.chainId === selectedPair.chainId
                    )
                      ? "text-primary"
                      : "text-tailwind"
                  }`}
                />
              </div>
              <img
                src={
                  (selectedPair.otherdexId ?? selectedPair.a) === "brewlabs"
                    ? "/images/brewlabsRouter.png"
                    : `https://dd.dexscreener.com/ds-data/dexes/${selectedPair.dexId}.png`
                }
                alt={""}
                className="primary-shadow mx-2 h-6 w-6 rounded-full"
              />
              <div className="flex">
                <TokenLogo
                  src={getTokenLogoURL(isAddress(selectedPair.baseToken.address), selectedPair.chainId)}
                  classNames="primary-shadow z-10 -mr-2 h-6 w-6 rounded-full"
                />
                <TokenLogo
                  src={getTokenLogoURL(isAddress(selectedPair.quoteToken.address), selectedPair.chainId)}
                  classNames="primary-shadow h-6 w-6 rounded-full"
                />
              </div>
              <div className="ml-2 text-lg font-bold text-white">
                {selectedPair.baseToken.symbol}-{selectedPair.quoteToken.symbol}
              </div>
            </div>
          </div>
          <div className="-mb-1 mt-3 block sm:mb-0 sm:mt-0 xl:hidden">{makePricePanel()}</div>
        </div>
        <div className="ml-0 mt-4 flex flex-wrap lg:ml-4 xl:mt-0">
          {infos.map((data, i) => {
            return (
              <div key={i} className="my-1 mr-1.5 flex items-center rounded-[5px] bg-[#FFFFFF0D] p-[4px_10px]">
                <div className="mr-0.5 text-tailwind">{data.icon}</div>
                <div className="ml-1.5 text-xs font-[500] text-white">{data.value}</div>
              </div>
            );
          })}
        </div>
      </div>
      <div className="hidden xl:block">{makePricePanel()}</div>
    </div>
  );
}
