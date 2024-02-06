/* eslint-disable react-hooks/exhaustive-deps */
import NFTComponent from "@components/NFTComponent";
import { useActiveNFT } from "views/nft/hooks/useActiveNFT";

export default function MomentumInfo({ volumeDatas }) {
  const activeRarity = useActiveNFT();
  const isActive = activeRarity >= 0;

  const buyAmount = volumeDatas["txn (usd)"]["7d"].Buys;
  const sellAmount = volumeDatas["txn (usd)"]["7d"].Sells;
  const totalAmount = buyAmount + sellAmount;
  const max = buyAmount > sellAmount ? 1 : 0;
  const buyPercent = isActive ? (totalAmount ? (buyAmount / totalAmount) * 100 : 50) : 100;
  const sellPercent = isActive ? (totalAmount ? (sellAmount / totalAmount) * 100 : 50) : 0;

  return (
    <div className="primary-shadow mt-2 rounded-md bg-[#B9B8B80D] p-[8px_16px_16px_16px]">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <div className={`text-base font-bold ${isActive ? "text-white" : "text-[#FFFFFF40]"}`}>7D Momentum</div>
        </div>
        <div className="flex items-center">
          <NFTComponent />
        </div>
      </div>
      <div className={`my-2 text-sm ${isActive ? "text-[#FFFFFFBF]" : "text-[#FFFFFF40]"}`}>
        Volume price direction over 7 days.
      </div>
      <div className="mx-auto flex max-w-[288px] items-center text-sm">
        <div className={isActive ? "text-white" : "text-[#FFFFFF40]"}>Sellers</div>
        <div className="mx-4 flex flex-1 items-center">
          <div
            className={`mx-[1px] h-2 ${max === 0 ? `h-3.5` : "flex-1"} tooltip cursor-pointer`}
            data-tip={sellPercent.toFixed(2) + "%"}
            style={{ background: isActive ? "#DC4545" : "#FFFFFF40", width: sellPercent + "%" }}
          ></div>
          <div
            className={`mx-[1px] h-2 ${max === 1 ? `h-3.5` : `flex-1`} tooltip cursor-pointer`}
            data-tip={buyPercent.toFixed(2) + "%"}
            style={{ background: isActive ? "#32FFB5" : "#FFFFFF40", width: buyPercent + "%" }}
          ></div>
        </div>
        <div className={isActive ? "text-white" : "text-[#FFFFFF40]"}>Buyers</div>
      </div>
    </div>
  );
}
