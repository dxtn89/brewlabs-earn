import axios from "axios";
import { COVALENT_API_KEYS, COVALENT_CHAIN_NAME, DEXSCREENER_CHAINNAME, SUBGRAPH_URL } from "config";
import { API_URL } from "config/constants";
import { ethers } from "ethers";
import { getBSCTransactions } from "utils/getChartTransactions";

function checkString(string) {
  return !isNaN(string) && string.toString().indexOf(".") != -1;
}

function getValues(str, chainId) {
  try {
    const valueList = str.split(" ");
    const txHash = valueList.find((value) => ethers.utils.isHexString(value));
    const sender = valueList.find((value) => ethers.utils.isAddress(value.replace("T", "")));
    const index = valueList.findIndex((value) => value === "buy" || value === "sell");
    const values = [];

    for (let i = index + 1; i < valueList.length; i++) {
      if (checkString(valueList[i])) values.push(valueList[i]);
    }

    const isBuy = valueList.find((value) => value === "buy");
    if (!txHash || !sender || values.length !== 4 || values.find((value) => !checkString(value))) {
      return null;
    }
    return {
      txnHash: txHash,
      maker: sender.replace("T", ""),
      priceUsd: values[0],
      volumeUsd: values[1],
      amount0: values[2],
      txnType: isBuy ? "buy" : "sell",
    };
  } catch (e) {
    return null;
  }
}

async function analyzeLog(str, chainId, dexId, token) {
  try {
    const temp = str.replace(/[\u0000-\u0020]/g, " ");
    const swapList = temp.split("swap");
    if (swapList.length) swapList.splice(0, 1);
    const values = swapList.map((swap) => getValues(swap, chainId)).filter((swap) => swap);
    const txs = values.map((value) => `"${value.txnHash}"` + ",");
    const result = await Promise.all(
      SUBGRAPH_URL[dexId].map(async (graph, index) => {
        if (Number(chainId) === 56) {
          const swaps = await getBSCTransactions(
            values.map((value) => value.txnHash),
            token
          );
          return swaps;
        }
        const { data: response } = await axios.post(graph, {
          query: `{
            swaps(first: 1000, where: {hash_in: [${txs}]}) {
              timestamp
              hash
            }
          }`,
        });
        return response.data.swaps;
      })
    );

    let swaps = [];
    for (let i = 0; i < result.length; i++) swaps = [...swaps, ...result[i]];

    return values.map((value) => ({
      ...value,
      blockTimestamp: (swaps.find((swap) => swap.hash === value.txnHash)?.timestamp ?? 0) * 1000,
    }));
  } catch (e) {
    console.log(e);
    return [];
  }
}
export async function fetchTradingHistoriesByDexScreener(query, chainId, fetch = "default", timestamp = 0) {
  let brewTb = query.tb ?? 0,
    tb = query.tb ?? 0;
  try {
    if (query.type === "holders") {
      const { data: response } = await axios.get(
        `https://api.covalenthq.com/v1/${COVALENT_CHAIN_NAME[chainId]}/tokens/${query.address}/token_holders_v2/?page-size=100&page-number=${tb}`,
        { headers: { Authorization: `Bearer ${COVALENT_API_KEYS[0]}` } }
      );
      const holders = response.data.items;
      return holders.map((holder) => ({
        address: holder.address,
        timestamp: tb,
        decimals: holder.contract_decimals,
        symbol: holder.contract_ticker_symbol,
        balance: holder.balance / Math.pow(10, holder.contract_decimals),
        ownerShip: (holder.balance / holder.total_supply) * 100,
        chainId,
      }));
    }
    let brewHistories = [];
    if (query.otherdexId === "brewlabs") {
      do {
        const brewSwapUrl = `${API_URL}/chart/log/all?pair=${query.pair.toLowerCase()}&q=${query.quote.toLowerCase()}&tb=${tb}${
          query.account ? `&account=${query.account.toLowerCase()}` : ""
        }&type=${query.type}`;
        const { data: response } = await axios.get(brewSwapUrl);
        if (!response.length) break;
        brewHistories = [...brewHistories, ...response].sort((a, b) => Number(b.timestamp) - Number(a.timestamp));
        brewTb = brewHistories[brewHistories.length - 1].timestamp;
      } while (fetch === "all" && brewHistories.length % 100 === 0 && brewTb >= timestamp);
    }

    let histories = [];

    do {
      const url = `https://io.dexscreener.com/dex/log/amm/v2/${query.a}/all/${DEXSCREENER_CHAINNAME[chainId]}/${
        query.pair
      }?${query.type ? `ft=${query.type}` : ""}&${query.account ? `m=${query.account.toLowerCase()}` : ""}&${
        query.quote ? `q=${query.quote.toLowerCase()}` : ""
      }&${tb ? `tb=${tb}` : ""}`;
      const { data: response } = await axios.post("https://pein-api.vercel.app/api/tokenController/getHTML", {
        url,
      });

      let txs = await analyzeLog(response.result, chainId, query.dexId, query.base);
      txs = txs.map((tx) => {
        const isExsiting = brewHistories.find((brewTx) => brewTx.transactionAddress === tx.txnHash);
        return { ...tx, blockTimestamp: isExsiting ? isExsiting.timestamp : tx.blockTimestamp };
      });
      histories = [...histories, ...txs];
      if (!histories.length) break;
      tb = histories[histories.length - 1].blockTimestamp;
    } while (fetch === "all" && histories.length % 100 === 0 && tb >= timestamp);

    return histories
      .filter((log) => log.blockTimestamp >= timestamp)
      .map((log) => ({
        timestamp: Number(log.blockTimestamp),
        action: log.txnType,
        price: Number(log.priceUsd),
        amount: Number(log.amount0),
        nativeAmount: undefined,
        amountStable: Number(log.volumeUsd),
        transactionAddress: log.txnHash,
        walletsCategories: [],
        chainId,
        from: log.maker,
      }));
  } catch (e) {
    console.log(e);
    return [];
  }
}

