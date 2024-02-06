import { useCallback } from "react";
import useActiveWeb3React from "@hooks/useActiveWeb3React";
import { useTokenFactoryContract } from "@hooks/useContract";
import { calculateGasMargin } from "utils";
import { getNetworkGasPrice } from "utils/getGasPrice";
import { ethers } from "ethers";

export const useFactory = (chainId, performanceFee) => {
  const { library } = useActiveWeb3React();
  const tokenContract = useTokenFactoryContract(chainId);

  const handleCreate = useCallback(
    async (name: string, symbol: string, decimals: number, totalSupply: string) => {
      const gasPrice = await getNetworkGasPrice(library, chainId);
      let gasLimit = await tokenContract.estimateGas.createBrewlabsStandardToken(name, symbol, decimals, totalSupply, {
        value: performanceFee,
        gasPrice,
      });
      gasLimit = calculateGasMargin(gasLimit);

      const tx = await tokenContract.createBrewlabsStandardToken(
        name,
        symbol,
        decimals,
        ethers.utils.parseUnits(totalSupply, decimals),
        {
          value: performanceFee,
          gasPrice,
        }
      );
      const receipt = await tx.wait();

      return receipt;
    },
    [tokenContract, chainId, library, performanceFee]
  );

  return {
    onCreate: handleCreate,
  };
};
