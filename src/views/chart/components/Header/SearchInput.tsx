import { useContext, useEffect, useState } from "react";

import { DrawSVG } from "@components/dashboard/assets/svgs";
import StyledInput from "@components/StyledInput";
import { useGlobalState } from "state";
import { Oval } from "react-loader-spinner";
import { ChartContext } from "contexts/ChartContext";
import { useRouter } from "next/router";
import { PairItem } from "./PairItem";
import { addPairs } from "state/chart";
import { useDispatch } from "react-redux";
import { fetchAllPairs } from "state/chart/fetchPairInfo";
import { useAllPairInfo, usePairsByCriteria } from "state/chart/hooks";
import { DEXSCREENER_CHAINNAME } from "config";
import CurrencySelector from "./CurrencySelector";

let searchTimeout;
let wrappedCriteria = "";

export const SearchInput = () => {
  const [isOpen, setIsOpen] = useGlobalState("userSidebarOpen");
  const [, setSidebarContent] = useGlobalState("userSidebarContent");
  const { criteria, setCriteria }: any = useContext(ChartContext);
  const [loading, setLoading] = useState(false);
  const [cri, setCri] = useState("");
  const pairs = usePairsByCriteria(criteria, null, 10);
  const dispatch = useDispatch();

  useEffect(() => {
    if (searchTimeout != undefined) clearTimeout(searchTimeout);
    wrappedCriteria = criteria;

    searchTimeout = setTimeout(async () => {
      setCriteria(cri);
      if (cri === "") return;
      setLoading(true);
      console.log(cri);
      const searchedPairs = await fetchAllPairs(cri, null, "simple");
      setLoading(false);
      dispatch(addPairs(searchedPairs));
    }, 500);
  }, [cri]);

  return (
    <div className="relative z-10 flex w-full">
      <div className="primary-shadow flex h-[44px] flex-1">
        <div className="relative flex-1">
          <div className=" relative flex h-full items-center justify-between overflow-hidden rounded-l bg-[#B9B8B81A]">
            <div
              className="z-10 !h-full flex-1  cursor-pointer bg-transparent font-brand !text-base !shadow-none focus:!shadow-none focus:!ring-0"
              onClick={() => {
                setIsOpen(3);
                setSidebarContent(<CurrencySelector />);
              }}
            />
            {!cri ? (
              <div
                className={`absolute left-0 top-0 flex h-full w-full items-center overflow-hidden text-ellipsis whitespace-nowrap p-[0px_14px] font-brand !text-base text-white`}
              >
                Search&nbsp;<span className="text-[#FFFFFF40]">contract, name, symbol...</span>
              </div>
            ) : (
              ""
            )}
          </div>
          <div className="absolute left-0 w-full overflow-hidden rounded-b bg-[#29292b]">
            {loading ? (
              <div className="flex h-[80px] w-full items-center justify-center">
                <Oval
                  width={30}
                  height={30}
                  color={"white"}
                  secondaryColor="black"
                  strokeWidth={4}
                  strokeWidthSecondary={4}
                />
              </div>
            ) : (
              pairs.map((pair, i) => {
                return <PairItem key={i} pair={pair} isLast={i === pairs.length - 1} setCriteria={setCri} />;
              })
            )}
          </div>
        </div>
        <div
          className="flex h-full w-[44px] cursor-pointer items-center justify-center rounded-r bg-[#B9B8B80D] text-primary"
          onClick={() => {
            setIsOpen(3);
            setSidebarContent(<CurrencySelector />);
          }}
        >
          {DrawSVG}
        </div>
      </div>
    </div>
  );
};
