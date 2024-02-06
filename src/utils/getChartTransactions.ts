import axios from "axios";
import { DEXSCREENER_CHAINNAME, DEXSCREENER_DEXID, DEXSCREENER_VERSION, DEXTOOLS_CHAINNAME } from "config";
import { isAddress } from "utils";
import { simpleRpcProvider } from "./providers";
import multicall from "./multicall";
import { ERC20_ABI } from "config/abi/erc20";

export async function getBSCTransactions(txs, token) {
  if (!txs.length) return [];
  let timestamps: any = await Promise.all([
    axios.post("https://pein-api.vercel.app/api/tokenController/getHTML", {
      url: `https://bsc-explorer-api.nodereal.io/api/tx/getDetail?hash=${txs[0]}`,
    }),
    axios.post("https://pein-api.vercel.app/api/tokenController/getHTML", {
      url: `https://bsc-explorer-api.nodereal.io/api/tx/getDetail?hash=${txs[txs.length - 1]}`,
    }),
  ]);

  timestamps = timestamps.map((time) => time.data.result.data.blockTimeStamp);
  let events = [],
    num = 0;
  while (true) {
    let { data: response } = await axios.post("https://api.thegraph.com/subgraphs/name/bcoder778/bsc-transfer-assets", {
      query: `{
        transferEvents(
          first: 1000
          skip : ${num * 1000}
          orderDirection: desc
          orderBy: timestamp
          where: {contract: "${token}", timestamp_gte: "${timestamps[1]}", timestamp_lte: "${timestamps[0]}"}
        ) {
          id
          from
          to
          amount
          contract
          timestamp
          height
        }
      }`,
    });
    if (!response.data) break;
    events = [...events, ...response.data.transferEvents];
    num++;
    if (response.data.transferEvents.length !== 1000) break;
    break;
  }

  return events.map((event) => ({ hash: event.id.split("-")[0], timestamp: event.timestamp }));
}

export function checkString(string) {
  const strs = string.split(".");
  return !isNaN(string) && strs.length > 1 && strs[0] !== "" && strs[1] !== "";
}

export function analyzeBarLog(str, resToSec, to, resolution) {
  try {
    const valueList = str.match(/[0-9.]+/g).filter((value) => checkString(value));
    let values = [];
    let j = 0,
      i = valueList.length - 1;
    to = to - (to % (resToSec * resolution));
    let openUsd,
      highUsd = -1,
      lowUsd = 1000000000,
      closeUsd = null,
      volumeUsd = 0;
    for (; i >= 7; i -= 9) {
      closeUsd = closeUsd === null ? parseFloat(valueList[i - 1]) : closeUsd;
      highUsd = highUsd < parseFloat(valueList[i - 5]) ? parseFloat(valueList[i - 5]) : highUsd;
      lowUsd = lowUsd > parseFloat(valueList[i - 3]) ? parseFloat(valueList[i - 3]) : lowUsd;

      volumeUsd += parseFloat(valueList[i]);
      if (j % resolution === resolution - 1) {
        openUsd = parseFloat(valueList[i - 7]);
        values.push({
          openUsd,
          highUsd,
          lowUsd,
          closeUsd,
          volumeUsd,
          timestamp: (to - j * resToSec) * 1000,
        });
        openUsd = null;
        highUsd = -1;
        lowUsd = 1000000000;
        closeUsd = null;
        volumeUsd = 0;
      }

      j++;
    }

    values.reverse();
    return values;
  } catch (e) {
    console.log(e);
    return [];
  }
}

function splitArrays(valueList) {
  let pairs = [],
    c = 0;
  pairs.push([]);
  for (let i = 0; i < valueList.length; i++) {
    const temp = valueList[i];
    pairs[c].push(temp);
    if (valueList[i - 1] === "a" && i > 0 && DEXSCREENER_DEXID.includes(valueList[i])) {
      c++;
      pairs.push([]);
    }
  }
  return pairs;
}

