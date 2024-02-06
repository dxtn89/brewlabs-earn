import { ChainId } from "@brewlabs/sdk";
import { useActiveChainId } from "@hooks/useActiveChainId";
import { useFlaskNftData } from "state/nfts/hooks";

export const useActiveNFT = () => {
  const flaskETHNft = useFlaskNftData(ChainId.ETHEREUM);
  const flaskBSCNft = useFlaskNftData(ChainId.BSC_MAINNET);
  const activeNFT = (flaskETHNft.userData?.balances?.length ?? 0) + (flaskBSCNft.userData?.balances?.length ?? 0);
  const activeRarity: any = activeNFT
    ? [...(flaskETHNft.userData?.balances ?? []), ...(flaskBSCNft.userData?.balances ?? [])].sort(
        (a, b) => b.rarity - a.rarity
      )[0].rarity - 1
    : -1;
  return activeRarity;
};
