import { useState } from "react";
import { Category } from "config/constants/types";
import { useChainCurrentBlocks } from "state/block/hooks";
import { filterPoolsByStatus } from "utils";
import ActivityDropdown from "views/directory/SelectionPanel/ActivityDropdown";

import { Input } from "@components/ui/input";
import { Button } from "@components/ui/button";

const SelectionPanel = ({
  pools,
  curFilter,
  setCurFilter,
  criteria,
  setCriteria,
  activity,
  setActivity,
}: {
  pools: any;
  curFilter: number;
  setCurFilter: any;
  criteria: string;
  setCriteria: any;
  activity: any;
  setActivity: any;
}) => {
  const currentBlocks = useChainCurrentBlocks();

  let counts = [];
  for (let i = 1; i <= 4; i++) {
    const filter = pools.filter((data: any) => data.type === i);
    counts[i] = filter.length;
  }
  counts[5] = pools.filter((data) =>
    data.type === Category.INDEXES
      ? data.userData?.stakedBalances[0]?.gt(0) || data.userData?.stakedBalances[1]?.gt(0)
      : Number(data.userData?.stakedBalance) > 0
  ).length;

  const filters = [
    {
      key: 2,
      count: <span className="ml-2 text-xs">({counts[2]})</span>,
      value: "Yield Farms",
    },
    {
      key: 3,
      count: <span className="ml-2 text-xs">({counts[3]})</span>,
      value: "Indexes",
    },
  ];

  let filteredPools = pools.filter(
    (data) =>
      curFilter === Category.ALL ||
      data.type === curFilter ||
      (curFilter === Category.MY_POSITION &&
        (data.type === Category.INDEXES ? +data.userData?.stakedUsdAmount > 0 : data.userData?.stakedBalance.gt(0)))
  );

  let activityCnts = {
    active: filterPoolsByStatus(filteredPools, currentBlocks, "active").length,
    finished: filterPoolsByStatus(filteredPools, currentBlocks, "finished").length,
    new: filterPoolsByStatus(filteredPools, currentBlocks, "new").length,
  };

  return (
    <div className="flex items-center gap-3">
      <Input
        placeholder="Search..."
        value={criteria}
        onChange={(e) => setCriteria(e.target.value)}
        className="max-w-sm"
      />

      <div className="flex items-center gap-2">
        {filters.map((filter, i) => {
          return (
            <Button
              variant="outline"
              className={curFilter === filter.key && "bg-zinc-800 text-yellow-200"}
              key={filter.key}
              onClick={() => setCurFilter(i + 2)}
            >
              {filter.value} {filter.count}
            </Button>
          );
        })}
      </div>

      <div className="ml-auto">
        <ActivityDropdown value={activity} setValue={setActivity} counts={activityCnts} />
      </div>
    </div>
  );
};

export default SelectionPanel;
