import { ChainId } from "@brewlabs/sdk";
import BigNumber from "bignumber.js";

import { BIG_TEN } from "utils/bigNumber";

BigNumber.config({
  EXPONENTIAL_AT: 1000,
  DECIMAL_PLACES: 80,
});

export const SUPPORTED_CHAINS_FOR_MODULES = {
  swap: [ChainId.ETHEREUM, ChainId.BSC_MAINNET],
  constructor: [ChainId.ETHEREUM, ChainId.BSC_MAINNET],
  zapper: [ChainId.ETHEREUM, ChainId.BSC_MAINNET],
};

export const EXCHANGE_URLS = {
  [ChainId.ETHEREUM]: "https://app.uniswap.org/#",
  [ChainId.BSC_MAINNET]: "https://pancakeswap.finance",
  [ChainId.BSC_TESTNET]: "https://pancakeswap.finance",
  [ChainId.POLYGON]: "https://quickswap.exchange",
  [ChainId.FANTOM]: "https://spookyswap.finance",
  [ChainId.AVALANCHE]: "https://traderjoexyz.com/trade",
  [ChainId.CRONOS]: "https://mm.finance",
  [ChainId.BRISE]: "https://app.icecreamswap.com/#",

  externals: {
    [ChainId.BSC_MAINNET]: {
      apeswap: "https://apeswap.finance",
    },
  },
};

export const ADD_LIQUIDITY_URLS = {
  [ChainId.ETHEREUM]: "https://app.uniswap.org/#/add/v2",
  [ChainId.BSC_MAINNET]: "https://pancakeswap.finance/add",
  [ChainId.BSC_TESTNET]: "https://pancakeswap.finance/add",
  [ChainId.POLYGON]: "https://quickswap.exchange/#/add",
  [ChainId.FANTOM]: "https://spookyswap.finance/add",
  [ChainId.AVALANCHE]: "https://traderjoexyz.com/pool",
  [ChainId.CRONOS]: "https://mm.finance/add",
  [ChainId.BRISE]: "https://app.icecreamswap.com/#/add",

  externals: {
    [ChainId.BSC_MAINNET]: {
      apeswap: "https://apeswap.finance/add",
    },
  },
};

export const INFO_URLS = {
  [ChainId.ETHEREUM]: {
    token: "https://v2.info.uniswap.org/token",
    pool: "https://v2.info.uniswap.org/pair",
  },
  [ChainId.BSC_MAINNET]: {
    token: "https://pancakeswap.finance/info/tokens",
    pool: "https://pancakeswap.finance/info/pools",
  },
  [ChainId.BSC_TESTNET]: {
    token: "https://pancakeswap.finance/info/tokens",
    pool: "https://pancakeswap.finance/info/pools",
  },
  [ChainId.POLYGON]: {
    token: "https://info.quickswap.exchange/#/token",
    pool: "https://info.quickswap.exchange/#/pair",
  },
  [ChainId.FANTOM]: {
    token: "https://info.spookyswap.finance/tokens",
    pool: "https://info.spookyswap.finance/pairs",
  },
  [ChainId.AVALANCHE]: {
    token: "https://dexscreener.com/avalanche",
    pool: "https://dexscreener.com/avalanche",
  },
  [ChainId.CRONOS]: {
    token: "https://dexscreener.com/cronos",
    pool: "https://dexscreener.com/cronos",
  },
  [ChainId.BRISE]: {
    token: "https://info.icecreamswap.com/token",
    pool: "https://info.icecreamswap.com/pair",
  },

  externals: {
    [ChainId.ETHEREUM]: {
      sushiswap: {
        token: "https://app.sushi.com/analytics/tokens",
        pool: "https://app.sushi.com/analytics/pools",
      },
    },
    [ChainId.BSC_MAINNET]: {
      pancakeswap: {
        token: "https://pancakeswap.finance/info/tokens",
        pool: "https://pancakeswap.finance/info/pools",
      },
      apeswap: {
        token: "https://info.apeswap.finance/token",
        pool: "https://info.apeswap.finance/pair",
      },
    },
  },
};

