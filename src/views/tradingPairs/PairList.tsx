import { useTradingAllPairDatas } from "state/pair/hooks";
import PairCard from "./PairCard";
import { ChainId } from "@brewlabs/sdk";
import { useEffect, useState } from "react";
import { SearchCircleSVG } from "@components/dashboard/assets/svgs";

const headers = ["Network", "Pair", "Token Price", "24h Change", "24h Volume", "TVL", "Fees Collected", "Action"];

export default function PairList({ selectedPair, setSelectedPair }) {
  const width = ["w-14", "w-[200px]", "w-[80px]", "w-[80px]", "w-[80px]", "w-[80px]", "w-[108px]", "w-[90px]"];

  const [criteria, setCriteria] = useState("");
  const [wrappedPairs, setWrappedPairs] = useState([]);

  const polygon_pairs = useTradingAllPairDatas(ChainId.POLYGON);
  const bsc_pairs = useTradingAllPairDatas(ChainId.BSC_MAINNET);
  const pairs = [...bsc_pairs, ...polygon_pairs];

  const stringifiedPairs = JSON.stringify(pairs);

  useEffect(() => {
    if (!pairs.length) return;
    setSelectedPair(Object.keys(selectedPair).length ? selectedPair : pairs[0]);
  }, [pairs.length]);

  useEffect(() => {
    setWrappedPairs(
      pairs.filter(
        (pair) =>
          pair.address?.toLowerCase().includes(criteria) ||
          pair.baseToken?.address.toLowerCase().includes(criteria) ||
          pair.baseToken?.symbol.toLowerCase().includes(criteria) ||
          pair.quoteToken?.address.toLowerCase().includes(criteria) ||
          pair.quoteToken?.symbol.toLowerCase().includes(criteria)
      )
    );
  }, [stringifiedPairs, criteria]);

  return (
    <div className="">
      <div className="primary-shadow focusShadow relative flex w-full rounded bg-[#29292C]">
        {!criteria ? (
          <div className="absolute left-0  top-0 p-2.5 text-sm">
            <span className="text-white">Search</span> pair, token, symbol...
          </div>
        ) : (
          ""
        )}
        <input
          type={"text"}
          className="leading-1.2 flex-1	!border-none bg-transparent p-2.5 font-brand text-sm text-white !ring-transparent"
          value={criteria}
          onChange={(e) => setCriteria(e.target.value)}
        />
        <div className="flex w-14 cursor-pointer items-center justify-center rounded-r bg-[#202023] text-primary [&>svg]:h-[18px] [&>svg]:w-[18px]">
          {SearchCircleSVG}
        </div>
      </div>
      <div className="primary-shadow mb-10 mt-5 rounded-md bg-[#18181B] p-[10px_0px_24px_0px] xsm:p-[10px_16px_24px_16px]">
        <div className="font-brand text-xl font-bold text-white">Brewswap Pools</div>
        <div className="mt-2 hidden justify-between px-4 font-brand text-sm text-[#ffffff75] lg:flex">
          {headers.map((data, i) => {
            return (
              <div key={i} className={`${width[i]}`}>
                {data}
              </div>
            );
          })}
        </div>
        <div>
          {wrappedPairs.map((pair, i) => {
            return (
              <div key={i} style={{ zIndex: 100000 - i }} className="relative">
                <PairCard pair={pair} setSelectedPair={setSelectedPair} />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
