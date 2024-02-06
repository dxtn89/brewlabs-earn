import { getChainLogo, getDexLogo } from "utils/functions";
import getTokenLogoURL from "utils/getTokenLogoURL";
import { isAddress } from "utils";
import TokenLogo from "@components/logo/TokenLogo";
import { useRouter } from "next/router";
import { DEXSCREENER_CHAINNAME } from "config";

export const PairItem = ({ pair, isLast, setCriteria }) => {
  const router = useRouter();

  return (
    <div
      className="flex h-[44px] cursor-pointer items-center overflow-hidden text-ellipsis px-3 transition hover:bg-[#5b5b5c]"
      onClick={() => {
        router.push(`/chart/${DEXSCREENER_CHAINNAME[pair.chainId]}/${pair.address}`);
        setCriteria("");
      }}
    >
      <div className="relative">
        <img src={getChainLogo(pair.chainId)} alt={""} className="primary-shadow h-6 w-6 rounded-full" />
        <img
          src={getDexLogo(pair.dexId)}
          alt={""}
          className="primary-shadow absolute -right-1 -top-1 h-4 w-4 rounded-full"
        />
      </div>
      <div
        className={`mx-2 flex flex-1 items-center justify-between ${
          !isLast ? "border-b border-dotted border-[#D9D9D980]" : ""
        } h-full overflow-hidden text-ellipsis text-sm leading-none`}
      >
        <div className="flex-1 overflow-hidden text-ellipsis text-[#FFFFFFBF]">
          <div>
            <span className="text-white">{pair.baseToken.symbol}</span> ({pair.quoteToken.symbol})
          </div>
          <div className="overflow-hidden text-ellipsis text-xs">{pair.address}</div>
        </div>
        <div className="text-right">
          <div>
            {pair.baseToken.symbol} <span className="text-white">${(pair.priceUsd ?? 0).toFixed(3)}</span>
          </div>
          <div className={`text-xs ${pair.priceChange.h24 >= 0 ? "text-green" : "text-danger"}`}>
            ({pair.priceChange.h24 >= 0 ? "+" : ""}
            {(pair.priceChange.h24 ?? 0).toFixed(2)}%)
          </div>
        </div>
      </div>
      <TokenLogo
        src={getTokenLogoURL(isAddress(pair.baseToken.address), pair.chainId)}
        classNames="primary-shadow h-6 w-6 rounded-full"
      />
    </div>
  );
};
