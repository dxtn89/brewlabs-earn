import styled from "styled-components";
import PoolCard from "./PoolCard";

import { Category } from "config/constants/types";
import { PlusIcon } from "@heroicons/react/24/outline";
import ButtonProductDeploy from "@components/productDeployer/ButtonProductDeploy";

const PoolList = ({
  pools,
  setSelectPoolDetail,
  setCurPool,
  setSortOrder,
  loading,
  deployerOpen,
  setDeployerOpen,
  step,
  setStep,
  deployType,
  setDeployType,
  curFilter,
}: {
  pools: any;
  setSelectPoolDetail: any;
  setCurPool: any;
  setSortOrder: any;
  loading: boolean;
  deployerOpen: any;
  setDeployerOpen: any;
  step: any;
  setStep: any;
  deployType: any;
  setDeployType: any;
  curFilter: Category;
}) => {
  return (
    <div className="relative mx-auto mb-4 flex w-full flex-col gap-1 rounded-3xl border-t border-slate-600 bg-zinc-900 px-3 pb-10 pt-4 shadow-xl shadow-amber-500/10 sm:px-10 md:mx-0">
      <div className="hidden justify-between sm:flex">
        <div className="min-w-[80px] cursor-pointer" onClick={() => setSortOrder("chainId")}>
          Network
        </div>
        {curFilter === Category.FARM ? (
          <div className="min-w-[36px] cursor-pointer" onClick={() => setSortOrder("chainId")}>
            DEX
          </div>
        ) : (
          ""
        )}
        <div className="min-w-[210px] cursor-pointer" onClick={() => setSortOrder("default")}>
          Pool
        </div>
        <div className="min-w-[70px] cursor-pointer" onClick={() => setSortOrder("tvl")}>
          TVL
        </div>
        <div className="min-w-[250px] cursor-pointer" onClick={() => setSortOrder("totalStaked")}>
          Total supply staked
        </div>
        <div className="min-w-[80px] cursor-pointer" onClick={() => setSortOrder("apr")}>
          Performance
        </div>
      </div>
      <div className="divider my-1"></div>
      <PoolPanel>
        {!loading && <div className="mt-3 text-center">loading...</div>}
        {loading &&
          pools.map((data: any, i: number) => {
            return (
              <PoolCard
                data={data}
                key={`${data.pid}-${data.chainId}-${data.address}-${data.contractAddress}`}
                index={i}
                length={pools.length}
                setSelectPoolDetail={setSelectPoolDetail}
                setCurPool={setCurPool}
              />
            );
          })}
      </PoolPanel>

      <div className="text-center">
        <svg
          className="mx-auto h-12 w-12 text-gray-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          aria-hidden="true"
        >
          <path
            vectorEffect="non-scaling-stroke"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z"
          />
        </svg>
        <h3 className="mt-2 text-sm font-semibold text-gray-900">No products</h3>
        <p className="mt-1 text-sm text-gray-500">Get started by creating a new product.</p>
        <div className="mx-auto mt-6 w-fit">
          <ButtonProductDeploy />
        </div>
      </div>
    </div>
  );
};

const PoolPanel = styled.div`
  overflow-y: scroll;
  display: flex;
  max-height: 400px;
  flex-direction: column;
  padding: 8px 0;
  ::-webkit-scrollbar {
    width: 16px;
    height: 16px;
    display: block !important;
  }

  ::-webkit-scrollbar-track {
  }
  ::-webkit-scrollbar-thumb:vertical {
    border: 4px solid rgba(0, 0, 0, 0);
    background-clip: padding-box;
    border-radius: 9999px;
    background-color: #eebb19;
  }
  @media screen and (max-width: 1080px) {
    height: fit-content;
    ::-webkit-scrollbar {
      display: none !important;
    }
  }
`;

export default PoolList;
