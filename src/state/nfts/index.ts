import { createSlice } from "@reduxjs/toolkit";
import { ChainId, NATIVE_CURRENCIES } from "@brewlabs/sdk";

import contracts from "config/constants/contracts";
import { PAGE_SUPPORTED_CHAINS } from "config/constants/networks";
import { stableCoins } from "config/constants/nft";
import { brewsToken } from "config/constants/tokens";
import { NftState } from "state/types";
import { serializeToken } from "state/user/hooks/helpers";

import { fetchFlaskNftPublicData, fetchFlaskNftUserData } from "./fetchFlaskNft";
import { fetchNftStakingPublicData, fetchNftStakingUserData } from "./fetchNftStaking";
import { fetchMirrorNftUserData } from "./fetchMirrorNft";

import type { AugmentedChainId } from "config/constants/networks";

const initialState: NftState = {
  flaskNft: Object.keys(contracts.flaskNft)
    .filter((chainId) => PAGE_SUPPORTED_CHAINS.nft.includes(+chainId))
    .map((chainId) => ({
      chainId: +chainId,
      address: contracts.flaskNft[chainId],
      brewsToken: serializeToken(brewsToken[+chainId]),
      stableTokens: stableCoins[+chainId].map((t) => serializeToken(t)),
      maxSupply: 5000,
      totalSupply: 0,
      oneTimeLimit: 30,
    })),
  mirrorNft: Object.keys(contracts.mirrorNft)
    .filter((chainId) => PAGE_SUPPORTED_CHAINS.nft.includes(+chainId))
    .map((chainId) => ({
      chainId: +chainId,
      address: contracts.mirrorNft[chainId],
    })),
  data: Object.keys(contracts.nftStaking)
    .filter((chainId) => PAGE_SUPPORTED_CHAINS.nft.includes(+chainId))
    .map((chainId) => ({
      chainId: +chainId,
      address: contracts.nftStaking[chainId],
      earningToken: serializeToken(NATIVE_CURRENCIES[+chainId]),
      nftPrice: 100,
      totalStaked: 0,
      startBlock: 0,
      bonusEndBlock: 0,
      rewardPerBlock: "0",
      oneTimeLimit: 30,
    })),
  userDataLoaded: false,
};

export const fetchNftPublicDataAsync = (chainId: AugmentedChainId) => async (dispatch) => {
  const flaskData = await fetchFlaskNftPublicData(chainId);
  dispatch(setNftPublicData({ type: "flaskNft", data: flaskData }));

  if (contracts.nftStaking[chainId]) {
    const nftStakingInfo = await fetchNftStakingPublicData(chainId);
    dispatch(setNftPublicData({ type: "data", data: nftStakingInfo }));
  }
};

export const fetchNftUserDataAsync = (chainId: AugmentedChainId, account: string) => async (dispatch, getState) => {
  const config = getState().nfts.flaskNft.find((p) => p.chainId === chainId);
  if (!config) return;

  const flaskData = await fetchFlaskNftUserData(chainId, account, [
    config.brewsToken.address,
    ...config.stableTokens.map((t) => t.address),
  ]);
  dispatch(setNftUserData({ type: "flaskNft", data: flaskData }));

  const mirrorData = await fetchMirrorNftUserData(chainId, account);
  dispatch(setNftUserData({ type: "mirrorNft", data: mirrorData }));

  if (contracts.nftStaking[chainId]) {
    const nftStakingInfo = await fetchNftStakingUserData(chainId, account);
    dispatch(setNftUserData({ type: "data", data: nftStakingInfo }));
  }
};

export const fetchFlaskNftUserDataAsync = (chainId: ChainId, account: string) => async (dispatch, getState) => {
  const config = getState().nfts.flaskNft.filter((p) => p.chainId === chainId);
  if (!config.brewsToken) return;

  const data = await fetchFlaskNftUserData(chainId, account, [
    config.brewsToken.address,
    ...config.stableTokens.map((t) => t.address),
  ]);
  dispatch(setNftUserData({ type: "flaskNft", data }));
};

export const NftSlice = createSlice({
  name: "nfts",
  initialState,
  reducers: {
    setNftPublicData: (state, action) => {
      const { type, data } = action.payload;

      const index = state[type].findIndex((p) => p.chainId === data.chainId);
      if (index >= 0) {
        state[type][index] = { ...state[type][index], ...data };
      } else {
        // state[type].push(data);
      }
    },
    setNftUserData: (state, action) => {
      const { type, data } = action.payload;

      const index = state[type].findIndex((p) => p.chainId === data.chainId);
      if (index >= 0) {
        state[type][index] = { ...state[type][index], userData: data.userData };
      }
      state.userDataLoaded = true;
    },
    resetNftUserData: (state) => {
      state.flaskNft = state.flaskNft.map((data) => ({ ...data, userData: undefined }));
      state.mirrorNft = state.mirrorNft.map((data) => ({ ...data, userData: undefined }));
      state.data = state.data.map((data) => ({ ...data, userData: undefined }));

      state.userDataLoaded = false;
    },
  },
});

// Actions
export const { setNftPublicData, setNftUserData, resetNftUserData } = NftSlice.actions;

export default NftSlice.reducer;
