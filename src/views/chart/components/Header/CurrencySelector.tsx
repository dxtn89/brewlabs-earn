import React, { useState, useMemo, useContext, useEffect, useRef } from "react";
import { ArrowTrendingDownIcon, ArrowTrendingUpIcon } from "@heroicons/react/24/outline";
import clsx from "clsx";

import { useGlobalState } from "state";
import { isAddress } from "utils";

import { PrimaryOutlinedButton } from "components/button/index";

import DropDown from "@components/dashboard/TokenList/Dropdown";
import { StarIcon } from "@heroicons/react/20/solid";
import { useDispatch } from "react-redux";
import { useCGListings, useCMCListings, useWatcherGuruTrending } from "@hooks/chart/useScrappingSite";
import { ChartContext } from "contexts/ChartContext";
import { addPairs, fetchPairsAsync } from "state/chart";
import { usePairsByCriteria, usePairsByCriterias } from "state/chart/hooks";
import TokenLogo from "@components/logo/TokenLogo";
import getTokenLogoURL from "utils/getTokenLogoURL";
import { BigNumberFormat, getChainLogo } from "utils/functions";

import TimeAgo from "javascript-time-ago";

// English.
import en from "javascript-time-ago/locale/en";
import { fetchAllPairs } from "state/chart/fetchPairInfo";
import { DEXSCREENER_CHAINNAME } from "config";
import { useRouter } from "next/router";
import { SearchCircleSVG } from "@components/dashboard/assets/svgs";

TimeAgo.addDefaultLocale(en);

// Create formatter (English).
const timeAgo = new TimeAgo("en-US");

const tabs = [
  {
    icon: <div className="-scale-x-100 [&>svg]:!h-4 [&>svg]:!w-4">{SearchCircleSVG}</div>,
    name: "Search...",
  },
  { icon: <StarIcon className="h-4 w-4" />, name: "Favourites" },
  {
    icon: <img src={"/images/chart/trending/cmc.png"} alt={""} className="h-4 w-4 rounded-full" />,
    name: "CMC Trending",
  },
  {
    icon: <img src={"/images/chart/trending/cmc.png"} alt={""} className="h-4 w-4 rounded-full" />,
    name: "CMC Recently Added",
  },
  {
    icon: <img src={"/images/chart/trending/cg.png"} alt={""} className="h-4 w-4 rounded-full" />,
    name: "CG Trending",
  },
  {
    icon: <img src={"/images/chart/trending/cg.png"} alt={""} className="h-4 w-4 rounded-full" />,
    name: "CG Top Gainers",
  },
  {
    icon: <img src={"/images/chart/trending/cg.png"} alt={""} className="h-4 w-4 rounded-full" />,
    name: "CG Top Losers",
  },
  {
    icon: <img src={"/images/chart/trending/watcherguru.png"} alt={""} className="h-4 w-4 rounded-full" />,
    name: "WG Trending",
  },
];

const CurrencyRow = ({ pair }: { pair: any }) => {
  const router = useRouter();
  const [, setIsOpen] = useGlobalState("userSidebarOpen");
  return (
    <>
      <button
        className="flex w-full justify-between border-b border-gray-600 from-transparent via-gray-800 to-transparent px-4 py-4 hover:bg-gradient-to-r"
        onClick={() => {
          router.push(`/chart/${DEXSCREENER_CHAINNAME[pair.chainId]}/${pair.address}`);
          setIsOpen(0);
        }}
      >
        <div className="flex items-center justify-between gap-12">
          <div className="flex w-[220px] items-center">
            <TokenLogo
              src={getTokenLogoURL(isAddress(pair.baseToken.address), pair.chainId)}
              classNames="primary-shadow z-10 h-10 w-10 rounded-full"
            />
            <div className="ml-4 text-start">
              <p className="whitespace-nowrap text-lg">
                {pair.baseToken.symbol} /{" "}
                <span className="text-sm leading-none text-gray-500">{pair.quoteToken.symbol}</span>
              </p>
              <p className="flex items-center justify-start gap-1 text-sm">
                {pair.priceChange.h24 > 0 ? (
                  <span className="flex items-center text-green">
                    {pair.priceChange.h24.toFixed(3)}% <ArrowTrendingUpIcon className="h-3 w-3" />
                  </span>
                ) : (
                  <span className="flex items-center text-danger">
                    {Math.abs(pair.priceChange.h24 ?? 0).toFixed(3)}%{" "}
                    <ArrowTrendingDownIcon className="h-3 w-3 dark:text-danger" />
                  </span>
                )}
                <span className="text-primary">24HR</span>
              </p>
              <p className={`${pair.priceChange.h24 > 0 ? "dark:text-green" : "dark:text-danger"} text-[10px]`}>
                {pair.priceUsd.toFixed(4)} USD = 1.00 {pair.baseToken.symbol}
              </p>
            </div>
          </div>
          <div className="hidden w-[110px] sm:block">
            <p className="text-lg">Liq. {BigNumberFormat(pair.liquidity?.usd ?? 0)}</p>
            <p className="text-sm">
              Vol. {BigNumberFormat(pair.volume?.h24 ?? 0)} <span className="text-gray-500">24h</span>
            </p>
          </div>
          <div className="hidden w-[120px] flex-col items-center sm:flex">
            <div className="flex">
              <img src={getChainLogo(pair.chainId)} alt={""} className="primary-shadow h-6 w-6 rounded-full" />
              <img
                src={
                  (pair.otherdexId ?? pair.a) === "brewlabs"
                    ? "/images/brewlabsRouter.png"
                    : `https://dd.dexscreener.com/ds-data/dexes/${pair.dexId}.png`
                }
                alt={""}
                className="primary-shadow h-6 w-6 rounded-full"
              />
            </div>
            <div>{pair.pairCreatedAt ? timeAgo.format(pair.pairCreatedAt) : ""}</div>
          </div>
        </div>
      </button>
    </>
  );
};

