import { Tooltip as ReactTooltip } from "react-tooltip";
import { GradientFlameSVG, InfoSVG } from "@components/dashboard/assets/svgs";
import { useCGListings, useCMCListings, useWatcherGuruTrending } from "@hooks/chart/useScrappingSite";
import { DEXSCREENER_CHAINNAME } from "config";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { fetchPairsAsync } from "state/chart";
import { usePairsByCriteria } from "state/chart/hooks";

export const TrendingPairs = () => {
  const { trendings: cmcTrendings }: any = useCMCListings();
  const { trendings: cgTrendings, gainers: cgGainers }: any = useCGListings();
  const { trendings: watcherGuruTrendings } = useWatcherGuruTrending();

  const [rt, refresh] = useState(0);
  const [sortedTrendings, setSortedTrendings] = useState([]);
  const [prevTrendings, setPrevTrendings] = useState([]);
  const [isFadeout, setIsFadeout] = useState(0);
  const [showCount, setShowCount] = useState(10);

  useEffect(() => {
    let time = 0;
    setInterval(() => {
      refresh(time);
      time++;
    }, 5000);
    setShowCount(Math.min(Math.floor((window.innerWidth - 270) / 60), 10));
  }, []);

  useEffect(() => {
    const allTokens = [...cmcTrendings, ...cgTrendings, ...cgGainers, ...watcherGuruTrendings].filter(
      (token) => token.symbol
    );
    let filteredTokens = [];
    for (let i = 0; i < allTokens.length; i++) {
      const isExisting = filteredTokens.find((token) => token.symbol === allTokens[i].symbol);
      if (!isExisting) {
        const count = allTokens.filter((token) => token.symbol === allTokens[i].symbol).length;
        filteredTokens.push({ ...allTokens[i], count });
      }
    }
    setPrevTrendings(sortedTrendings);
    setSortedTrendings(filteredTokens.sort((a, b) => b.count - a.count).slice(0, showCount));
    setIsFadeout(1);
    setTimeout(() => {
      setIsFadeout(2);
      setTimeout(() => {
        setIsFadeout(0);
      }, 200);
    }, 200);
  }, [rt]);

  return (
    <div className="mt-5 flex items-center font-roboto">
      <div className="mr-3 [&>svg]:!h-4 [&>svg]:!w-4" id={"totalmarketheatmap"}>
        {InfoSVG}
      </div>
      <div className="-mt-1 mr-2 [&>svg]:!h-5 [&>svg]:!w-5">{GradientFlameSVG}</div>
      <div className="mr-4 text-xs font-medium text-[#FFFFFFBF]">Total market heat map</div>
      <div className={`flex ${isFadeout !== 0 ? "animate-bounce" : ""} h-6 flex-1`}>
        {(isFadeout === 1 ? prevTrendings : sortedTrendings).map((trending, i) => (
          <div key={i} className="mr-4">
            <PairCard token={trending} index={i + 1} />
          </div>
        ))}
        <div className="w-0 opacity-0">test</div>
      </div>
      <ReactTooltip
        anchorId={"totalmarketheatmap"}
        place="top"
        content={"Trending currencies across the global cryptocurrency market."}
        className="!z-[1000]"
      />
    </div>
  );
};

const PairCard = ({ token, index }) => {
  const pairs: any = usePairsByCriteria(token.symbol, null, 1);
  const dispatch: any = useDispatch();

  const stringifiedToken = JSON.stringify(token);
  useEffect(() => {
    dispatch(fetchPairsAsync(token.symbol, null, "simple"));
  }, [stringifiedToken]);

  return (
    <Link
      className="whitespace-nowrap cursor-pointer text-sm !text-[#FFFFFF59] hover:!text-white"
      href={pairs.length ? `/chart/${DEXSCREENER_CHAINNAME[pairs[0].chainId]}/${pairs[0].address}` : "#"}
    >
      <span className="font-brand text-base">#</span>
      {index} {token.symbol}
    </Link>
  );
};