export const BLOCK_TIMES = {
  [ChainId.ETHEREUM]: 13.25,
  [ChainId.BSC_MAINNET]: 3,
  [ChainId.BSC_TESTNET]: 3,
  [ChainId.POLYGON]: 2.3,
  [ChainId.FANTOM]: 1, //  will be used as per second in fantom
  [ChainId.AVALANCHE]: 3,
  [ChainId.CRONOS]: 6,
  [ChainId.BRISE]: 15,
};

export const SECONDS_PER_YEAR = 365 * 86400; // 10512000
export const BASE_URL = "https://earn.brewlabs.info";

export const DEFAULT_TOKEN_DECIMAL = BIG_TEN.pow(18);
export const DEFAULT_GAS_LIMIT = 200000;

export const BANANA_PER_BLOCK = new BigNumber(10);
export const BLOCKS_PER_YEAR = new BigNumber(10512000);
export const BANANA_PER_YEAR = BANANA_PER_BLOCK.times(BLOCKS_PER_YEAR);

export const COVALENT_API_KEYS = ["cqt_rQYkrrFc34HqD4T4R7XvPM76gh6D", "cqt_rQ4tXTKbyY7qbvywfdQbctPFbjWC"];

export const COVALENT_CHAIN_NAME = {
  [ChainId.ETHEREUM]: "eth-mainnet",
  [ChainId.BSC_MAINNET]: "bsc-mainnet",
  [ChainId.BSC_TESTNET]: "bsc-testnet",
  [ChainId.POLYGON]: "matic-mainnet",
  [ChainId.ARBITRUM]: "arbitrum-mainnet",
  [ChainId.FANTOM]: "fantom-mainnet",
  [ChainId.AVALANCHE]: "avalanche-mainnet",
};

export const UNMARSHAL_API_KEYS = [
  "5yA1HYPCmf4xpXjZQMOAa5BJPnupBs45eLE3D7O1",
  "K82WDxM7Ej3y9u8VSmLYa8pdeqTVqziA2VGQaSRq",
  "81Ev4SteeHa2L23LdTq0e3U1urG82Idc8vtwbiIS",
  "bG6czxhve08cqjNx3tQ8r9P6TDFC8qmI6qwDRXRv",
  "gxzF8K9KM98XQaLuypeVC6HJ9TJq8d0V89nbd7G3",
];

export const UNMARSHAL_CHAIN_NAME = {
  1: "ethereum",
  56: "bsc",
  137: "matic",
};

export const DEX_GURU_CHAIN_NAME = {
  1: "eth",
  56: "bsc",
  137: "polygon",
  [ChainId.ARBITRUM]: "arbitrum",
  8453: "base",
};

export const DEXTOOLS_CHAINNAME = {
  1: "ether",
  56: "bsc",
  42161: "arbitrum",
  137: "polygon",
  300: "optimism",
  8453: "base",
  324: "zksync",
  43114: "avalanche",
};

export const DEXSCREENER_CHAINNAME = {
  1: "ethereum",
  56: "bsc",
  42161: "arbitrum",
  137: "polygon",
  300: "optimism",
  8453: "base",
  43114: "avalanche",
};

export const DEXSCREENER_VERSION = ["v1", "v2", "v3"];

export const DEXSCREENER_DEXID = ["uniswap", "pancakeswap", "pcsv3"];

export const TRUSTWALLET_ASSETS = {
  1: "ethereum",
  56: "smartchain",
};

export const SUBGRAPH_URL = {
  uniswap: [
    "https://api.thegraph.com/subgraphs/name/messari/substream-uniswap-v2-ethereum",
    "https://api.thegraph.com/subgraphs/name/messari/uniswap-v3-ethereum",
  ],
  pancakeswap: ["https://data-platform.nodereal.io/graph/v1/59e783c72fc84fcb9274f57574e23878/projects/pancakeswap"],
};
