import { useCallback } from "react";
import useActiveWeb3React from "@hooks/useActiveWeb3React";
import { useFlaskNftContract } from "@hooks/useContract";
import { calculateGasMargin } from "utils";
import { getNetworkGasPrice } from "utils/getGasPrice";

export const useFlaskNft = () => {
  const { library, chainId } = useActiveWeb3React();
  const nftContract = useFlaskNftContract(chainId);

  const handleMint = useCallback(
    async (count: number, payingToken: string) => {
      const gasPrice = await getNetworkGasPrice(library, chainId);
      let gasLimit = await nftContract.estimateGas.mint(count, payingToken, { gasPrice });
      gasLimit = calculateGasMargin(gasLimit);

      const tx = await nftContract.mint(count, payingToken, { gasPrice, gasLimit });
      const receipt = await tx.wait();

      return receipt;
    },
    [nftContract, chainId, library]
  );
  const handleUpgradeNft = useCallback(
    async (tokenIds: number[], payingToken: string) => {
      const gasPrice = await getNetworkGasPrice(library, chainId);

      let gasLimit = await nftContract.estimateGas.upgradeNFT(tokenIds, payingToken, { gasPrice });
      gasLimit = calculateGasMargin(gasLimit);

      const tx = await nftContract.upgradeNFT(tokenIds, payingToken, { gasPrice, gasLimit });
      const receipt = await tx.wait();

      return receipt;
    },
    [nftContract, chainId, library]
  );

  return {
    onMint: handleMint,
    onUpgrade: handleUpgradeNft,
  };
};
