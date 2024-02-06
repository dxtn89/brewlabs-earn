import { useContext, useEffect, useState } from "react";
import styled from "styled-components";
import { useAccount } from "wagmi";

import { DashboardContext } from "contexts/DashboardContext";
import { useActiveChainId } from "@hooks/useActiveChainId";
import SwapBoard from "views/swap/SwapBoard";
import { useUserTokenData } from "state/wallet/hooks";

import LogoIcon from "../LogoIcon";
import FullOpenVector from "./FullOpenVector";
import SwitchButton from "./SwitchButton";
import NavButton from "./NavButton";
import IndexPerformance from "./IndexPerformance";
import FeaturedPriceList from "./FeaturedPriceList";
import PerformanceChart from "./PerformanceChart";
import NFTList from "./NFTList";
import TokenList from "./TokenList";

const UserDashboard = () => {
  const [showType, setShowType] = useState(0);
  const [fullOpen, setFullOpen] = useState(false);
  const { viewType, setViewType, chartPeriod, setChartPeriod }: any = useContext(DashboardContext);
  const [pageIndex, setPageIndex] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(0);
  const [archives, setArchives] = useState<any>([]);
  const [listType, setListType] = useState(0);
  const [maxPage, setMaxPage] = useState(0);

  const { address: account } = useAccount();
  const { chainId } = useActiveChainId();

  const tokens = useUserTokenData(chainId, account);

  useEffect(() => {
    if (window.innerHeight < 790) setItemsPerPage(Math.floor((window.innerHeight - 300) / 50));
    else if (window.innerHeight < 920) setItemsPerPage(Math.floor((window.innerHeight - 535) / 50));
    else setItemsPerPage(Math.floor((window.innerHeight - 548) / 50));
  }, [fullOpen]);

  const stringifiedValues = JSON.stringify({ listType, tokens, archives, itemsPerPage });
  useEffect(() => {
    let _filteredTokens: any = [];
    if (listType === 0) {
      _filteredTokens = tokens.filter((data: any) => !archives.includes(data.address));
    } else {
      _filteredTokens = tokens.filter((data: any) => archives.includes(data.address));
    }
    setMaxPage(Math.ceil(_filteredTokens.length / itemsPerPage));
  }, [stringifiedValues]);

  return (
    <>
      <StyledContainer className="relative mr-1.5 flex w-full  flex-col  pb-3">
        <div className="flex w-full justify-between border-b border-yellow pb-4">
          <div className="flex items-center ">
            <LogoIcon classNames="w-14 text-dark dark:text-brand" />
            <div className={"ml-5 text-2xl font-semibold text-yellow"}>Dashboard</div>
          </div>
          <NavButton value={viewType} setValue={setViewType} />
        </div>

        {viewType === 0 ? (
          <ChartPanel>
            <div className={"mt-4"}>
              <PerformanceChart showType={showType} tokens={tokens} />
            </div>
            <div className={"relative z-10 flex w-full justify-between"}>
              <SwitchButton
                value={chartPeriod}
                setValue={setChartPeriod}
                values={["1D", "1W", "1M", "1Y", "ALL"]}
                className="h-[25px] w-[240px] text-xs xsm:text-sm"
              />
              <SwitchButton
                value={showType}
                setValue={setShowType}
                values={["My Wallet", "Total Market"]}
                className="h-[25px] w-[220px] text-xs xsm:text-sm"
              />
            </div>
          </ChartPanel>
        ) : (
          ""
        )}
      </StyledContainer>
      {viewType === 1 ? (
        <div className="mt-4 flex justify-center">
          <SwapBoard type={"draw"} disableChainSelect />
        </div>
      ) : viewType === 0 ? (
        <>
          <TokenList
            tokens={tokens}
            fullOpen={fullOpen}
            showType={showType}
            pageIndex={pageIndex}
            setPageIndex={setPageIndex}
            itemsPerPage={itemsPerPage}
            archives={archives}
            setArchives={setArchives}
            listType={listType}
            setListType={setListType}
          />
          <div className={"w-full"}>
            <FullOpenVector
              open={fullOpen}
              setOpen={setFullOpen}
              pageIndex={pageIndex}
              setPageIndex={setPageIndex}
              maxPage={maxPage}
            />
          </div>
        </>
      ) : (
        <NFTList />
      )}
      <div className={fullOpen || viewType !== 0 ? "hidden" : "w-full"}>
        <IndexPerformance />
      </div>
      <PricePanel className={`absolute bottom-10 w-full px-4 ${fullOpen ? "hidden" : ""}`} viewType={viewType}>
        <FeaturedPriceList />
      </PricePanel>
    </>
  );
};

export default UserDashboard;

const StyledContainer = styled.div`
  padding-top: 20px;
`;

const ChartPanel = styled.div`
  @media screen and (max-height: 790px) {
    display: none;
  }
`;

const PricePanel = styled.div<{ viewType: number }>`
  @media screen and (max-height: 920px) {
    display: none;
  }
  display: ${({ viewType }) => (viewType === 1 ? "none" : "")};
`;
