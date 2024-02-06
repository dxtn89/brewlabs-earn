import axios from "axios";
import { DEXSCREENER_CHAINNAME, DEXSCREENER_DEXID, DEXTOOLS_CHAINNAME } from "config";
import { API_URL } from "config/constants";
import { isAddress } from "utils";
import { analyzePairLog } from "utils/getChartTransactions";

function getPairParams(pair) {
  const chainId = Number(
    Object.keys(DEXSCREENER_CHAINNAME).find((key, i) => pair.chainId === DEXSCREENER_CHAINNAME[key])
  );
  return {
    ...pair,
    address: pair.pairAddress.toLowerCase(),
    chainId,
    priceUsd: Number(pair.priceUsd),
    baseToken: { ...pair.baseToken, address: pair.baseToken.address.toLowerCase() },
    quoteToken: { ...pair.quoteToken, address: pair.quoteToken.address.toLowerCase() },
    dexId: isAddress(pair.dexId) ? "uniswap" : pair.dexId,
    a: "uniswap",
  };
}

export async function fetchAllPairs(criteria, chain = null, type = "none") {
  try {
    if (!criteria) return;
    const brewSwapUrl = `${API_URL}/chart/search/pairs?q=${criteria}`;
    let { data: brewPairs } = await axios.get(brewSwapUrl);
    let searchedPairs = [];

    if (isAddress(criteria) || type === "simple") {
      const pair = brewPairs.find((pair) => pair.address === criteria.toLowerCase());
      if (pair) chain = DEXSCREENER_CHAINNAME[pair.chainId];
      if (isAddress(criteria) && chain) {
        const url = `https://api.dexscreener.com/latest/dex/pairs/${chain}/${criteria}`;
        let { data: response } = await axios.post(`https://pein-api.vercel.app/api/tokenController/getHTML`, { url });

        const pair = response?.result?.pair;
        if (pair) {
          searchedPairs = [getPairParams(pair)];
        }
      } else {
        const url = `https://io.dexscreener.com/dex/search/v3/pairs?q=${criteria}`;
        let { data: response } = await axios.post(`https://pein-api.vercel.app/api/tokenController/getHTML`, { url });
        const pairs = await analyzePairLog(response.result);
        searchedPairs = pairs;
      }
    }

    searchedPairs = searchedPairs
      .filter((pair) => pair.liquidity?.usd && Object.keys(DEXSCREENER_CHAINNAME).includes(pair.chainId.toString()))
      .sort((a, b) => b.volume.h24 - a.volume.h24)
      .map((pair) => {
        const isBrewPair = brewPairs.find((bPair) => bPair.address.toLowerCase() === pair.address.toLowerCase());
        if (isBrewPair) return { ...pair, otherdexId: "brewlabs" };
        return pair;
      });

    brewPairs = brewPairs.filter((pair) => !searchedPairs.find((sPair) => sPair.address === pair.address));
    searchedPairs = [...searchedPairs, ...brewPairs];
    return searchedPairs;
  } catch (e) {
    console.log(e);
    return [];
  }
}
