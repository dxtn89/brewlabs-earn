import { Currency, CurrencyAmount } from "@brewlabs/sdk";
import { useCallback, useMemo } from "react";

import { useTokenContract } from "./useContract";
import { useSingleCallResult } from "../state/multicall/hooks";
import { getNetworkGasPrice } from "utils/getGasPrice";
import { ethers } from "ethers";
import useActiveWeb3React from "./useActiveWeb3React";
import { useCurrency } from "./Tokens";

function useTokenAllowance(token?: Currency, owner?: string, spender?: string): CurrencyAmount | undefined {
  const contract = useTokenContract(token?.address, false);

  const inputs = useMemo(() => [owner, spender], [owner, spender]);
  const allowance = useSingleCallResult(contract, "allowance", inputs).result;

  return useMemo(
    () => (token && allowance ? new CurrencyAmount(token, allowance.toString()) : undefined),
    [token, allowance]
  );
}

export const useTokenApprove = (tokenAddress, to) => {
  const { account, chainId, library } = useActiveWeb3React();
  const currency = useCurrency(tokenAddress);
  const allowance = useTokenAllowance(currency, account, to);

  const tokenContract = useTokenContract(tokenAddress);

  const handleApprove = useCallback(async () => {
    const gasPrice = await getNetworkGasPrice(library, chainId);

    const tx = await tokenContract.approve(to, ethers.constants.MaxUint256, { gasPrice });
    const receipt = await tx.wait();

    return receipt;
  }, [account, chainId, library, to, tokenContract]);

  return { onApprove: handleApprove, allowance };
};

export default useTokenAllowance;
