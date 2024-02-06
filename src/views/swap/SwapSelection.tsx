import { InfoSVG } from "@components/dashboard/assets/svgs";
import StyledButton from "views/directory/StyledButton";

export default function SwapSelection({ swapType, setSwapType }) {
  return (
    <div className="-mt-2 mb-2 flex justify-between">
      <StyledButton
        className={`mr-3 rounded-md  py-1.5 font-roboto font-bold !opacity-100 ${
          swapType !== 0 ? "!bg-[#24293380] !text-[#EEBB1980]" : "!bg-[#242933] text-primary"
        }`}
        onClick={() => setSwapType(0)}
      >
        <div className="relative">
          Classic Swap
          <div className="absolute -left-[22px] top-0.5 text-[#4e4e4e] [&>svg]:h-3.5 [&>svg]:w-3.5 [&>svg]:opacity-100">
            {InfoSVG}
          </div>
        </div>
      </StyledButton>
      <StyledButton
        className={`rounded-md !bg-[#242933] py-1.5 font-roboto font-bold text-primary !opacity-100 ${
          swapType !== 1 ? "!bg-[#24293380] !text-[#EEBB1980]" : "!bg-[#242933] text-primary"
        }`}
        onClick={() => setSwapType(1)}
      >
        <div className="relative">
          Limit order
          <div className="absolute -left-[22px] top-0.5 text-[#4e4e4e] [&>svg]:h-3.5 [&>svg]:w-3.5 [&>svg]:opacity-100">
            {InfoSVG}
          </div>
        </div>
      </StyledButton>
    </div>
  );
}
