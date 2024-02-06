import { SkeletonComponent } from "@components/SkeletonComponent";
import { RefreshSVG } from "@components/dashboard/assets/svgs";
import { useTokenTaxes } from "@hooks/useTokenInfo";

export default function SlippageInfo({ selectedPair }) {
  const { buyTaxes, sellTaxes }: any = useTokenTaxes(selectedPair.baseToken.address, selectedPair.chainId);
  return (
    <div className="primary-shadow rounded-[6px] bg-[#B9B8B80D] p-[20px_12px] text-sm leading-none">
      <div className="mx-auto flex max-w-[280px] items-center justify-between">
        <div className="text-center 2xl:text-left">
          <div className="text-white">Buy Slippage</div>
          <div className="mt-2 font-bold text-[#3AFDB7]">
            {buyTaxes === null ? <SkeletonComponent /> : `${buyTaxes.toFixed(2)}%`}
          </div>
        </div>
        <div className="text-tailwind [&>svg]:!h-5 [&>svg]:!w-5">{RefreshSVG}</div>
        <div className="text-center 2xl:text-right">
          <div className="text-white">Sell slippage</div>
          <div className="mt-2 font-bold text-[#DC4545]">
            {sellTaxes === null ? <SkeletonComponent /> : `${sellTaxes.toFixed(2)}%`}
          </div>
        </div>
      </div>
    </div>
  );
}
