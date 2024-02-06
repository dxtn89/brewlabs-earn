import { Currency } from "@brewlabs/sdk";
import CurrencySelector from "./CurrencySelector";
import { CurrencyLogo } from "./logo";
import { ChevronDownIcon } from "@heroicons/react/24/solid";

import { useGlobalState } from "state";
import { Field } from "state/swap/actions";
import { Field as LiquidityField } from "state/mint/actions";
import { useDerivedSwapInfo } from "state/swap/hooks";
import { useEffect, useState } from "react";
import { useMediaQuery } from "react-responsive";

const CurrencySelectButton = ({
  inputCurrencySelect,
  onUserInput,
  type,
  onCurrencySelect,
  currencies,
  size,
}: {
  inputCurrencySelect: boolean;
  onUserInput?: any;
  type?: any;
  onCurrencySelect?: any;
  currencies: any;
  size?: string;
}) => {
  const [inputValue, setInputValue] = useState(null);
  const [isOpen, setIsOpen] = useGlobalState("userSidebarOpen");
  const [sidebarContent, setSidebarContent] = useGlobalState("userSidebarContent");

  const isSM = useMediaQuery({ query: "(max-width: 640px)" });

  useEffect(() => {
    setInputValue(
      inputCurrencySelect
        ? type === "liquidity"
          ? currencies[LiquidityField.CURRENCY_A]
          : currencies[Field.INPUT]
        : type === "liquidity"
        ? currencies[LiquidityField.CURRENCY_B]
        : currencies[Field.OUTPUT]
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currencies, inputCurrencySelect]);

  return (
    <button
      onClick={() => {
        setIsOpen(isOpen === 1 ? 1 : 2);
        setSidebarContent(
          <CurrencySelector
            inputType={inputCurrencySelect ? "input" : "output"}
            selectedCurrency={inputValue}
            onUserInput={onUserInput}
            type={type}
            onCurrencySelect={onCurrencySelect}
          />
        );
      }}
      className={`${
        size === "sm" ? "" : "sm:!min-h-12 sm:!h-12 sm:!px-4"
      } !min-h-8 btn !h-8 !px-2 font-brand font-light`}
    >
      {inputValue ? (
        <span
          className={`${
            size === "sm" ? "" : "sm:pr-1 sm:text-2xl"
          } flex items-center justify-between gap-2 pr-0 text-base`}
        >
          <CurrencyLogo currency={inputValue} size={isSM || size === "sm" ? "18px" : "24px"} />
          {inputValue?.symbol}
        </span>
      ) : (
        <span>Select Token</span>
      )}
      <ChevronDownIcon
        className={`${
          size === "sm" ? "" : "sm:mb-1 sm:h-5 sm:w-5"
        } mb-0 ml-2 hidden h-3 w-3 dark:text-primary xsm:block`}
      />
    </button>
  );
};

export default CurrencySelectButton;
