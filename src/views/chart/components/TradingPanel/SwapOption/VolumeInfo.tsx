/* eslint-disable react-hooks/exhaustive-deps */
import DropDown from "views/directory/IndexDetail/Dropdowns/Dropdown";
import { useState } from "react";
import { BigNumberFormat } from "utils/functions";
import { SkeletonComponent } from "@components/SkeletonComponent";

export default function VolumeInfo({ volumeDatas, volumeDataLoading }) {
  const [showType, setShowType] = useState(0);

  const showTypes = [
    { key: "txn", values: ["Buys", "Sells", "Total"] },
    { key: "txn (usd)", values: ["Buys", "Sells", "Total"] },
  ];

  return (
    <div className="primary-shadow rounded-[6px] bg-[#B9B8B80D] p-3">
      <div className="flex items-center">
        <DropDown
          value={showType}
          setValue={setShowType}
          data={showTypes.map((data) => data.key.toUpperCase())}
          className="!w-[88px] !bg-[#29292C] !text-xs text-white"
          bodyClassName="!bg-none !bg-[#29292C]"
          itemClassName="hover:!bg-[#86868644]"
        />
        <div className="flex flex-1 items-center justify-between">
          {Object.keys(volumeDatas[showTypes[showType].key]).map((key, i) => {
            return (
              <div
                key={i}
                className={`flex-1 text-right text-sm ${
                  volumeDatas[showTypes[showType].key][key].isUp ? " text-[#3AFDB7]" : "text-[#DC4545]"
                }`}
              >
                {key.toUpperCase()}
              </div>
            );
          })}
        </div>
      </div>
      <div className="py-2">
        {showTypes[showType].values.map((data, i) => {
          return (
            <div
              key={i}
              className={`flex py-1.5 text-sm ${
                i === showTypes[showType].values.length - 1 ? "" : "border-b border-[#FFFFFF40]"
              }`}
            >
              <div
                className={`w-[90px] ${i < 2 ? (i % 2 === 0 ? " text-[#3AFDB7]" : "text-[#DC4545]") : "text-white"}`}
              >
                {data}
              </div>
              <div className="flex flex-1 items-center justify-between">
                {Object.keys(volumeDatas[showTypes[showType].key]).map((key, i) => {
                  return (
                    <div key={i} className="flex-1 text-right text-[11px] text-white">
                      {volumeDataLoading ? (
                        <SkeletonComponent className="!min-w-[32px] !w-8" />
                      ) : (
                        BigNumberFormat(volumeDatas[showTypes[showType].key][key][data], showType ? 2 : 0)
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
