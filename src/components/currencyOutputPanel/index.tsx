import { Currency, CurrencyAmount, Price, WNATIVE } from "@brewlabs/sdk";
import { ArrowTrendingUpIcon, ArrowTrendingDownIcon } from "@heroicons/react/24/outline";
import BigNumber from "bignumber.js";
import useActiveWeb3React from "hooks/useActiveWeb3React";
import { useDexPrice } from "hooks/useTokenPrice";
import { getBlockExplorerLink, getBlockExplorerLogo } from "utils/functions";

import CurrencySelectButton from "components/CurrencySelectButton";
import NumericalInput from "./NumericalInput";
import TradeCard from "./TradeCard";
import { useTokenMarketChart } from "state/prices/hooks";
import { defaultMarketData } from "state/prices/types";
import { useDerivedSwapInfo } from "state/swap/hooks";
import { useContext, useEffect, useMemo } from "react";
import { Field } from "state/swap/actions";
import { SwapContext } from "contexts/SwapContext";
import { SkeletonComponent } from "@components/SkeletonComponent";

interface CurrencyOutputPanelProps {
  value: string;
  onUserInput: (value: string) => void;
  onCurrencySelect?: (currency: Currency) => void;
  label?: string;
  currency?: Currency | null;
  balance: CurrencyAmount | undefined;
  data?: any;
  slippage?: number;
  price?: any;
  buyTax?: number;
  sellTax?: number;
  currencies: any;
  noLiquidity?: boolean;
  size?: string;
}

const CurrencyOutputPanel = ({
  value,
  onUserInput,
  label,
  currency,
  balance,
  data,
  slippage,
  price,
  buyTax,
  sellTax,
  currencies,
  noLiquidity = false,
  size,
}: CurrencyOutputPanelProps) => {
  const { chainId } = useActiveWeb3React();
  const tokenAddress = currency?.wrapped?.address?.toLowerCase();
  const tokenMarketData = useTokenMarketChart(chainId);
  const { usd_24h_change: priceChange24h } = tokenMarketData[tokenAddress] || defaultMarketData;
  const { price: tokenPrice } = useDexPrice(
    chainId,
    currency?.isNative ? WNATIVE[chainId]?.address?.toLowerCase() : currency?.address?.toLowerCase()
  );

  const { v2Trade, parsedAmount } = useDerivedSwapInfo();
  const { isBrewRouter, setIsBrewRouter }: any = useContext(SwapContext);
  const usingAggregator = noLiquidity;

  const parsedAmounts = {
    [Field.INPUT]: parsedAmount,
    [Field.OUTPUT]: v2Trade?.outputAmount,
  };

  const brewPrice = useMemo(() => {
    if (
      !parsedAmounts ||
      !parsedAmounts[Field.INPUT] ||
      !parsedAmounts[Field.OUTPUT] ||
      !currencies[Field.INPUT] ||
      !currencies[Field.OUTPUT] ||
      parsedAmounts[Field.INPUT].equalTo(0)
    )
      return undefined;
    return new Price(
      currencies[Field.INPUT],
      currencies[Field.OUTPUT],
      parsedAmounts[Field.INPUT].raw,
      parsedAmounts[Field.OUTPUT].raw
    );
  }, [currencies[Field.INPUT], currencies[Field.OUTPUT], parsedAmounts[Field.INPUT]]);

  const stringified = JSON.stringify({
    a: currencies[Field.INPUT],
    b: currencies[Field.OUTPUT],
    c: parsedAmounts[Field.INPUT],
  });
  useEffect(() => {
    setIsBrewRouter(false);
  }, [stringified]);

  return (
    <>
      <div className={`${size === "sm" ? "" : "sm:pr-4 lg:ml-6"} ml-0 py-2 pl-4 pr-2`}>
        <div>{label}</div>
        <div className="mt-1 overflow-hidden">
          <div className="flex justify-between">
            <NumericalInput
              value={isBrewRouter ? parsedAmounts[Field.OUTPUT]?.toSignificant(6) : value}
              onUserInput={(val) => {
                onUserInput(val);
              }}
              decimals={currency?.decimals}
              disable={noLiquidity}
              size={size}
            />
            <CurrencySelectButton inputCurrencySelect={false} currencies={currencies} size={size} />
          </div>
          <div className="flex justify-between">
            <div className="ml-1 flex text-sm opacity-40">
              {value ? tokenPrice ? new BigNumber(value).times(tokenPrice).toFixed(2) : <SkeletonComponent /> : "0.00"}
              &nbsp;USD
            </div>
            {currency && (
              <div className="ml-1">
                <div className="flex items-center justify-end">
                  <div className="mr-2 text-sm opacity-40">Balance: {balance ? balance.toSignificant(6) : "0.00"}</div>
                  <a
                    href={getBlockExplorerLink(currency?.wrapped?.address, "token", chainId)}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <img src={getBlockExplorerLogo(chainId)} alt="" className="h-2.5 w-2.5" />
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>
        {priceChange24h && (
          <div className="ml-1 flex items-center gap-1 text-sm opacity-40">
            {priceChange24h > 0 ? (
              <>
                {priceChange24h.toFixed(3)}% <ArrowTrendingUpIcon className="h-3 w-3 dark:text-primary" />
              </>
            ) : (
              <>
                {Math.abs(priceChange24h).toFixed(3)}% <ArrowTrendingDownIcon className="h-3 w-3 dark:text-danger" />
              </>
            )}
            24HR
          </div>
        )}
      </div>
      {price ? (
        <div className={`${size === "sm" ? "" : "sm:mx-6"} mx-2 mb-2 mt-3 flex flex-col`}>
          <div
            className={`primary-shadow cursor-pointer rounded-xl border ${
              !isBrewRouter ? "border-amber-300" : "border-[#ffffff20]"
            } transition duration-300 hover:scale-[1.05]`}
            onClick={() => setIsBrewRouter(false)}
          >
            <TradeCard
              data={data}
              slippage={slippage}
              price={price}
              buyTax={buyTax}
              sellTax={sellTax}
              noLiquidity={noLiquidity}
              size={size}
            />
          </div>
          {usingAggregator && brewPrice && v2Trade?.route?.pairs?.[0].liquidityToken?.symbol.includes("BREW") ? (
            <div
              className={`primary-shadow mt-1.5 cursor-pointer rounded-xl border ${
                isBrewRouter ? "border-amber-300" : "border-[#ffffff20]"
              } transition duration-300 hover:scale-[1.05]`}
              onClick={() => setIsBrewRouter(true)}
            >
              <TradeCard
                data={data}
                slippage={slippage}
                price={brewPrice}
                buyTax={buyTax}
                sellTax={sellTax}
                noLiquidity={false}
                size={size}
              />
            </div>
          ) : (
            ""
          )}
        </div>
      ) : null}
    </>
  );
};

export default CurrencyOutputPanel;