let searchTimeout;

const CurrencySelector = () => {
  const [activeTab, setActiveTab] = useState(-1);
  const [criteria, setCriteria] = useState("");
  const [cri, setCri] = useState("");
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  const criteriaRef: any = useRef();

  const dispatch: any = useDispatch();
  const { trendings, newListings }: any = useCMCListings();
  const { trendings: cgTrendings, gainers: cgGainers, losers: cgLosers }: any = useCGListings();
  const { trendings: watcherGuruTrendings } = useWatcherGuruTrending();
  const { favourites }: any = useContext(ChartContext);

  const arrays = [
    favourites.map((pair) => pair.address),
    trendings.map((pair) => pair.name),
    newListings.map((pair) => pair.name),
    cgTrendings.map((pair) => pair.name),
    cgGainers.map((pair) => pair.name),
    cgLosers.map((pair) => pair.name),
    watcherGuruTrendings.map((pair) => pair.name),
  ];

  const selectedPairs = usePairsByCriterias(activeTab === -1 ? [] : arrays[activeTab]);
  const searchedPairs = usePairsByCriteria(activeTab === -1 ? criteria : "", null, 10);

  useEffect(() => {
    setActiveTab(-1);
    setCri("");
    setCriteria("");
    if (window) setRowsPerPage(Math.floor((window.innerHeight - 300) / 96));
  }, []);

  const stringifiedArrays = JSON.stringify(arrays[activeTab]);
  useEffect(() => {
    if (activeTab === -1) {
    } else {
      arrays[activeTab].map((criteria) => dispatch(fetchPairsAsync(criteria, null, "simple")));
    }
  }, [activeTab, stringifiedArrays]);

  const showPairs = activeTab === -1 ? searchedPairs : selectedPairs;
  const totalPages = useMemo(() => Math.ceil(showPairs.length / rowsPerPage), [showPairs, rowsPerPage]);

  const nextPage = () => {
    setPage((page + 1) % totalPages);
  };
  const prevPage = () => {
    setPage((page - 1) % totalPages);
  };

  useEffect(() => {
    if (searchTimeout != undefined) clearTimeout(searchTimeout);

    searchTimeout = setTimeout(async () => {
      setCriteria(cri);
      if (cri === "") return;
      setLoading(true);
      const searchedPairs = await fetchAllPairs(cri, null, "simple");
      setLoading(false);
      dispatch(addPairs(searchedPairs));
    }, 500);
  }, [cri]);

  useEffect(() => {
    if (activeTab === -1) criteriaRef.current.focus();
  }, [activeTab]);

  return (
    <div className="relative w-full">
      <div className="mb-6 flex items-center justify-between">
        <div className="font-brand">
          <h2 className="text-3xl">Select token</h2>
        </div>
      </div>

      <nav className="-ml-2 mb-2 hidden w-[calc(100%+16px)] flex-wrap space-x-4 sm:flex" aria-label="Tabs">
        {tabs.map((tab, index) => (
          <button
            key={index}
            onClick={() => {
              setActiveTab(index - 1);
              setPage(0);
              setCriteria("");
              setCri("");
            }}
            className={clsx(
              index === activeTab + 1 ? "bg-gray-700 text-brand" : "bg-gray-800 text-gray-500 hover:text-gray-400",
              "!mx-2  mb-2 flex w-[calc((100%-48px)/3)] items-center whitespace-nowrap rounded-2xl px-4 py-2 text-sm"
            )}
          >
            <div className="-mt-0.5 mr-1.5">{tab.icon}</div>
            <div>{tab.name}</div>
          </button>
        ))}
      </nav>

      <nav className="mb-4 block sm:hidden relative z-10" aria-label="Tabs">
        <DropDown
          width="w-full"
          value={activeTab + 1}
          setValue={(i) => {
            setActiveTab(i - 1);
          }}
          type="secondary"
          values={tabs.map((data) => data.name)}
        />
      </nav>

      {activeTab === -1 ? (
        <input
          value={cri}
          onChange={(e) => {
            setCri(e.target.value);
            setActiveTab(-1);
          }}
          type="text"
          placeholder="Search by contract address or by name"
          className="input-bordered input w-full"
          ref={criteriaRef}
        />
      ) : (
        ""
      )}

      <div className="mt-3 px-2">
        <div>
          {showPairs.length > 0 ? (
            showPairs.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((pair, index) => {
              return <CurrencyRow key={index} pair={pair} />;
            })
          ) : (activeTab === -1 ? loading : arrays[activeTab].length) ? (
            <>
              <p className="my-7 flex justify-center text-2xl dark:text-primary">Loading Token ...</p>
            </>
          ) : (
            <>
              <img className="m-auto" alt="No results" src="/images/Brewlabs--no-results-found-transparent.gif" />
              <p className="my-7 flex justify-center text-2xl dark:text-primary">No Result Found</p>
            </>
          )}
        </div>
      </div>

      {showPairs.length > 0 && (
        <div className="mb-2 mt-3 flex justify-center gap-5">
          <PrimaryOutlinedButton disabled={page === 0} onClick={prevPage}>
            Back
          </PrimaryOutlinedButton>
          <PrimaryOutlinedButton disabled={page === totalPages - 1} onClick={nextPage}>
            Next
          </PrimaryOutlinedButton>
        </div>
      )}
    </div>
  );
};

export default CurrencySelector;
