import { ChainId } from "@brewlabs/sdk";
import axios from "axios";
import { API_URL } from "config/constants";
import { AGGREGATOR_SUBGRAPH_NAMES, ROUTER_SUBGRAPH_NAMES } from "config/constants/swap";
import { ethers } from "ethers";
import { getBrewlabsFeeManagerContract, getBrewlabsPairContract } from "utils/contractHelpers";
import { formatUnits } from "viem";

function getPriceByTx(tx) {
  if (tx.type === "mint") {
    return { price0: tx.amountUSD / tx.amount0, price1: tx.amountUSD / tx.amount1 };
  }
  const amount0 = Math.max(tx.amount0In, tx.amount0Out);
  const amount1 = Math.max(tx.amount1In, tx.amount1Out);
  return { price0: tx.amountUSD / amount0, price1: tx.amountUSD / amount1 };
}
export async function getTradingPair(chainId, pair) {
  const brewSwapUrl = `${API_URL}/chart/search/pairs?q=${pair}`;
  const { data: brewPairs } = await axios.get(brewSwapUrl);
  if (brewPairs.length) {
    return brewPairs[0];
  }
  return null;
}

export async function getTradingAllPairs(chainId: ChainId) {
  if (!Object.keys(ROUTER_SUBGRAPH_NAMES).includes(chainId.toString())) return [];
  try {
    let totalPairs = [];
    let pairs = [],
      index = 0;
    do {
      const { data: response } = await axios.post(
        `https://api.thegraph.com/subgraphs/name/brainstormk/${ROUTER_SUBGRAPH_NAMES[chainId]}`,
        {
          query: `{
            pairs(
              first: 1000
              skip: ${index * 1000}
            ) {
              id
              token0 {
                decimals
                id
                name
                symbol
              }
              token1 {
                decimals
                id
                name
                symbol
              }
              reserveETH
            }
          }`,
        }
      );
      pairs = response.data.pairs;
      totalPairs = [...totalPairs, ...pairs];
      index++;
    } while (pairs.length === 1000);
    return totalPairs
      .sort((a, b) => Number(b.reserveETH) - Number(a.reserveETH))
      .map((pair) => ({
        ...pair,
        address: pair.id,
        token0: { ...pair.token0, address: pair.token0.id },
        token1: { ...pair.token1, address: pair.token1.id },
        chainId,
      }));
  } catch (e) {
    console.log(e);
    return [];
  }
}

async function getRouterTxs(chainId, period) {
  try {
    const timestamp = Math.floor(Date.now() / 1000 - period);
    let swaps,
      mints,
      index = 0,
      totalSwaps = [];
    do {
      const query = `{
        swaps(
          where: {timestamp_gte: "${timestamp}"}
          first: 1000
          skip:${1000 * index}
          orderBy: timestamp
        ) {
          amount1In
          amount0In
          amount0Out
          amount1Out
          amountUSD
          amountFeeUSD
          timestamp
          pair {
            id
          }
        }
        mints(
          where: {timestamp_gte: "${timestamp}"}
          first: 1000
          skip:${1000 * index}
          orderBy: timestamp
        ) {
          amount0
          amount1
          amountUSD
          timestamp
          pair {
            id
          }
        }
      }`;

      const { data: response } = await axios.post(
        `https://api.thegraph.com/subgraphs/name/brainstormk/${ROUTER_SUBGRAPH_NAMES[chainId]}`,
        { query }
      );

      swaps = response.data.swaps;
      mints = response.data.mints.map((mint) => ({
        ...mint,
        type: "mint",
        amount0In: mint.amount0,
        amount1In: mint.amount1,
        amount0Out: 0,
        amount1Out: 0,
        amountFeeUSD: 0,
      }));
      totalSwaps = [...totalSwaps, ...swaps, ...mints];
      index++;
    } while (swaps.length === 1000 || mints.length === 1000);
    return totalSwaps;
  } catch (e) {
    console.log(e);
    return [];
  }
}

async function getAggregatorTxs(chainId, period, marketData, tokenList) {
  try {
    const timestamp = Math.floor(Date.now() / 1000 - period);
    let swaps,
      index = 0,
      totalSwaps = [];
    do {
      const query = `{
      brewlabsSwaps(
          where: {blockTimestamp_gte: "${timestamp}"}
          first: 1000
          skip:${1000 * index}
          orderBy: blockTimestamp
        ) {
          _amountIn
          _tokenIn
          _tokenOut
          _amountOut
          blockTimestamp
        }
      }`;

      const { data: response } = await axios.post(
        AGGREGATOR_SUBGRAPH_NAMES[chainId]
          ? chainId === 56
            ? `https://api.thegraph.com/subgraphs/name/kittystardev/brewlabs-aggregator-bsc`
            : `https://api.thegraph.com/subgraphs/name/devscninja/${AGGREGATOR_SUBGRAPH_NAMES[chainId]}`
          : undefined,
        { query }
      );

      swaps = response.data.brewlabsSwaps.map((swap) => {
        const token = tokenList.find((_token) => _token.address === swap._tokenIn);
        return {
          timestamp: swap.blockTimestamp,
          amountUSD: Number(formatUnits(swap._amountIn, token?.decimals ?? 18)) * (marketData[swap._tokenIn]?.usd ?? 0),
          amountFeeUSD: 0,
        };
      });

      totalSwaps = [...totalSwaps, ...swaps];
      index++;
    } while (swaps.length === 1000);
    return totalSwaps;
  } catch (e) {
    console.log(e);
    return [];
  }
}

