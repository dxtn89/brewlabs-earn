import { useEffect, useState } from "react";
import { ChainId } from "@brewlabs/sdk";
import axios from "axios";
import { getAddress } from "ethers/lib/utils.js";

import { ERC20_ABI } from "config/abi/erc20";

import { DEXSCREENER_CHAINNAME } from "config";
import { useActiveChainId } from "hooks/useActiveChainId";
import { useAppDispatch } from "state";
import { useTokenMarketChart } from "state/prices/hooks";
import { fetchTokenBalancesAsync } from "state/wallet";
import { useUserLpTokenData } from "state/wallet/hooks";
import multicall from "utils/multicall";
import { useSigner } from "utils/wagmi";
import { useAccount } from "wagmi";
import { API_URL } from "config/constants";
import { ethers } from "ethers";
import { analyzePairLog } from "utils/getChartTransactions";

export const useLPTokens = () => {
  const dispatch = useAppDispatch();

  const { chainId } = useActiveChainId();
  const { address: account } = useAccount();
  const { data: signer } = useSigner();

  const ownedlpTokens = useUserLpTokenData(chainId, account);
  const tokenMarketData = useTokenMarketChart(chainId);

  const [lpTokens, setLPTokens] = useState(null);

  async function fetchLPInfo(data: any, chainId: ChainId) {
    console.log(data);
    const pairInfos = await Promise.all(
      data.map(async (data) => {
        try {
          let pair;
          if (data.symbol === "BREWSWAP-LP") {
            const brewSwapUrl = `${API_URL}/chart/search/pairs?q=${data.address}`;
            const { data: brewPairs } = await axios.get(brewSwapUrl);
            if (!brewPairs || !brewPairs.length) return null;
            pair = brewPairs[0];
            pair = {
              ...pair,
              liquidity: { ...pair.liquidity, quote: pair.liquidity.usd / (pair.totalSupply ?? 1) },
            };
          } else {
            const url = `https://api.dexscreener.com/latest/dex/pairs/${DEXSCREENER_CHAINNAME[chainId]}/${data.address}`;
            const { data: response } = await axios.post("https://pein-api.vercel.app/api/tokenController/getHTML", {
              url,
            });
            pair = response.result.pair;
            const calls = [
              {
                name: "decimals",
                address: pair.baseToken.address,
              },
              {
                name: "decimals",
                address: pair.quoteToken.address,
              },
              {
                name: "totalSupply",
                address: pair.pairAddress,
              },
            ];
            const result = await multicall(ERC20_ABI, calls, chainId);
            pair = {
              ...pair,
              baseToken: { ...pair.baseToken, decimals: result[0][0] },
              quoteToken: { ...pair.quoteToken, decimals: result[1][0] },
              totalSupply: ethers.utils.formatEther(result[2][0]).toString(),
              a: pair.dexId,
            };
          }
          return {
            timeStamp: Math.floor(pair.pairCreatedAt / 1000),
            address: getAddress(data.address),
            balance: data.balance,
            symbol: data.symbol,
            token0: pair.baseToken,
            token1: pair.quoteToken,
            price: pair.liquidity.usd / pair.totalSupply,
            volume: pair.volume.h24 ?? 0,
            chainId,
            a: pair.a === "pancakeswap" ? "pcs-v2" : pair.a === "uniswap" ? "uniswap-v2" : pair.a,
          };
        } catch (e) {
          console.log(e);
          return null;
        }
      })
    );
    return pairInfos.filter((pair) => pair);
  }

  async function fetchLPTokens(chainId) {
    dispatch(fetchTokenBalancesAsync(account, chainId, tokenMarketData, signer));
  }

  useEffect(() => {
    if (!account) {
      setLPTokens(null);
      return;
    }
    if (!Object.keys(DEXSCREENER_CHAINNAME).includes(chainId.toString())) {
      setLPTokens(null);
      return;
    }

    if (!ownedlpTokens.length) {
      setLPTokens(null);
      return;
    }

    const fetchLPInfoAsync = async () => {
      const data = await fetchLPInfo(ownedlpTokens, chainId);
      setLPTokens(data);
    };

    fetchLPInfoAsync();
  }, [account, chainId, JSON.stringify(ownedlpTokens)]);

  return { lpTokens: lpTokens ?? [], loading: ownedlpTokens.length && lpTokens === null, fetchLPTokens };
};
