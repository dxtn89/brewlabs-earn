import { useSelector } from "react-redux";

import { useSlowRefreshEffect } from "hooks/useRefreshEffect";
import { useAppDispatch } from "state";

import { HomeState, State } from "../types";
import { SerializedTransactionData } from "./type";
import {
  fetchFeeCollectedDataAsync,
  fetchMarketInfoAsync,
  fetchNFTStakingDataAsync,
  fetchTokenListAsync,
  fetchTransactionDataAsync,
  fetchTreasuryValueAsync,
} from ".";
import { useEffect } from "react";
import { ChainId } from "@brewlabs/sdk";

export const useFetchHomeData = () => {
  const dispatch = useAppDispatch();

  useSlowRefreshEffect(() => {
    dispatch(fetchTransactionDataAsync());
    dispatch(fetchNFTStakingDataAsync());
    dispatch(fetchFeeCollectedDataAsync());
    dispatch(fetchTreasuryValueAsync());
  }, [dispatch]);
};

export const useFetchMarketValues = (period) => {
  const dispatch = useAppDispatch();
  useSlowRefreshEffect(() => {
    dispatch(fetchMarketInfoAsync(period));
  }, [dispatch, period]);
};

export const useFetchTokenLists = () => {
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(fetchTokenListAsync(ChainId.ETHEREUM));
    dispatch(fetchTokenListAsync(ChainId.BSC_MAINNET));
    dispatch(fetchTokenListAsync(ChainId.POLYGON));
  }, [dispatch]);
};

export const useHomeTransaction = (): { transactions: SerializedTransactionData } => {
  const { transactions } = useSelector((state: State) => ({
    transactions: state.home.transactions,
  }));
  return { transactions };
};

export const useAllHomeData = () => useSelector((state: State) => state.home);

export const useMarketValues = (period) => useSelector((state: State) => state.home.marketValues[period] ?? []);

export const useTokenList = (chainId) => useSelector((state: State) => state.home.tokenList[chainId] ?? []);