export async function analyzePairLog(str) {
  try {
    const temp = str.replace(/[\u0000-\u001F]/g, "#").replace(/[^a-zA-Z0-9. :]/g, "#");
    let splitList = temp.split("#").filter((value) => value !== "");
    splitList.splice(0, 1);
    const pairValues = splitArrays(splitList);
    const pairs = await Promise.all(
      pairValues.map(async (valueList) => {
        try {
          const chain = valueList.find((value) =>
            Object.keys(DEXSCREENER_CHAINNAME).find((key, i) => value.includes(DEXSCREENER_CHAINNAME[key]))
          );

          if (!chain) return null;
          valueList = valueList.filter((value) => value !== chain);

          const chainId = Object.keys(DEXSCREENER_CHAINNAME).find((key, i) =>
            chain.includes(DEXSCREENER_CHAINNAME[key])
          );

          let dexIds = valueList.filter((value) => DEXSCREENER_DEXID.includes(value));
          if (dexIds.length === 1) {
            dexIds = [dexIds[0], dexIds[0]];
          }

          valueList = valueList.filter((value) => !DEXSCREENER_DEXID.includes(value));

          let addresses = [];
          valueList.map((value, i) => {
            const splitAddresses = value
              .split("T")
              .filter((addr) => isAddress(addr.substring(0, 42)))
              .map((addr) => addr.substring(0, 42).toLowerCase());

            addresses = [...addresses, ...splitAddresses];
          });

          for (let i = 0; i < valueList.length; i++)
            for (let j = 0; j < addresses.length; j++)
              valueList[i] = valueList[i].replace(`T${isAddress(addresses[j])}`, "");

          if (DEXSCREENER_VERSION.includes(valueList[0])) {
            valueList = valueList.slice(1, valueList.length);
          } else {
            valueList[0] = valueList[0].slice(3, valueList[0].length);
          }

          const prices = valueList.filter((value) => checkString(value));
          if (!dexIds[1]) return null;

          const url = `https://io.dexscreener.com/dex/chart/amm/v3/${dexIds[1]}/bars/${
            DEXSCREENER_CHAINNAME[chainId]
          }/${addresses[0]}?from=${Date.now() - 86400000 * 2}&to=${Date.now()}&res=1440&cb=1`;
          const result = await Promise.all([
            axios.post("https://pein-api.vercel.app/api/tokenController/getHTML", { url }),
            multicall(
              ERC20_ABI,
              [
                { name: "balanceOf", address: addresses[1], params: [addresses[0]] },
                { name: "decimals", address: addresses[1] },
              ],
              Number(chainId)
            ),
          ]);
          const liquidity = (result[1][0][0] * Number(prices[1]) * 2) / Math.pow(10, result[1][1][0]);
          const priceBar = analyzeBarLog(result[0].data.result, 1440 * 60, Date.now(), 1);
          let priceChange = 0,
            volume = 0;
          if (priceBar.length) {
            const { closeUsd, openUsd, volumeUsd } = priceBar[0];
            volume = Number(volumeUsd);
            priceChange = openUsd ? ((closeUsd - openUsd) / openUsd) * 100 : 0;
          }
          return {
            chainId: Number(chainId),
            a: dexIds[1],
            dexId: dexIds[0],
            address: addresses[0],
            pairAddress: addresses[0],
            baseToken: {
              address: addresses[1],
              name: valueList[0],
              symbol: valueList[1],
              price: Number(prices[1]),
            },
            quoteToken: {
              address: addresses[2],
              name: valueList[2],
              symbol: valueList[3],
              price: prices[1] / prices[0],
            },
            priceUsd: Number(prices[1]),
            reserve0: 0,
            reserve1: 0,
            liquidity: { usd: liquidity },
            tvl: liquidity,
            volume: { h24: volume ?? 0 },
            priceChange: { h24: priceChange ?? 0 },
          };
        } catch (e) {
          return null;
        }
      })
    );
    return pairs.filter((pair) => pair);
  } catch (e) {
    console.log(e);
    return [];
  }
}
