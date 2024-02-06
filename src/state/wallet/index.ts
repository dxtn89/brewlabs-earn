import { createSlice } from "@reduxjs/toolkit";

import { WalletState } from "state/types";

import { getNFTBalances } from "./fetchNFTBalances";
import { ChainId } from "@brewlabs/sdk";
import { getTokenBalances, getTokenDetails } from "./fetchTokenBalances";

const initialState: WalletState = {
  nfts: {},
  tokens: {},
};

export const fetchNFTBalancesAsync = (account: string, chainId: ChainId) => async (dispatch) => {
  const nfts = await getNFTBalances(account, chainId);
  dispatch(setNFTBalance({ account, chainId, nfts }));
};

export const fetchTokenBalancesAsync =
  (account: string, chainId: ChainId, tokenMarketData: any, signer: any) => async (dispatch) => {
    const tokens = await getTokenBalances(account, chainId, tokenMarketData);
    dispatch(setTokenBalance({ account, chainId, tokens }));
    const tokensWithDetails = await getTokenDetails(tokens, chainId, account, signer);
    dispatch(setTokenBalance({ account, chainId, tokens: tokensWithDetails }));
  };

export const HomeSlice = createSlice({
  name: "home",
  initialState,
  reducers: {
    setNFTBalance: (state, action) => {
      const { account, nfts, chainId } = action.payload;
      if (!state.nfts[chainId]) state.nfts[chainId] = {};
      state.nfts[chainId][account] = nfts;
    },
    setTokenBalance: (state, action) => {
      const { account, tokens, chainId } = action.payload;
      if (!state.tokens[chainId]) state.tokens[chainId] = {};
      if (!state.tokens[chainId][account]) state.tokens[chainId][account] = tokens;
      else {
        let _tokens = [];
        for (let i = 0; i < tokens.length; i++) {
          const isExisting = state.tokens[chainId][account].find((token) => token.address === tokens[i].address);
          _tokens.push({
            ...tokens[i],
            reward: tokens[i].reward !== undefined ? tokens[i].reward : isExisting?.reward,
            isScam: tokens[i].isScam !== undefined ? tokens[i].isScam : isExisting?.isScam,
            isReward: tokens[i].isReward !== undefined ? tokens[i].isReward : isExisting?.isReward,
          });
        }
        state.tokens[chainId][account] = _tokens;
      }
    },
  },
});

// Actions
export const { setNFTBalance, setTokenBalance } = HomeSlice.actions;

export default HomeSlice.reducer;
