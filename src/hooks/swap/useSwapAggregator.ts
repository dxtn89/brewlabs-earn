import { Currency, CurrencyAmount, TokenAmount, Token } from "@brewlabs/sdk";
import { useEffect, useMemo, useState } from "react";
import { ethers } from "ethers";

import { DEFAULT_DEADLINE_FROM_NOW, INITIAL_ALLOWED_SLIPPAGE } from "config/constants";
import useActiveWeb3React from "hooks/useActiveWeb3React";
import useENS from "hooks/ENS/useENS";
import { Field } from "state/swap/actions";
import { useTransactionAdder } from "state/transactions/hooks";
import { calculateGasMargin, isAddress, shortenAddress } from "utils";
import { getAggregatorContract } from "utils/contractHelpers";
import { makeBigNumber } from "utils/functions";
import { useSigner } from "utils/wagmi";

export const useSwapAggregator = (
  currencies: { [field in Field]?: Currency },
  amountIn: CurrencyAmount,
  allowedSlippage: number = INITIAL_ALLOWED_SLIPPAGE, // in bips
  deadline: number = DEFAULT_DEADLINE_FROM_NOW, // in seconds from now
  recipientAddressOrName: string | null
) => {
  const { account, chainId } = useActiveWeb3React();

  const { data: signer } = useSigner();

  // const { address: recipientAddress } = useENS(recipientAddressOrName);
  const recipient = !isAddress(recipientAddressOrName) ? account : recipientAddressOrName;

  const callParams = useMemo(() => {
    if (
      !amountIn ||
      !currencies ||
      !currencies[Field.INPUT] ||
      !currencies[Field.OUTPUT] ||
      currencies[Field.INPUT]?.wrapped.address === currencies[Field.OUTPUT]?.wrapped.address
    )
      return null;
    const amountInWei = makeBigNumber(amountIn.toExact(), amountIn.currency.decimals);
    return {
      args: [
        amountInWei, // amountIn
        currencies[Field.INPUT]?.wrapped.address, // tokenIn
        currencies[Field.OUTPUT]?.wrapped.address, // tokenOut
        2, // maxSteps
      ],
      value: currencies[Field.INPUT].isNative ? amountInWei : null,
    };
  }, [amountIn?.toExact(), currencies[Field.INPUT]?.address, currencies[Field.OUTPUT]?.address]);

  const [query, setQuery] = useState<any>(null);

  useEffect(() => {
    setQuery(null);
  }, [chainId]);

  useEffect(() => {
    const contract = getAggregatorContract(chainId);
    if (!contract || !callParams) return;

    const methodName = "findBestPath";
    contract[methodName](...callParams.args)
      .then((response: any) => {
        const outputValue = response.amounts[response.amounts.length - 1];
        if (outputValue) {
          const outputAmount =
            currencies[Field.OUTPUT] instanceof Token
              ? new TokenAmount(currencies[Field.OUTPUT], outputValue)
              : new CurrencyAmount(currencies[Field.OUTPUT], outputValue);
          const inputValue = response.amounts[0];
          const inputAmount =
            currencies[Field.INPUT] instanceof Token
              ? new TokenAmount(currencies[Field.INPUT], inputValue)
              : new CurrencyAmount(currencies[Field.INPUT], inputValue);
          setQuery({
            inputAmount,
            outputAmount,
            amounts: response.amounts,
            path: response.path,
            adapters: response.adapters,
          });
        } else {
          setQuery(null);
        }
      })
      .catch((error: any) => {
        console.error(error);
      });
  }, [chainId, callParams]);

  const addTransaction = useTransactionAdder();
  return useMemo(() => {
    const contract = getAggregatorContract(chainId, signer);

    if (!chainId || !account || !signer || !contract || !callParams) {
      return { callback: null, error: "Missing dependencies", query };
    }
    if (!query || !query.outputAmount) {
      return { callback: null, error: "No liquidity found", query };
    }

    if (callParams.value && !callParams.value.eq(query.amounts[0])) {
      return { callback: null, error: "Querying swap path...", query };
    }

    return {
      callback: async function onSwap() {
        const amountOutMin = query.amounts[query.amounts.length - 1].mul(10000 - allowedSlippage).div(10000);
        const args = [
          [query.amounts[0], amountOutMin, query.path, query.adapters],
          recipient,
          Math.floor(Date.now() / 1000 + deadline),
        ];
        const options = callParams.value ? { value: callParams.value } : {};
        const methodName = currencies[Field.INPUT].isNative
          ? "swapNoSplitFromETH"
          : currencies[Field.OUTPUT].isNative
          ? "swapNoSplitToETH"
          : "swapNoSplit";
        const gasEstimate = await contract.estimateGas[methodName](...args, options);
        return contract[methodName](...args, {
          gasLimit: calculateGasMargin(gasEstimate),
          ...(options.value ? { value: options.value, from: account } : { from: account }),
        })
          .then(async (response: any) => {
            const inputSymbol = currencies[Field.INPUT].wrapped.symbol;
            const outputSymbol = currencies[Field.OUTPUT].wrapped.symbol;
            const inputAmount = amountIn.toSignificant(3);
            const outputAmount = ethers.utils.formatUnits(response.data, currencies[Field.OUTPUT].decimals);

            const base = `Swap ${inputAmount} ${inputSymbol} for ${outputAmount} ${outputSymbol}`;
            const withRecipient =
              recipient === account
                ? base
                : `${base} to ${
                    recipientAddressOrName && isAddress(recipientAddressOrName)
                      ? shortenAddress(recipientAddressOrName)
                      : recipientAddressOrName
                  }`;

            addTransaction(response, {
              summary: withRecipient,
            });
            await response.wait();
            return response.hash;
          })
          .catch((error: any) => {
            // if the user rejected the tx, pass this along
            if (error?.code === 4001) {
              throw new Error("Transaction rejected.");
            } else {
              // otherwise, the error was unexpected and we need to convey that
              console.error(`Swap failed`, error, methodName, args, options.value);
              throw new Error(`${error.message}`);
            }
          });
      },
      query,
    };
  }, [
    account,
    chainId,
    recipient,
    query,
    callParams,
    allowedSlippage,
    deadline,
    recipientAddressOrName,
    addTransaction,
  ]);
};
