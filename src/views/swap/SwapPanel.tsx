import { useState, useMemo, useCallback, useContext, useEffect } from "react";
import { CurrencyAmount, Percent, Price, ChainId } from "@brewlabs/sdk";
import { useWeb3Modal } from "@web3modal/wagmi/react";
import { Oval } from "react-loader-spinner";
import { toast } from "react-toastify";
import { useConnect } from "wagmi";

import { PRICE_IMPACT_WITHOUT_FEE_CONFIRM_MIN, ALLOWED_PRICE_IMPACT_HIGH } from "config/constants";
import contracts from "config/constants/contracts";
import { NETWORKS } from "config/constants/networks";
import { useTranslation } from "contexts/localization";
import { SwapContext } from "contexts/SwapContext";
import useActiveWeb3React from "hooks/useActiveWeb3React";
import { ApprovalState, useApproveCallbackFromTrade } from "hooks/useApproveCallback";
import { useSwapAggregator } from "hooks/swap/useSwapAggregator";
import useSwapCallback from "hooks/swap/useSwapCallback";
import useWrapCallback, { WrapType } from "hooks/swap/useWrapCallback";
import { useSwitchNetwork } from "hooks/useSwitchNetwork";
import { useTokenTaxes } from "hooks/useTokenInfo";
import { useTokenMarketChart } from "state/prices/hooks";
import { useUserSlippageTolerance, useUserTransactionTTL } from "state/user/hooks";
import { Field } from "state/swap/actions";
import { useSwapState, useSwapActionHandlers, useDerivedSwapInfo } from "state/swap/hooks";
import maxAmountSpend from "utils/maxAmountSpend";
import { computeTradePriceBreakdown, warningSeverity } from "utils/prices";

import CurrencyInputPanel from "components/currencyInputPanel";
import CurrencyOutputPanel from "components/currencyOutputPanel";
import { PrimarySolidButton } from "components/button/index";
import Button from "components/Button";
import WarningModal from "components/warningModal";
import StyledButton from "views/directory/StyledButton";

import History from "./components/History";
import SwitchIconButton from "./components/SwitchIconButton";
import ConfirmationModal from "./components/modal/ConfirmationModal";
import StyledInput from "@components/StyledInput";
import { handleWalletError } from "lib/bridge/helpers";
import { showError } from "utils/functions";

const AGGREGATOR_LOST_MAX_LIMIT = 0.15;
const AGGREGATOR_LOST_LIMIT = 0.05;

