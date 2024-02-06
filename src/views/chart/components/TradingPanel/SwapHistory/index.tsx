import { useEffect, useState } from "react";
import HistoryToolBar from "./HistoryToolBar";
import HistoryList from "./HistoryList";
import { useAccount } from "wagmi";
import UserInfo from "../UserInfo";
import { isAddress } from "utils";
import { DEX_GURU_CHAIN_NAME } from "config";
import { fetchTradingHistoriesByDexScreener } from "@hooks/useTokenAllPairs";
import { useFastRefreshEffect, useSecondRefreshEffect } from "@hooks/useRefreshEffect";
import HolderList from "./HolderList";

let wrappedQuery;
export default function SwapHistory({ selectedPair, holders30d }) {
  const { address: account } = useAccount();
  const [showType, setShowType] = useState(0);
  const [criteria, setCriteria] = useState("");
  const [tb, setTB] = useState(0);
  const [loading, setLoading] = useState(false);
  const [histories, setHistories] = useState([]);
  const [totalHistories, setTotalHistories] = useState([]);
  const [recentHistories, setRecentHistories] = useState([]);

  const getQuery = () => {
    let query: any = {
      pair: selectedPair.address,
      quote: selectedPair.quoteToken.address,
      tb,
      a: selectedPair.a,
      base: selectedPair.baseToken.address,
      dexId: selectedPair.dexId,
      otherdexId: selectedPair.otherdexId,
    };
    switch (showType) {
      case 0:
        return { ...query, type: "buyOrSell" };
      case 1:
        return { ...query, type: "buy" };
      case 2:
        return { ...query, type: "sell" };
      case 3:
        return { ...query, type: "holders", address: selectedPair.baseToken.address };
      case 4:
        return {
          ...query,
          account: account ? account.toLowerCase() : "0x0",
          type: "buyOrSell",
        };
      case 5:
        return {
          ...query,
          account: account ? account.toLowerCase() : "0x0",
          type: "buy",
        };
      case 6:
        return {
          ...query,
          account: account ? account.toLowerCase() : "0x0",
          type: "sell",
        };
      case 7:
        return {
          ...query,
          account: criteria ? criteria.toLowerCase() : "0x0",
          type: "buyOrSell",
          pool: selectedPair.address,
        };
    }
  };

  const stringifiedValue = JSON.stringify({ showType, address: selectedPair.address, tb, criteria });

  useEffect(() => {
    const query: any = getQuery();
    if (!isAddress(query.pair)) {
      return;
    }
    setLoading(true);
    setHistories([]);
    wrappedQuery = JSON.stringify(query);
    fetchTradingHistoriesByDexScreener(query, selectedPair.chainId)
      .then((result) => {
        if (wrappedQuery === JSON.stringify(query)) {
          setHistories(result);
          setLoading(false);
        }
      })
      .catch((e) => {
        console.log(e);
        setLoading(false);
      });
  }, [stringifiedValue]);

  useEffect(() => {
    setTotalHistories([]);
    setTB(0);
  }, [showType, selectedPair.address, criteria]);

  useFastRefreshEffect(() => {
    let query = getQuery();
    query.tb = 0;

    fetchTradingHistoriesByDexScreener(query, selectedPair.chainId)
      .then((result) => {
        if (wrappedQuery === JSON.stringify(query)) setRecentHistories(result);
      })
      .catch((e) => {
        console.log(e);
      });
  }, [stringifiedValue]);

  const strigifiedHistories = JSON.stringify(histories);
  const strigifiedRecentHistories = JSON.stringify(recentHistories);

  useEffect(() => {
    const total = [...histories];
    let temp = [...totalHistories];
    for (let i = 0; i < total.length; i++) {
      const isExisting = temp.find((history) => JSON.stringify(history) === JSON.stringify(total[i]));
      if (!isExisting) {
        temp.push(total[i]);
      }
    }
    setTotalHistories(temp.sort((a, b) => b.timestamp - a.timestamp));
  }, [strigifiedHistories]);

  useEffect(() => {
    const total = [...recentHistories];
    let temp = [...totalHistories];
    for (let i = 0; i < total.length; i++) {
      const isExisting = temp.find((history) => JSON.stringify(history) === JSON.stringify(total[i]));
      if (!isExisting) {
        temp.push(total[i]);
      }
    }
    setTotalHistories(temp.sort((a, b) => b.timestamp - a.timestamp));
  }, [strigifiedRecentHistories]);

  return (
    <div className="duraton-300 flex min-h-[100px] flex-1 flex-col transition-all">
      <HistoryToolBar showType={showType} setShowType={setShowType} criteria={criteria} setCriteria={setCriteria} />
      <UserInfo
        selectedPair={selectedPair}
        active={showType >= 4}
        account={showType === 7 ? criteria : account}
        setShowType={setShowType}
        setCriteria={setCriteria}
        totalHistories={totalHistories}
      />
      {showType === 3 ? (
        <HolderList
          histories={totalHistories}
          selectedPair={selectedPair}
          loading={loading}
          setTB={setTB}
          holders30d={holders30d}
          setShowType={setShowType}
          setCriteria={setCriteria}
        />
      ) : (
        <HistoryList
          histories={totalHistories}
          selectedPair={selectedPair}
          loading={loading}
          tb={tb}
          setTB={setTB}
          setCriteria={setCriteria}
          setShowType={setShowType}
          isAccount={showType >= 4}
        />
      )}
    </div>
  );
}
