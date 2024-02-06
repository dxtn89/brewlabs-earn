import { CloseCircle } from "@components/dashboard/assets/svgs";
import { useContext, useEffect, useRef, useState } from "react";
import { isAddress } from "utils";
import getTokenLogoURL from "utils/getTokenLogoURL";
import { ChartContext } from "contexts/ChartContext";
import TokenLogo from "@components/logo/TokenLogo";
import { SkeletonComponent } from "@components/SkeletonComponent";
import StyledPrice from "@components/StyledPrice";
import { useRouter } from "next/router";
import { useDispatch } from "react-redux";
import { fetchPairsAsync } from "state/chart";
import { usePairsByCriteria } from "state/chart/hooks";
import { DEXSCREENER_CHAINNAME } from "config";

export default function FavouriteCard({ pair, type, network }) {
  const [isFade, setIsFade] = useState(false);

  const router = useRouter();
  const dispatch: any = useDispatch();
  const pairs: any = usePairsByCriteria(type === 0 ? pair.address : pair, null, 1);

  const wrappedPair = pairs[0];
  const stringifiedPair = JSON.stringify({ type, pair });
  useEffect(() => {
    dispatch(fetchPairsAsync(type === 0 ? pair.address : pair, null, "simple"));
  }, [stringifiedPair]);

  const { onFavourites }: any = useContext(ChartContext);

  const closeRef: any = useRef();

  if (!(network === "All" || wrappedPair?.chainId === parseInt(network.chainId))) return;
  return wrappedPair !== undefined ? (
    <div
      className={`${
        isFade ? "opacity-0" : ""
      } primary-shadow relative mb-3 flex cursor-pointer items-center justify-between rounded-md bg-[#B9B8B80D] p-3.5 transition-all duration-300 hover:scale-[1.05] hover:bg-[#B9B8B822]`}
      onClick={(e) => {
        if ((!closeRef.current || (closeRef.current && !closeRef.current.contains(e.target))) && wrappedPair) {
          router.push(`/chart/${DEXSCREENER_CHAINNAME[wrappedPair.chainId]}/${wrappedPair.address}`);
        }
      }}
    >
      <div className="flex items-center overflow-hidden text-ellipsis flex-1">
        <TokenLogo
          src={getTokenLogoURL(isAddress(wrappedPair?.baseToken?.address), wrappedPair?.chainId)}
          alt={""}
          classNames="h-4 w-4 rounded-full"
        />
        <div className="mx-2 max-w-[64px] flex-1 overflow-hidden text-ellipsis text-sm text-white">
          {wrappedPair && wrappedPair.baseToken ? wrappedPair.baseToken.symbol : <SkeletonComponent />}
        </div>
        <div className="text-xs text-[#FFFFFF80]">
          {wrappedPair && wrappedPair.quoteToken ? wrappedPair.quoteToken.symbol : <SkeletonComponent />}
        </div>
      </div>
      <div className="flex items-center text-sm">
        <div
          className={`mx-2 text-xs ${
            wrappedPair?.priceChange?.h24 > 0
              ? "text-green"
              : wrappedPair?.priceChange?.h24 === 0
              ? "text-white"
              : "text-danger"
          } whitespace-nowrap`}
        >
          {wrappedPair ? (
            `${wrappedPair.priceChange.h24 >= 0 ? "+" : ""}
          ${(wrappedPair.priceChange.h24 ?? 0).toFixed(2)}%`
          ) : (
            <SkeletonComponent />
          )}
        </div>
        <div className="text-white">
          {wrappedPair && wrappedPair.priceUsd !== undefined ? (
            <StyledPrice price={wrappedPair.priceUsd} decimals={4} itemClassName="!text-[8px]" />
          ) : (
            <SkeletonComponent />
          )}
        </div>
      </div>
      {type === 0 ? (
        <button
          className="absolute -right-2 -top-2 [&>svg]:!h-5 [&>svg]:!w-5"
          onClick={() => {
            setIsFade(true);
            setTimeout(() => {
              setIsFade(false);
              onFavourites(wrappedPair, 2);
            }, 300);
            //   { chainId, address: _address, tokenAddress, symbol1 }
          }}
          ref={closeRef}
        >
          {CloseCircle}
        </button>
      ) : (
        ""
      )}
    </div>
  ) : (
    <div />
  );
}
