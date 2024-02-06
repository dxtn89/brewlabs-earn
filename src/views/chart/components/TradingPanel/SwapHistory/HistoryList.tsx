import { ContractSVG, NonSellerSVG, WalletSVG } from "@components/dashboard/assets/svgs";
import { BigNumberFormat, numberWithCommas } from "utils/functions";
import TimeAgo from "javascript-time-ago";

// English.
import en from "javascript-time-ago/locale/en";
import { getNativeSybmol } from "lib/bridge/helpers";
import { Oval } from "react-loader-spinner";
import { useCallback, useEffect, useRef, useState } from "react";
import { WNATIVE } from "@brewlabs/sdk";
import { useTokenMarketChart } from "state/prices/hooks";
import HistoryCard from "./HistoryCard";
import { usePairTxInfoByHash } from "state/chart/hooks";

// Create formatter (English).
const timeAgo = new TimeAgo("en-US");

export default function HistoryList({
  histories,
  selectedPair,
  loading,
  tb,
  setTB,
  setCriteria,
  setShowType,
  isAccount,
}) {
  const [wrappedHistories, setWrappedHistories] = useState([]);
  const tokenMarketData = useTokenMarketChart(selectedPair.chainId);
  const nativePrice = tokenMarketData[WNATIVE[selectedPair.chainId].address.toLowerCase()]?.usd;

  const node: any = useRef();
  const stringifiedHistories = JSON.stringify(histories);
  const handleScroll = useCallback(() => {
    const { scrollTop, scrollHeight, clientHeight } = node.current;
    if (scrollTop + clientHeight === scrollHeight && !loading && scrollHeight > 50) {
      console.log("reached bottom hook in scroll component");
      setTB(histories[histories.length - 1].timestamp);
    } else {
    }
  }, [node, loading, stringifiedHistories]);

  useEffect(() => {
    if (node.current) {
      node.current.addEventListener("scroll", handleScroll);
      return () => node.current?.removeEventListener("scroll", handleScroll);
    }
  }, [node, handleScroll]);

  useEffect(() => {
    setWrappedHistories(
      histories
        .filter((history) => !history.ownerShip)
        .map((history) => {
          const date = new Date(history.timestamp);
          return {
            time: date.toLocaleDateString() + " " + date.toLocaleTimeString(),
            action: history.action,
            price: history.price,
            usdValue: numberWithCommas(history.amountStable.toFixed(2)),
            amount: BigNumberFormat(history.amount),
            nativeAmount: BigNumberFormat(
              history.nativeAmount ??
                history.amountStable / tokenMarketData[WNATIVE[selectedPair.chainId].address.toLowerCase()]?.usd
            ),
            type:
              history.action === "buy"
                ? WalletSVG
                : history.walletsCategories.includes("Liquiditypool")
                ? ContractSVG
                : NonSellerSVG,
            txHash: history.transactionAddress,
            ago: history.timestamp ? timeAgo.format(history.timestamp) : "A long time ago",
            wallet: history.from,
            info: history.type,
            chainId: history.chainId,
          };
        })
    );
  }, [stringifiedHistories, nativePrice]);

  return (
    <div className="mt-2 flex min-h-[100px] flex-1 flex-col rounded-md pt-1.5 text-sm">
      <div className="hidden justify-between rounded-[2px] bg-[#D9D9D91A] p-[4px_12px] text-[#FFFFFFBF] lg:flex">
        <div className="flex">
          <div className="w-[90px]">Tx</div>
          <div className="w-[160px] ">Time</div>
          <div className="w-[110px] ">Ago</div>
          <div className="w-[60px] ">Action</div>
          <div className="w-[70px] ">Price</div>
          <div className="w-[90px] ">Maker</div>
        </div>
        <div className="flex">
          <div className="w-20 overflow-hidden text-ellipsis">{selectedPair.baseToken.symbol}</div>
          <div className="w-14 ">{getNativeSybmol(selectedPair.chainId)}</div>
          <div className="w-20">USD</div>
        </div>
      </div>
      <div
        className="yellowScroll mt-2.5 min-h-[100px] w-[calc(100%+6px)] flex-1 overflow-y-auto overflow-x-clip"
        ref={node}
      >
        {wrappedHistories.map((list, i) => {
          return (
            <HistoryCard
              key={i}
              list={list}
              i={i}
              setCriteria={setCriteria}
              setShowType={setShowType}
              selectedPair={selectedPair}
              isAccount={isAccount}
            />
          );
        })}

        {loading ? (
          <div className="flex w-full justify-center py-2">
            <Oval
              width={21}
              height={21}
              color={"white"}
              secondaryColor="black"
              strokeWidth={3}
              strokeWidthSecondary={3}
            />
          </div>
        ) : (
          ""
        )}
      </div>
    </div>
  );
}
