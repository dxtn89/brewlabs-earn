export interface SerializedPairData {
  price?: number;
  priceChange?: number;
  price24h?: number;
  address?: string;
  chainId?: number;
  params?: string[];
  txs?: Record<number, Record<string, SerializedTxData>>;
}

export interface SerializedTxData {
  timestamp: number;
}
