import TimeAgo from "javascript-time-ago";

// English.
import { Oval } from "react-loader-spinner";
import { useCallback, useEffect, useRef, useState } from "react";
import HolderCard from "./HolderCard";
import useTokenInfo from "@hooks/useTokenInfo";
import { usePools } from "state/pools/hooks";
import { ethers } from "ethers";

// Create formatter (English).

export default function HolderList({ histories, selectedPair, loading, setTB, holders30d, setShowType, setCriteria }) {
  const [filteredHistories, setFilteredHistories] = useState([]);

  const { deployer } = useTokenInfo(selectedPair.baseToken.address, selectedPair.chainId);
  const { pools } = usePools();

  const node: any = useRef();
  const stringifiedHistories = JSON.stringify(histories);

  const handleScroll = useCallback(() => {
    const { scrollTop, scrollHeight, clientHeight } = node.current;
    if (scrollTop + clientHeight === scrollHeight && !loading && scrollHeight > 50) {
      console.log("reached bottom hook in scroll component");
      setTB(histories[0].timestamp + 1);
    } else {
    }
  }, [node, loading, stringifiedHistories]);

  useEffect(() => {
    if (node.current) {
      node.current.addEventListener("scroll", handleScroll);
      return () => node.current?.removeEventListener("scroll", handleScroll);
    }
  }, [node, handleScroll]);

  const stringifiedPools = JSON.stringify(pools);
  const stringifiedHolders = JSON.stringify(holders30d);

  useEffect(() => {
    setFilteredHistories(
      histories
        .filter((history) => history.ownerShip)
        .map((history) => {
          const isExistingPool = pools.find((pool) => pool.contractAddress.toLowerCase() === history.address);
          const isExistingHolder = holders30d.find((holder) => holder.address === history.address);
          return {
            ...history,
            type:
              history.address === selectedPair.address
                ? "Liquidity Pool"
                : isExistingPool
                ? "Staking Pool"
                : deployer.toLowerCase() === history.address
                ? "Deployer"
                : "Wallet",
            ownerShipStatus: isExistingHolder
              ? history.balance > isExistingHolder.balance
                ? "Up"
                : history.balance === isExistingHolder.balance
                ? "Draw"
                : "Down"
              : "Up",
          };
        })
        .sort((b, a) => a.balance - b.balance)
    );
  }, [stringifiedHistories, stringifiedPools, selectedPair.address, deployer, stringifiedHolders]);

  return (
    <div className="mt-2 flex min-h-[100px] flex-1 flex-col rounded-md pt-1.5 text-sm">
      <div className="hidden justify-between rounded-[2px] bg-[#D9D9D91A] p-[4px_12px] text-[#FFFFFFBF] lg:flex">
        <div className="flex flex-1">
          <div className="w-20">Holder</div>
          <div className="w-[120px]" />
          <div className="w-[180px]">Type</div>
          <div className="mr-10 max-w-[360px] flex-1">Held</div>
        </div>
        <div className="flex">
          <div className="w-24 overflow-hidden text-ellipsis">{selectedPair.baseToken.symbol}</div>
          <div className="w-[100px]">Ownership</div>
          <div className="w-20">USD</div>
        </div>
      </div>
      <div
        className="yellowScroll mt-2.5 min-h-[100px] w-[calc(100%+6px)] flex-1 overflow-y-auto overflow-x-clip"
        ref={node}
      >
        {filteredHistories.map((list, i) => {
          return (
            <HolderCard
              key={i}
              list={list}
              i={i}
              selectedPair={selectedPair}
              setShowType={setShowType}
              setCriteria={setCriteria}
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