export default function SwapPanel({
  showHistory = true,
  size,
  toChainId,
}: {
  showHistory?: boolean;
  size?: string;
  toChainId?: ChainId;
}) {
  const { account, chainId } = useActiveWeb3React();

  const { t } = useTranslation();
  const { isLoading } = useConnect();
  const { open } = useWeb3Modal();

  const [openConfirmationModal, setOpenConfirmationModal] = useState(false);
  const [warningOpen, setWarningOpen] = useState(false);
  const [txConfirmInfo, setTxConfirmInfo] = useState({ type: "confirming", tx: "" });
  // modal and loading
  const [attemptingTxn, setAttemptingTxn] = useState<boolean>(false); // clicked confirm

  // ----------------- ROUTER SWAP --------------------- //

  const { autoMode, buyTax, sellTax, slippage, setAutoMode, setSlippageInput, isBrewRouter, isSwapAndTransfer }: any =
    useContext(SwapContext);
  // swap state
  const { independentField, typedValue, recipient } = useSwapState();
  const { currencies, currencyBalances, parsedAmount, inputError, v2Trade } = useDerivedSwapInfo();
  const {
    wrapType,
    execute: onWrap,
    inputError: wrapInputError,
  } = useWrapCallback(currencies[Field.INPUT], currencies[Field.OUTPUT], typedValue);
  const showWrap: boolean = wrapType !== WrapType.NOT_APPLICABLE;
  const trade = showWrap ? undefined : v2Trade;

  const { onUserInput, onSwitchTokens, onChangeRecipient } = useSwapActionHandlers();

  const tokenMarketData = useTokenMarketChart(chainId);

  // txn values
  const [deadline] = useUserTransactionTTL();
  const [userSlippageTolerance, setUserSlippageTolerance] = useUserSlippageTolerance();

  const noLiquidity = useMemo(() => {
    if (chainId === ChainId.BSC_TESTNET || chainId === ChainId.POLYGON)
      return currencies[Field.INPUT] && currencies[Field.OUTPUT] && !trade;
    return true; // use aggregator for non bsc testnet & polygon network
  }, [currencies[Field.INPUT], currencies[Field.OUTPUT], trade]);

  const [approval, approveCallback] = useApproveCallbackFromTrade(
    parsedAmount,
    trade,
    userSlippageTolerance,
    noLiquidity
  );

  const maxAmountInput: CurrencyAmount | undefined = maxAmountSpend(currencyBalances[Field.INPUT]);

  const { callback: swapCallbackUsingRouter, error: swapCallbackError }: any = useSwapCallback(
    trade,
    autoMode ? slippage : userSlippageTolerance,
    deadline,
    recipient
  );

  const { priceImpactWithoutFee } = computeTradePriceBreakdown(trade);

  const { canSwitch, switchNetwork } = useSwitchNetwork();

  const confirmPriceImpactWithoutFee = (priceImpactWithoutFee: Percent) => {
    if (!priceImpactWithoutFee.lessThan(PRICE_IMPACT_WITHOUT_FEE_CONFIRM_MIN)) {
      return (
        window.prompt(
          `This swap has a price impact of at least ${PRICE_IMPACT_WITHOUT_FEE_CONFIRM_MIN.toFixed(
            0
          )}%. Please type the word "confirm" to continue with this swap.`
        ) === "confirm"
      );
    }
    if (!priceImpactWithoutFee.lessThan(ALLOWED_PRICE_IMPACT_HIGH)) {
      return window.confirm(
        `This swap has a price impact of at least ${ALLOWED_PRICE_IMPACT_HIGH.toFixed(
          0
        )}%. Please confirm that you would like to continue with this swap.`
      );
    }
    return true;
  };

  const handleApproveUsingRouter = async () => {
    setAttemptingTxn(true);
    approveCallback()
      .then((result) => setAttemptingTxn(false))
      .catch((e) => {
        setAttemptingTxn(false);
        handleWalletError(e, showError);
      });
  };

  const handleSwapUsingRouter = useCallback(() => {
    if (priceImpactWithoutFee && !confirmPriceImpactWithoutFee(priceImpactWithoutFee)) {
      return;
    }
    if (!swapCallbackUsingRouter) {
      return;
    }
    setAttemptingTxn(true);
    swapCallbackUsingRouter()
      .then(() => {
        setAttemptingTxn(false);
        onUserInput(Field.INPUT, "");
      })
      .catch((error) => {
        if (error.reason) {
          toast.error(error.reason.split(":").slice(-1)[0]);
        } else if (error.message) {
          toast.error(error.message.split("(")[0]);
        }

        setAttemptingTxn(false);
        onUserInput(Field.INPUT, "");
      });
  }, [priceImpactWithoutFee, swapCallbackUsingRouter]);

  const handleMaxInput = useCallback(() => {
    if (maxAmountInput) {
      onUserInput(Field.INPUT, maxAmountInput.toExact());
    }
  }, [maxAmountInput, onUserInput]);

  const dependentField: Field = independentField === Field.INPUT ? Field.OUTPUT : Field.INPUT;

  const handleTypeInput = useCallback(
    (value: string) => {
      onUserInput(Field.INPUT, value);
      if (value === "") onUserInput(Field.OUTPUT, "");
    },
    [onUserInput]
  );
  const handleTypeOutput = useCallback(
    (value: string) => {
      onUserInput(Field.OUTPUT, value);
    },
    [onUserInput]
  );

  // ----------------- AGGREGATION SWAP --------------------- //

  const {
    callback: swapCallbackUsingAggregator,
    query,
    error: aggregationCallbackError,
  } = useSwapAggregator(currencies, parsedAmount, autoMode ? slippage : userSlippageTolerance, deadline, recipient);

  const _usingAggregator = noLiquidity || +query?.outputAmount?.toExact() > +trade?.outputAmount?.toExact();
  const usingAggregator = !isBrewRouter && _usingAggregator;

  const parsedAmounts = showWrap
    ? {
        [Field.INPUT]: parsedAmount,
        [Field.OUTPUT]: parsedAmount,
      }
    : {
        [Field.INPUT]: parsedAmount,
        [Field.OUTPUT]: _usingAggregator ? query?.outputAmount : trade?.outputAmount,
      };

  const atMaxAmountInput = Boolean(maxAmountInput && parsedAmounts[Field.INPUT]?.equalTo(maxAmountInput));

  const formattedAmounts = {
    [independentField]: typedValue,
    [dependentField]: showWrap
      ? parsedAmounts[independentField]?.toExact() ?? ""
      : parsedAmounts[dependentField]?.toSignificant(6) ?? "",
  };

  const price = useMemo(() => {
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

  const sellTokenPrice = tokenMarketData?.[currencies[Field.INPUT]?.wrapped.address.toLowerCase()]?.usd ?? 0;
  const buyTokenPrice = tokenMarketData?.[currencies[Field.OUTPUT]?.wrapped.address.toLowerCase()]?.usd ?? 0;
  const priceImpactOnAggregator =
    buyTokenPrice && sellTokenPrice
      ? 1 -
        ((query ? +query.outputAmount?.toExact() : 0) * buyTokenPrice) /
          ((parsedAmount ? +parsedAmount.toExact() : 0) * sellTokenPrice)
      : 0;

  // warnings on slippage
  const priceImpactSeverity = warningSeverity(priceImpactWithoutFee);

  const handleSwapUsingAggregator = async () => {
    // if (priceImpactOnAggregator && !confirmPriceImpactForSwapAggregator(priceImpactOnAggregator)) {
    //   return;
    // }
    if (!swapCallbackUsingAggregator) {
      return;
    }
    setAttemptingTxn(true);

    swapCallbackUsingAggregator()
      .then(() => {
        setAttemptingTxn(false);
        onUserInput(Field.INPUT, "");
      })
      .catch((error) => {
        if (error.reason) {
          if (error.reason == "BrewlabsAggregatonRouter: Insufficient output amount") {
            toast.error("Insufficient output amount, please check slippage.");
          } else toast.error(error.reason.split(":").slice(-1)[0]);
        } else if (error.message) {
          toast.error(error.message.split("(")[0]);
        }

        setAttemptingTxn(false);
        onUserInput(Field.INPUT, "");
      });
  };

  const onConfirm = () => {
    if (usingAggregator) {
      handleSwapUsingAggregator();
    } else {
      handleSwapUsingRouter();
    }
  };

  const parseCustomSlippage = (value: string) => {
    setSlippageInput(value);
    try {
      const valueAsIntFromRoundedFloat = Number.parseInt((Number.parseFloat(value) * 100).toString());
      if (!Number.isNaN(valueAsIntFromRoundedFloat) && valueAsIntFromRoundedFloat < 5000) {
        setUserSlippageTolerance(valueAsIntFromRoundedFloat);
      }
    } catch (error) {
      console.error(error);
    }
  };
  const { buyTaxes: outputBuyTaxes }: any = useTokenTaxes(currencies[Field.OUTPUT]?.address, chainId);
  const { sellTaxes: inputSellTaxes }: any = useTokenTaxes(currencies[Field.INPUT]?.address, chainId);

  useEffect(() => {
    if (!(outputBuyTaxes + inputSellTaxes)) {
      if (
        currencies[Field.OUTPUT]?.address?.toLowerCase() === "0x2f86747a9c5db9b80840a3a588e2b87f367188d6" ||
        currencies[Field.INPUT]?.address?.toLowerCase() === "0x2f86747a9c5db9b80840a3a588e2b87f367188d6"
      ) {
        setAutoMode(false);
        parseCustomSlippage("5.5");
      } else setAutoMode(true);
    } else {
      setAutoMode(false);
      parseCustomSlippage(outputBuyTaxes + inputSellTaxes + 1);
    }
  }, [outputBuyTaxes, currencies[Field.OUTPUT]?.address, inputSellTaxes, currencies[Field.INPUT]?.address]);

  useEffect(() => {
    if (!isSwapAndTransfer) onChangeRecipient("");
  }, [isSwapAndTransfer]);

  return (
    <>
      <WarningModal open={warningOpen} setOpen={setWarningOpen} type={"highpriceimpact"} onClick={onConfirm} />
      <ConfirmationModal
        open={openConfirmationModal}
        setOpen={setOpenConfirmationModal}
        type={txConfirmInfo.type}
        tx={txConfirmInfo.tx}
      />

      <div className="rounded-2xl border border-gray-600">
        <CurrencyInputPanel
          label={t("Sell")}
          value={formattedAmounts[Field.INPUT]}
          onUserInput={handleTypeInput}
          onMax={handleMaxInput}
          showMaxButton={!atMaxAmountInput}
          currency={currencies[Field.INPUT]}
          balance={currencyBalances[Field.INPUT]}
          currencies={currencies}
          size={size}
        />
      </div>

      <SwitchIconButton
        onSwitch={() => {
          onSwitchTokens();
          onUserInput(Field.INPUT, "");
        }}
      />

      <div className="mb-1 rounded-2xl border border-dashed border-gray-600">
        <CurrencyOutputPanel
          label={t("Buy")}
          value={formattedAmounts[Field.OUTPUT]}
          onUserInput={handleTypeOutput}
          currency={currencies[Field.OUTPUT]}
          balance={currencyBalances[Field.OUTPUT]}
          data={parsedAmounts[Field.INPUT] && !showWrap ? query : undefined}
          slippage={autoMode ? slippage : userSlippageTolerance}
          price={price}
          buyTax={buyTax}
          sellTax={sellTax}
          currencies={currencies}
          noLiquidity={_usingAggregator}
          size={size}
        />
      </div>
      {account ? (
        !(toChainId && toChainId !== chainId) ? (
          Object.keys(contracts.aggregator).includes(chainId.toString()) ? (
            <>
              {isSwapAndTransfer && (
                <label className="form-control mb-4 w-full">
                  <div className="label">
                    <span className="label-text">Swap and send to ...</span>
                  </div>
                  <input
                    type="text"
                    autoComplete="off"
                    value={recipient ?? ""}
                    placeholder="0x000..."
                    onChange={(e) => onChangeRecipient(e.target.value)}
                    className="input-bordered input-ghost input w-full"
                  />
                </label>
              )}
              {inputError ? (
                <button className="primary-shadow h-12 rounded font-brand text-[#FFFFFF50]" disabled={true}>
                  {t(inputError)}
                </button>
              ) : currencyBalances[Field.INPUT] === undefined ? (
                <button className="primary-shadow h-12 rounded font-brand text-[#FFFFFF50]" disabled={true}>
                  {t("Loading")}
                </button>
              ) : showWrap ? (
                <PrimarySolidButton disabled={Boolean(wrapInputError)} onClick={onWrap}>
                  {wrapInputError ??
                    (wrapType === WrapType.WRAP ? "Wrap" : wrapType === WrapType.UNWRAP ? "Unwrap" : null)}
                </PrimarySolidButton>
              ) : approval <= ApprovalState.PENDING ? (
                <>
                  <PrimarySolidButton
                    onClick={() => {
                      handleApproveUsingRouter();
                    }}
                    pending={attemptingTxn}
                    disabled={attemptingTxn}
                  >
                    {attemptingTxn ? (
                      <span>{t("Approving %asset%...", { asset: currencies[Field.INPUT]?.symbol })}</span>
                    ) : (
                      t("Approve %asset%", { asset: currencies[Field.INPUT]?.symbol })
                    )}
                  </PrimarySolidButton>
                </>
              ) : (
                <PrimarySolidButton
                  onClick={() => {
                    if (
                      priceImpactSeverity === 3 ||
                      priceImpactOnAggregator > Math.max(AGGREGATOR_LOST_LIMIT, userSlippageTolerance / 10000)
                    ) {
                      setWarningOpen(true);
                    } else onConfirm();
                  }}
                  pending={attemptingTxn}
                  disabled={
                    attemptingTxn ||
                    (!usingAggregator && (!!swapCallbackError || priceImpactSeverity > 3)) ||
                    (usingAggregator && !!aggregationCallbackError)
                  }
                >
                  {attemptingTxn
                    ? "Swapping..."
                    : !usingAggregator
                    ? !!swapCallbackError
                      ? swapCallbackError
                      : priceImpactSeverity > 3
                      ? "Price Impact Too High"
                      : "Swap"
                    : !!aggregationCallbackError
                    ? aggregationCallbackError
                    : "Swap"}
                  {(attemptingTxn || aggregationCallbackError === "Querying swap path...") && (
                    <div className="absolute right-2 top-0 flex h-full items-center">
                      <Oval
                        width={21}
                        height={21}
                        color={"white"}
                        secondaryColor="black"
                        strokeWidth={3}
                        strokeWidthSecondary={3}
                      />
                    </div>
                  )}
                </PrimarySolidButton>
              )}
            </>
          ) : (
            <Button disabled={!0}>{t("Coming Soon")}</Button>
          )
        ) : (
          <StyledButton
            className="!w-full whitespace-nowrap p-[10px_12px] !font-roboto"
            onClick={() => {
              switchNetwork(toChainId);
            }}
            disabled={!canSwitch}
          >
            Switch {NETWORKS[toChainId].chainName}
          </StyledButton>
        )
      ) : (
        <StyledButton
          className="!w-full whitespace-nowrap p-[10px_12px] !font-roboto"
          onClick={() => {
            open({ view: "Connect" });
          }}
          pending={isLoading}
        >
          Connect Wallet
        </StyledButton>
      )}

      {showHistory ? <History /> : ""}
    </>
  );
}
