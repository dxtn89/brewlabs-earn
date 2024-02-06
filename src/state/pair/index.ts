import { createSlice } from "@reduxjs/toolkit";

import { PairState, WalletState } from "state/types";

import { ChainId } from "@brewlabs/sdk";
import { getBrewlabsSwapFee, getTradingAllPairs, getTradingPair } from "./fetchTradingPairs";
import { BASES_TO_TRACK_LIQUIDITY_FOR } from "config/constants";

const initialState: PairState = {
  tradingPairs: {},
};

export const fetchTradingPairAsync = (chainId: ChainId, address: string) => async (dispatch) => {
  const pair = await getTradingPair(chainId, address);
  if (!pair) return;
  dispatch(setPairData({ chainId, address, pair }));
};

export const fetchTradingPairFeesAsync = (chainId: ChainId, address: string) => async (dispatch) => {
  const data = await getBrewlabsSwapFee(chainId, address);
  dispatch(setPairFeeData({ chainId, address, data }));
};

export const fetchTradingAllPairAsync = (chainId: ChainId) => async (dispatch) => {
  const pairs = await getTradingAllPairs(chainId);
  dispatch(setPairs({ chainId, pairs }));
};

export const PairSlice = createSlice({
  name: "pair",
  initialState,
  reducers: {
    setPairData: (state: any, action) => {
      const { chainId, pair } = action.payload;
      if (!state.tradingPairs[chainId]) state.tradingPairs[chainId] = {};
      state.tradingPairs[chainId][pair.address] = {...state.tradingPairs[chainId][pair.address], ...pair};
    },
    setPairs: (state, action) => {
      const { chainId, pairs } = action.payload;
      if (!state.tradingPairs[chainId]) state.tradingPairs[chainId] = {};
      pairs.map(
        (pair) =>
          (state.tradingPairs[chainId][pair.address] = { ...state.tradingPairs[chainId][pair.address], ...pair })
      );
    },
    setPairFeeData: (state, action) => {
      const { chainId, address, data } = action.payload;
      if (!state.tradingPairs[chainId]) state.tradingPairs[chainId] = {};
      state.tradingPairs[chainId][address] = { ...state.tradingPairs[chainId][address], ...data };
    },
  },
});

// Actions
export const { setPairData, setPairs, setPairFeeData } = PairSlice.actions;

export default PairSlice.reducer;
