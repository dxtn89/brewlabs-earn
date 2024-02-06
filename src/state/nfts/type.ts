import { ChainId } from "@brewlabs/sdk";
import { SerializedToken } from "config/constants/types";

export interface FlaskNftData {
  chainId: ChainId;
  address: string;
  brewsToken: SerializedToken;
  stableTokens: SerializedToken[];
  maxSupply: number;
  totalSupply: number;
  mintFee?: { brews: string; stable: string };
  upgradeFee?: { brews: string; stable: string };
  oneTimeLimit: number;
  userData?: {
    balances: [{ tokenId: number; rarity: number }];
    allowances: string[];
    tokenBalances?: string[];
  };
}

export interface MirrorNftData {
  chainId: ChainId;
  address: string;
  userData?: {
    balances: [{ tokenId: number; rarity: number }];
  };
}

export interface NftStakingData {
  chainId: ChainId;
  address: string;
  earningToken: SerializedToken;
  apr?: number;
  totalStaked: number;
  startBlock: number;
  bonusEndBlock: number;
  rewardPerBlock?: string;
  oneTimeLimit: number;
  userData?: {
    allowance: boolean;
    stakedAmount: number;
    stakedTokenIds: number[];
    earnings: string;
  };
  performanceFee?: string;
}
