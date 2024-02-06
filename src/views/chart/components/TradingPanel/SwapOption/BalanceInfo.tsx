import { SkeletonComponent } from "@components/SkeletonComponent";
import { ChevronDownSVG, CopySVG, RefreshSVG } from "@components/dashboard/assets/svgs";
import TokenLogo from "@components/logo/TokenLogo";
import { useTokenTaxes } from "@hooks/useTokenInfo";
import { useState } from "react";
import { isAddress } from "utils";
import { BigNumberFormat } from "utils/functions";
import getTokenLogoURL from "utils/getTokenLogoURL";

export default function BalanceInfo({ selectedPair, balances, price, lpPrice }) {
  const [switchBalance, setSwitchBalance] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  const balance = selectedPair
    ? switchBalance
      ? balances && balances[selectedPair.chainId]
        ? balances[selectedPair.chainId][1].balance
        : 0
      : balances && balances[selectedPair.chainId]
      ? balances[selectedPair.chainId][0].balance
      : 0
    : 0;

  const symbol = selectedPair
    ? switchBalance
      ? `${selectedPair.baseToken.symbol}-${selectedPair.quoteToken.symbol}`
      : selectedPair.baseToken.symbol
    : "";

  const onCopyAddress = () => {
    setIsCopied(true);
    setTimeout(() => {
      setIsCopied(false);
    }, 1000);
    navigator.clipboard.writeText(switchBalance ? selectedPair.address : selectedPair.baseToken.address);
  };

  return (
    <div className="primary-shadow mt-2 flex w-[320px] items-center justify-between rounded-[6px] bg-[#B9B8B80D] p-3">
      <div
        className="flex cursor-pointer items-center"
        //  onClick={() => setSwitchBalance(!switchBalance)}
      >
        {/* <div className={`mr-2 text-white ${switchBalance ? "-scale-y-100" : ""}`}>{ChevronDownSVG}</div> */}
        <TokenLogo
          src={getTokenLogoURL(isAddress(selectedPair.baseToken.address), selectedPair.chainId)}
          classNames="primary-shadow h-8 w-8 rounded-full"
        />

        <div className="ml-2">
          <div className="text-sm leading-none text-white">
            {BigNumberFormat(balance)} {symbol} Balance
          </div>
          <div className="mt-0.5 text-xs leading-none text-[#FFFFFF80]">
            {BigNumberFormat(balance * (switchBalance ? lpPrice : price))} USD
          </div>
        </div>
      </div>
      <div
        className={`cursor-pointer ${
          isCopied ? "!text-[#FFFFFFBF]" : "text-tailwind"
        } text-sm hover:text-white [&>svg]:!h-4 [&>svg]:!w-4`}
        onClick={() => onCopyAddress()}
      >
        {isCopied ? "Copied" : CopySVG}
      </div>
    </div>
  );
}
