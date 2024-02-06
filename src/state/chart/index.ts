import { createSlice } from "@reduxjs/toolkit";

import { ChartState, HomeState } from "state/types";
import { fetchAllPairs } from "./fetchPairInfo";
import { simpleRpcProvider } from "utils/providers";

const initialState: ChartState = {
  pairs: {},
};

export const fetchPairsAsync =
  (criteria, chain = null, type) =>
  async (dispatch) => {
    const pairs = await fetchAllPairs(criteria, chain, type);
    dispatch(addPairs(pairs));
  };

export const fetchTxInfoAsync = (pair, txHash, chainId) => async (dispatch) => {
  if (!pair || !txHash) return;
  try {
    const provider = simpleRpcProvider(chainId);
    const transaction = await provider.getTransaction(txHash);
    const { timestamp } = await provider.getBlock(transaction.blockNumber);
    dispatch(addTxInfo({ txHash, timestamp: timestamp * 1000, pair, chainId }));
  } catch (e) {
    console.log(e);
  }
};
export const ChartSlice = createSlice({
  name: "chart",
  initialState,
  reducers: {
    addPairs: (state, action) => {
      const pairs = action.payload;
      pairs.map((pair) => {
        if (!state.pairs[pair.chainId]) state.pairs[pair.chainId] = {};
        state.pairs[pair.chainId][pair.address] = {
          ...state.pairs[pair.chainId][pair.address],
          ...pair,
        };
      });
    },
    addTxInfo: (state, action) => {
      const { pair, timestamp, chainId, txHash } = action.payload;
      if (!state.pairs[chainId]) state.pairs[chainId] = {};
      if (!state.pairs[chainId][pair]) state.pairs[chainId][pair] = {};
      state.pairs[chainId][pair][txHash] = {
        ...state.pairs[chainId][pair][txHash],
        txHash,
        timestamp,
      };
    },
  },
});

// Actions
export const { addPairs, addTxInfo } = ChartSlice.actions;

export default ChartSlice.reducer;
