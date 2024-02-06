import { Currency } from "@brewlabs/sdk";
import { SkeletonComponent } from "@components/SkeletonComponent";
import StyledPrice from "@components/StyledPrice";
import { ChevronRightVG } from "@components/dashboard/assets/svgs";
import TokenLogo from "@components/logo/TokenLogo";
import { BASE_URL, DEXSCREENER_CHAINNAME, DEXTOOLS_CHAINNAME } from "config";
import Link from "next/link";
import { useTradingPair } from "state/pair/hooks";
import { SerializedTradingPair } from "state/types";
import { getAddLiquidityUrl, getChainLogo, getRemoveLiquidityUrl, numberWithCommas } from "utils/functions";
import getTokenLogoURL from "utils/getTokenLogoURL";
import DropDown from "views/directory/IndexDetail/Dropdowns/Dropdown";

export default function PairCard({ pair, setSelectedPair }) {
  const width = ["w-14", "w-[200px]", "w-[80px]", "w-[80px]", "w-[80px]", "w-[80px]", "w-[108px]", "w-[90px]"];
  const { data }: { data: SerializedTradingPair } = useTradingPair(pair.chainId, pair.address);

  const isLoading = !data.baseToken;

  const actions = ["Visit", "Swap", "Add LP", "Remove LP", "Chart"];

  const actionHref = [
    "#",
    `/swap?iputCurrency=${data.quoteToken?.address}&outputCurrency=${data.baseToken?.address}`,
    getAddLiquidityUrl("brewlabs", data.quoteToken as Currency, data.baseToken as Currency, data.chainId),
    getRemoveLiquidityUrl("brewlabs", data.quoteToken as Currency, data.baseToken as Currency, data.chainId),
    `/chart/${DEXSCREENER_CHAINNAME[data?.chainId]}/${data?.address}`,
  ];

  return (
    <>
      <div
        className="mt-2 hidden h-[54px] cursor-pointer items-center justify-between rounded-md border border-transparent bg-[#29292C] px-4 font-brand text-white transition duration-300 xl:flex"
        // onClick={() => !isLoading && setSelectedPair(pair)}
        // href={
        //   isLoading
        //     ? "#"
        //     : getAddLiquidityUrl("brewlabs", data.quoteToken as Currency, data.baseToken as Currency, data.chainId)
        // }
      >
        <div className={`${width[0]}`}>
          {isLoading ? (
            <SkeletonComponent />
          ) : (
            <div className="flex justify-center">
              <img src={getChainLogo(data.chainId)} alt={""} className="h-7 w-7 rounded-full" />
            </div>
          )}
        </div>
        <div className={`${width[1]} `}>
          {isLoading ? (
            <SkeletonComponent />
          ) : (
            <div className="flex items-center overflow-hidden text-ellipsis whitespace-nowrap">
              <TokenLogo src={getTokenLogoURL(data.baseToken.address, data.chainId)} alt={""} classNames="h-7 w-7" />

              <TokenLogo
                src={getTokenLogoURL(data.quoteToken.address, data.chainId)}
                alt={""}
                classNames="h-7 w-7 -ml-3 z-10"
              />

              <div className="ml-2 flex-1 overflow-hidden text-ellipsis whitespace-nowrap">
                {data.baseToken.symbol}/{data.quoteToken.symbol}
              </div>
            </div>
          )}
        </div>
        <div className={`${data?.baseToken?.price24hChange >= 0 ? "text-green" : "text-danger"} ${width[2]} `}>
          {isLoading ? (
            <SkeletonComponent />
          ) : (
            <StyledPrice itemClassName="!text-[10px]" decimals={4} price={data.baseToken.price} />
          )}
        </div>
        <div className={`${data?.baseToken?.price24hChange >= 0 ? "text-green" : "text-danger"} ${width[3]} `}>
          {isLoading ? <SkeletonComponent /> : `${numberWithCommas(data.baseToken.price24hChange.toFixed(2))}%`}
        </div>
        <div className={`${width[4]} `}>
          {isLoading ? <SkeletonComponent /> : `$${numberWithCommas(data.volume24h.toFixed(2))}`}
        </div>
        <div className={`${width[5]} `}>
          {isLoading ? <SkeletonComponent /> : `$${numberWithCommas(data.tvl.toFixed(2))}`}
        </div>
        <div className={`${width[6]} `}>
          {isLoading || data.feesCollected24h === undefined ? (
            <SkeletonComponent />
          ) : (
            `$${numberWithCommas(data.feesCollected24h.toFixed(2))}`
          )}
        </div>
        <div className={`${width[7]}`}>
          <DropDown
            defaultValue={"What type of token are you seeking to deploy?"}
            value={0}
            setValue={(i) => {
              if (i > 0) window.open(actionHref[i], "_blank");
            }}
            data={actions}
            height={"40px"}
            rounded={"10px"}
            className="!bg-[#18181A] !pl-2 !pr-[10px] !text-sm !text-white"
            bodyClassName="!bg-none !bg-[#121214]"
            itemClassName={`hover:!bg-[#28282b] !justify-start !px-2`}
            chevronClassName={"!text-brand [&>svg]:!h-3.5 [&>svg]:!w-3.5"}
          />
        </div>
      </div>

      <div
        className="mt-2.5 block w-full cursor-pointer rounded-md border border-transparent bg-[#29292C] p-4 text-sm text-white hover:border-primary xl:hidden"
        onClick={() => !isLoading && setSelectedPair(pair)}
      >
        {isLoading ? (
          <SkeletonComponent />
        ) : (
          <div className="flex items-center overflow-hidden text-ellipsis whitespace-nowrap">
            <TokenLogo
              src={`https://assets-stage.dex.guru/icons/${data.baseToken.address}-${
                DEXTOOLS_CHAINNAME[data.chainId]
              }.png`}
              alt={""}
              classNames="h-7 w-7 z-10 relative"
            />

            <TokenLogo
              src={`https://assets-stage.dex.guru/icons/${data.quoteToken.address}-${
                DEXTOOLS_CHAINNAME[data.chainId]
              }.png`}
              alt={""}
              classNames="h-7 w-7 -ml-3"
            />
            <div className="ml-2 flex-1 overflow-hidden text-ellipsis whitespace-nowrap">
              {data.baseToken.symbol}/{data.quoteToken.symbol}
            </div>
          </div>
        )}
        <div className="flex flex-wrap justify-between">
          <div className={`${data?.baseToken?.price24hChange >= 0 ? "text-green" : "text-danger"} mr-4 mt-2`}>
            Last Price:{" "}
            {isLoading ? (
              <SkeletonComponent />
            ) : (
              <StyledPrice itemClassName="!text-[10px]" decimals={4} price={data.baseToken.price} />
            )}
          </div>
          <div className={`${data?.baseToken?.price24hChange >= 0 ? "text-green" : "text-danger"} mt-2`}>
            24H Change:{" "}
            {isLoading ? <SkeletonComponent /> : `${numberWithCommas(data.baseToken.price24hChange.toFixed(2))}%`}
          </div>
        </div>
        <div className="flex flex-wrap justify-between">
          <div className="mr-4 mt-2">
            24H Volume (USD): {isLoading ? <SkeletonComponent /> : `$${numberWithCommas(data.volume24h.toFixed(2))}`}
          </div>
          <div className="mt-2">
            TVL: {isLoading ? <SkeletonComponent /> : `$${numberWithCommas(data.tvl.toFixed(2))}`}
          </div>
        </div>
        <div className="flex flex-wrap justify-between">
          <div className="mr-4 mt-2">
            Fees Collected:{" "}
            {isLoading || data.feesCollected24h === undefined ? (
              <SkeletonComponent />
            ) : (
              `$${numberWithCommas(data.feesCollected24h.toFixed(2))}`
            )}
          </div>
        </div>
        <div className="w-[120px] mt-2">
          <DropDown
            defaultValue={"What type of token are you seeking to deploy?"}
            value={0}
            setValue={(i) => {
              if (i > 0) window.open(actionHref[i], "_blank");
            }}
            data={actions}
            height={"40px"}
            rounded={"10px"}
            className="!bg-[#18181A] !pl-2 !pr-[10px] !text-sm !text-white"
            bodyClassName="!bg-none !bg-[#121214]"
            itemClassName={`hover:!bg-[#28282b] !justify-start !px-2`}
            chevronClassName={"!text-brand [&>svg]:!h-3.5 [&>svg]:!w-3.5"}
          />
        </div>
      </div>
    </>
  );
}
