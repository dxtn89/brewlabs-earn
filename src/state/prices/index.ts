import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { LpTokenPrices, AppThunk, TokenPricesState } from "state/types";
import fetchLpPrices from "./fetchLpPrices";
import { getMarketDatas } from "./fetchMarketDatas";

const initialState: TokenPricesState = {
  lpTokenPrices: {
    isInitialized: false,
    isLoading: true,
    data: null,
  },
  marketDatas: {},
};

export const TokenPricesSlice = createSlice({
  name: "TokenPrices",
  initialState,
  reducers: {
    lpTokenPricesFetchStart: (state) => {
      state.lpTokenPrices.isLoading = true;
    },
    lpTokenPricesFetchSucceeded: (state, action: PayloadAction<LpTokenPrices[]>) => {
      state.lpTokenPrices.isInitialized = true;
      state.lpTokenPrices.isLoading = false;
      state.lpTokenPrices.data = action.payload;
    },
    lpTokenPricesFetchFailed: (state) => {
      state.lpTokenPrices.isLoading = false;
      state.lpTokenPrices.isInitialized = true;
    },
    setMarketData: (state, action) => {
      const { chainId, marketDatas } = action.payload;
      if (!state.marketDatas[chainId]) state.marketDatas[chainId] = {};
      state.marketDatas[chainId] = { ...state.marketDatas[chainId], ...marketDatas };
    },
  },
});

export const { lpTokenPricesFetchStart, lpTokenPricesFetchSucceeded, lpTokenPricesFetchFailed, setMarketData } =
  TokenPricesSlice.actions;

export const fetchLpTokenPrices =
  (chainId, farms): AppThunk =>
  async (dispatch) => {
    try {
      dispatch(lpTokenPricesFetchStart());
      const tokenPrices = await fetchLpPrices(chainId, farms);
      dispatch(lpTokenPricesFetchSucceeded(tokenPrices));
    } catch (error) {
      dispatch(lpTokenPricesFetchFailed());
    }
  };

export const fetchMarketDataAsync =
  (chainId): AppThunk =>
  async (dispatch) => {
    const marketDatas = await getMarketDatas(chainId);
    dispatch(setMarketData({ chainId, marketDatas }));
  };

export default TokenPricesSlice.reducer;