export async function getTradingPairHistories(chainId, period, marketData, tokenList) {
  if (!Object.keys(ROUTER_SUBGRAPH_NAMES).includes(chainId.toString()))
    return { volumeHistory: [], feeHistory: [], tvlHistory: [] };
  try {
    let query,
      totalSwaps = [],
      volumeHistory = [],
      feeHistory = [],
      tvlHistory = [];

    const timestamp = Math.floor(Date.now() / 1000 - period);

    const txsResult = await Promise.all([
      getRouterTxs(chainId, period),
      getAggregatorTxs(chainId, period, marketData, tokenList),
    ]);
    totalSwaps = [...txsResult[0], ...txsResult[1]];

    let j = 0,
      v = 0,
      fee = 0;
    for (let i = 1; i <= 10; i++) {
      while (j < totalSwaps.length && Number(totalSwaps[j].timestamp) <= timestamp + (period / 10) * i) {
        v += Number(totalSwaps[j].amountUSD);
        fee += Number(totalSwaps[j].amountFeeUSD);
        j++;
      }
      volumeHistory.push(v);
      feeHistory.push(fee);
    }

    totalSwaps = txsResult[0];

    query = `{
      pairs {
        id
        reserve1
        reserve0
        swaps(orderDirection: desc, orderBy: timestamp, first: 1) {
          amount0In
          amount0Out
          amount1In
          amount1Out
          amountFeeUSD
          amountUSD
          timestamp
        }
        mints(first: 1, orderBy: timestamp, orderDirection: desc) {
          amountUSD
          amount0
          amount1
          timestamp
        }
     }
    }`;

    const { data: reserveResponse } = await axios.post(
      `https://api.thegraph.com/subgraphs/name/brainstormk/${ROUTER_SUBGRAPH_NAMES[chainId]}`,
      { query }
    );

    const pairs = reserveResponse.data.pairs;

    let historiesByPair = [];
    for (let i = 0; i < pairs.length; i++) {
      const swapsByPair = totalSwaps
        .filter((swap) => swap.pair.id === pairs[i].id)
        .sort((a, b) => b.timestamp - a.timestamp);
      let history = [];

      const swap = pairs[i].swaps?.[0];
      const mint = pairs[i].mints?.[0];
      const lastTx =
        swap && mint
          ? Number(swap.timestamp) > Number(mint.timestamp)
            ? swap
            : { ...mint, type: "mint" }
          : swap ?? { ...mint, type: "mint" };

      let price0 = getPriceByTx(lastTx).price0;
      let price1 = getPriceByTx(lastTx).price1;

      for (let j = 0; j < 10; j++) {
        let reserve0 = Number(pairs[i].reserve0);
        let reserve1 = Number(pairs[i].reserve1);

        let k = 0;
        while (k < swapsByPair.length && Number(swapsByPair[k].timestamp) > Date.now() / 1000 - (period / 10) * j) {
          reserve0 += Number(swapsByPair[k].amount0Out);
          reserve0 -= Number(swapsByPair[k].amount0In);
          reserve1 += Number(swapsByPair[k].amount1Out);
          reserve1 -= Number(swapsByPair[k].amount1In);
          price0 = getPriceByTx(swapsByPair[k]).price0;
          price1 = getPriceByTx(swapsByPair[k]).price1;
          k++;
        }
        history.push(reserve0 * price0 + reserve1 * price1);
      }
      historiesByPair.push(history);
    }

    for (let i = 9; i >= 0; i--) {
      let s = 0;
      for (let j = 0; j < historiesByPair.length; j++) s += historiesByPair[j][i];
      tvlHistory.push(s);
    }
    return { volumeHistory, feeHistory, tvlHistory };
  } catch (e) {
    console.log(e);
    return { volumeHistory: [], feeHistory: [], tvlHistory: [] };
  }
}

export async function getBrewlabsSwapFee(chainId: ChainId, pair: string) {
  try {
    const pairContract = getBrewlabsPairContract(chainId, pair);
    const feeManagerContract = getBrewlabsFeeManagerContract(chainId);
    const data = await feeManagerContract.getPoolFeeInfo(pair);
    // const owner = await feeManagerContract.owner();
    const stakingPool = await pairContract.stakingPool();

    const lpFee = Number(data.feeDistribution[0]) / 10000;
    const brewlabsFee = Number(data.feeDistribution[1]) / 10000;
    const tokenOwnerFee = Number(data.feeDistribution[2]) / 10000;
    const stakingFee = Number(data.feeDistribution[3]) / 10000;
    const referralFee = Number(data.feeDistribution[4]) / 10000;
    return {
      fees: {
        totalFee: lpFee + brewlabsFee + tokenOwnerFee + stakingFee + referralFee,
        lpFee,
        brewlabsFee,
        tokenOwnerFee,
        stakingFee,
        referralFee,
      },
      tokenOwner: data.tokenOwner,
      referrer: data.referer,
      stakingPool,
      owner:
        chainId === ChainId.BSC_TESTNET
          ? "0x9543F59c1Fc00C37d6B239ED1988F7af9Aed780E"
          : "0xE1f1dd010BBC2860F81c8F90Ea4E38dB949BB16F",
    };
  } catch (e) {
    console.log(e);
    return {
      tokenOwner: ethers.constants.AddressZero,
      referrer: ethers.constants.AddressZero,
      stakingPool: ethers.constants.AddressZero,
      owner:
        chainId === ChainId.BSC_TESTNET
          ? "0x9543F59c1Fc00C37d6B239ED1988F7af9Aed780E"
          : "0xE1f1dd010BBC2860F81c8F90Ea4E38dB949BB16F",
      fees: { totalFee: 0.3, lpFee: 0.25, brewlabsFee: 0.05, tokenOwnerFee: 0, stakingFee: 0, referralFee: 0 },
    };
  }
}