export function getVolume(data, period) {
  let buyVolume = 0,
    sellVolume = 0;

  const sellCount = data
    .filter((history) => history.action === "sell" && Number(history.timestamp) >= Date.now() - period)
    .map((history) => (sellVolume += history.amountStable)).length;

  const buyCount = data
    .filter((history) => history.action === "buy" && Number(history.timestamp) >= Date.now() - period)
    .map((history) => (buyVolume += history.amountStable)).length;

  return {
    buyVolume,
    sellVolume,
    buyCount,
    sellCount,
    totalCount: buyCount + sellCount,
    totalVolume: buyVolume + sellVolume,
  };
}

export function getVolumeDatas(histories) {
  const v5m = getVolume(histories, 5 * 60000);
  const v30m = getVolume(histories, 30 * 60000);
  const v24hr = getVolume(histories, 3600000 * 24);
  const v7d = getVolume(histories, 3600000 * 24 * 7);
  return {
    txn: {
      "5m": {
        Buys: v5m.buyCount,
        Sells: v5m.sellCount,
        Total: v5m.totalCount,
        isUp: v5m.buyCount >= v5m.sellCount,
      },
      "30m": {
        Buys: v30m.buyCount,
        Sells: v30m.sellCount,
        Total: v30m.totalCount,
        isUp: v30m.buyCount >= v30m.sellCount,
      },
      "24hr": {
        Buys: v24hr.buyCount,
        Sells: v24hr.sellCount,
        Total: v24hr.totalCount,
        isUp: v24hr.buyCount >= v24hr.sellCount,
      },
      "7d": {
        Buys: v7d.buyCount,
        Sells: v7d.sellCount,
        Total: v7d.totalCount,
        isUp: v7d.buyCount >= v7d.sellCount,
      },
    },
    "txn (usd)": {
      "5m": {
        Buys: v5m.buyVolume,
        Sells: v5m.sellVolume,
        Total: v5m.totalVolume,
        isUp: v5m.buyVolume >= v5m.sellVolume,
      },
      "30m": {
        Buys: v30m.buyVolume,
        Sells: v30m.sellVolume,
        Total: v30m.totalVolume,
        isUp: v30m.buyVolume >= v30m.sellVolume,
      },
      "24hr": {
        Buys: v24hr.buyVolume,
        Sells: v24hr.sellVolume,
        Total: v24hr.totalVolume,
        isUp: v24hr.buyVolume >= v24hr.sellVolume,
      },
      "7d": {
        Buys: v7d.buyVolume,
        Sells: v7d.sellVolume,
        Total: v7d.totalVolume,
        isUp: v7d.buyVolume >= v7d.sellVolume,
      },
    },
  };
}

export const defaultVolume = {
  txn: {
    "5m": {
      Buys: 0,
      Sells: 0,
      Total: 0,
      isUp: true,
    },
    "30m": {
      Buys: 0,
      Sells: 0,
      Total: 0,
      isUp: true,
    },
    "24hr": {
      Buys: 0,
      Sells: 0,
      Total: 0,
      isUp: true,
    },
    "7d": {
      Buys: 0,
      Sells: 0,
      Total: 0,
      isUp: true,
    },
  },
  "txn (usd)": {
    "5m": {
      Buys: 0,
      Sells: 0,
      Total: 0,
      isUp: true,
    },
    "30m": {
      Buys: 0,
      Sells: 0,
      Total: 0,
      isUp: true,
    },
    "24hr": {
      Buys: 0,
      Sells: 0,
      Total: 0,
      isUp: true,
    },
    "7d": {
      Buys: 0,
      Sells: 0,
      Total: 0,
      isUp: true,
    },
  },
};
