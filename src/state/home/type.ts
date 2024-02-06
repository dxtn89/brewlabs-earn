export interface SerializedTransactionData {
  count: number;
  count24h: number;
}
export interface SerializedNFTStakingData {
  stakedCount: number;
  apy: number;
}

export interface SerializedFeeCollectedData {
  fee: number;
  fee24h: number;
}
export interface SerializedTreasuryData {
  value: number;
  value24h: number;
}

export interface SerialziedTokenListData {
  chainId: number;
  address: string;
  name: string;
  symbol: string;
  logoURI: string;
  decimals: number;
}
