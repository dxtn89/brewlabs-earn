/* eslint-disable react-hooks/exhaustive-deps */
import { DocumentTextIcon } from "@heroicons/react/24/outline";
import { useContext, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import orderBy from "lodash/orderBy";
import { useAccount } from "wagmi";

import { buttonVariants } from "components/ui/button";
import Link from "next/link";

import Container from "components/layout/Container";
import PageWrapper from "components/layout/PageWrapper";
import PageHeader from "components/layout/PageHeader";
import WordHighlight from "components/text/WordHighlight";
import ButtonProductDeploy from "components/productDeployer/ButtonProductDeploy";

import { Category } from "config/constants/types";
import { TokenPriceContext } from "contexts/TokenPriceContext";
import { useFarms } from "state/farms/hooks";
import { usePools } from "state/pools/hooks";
import { useIndexes } from "state/indexes/hooks";
import { useChainCurrentBlocks } from "state/block/hooks";
import { filterPoolsByStatus } from "utils";
import getCurrencyId from "utils/getCurrencyId";

import IndexDetail from "views/directory/IndexDetail";
import FarmingDetail from "views/directory/FarmingDetail";
import StakingDetail from "views/directory/StakingDetail";

import PoolList from "./PoolList";
import SelectionPanel from "./SelectionPanel";

const Deployer = ({ page, type }: { page: number; type?: string }) => {
  const [curFilter, setCurFilter] = useState(page);
  const [criteria, setCriteria] = useState("");
  const [sortOrder, setSortOrder] = useState("default");
  const [curPool, setCurPool] = useState<{ type: Category; pid: number; chainId: number }>({
    type: 0,
    pid: 0,
    chainId: 0,
  });
  const [selectPoolDetail, setSelectPoolDetail] = useState(false);
  const [status, setStatus] = useState("active");

  const [deployerOpen, setDeployerOpen] = useState(false);
  const [step, setStep] = useState(0);
  const [deployType, setDeployType] = useState("Yield Farm");

  useEffect(() => {
    setDeployType(type === "index" ? "Index" : type === "token" ? "Token" : "Yield Farm");
    setStep(type ? 1 : 0);
    setDeployerOpen(type ? true : false);
  }, [type]);

  const { pools, dataFetched } = usePools();
  const { data: farms } = useFarms();
  const { indexes } = useIndexes();
  const { address: account } = useAccount();

  const { tokenPrices, lpPrices } = useContext(TokenPriceContext);
  const currentBlocks = useChainCurrentBlocks();
  const totalPools = [
    ...pools.map((pool) => {
      let price = tokenPrices[getCurrencyId(pool.chainId, pool.stakingToken.address)];
      if (price > 500000) price = 0;
      return { ...pool, tvl: pool.totalStaked && price ? +pool.totalStaked * price : 0 };
    }),
    ...farms.map((farm) => {
      let price = lpPrices[getCurrencyId(farm.chainId, farm.lpAddress, true)];
      return { ...farm, tvl: farm.totalStaked && price ? +farm.totalStaked * price : 0 };
    }),
    ...indexes.map((_index) => {
      let tvl = 0;
      for (let i = 0; i < _index.tokens.length; i++) {
        let price = _index.tokenPrices?.[i] ?? tokenPrices[getCurrencyId(_index.chainId, _index.tokens[i].address)];
        tvl += _index.totalStaked?.[i] && price ? +_index.totalStaked[i] * price : 0;
      }
      return { ..._index, tvl };
    }),
  ];

  const allPools = totalPools.filter(
    (data) => data.deployer && account && data.deployer.toLowerCase() === account.toLowerCase()
  );

  const sortPools = (poolsToSort) => {
    switch (sortOrder) {
      case "apr":
        return orderBy(poolsToSort, (pool) => pool.apr ?? 0, "desc");
      case "earned":
        return orderBy(
          poolsToSort,
          (pool) => {
            const earningTokenPrice = +tokenPrices[getCurrencyId(pool.earningToken.chainId, pool.earningToken.address)];
            if (!pool.userData || !earningTokenPrice) {
              return 0;
            }
            return pool.userData.earnings.times(earningTokenPrice).toNumber();
          },
          "desc"
        );
      case "tvl":
        return orderBy(poolsToSort, (pool) => pool.tvl ?? 0, "desc");
      case "totalStaked":
        return orderBy(
          poolsToSort,
          (pool) => {
            let totalStaked = Number.NaN;
            if (pool.totalStaked !== Infinity && pool.totalStaked !== undefined) {
              totalStaked = +pool.totalStaked.toString();
            }
            return Number.isFinite(totalStaked) ? totalStaked : 0;
          },
          "desc"
        );
      case "chainId":
        return orderBy(poolsToSort, (pool) => pool.chainId, "asc");
      case "latest":
        return orderBy(poolsToSort, (pool) => pool.sortOrder, "desc");
      default:
        return orderBy(poolsToSort, (pool) => pool.sortOrder, "asc");
    }
  };

  let chosenPools;
  if (curFilter >= 0 || criteria) {
    const lowercaseQuery = criteria.toLowerCase();
    chosenPools = allPools
      .filter(
        (pool: any) =>
          pool.stakingToken?.name.toLowerCase().includes(lowercaseQuery) ||
          pool.stakingToken?.symbol.toLowerCase().includes(lowercaseQuery) ||
          pool.lpSymbol?.toLowerCase().includes(lowercaseQuery) ||
          pool.earningToken?.name.toLowerCase().includes(lowercaseQuery) ||
          pool.earningToken?.symbol.toLowerCase().includes(lowercaseQuery) ||
          pool.tokens?.filter(
            (t) => t.name.toLowerCase().includes(lowercaseQuery) || t.symbol.toLowerCase().includes(lowercaseQuery)
          ).length
      )
      .filter((data: any) => data.type === curFilter);
  }

  chosenPools = sortPools(filterPoolsByStatus(chosenPools, currentBlocks, status));

  const renderDetailPage = () => {
    switch (curPool.type) {
      case Category.POOL:
        return (
          <StakingDetail
            detailDatas={{
              open: selectPoolDetail,
              setOpen: setSelectPoolDetail,
              data: allPools.find(
                (pool: any) =>
                  pool.type === curPool.type && pool.sousId === curPool.pid && pool.chainId === curPool.chainId
              ),
            }}
          />
        );
      case Category.FARM:
        return (
          <FarmingDetail
            detailDatas={{
              open: selectPoolDetail,
              setOpen: setSelectPoolDetail,
              data: allPools.find(
                (pool: any) =>
                  pool.type === curPool.type && pool["pid"] === curPool.pid && pool.chainId === curPool.chainId
              ),
            }}
          />
        );
      case Category.INDEXES:
        return (
          <IndexDetail
            detailDatas={{
              data: allPools.find(
                (pool: any) =>
                  pool.type === curPool.type && pool["pid"] === curPool.pid && pool.chainId === curPool.chainId
              ),
            }}
          />
        );

      default:
        return "";
    }
  };

  return (
    <PageWrapper>
      {renderDetailPage()}

      <AnimatePresence>
        {!selectPoolDetail && (
          <motion.div
            initial={{ opacity: 0, scale: 0.75 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0 }}
            transition={{ duration: 0.3 }}
          >
            <PageHeader
              title={
                <>
                  Automatically <WordHighlight content="deploy smart contracts" />
                </>
              }
              summary={
                <>
                  The Brewlabs product deployer is a simple tool that uses a step-by-step wizard to assist in the
                  deployment of smart contracts across a range of networks. No matter if you are a novice or an expert
                  in the industry, this simple deployment tool enables teams to create tokens, supporting utility smart
                  contract, staking and yield farming and more. All contracts that are deployed by our deployer tools
                  are safe, transparent and verified to ensure user security.
                </>
              }
              infoLink="https://brewlabs.gitbook.io/welcome-to-brewlabs/brewlabs-defi-products/brewlabs-2023/live-product-deployer"
            >
              <ButtonProductDeploy />
            </PageHeader>

            <Container className="pb-4 font-brand">
              <div className="mt-8">
                <SelectionPanel
                  pools={allPools}
                  curFilter={curFilter}
                  setCurFilter={setCurFilter}
                  criteria={criteria}
                  setCriteria={setCriteria}
                  activity={status}
                  setActivity={setStatus}
                />
              </div>
              <div className="mb-24 mt-5">
                <PoolList
                  pools={chosenPools}
                  setSelectPoolDetail={setSelectPoolDetail}
                  setCurPool={setCurPool}
                  setSortOrder={setSortOrder}
                  loading={dataFetched}
                  deployerOpen={deployerOpen}
                  setDeployerOpen={setDeployerOpen}
                  step={step}
                  setStep={setStep}
                  deployType={deployType}
                  setDeployType={setDeployType}
                  curFilter={curFilter}
                />
              </div>
            </Container>
          </motion.div>
        )}
      </AnimatePresence>
    </PageWrapper>
  );
};

export default Deployer;
