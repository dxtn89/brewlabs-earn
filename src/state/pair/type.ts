import { ChainId } from "@brewlabs/sdk";

export interface SerializedWalletNFT {
  type: string;
  collectionName: string;
  address: string;
  description: string;
  logo: string;
  chainId: ChainId;
  name: string;
  tokenId: number;
  balance: number;
}

export interface SerializedWalletToken {
  address: string;
  balance: number;
  name: string;
  symbol: string;
  decimals: number;
  price: number;
  reward: SerializedRewardToken;
  isScam: boolean;
  isReward: boolean;
  chainId: number;
}

interface SerializedRewardToken {
  totalRewards: number;
  pendingRewards: number;
  symbol: string;
}
