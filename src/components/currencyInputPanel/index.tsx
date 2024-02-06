import { Currency, CurrencyAmount, WNATIVE } from "@brewlabs/sdk";
import BigNumber from "bignumber.js";
import useActiveWeb3React from "hooks/useActiveWeb3React";
import { useDexPrice } from "hooks/useTokenPrice";
import { getBlockExplorerLink, getBlockExplorerLogo } from "utils/functions";

import CurrencySelectButton from "components/CurrencySelectButton";
import NumericalInput from "./NumericalInput";
import { SkeletonComponent } from "@components/SkeletonComponent";

interface CurrencyInputPanelProps {
  value: string;
  onUserInput: (value: string) => void;
  onMax?: () => void;
  showMaxButton: boolean;
  label?: string;
  currency: Currency | null;
  balance: CurrencyAmount | undefined;
  type?: string;
  onCurrencySelect?: any;
  inputCurrencySelect?: boolean;
  currencies?: any;
  size?: string;
}

const CurrencyInputPanel = ({
  value,
  onUserInput,
  onMax,
  label,
  currency,
  balance,
  type = "swap",
  onCurrencySelect,
  inputCurrencySelect = true,
  currencies,
  size,
}: CurrencyInputPanelProps) => {
  const { chainId } = useActiveWeb3React();
  const { price: tokenPrice } = useDexPrice(
    chainId,
    currency?.isNative ? WNATIVE[chainId]?.address?.toLowerCase() : currency?.address?.toLowerCase()
  );

  return (
    <div className={`${size === "sm" ? "" : "sm:pr-4 lg:ml-6"} ml-0 py-2 pl-4 pr-2`}>
      <span>{label}</span>
      <div className="mt-1 overflow-hidden">
        <div className="flex justify-between">
          <NumericalInput
            value={value}
            onUserInput={(val) => {
              onUserInput(val);
            }}
            decimals={currency?.decimals}
            size={size}
          />
          <CurrencySelectButton
            inputCurrencySelect={inputCurrencySelect}
            onUserInput={onUserInput}
            type={type}
            onCurrencySelect={onCurrencySelect}
            currencies={currencies}
            size={size}
          />
        </div>
        <div className="flex justify-between">
          <div className="ml-1 flex text-sm opacity-40">
            {value ? tokenPrice ? new BigNumber(value).times(tokenPrice).toFixed(2) : <SkeletonComponent /> : "0.00"}
            &nbsp;USD
          </div>
          {currency && (
            <div className="ml-1">
              <div className="flex items-center justify-end">
                <div className="mr-2 cursor-pointer text-sm opacity-40 hover:opacity-80" onClick={onMax}>
                  Balance: {currency ? balance?.toSignificant(6) : "0.00"}
                </div>
                <a
                  href={getBlockExplorerLink(currency?.wrapped?.address, "token", chainId)}
                  target="_blank"
                  rel="noreferrer"
                >
                  <img src={getBlockExplorerLogo(chainId)} alt="Ether scan logo" className="h-2.5 w-2.5" />
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CurrencyInputPanel;
