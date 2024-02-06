import { BarsArrowUpIcon } from "@heroicons/react/24/outline";
import PoolCard from "./PoolCard";
import { Category } from "config/constants/types";

const navigationItems = [
  {
    name: "Network",
    sortValue: "chainId",
    width: "min-w-24",
  },
  {
    name: "DEX",
    sortValue: "chainId",
    width: "min-w-16",
  },
  {
    name: "Pool",
    sortValue: "default",
    width: "min-w-[210px]",
  },
  {
    name: "TVL",
    sortValue: "tvl",
    width: "min-w-[70px]",
  },
  {
    name: "Total supply staked",
    sortValue: "totalStaked",
    width: "min-w-[250px]",
  },
  {
    name: "Performance",
    sortValue: "apr",
    width: "min-w-[120px]",
  },
];

const PoolList = ({
  pools,
  setSelectPoolDetail,
  setCurPool,
  setSortOrder,
  loading,
  curFilter,
}: {
  pools: any;
  setSelectPoolDetail: any;
  setCurPool: any;
  setSortOrder: any;
  loading: boolean;
  curFilter: Category;
}) => {
  return (
    <div>
      <div className="sticky top-0 z-10 mb-4 hidden justify-between rounded-t-lg bg-zinc-900/90 px-4 py-4 backdrop:blur md:flex">
        {navigationItems.map(
          (item, i) =>
            (curFilter === Category.FARM || i !== 1) && (
              <button
                key={i}
                className={`group flex ${item.width} items-center gap-2 text-start`}
                onClick={() => setSortOrder(item.sortValue)}
              >
                {item.name}{" "}
                <BarsArrowUpIcon className="h-auto w-4 opacity-0 transition-opacity group-hover:opacity-100" />
              </button>
            )
        )}
      </div>

      <div>
        {!loading && <div className="mt-3 text-center">loading...</div>}
        {loading &&
          pools.map((data: any, i: number) => {
            return (
              <PoolCard
                data={data}
                key={i}
                index={i}
                setSelectPoolDetail={setSelectPoolDetail}
                setCurPool={setCurPool}
              />
            );
          })}
      </div>
    </div>
  );
};

export default PoolList;
