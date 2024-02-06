/* eslint-disable import/no-anonymous-default-export */
import axios from "axios";
import { DEXSCREENER_CHAINNAME } from "config";
import { API_URL } from "config/constants";
import { analyzeBarLog } from "utils/getChartTransactions";
import avro from "avsc";

const lastBarsCache = new Map();

const supportedResolutions = ["5", "15", "30", "60", "240", "D", "W", "M"];

const config = {
  supported_resolutions: supportedResolutions,
};

const resolutionToSeconds = (r) => {
  if (r === "D" || r === "W" || r === "M") return 1440;

  return Number(r);
};
let lastResc = null;
let lastTime = null;
let lastTicker = null;
let lastBars = [];
let lastBlock = 1000000000000000;

export default {
  onReady: (callback) => {
    console.log("[onReady]: Method call");
    setTimeout(() => callback(config), 0);
  },

  searchSymbols: (userInput: string, exchange: string, symbolType: string, onResult): void => {
    // used for "Compare" feature
  },

  resolveSymbol: async (symbolName, onSymbolResolvedCallback, onResolveErrorCallback) => {
    console.log("[resolveSymbol]: Method call", symbolName);
    if (!symbolName || symbolName.includes("undefined")) {
      onResolveErrorCallback("No Symbol Name");
      return;
    }
    const symbolInfo = {
      id: "",
      name: "",
      description: symbolName.split("#")[1],
      exchange: "BrewSwap",
      ticker: symbolName.split("#")[0],
      full_name: "",
      type: "crypto",
      session: "24x7",
      data_status: "pulsed",
      has_daily: true,
      has_weekly_and_monthly: true,
      has_empty_bars: true,
      force_session_rebuild: true,
      has_no_volume: false,
      volume_precision: 2,
      timezone: "Etc/UTC",
      format: "price",
      pricescale: 1000000000,
      minmov: 1,
      has_intraday: true,
      supported_resolutions: ["1", "5", "15", "30", "60", "240", "720", "1D", "1W", "1M"],
    };
    console.log("[resolveSymbol]: Symbol resolved", symbolName);
    onSymbolResolvedCallback(symbolInfo);
  },

  getBars: async (symbolInfo, resolution, from, to, onHistoryCallback, onErrorCallback, firstDataRequest) => {
    try {
      const swap = symbolInfo.ticker.split("/")[0];
      const chain = symbolInfo.ticker.split("/")[2];
      console.log("Resolution", resolution, from, to, swap);

      const resSec = resolutionToSeconds(resolution);

      if (lastResc !== resolution || lastTicker !== symbolInfo.ticker) {
        lastTime = null;
        lastBlock = 1000000000000000;
        lastResc = resolution;
        lastTicker = symbolInfo.ticker;
        lastBars = [];
      }
      let data = [];
      if (swap === "brewlabs") {
        const pair = symbolInfo.ticker.split("?")[0].split("/")[3];
        const quote = symbolInfo.ticker.split("?")[1];
        const url = `${API_URL}/chart/bars?pair=${pair.toLowerCase()}&${quote}&from=${from * 1000}&to=${
          to * 1000
        }&res=${resSec}`;
        const { data: response } = await axios.get(url);
        data = response;
      } else {
        const url = `https://io.dexscreener.com/dex/chart/amm/v3/${symbolInfo.ticker}&cb=${Math.floor(
          (to - from) / (resSec * 60)
        )}&res=${resSec}&bbn=${lastBlock}`;
        const { data: response } = await axios.post("https://pein-api.vercel.app/api/tokenController/getHTML", {
          url,
        });
        data = analyzeBarLog(
          response.result,
          resSec * 60,
          lastTime ?? to,
          resolution === "M" ? 30 : resolution === "W" ? 7 : 1
        ).filter(
          (item) =>
            !lastBars.find(
              (lastItem) =>
                item.closeUsd === lastItem.closeUsd &&
                item.openUsd === lastItem.openUsd &&
                item.highUsd === lastItem.highUsd &&
                item.lowUsd === lastItem.lowUsd &&
                item.volumeUsd === lastItem.volumeUsd
            )
        );
        console.log(data);
      }
      let bars = [];
      if (!data || !data.length) return;
      if (swap !== "brewlabs") {
        const { data: blockResult } = await axios.get(
          `https://coins.llama.fi/block/${chain}/${data[0].timestamp / 1000}`
        );
        if (lastBlock === blockResult.height) return;
        lastBlock = blockResult.height;
        lastTime = data[0].timestamp / 1000;
        lastBars = [...data];
      }
      for (let i = 0; i < data.length; ++i) {
        const barValue: any = {
          time: data[i].timestamp,
          close: data[i].closeUsd,
          open: data[i].openUsd,
          high: data[i].highUsd,
          low: data[i].lowUsd,
          volume: data[i].volumeUsd,
        };

        bars.push(barValue);
      }

      if (firstDataRequest) {
        lastBarsCache.set(symbolInfo.full_name, {
          ...bars[bars.length - 1],
        });
      }
      console.log(`[getBars]: returned ${bars.length} bar(s)`);
      onHistoryCallback(bars, {
        noData: false,
      });
      return;
    } catch (error) {
      console.log("[getBars]: Get error", error);
      onErrorCallback(error);
    }
  },

  subscribeBars: (symbolInfo, resolution, onRealtimeCallback, subscribeUID, onResetCacheNeededCallback) => {},

  unsubscribeBars: (subscriberUID) => {},
};
