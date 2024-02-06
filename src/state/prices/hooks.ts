import { AppId } from "config/constants/types";
import useActiveWeb3React from "hooks/useActiveWeb3React";
import { useEffect } from "react";
import { shallowEqual, useSelector } from "react-redux";
import { useAppDispatch } from "state";
import { LpTokenPricesState, State } from "state/types";
import { fetchLpTokenPrices, fetchMarketDataAsync } from ".";
import { useSlowRefreshEffect } from "@hooks/useRefreshEffect";
import { ChainId } from "@brewlabs/sdk";

export const useFetchLpTokenPrices = () => {
  const dispatch = useAppDispatch();
  const { chainId } = useActiveWeb3React();
  const farms = useSelector((state: State) => state.zap.data[AppId.APESWAP]);
  useEffect(() => {
    dispatch(fetchLpTokenPrices(chainId, farms));
  }, [dispatch, farms, chainId]);
};

export const useFetchMarketData = () => {
  const dispatch = useAppDispatch();

  useSlowRefreshEffect(() => {
    dispatch(fetchMarketDataAsync(ChainId.ETHEREUM));
    dispatch(fetchMarketDataAsync(ChainId.BSC_MAINNET));
    dispatch(fetchMarketDataAsync(ChainId.ARBITRUM));
    dispatch(fetchMarketDataAsync(ChainId.POLYGON));
  }, [dispatch]);
};

export const useLpTokenPrices = () => {
  const { isInitialized, isLoading, data }: LpTokenPricesState = useSelector(
    (state: State) => state.prices.lpTokenPrices,
    shallowEqual
  );
  return { lpTokenPrices: data, isInitialized, isLoading };
};

export const useTokenMarketChart = (chainId) => {
  const marketData = useSelector((state: State) => state.prices.marketDatas[chainId] ?? {}, shallowEqual);
  return marketData;
};
