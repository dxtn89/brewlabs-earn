import { ChainId, NATIVE_CURRENCIES, WNATIVE } from "@brewlabs/sdk";
import axios from "axios";

import claimableTokenAbi from "config/abi/claimableToken.json";
import dividendTrackerAbi from "config/abi/dividendTracker.json";

import { COVALENT_API_KEYS, COVALENT_CHAIN_NAME } from "config";
import { API_URL, DEX_GURU_WETH_ADDR } from "config/constants";
import { fetchTokenBaseInfo } from "contexts/DashboardContext/fetchFeaturedPrices";
import { getNativeSymbol } from "lib/bridge/helpers";
import { defaultMarketData } from "state/prices/types";
import { isAddress } from "utils";
import { getDividendTrackerContract, getMulticallContract } from "utils/contractHelpers";
import multicall from "utils/multicall";
import { ERC20_ABI } from "config/abi/erc20";

async function getNativeBalance(address: string, chainId: number) {
  let ethBalance = 0;
  const multicallContract = getMulticallContract(chainId);
  ethBalance = await multicallContract.getEthBalance(address);
  return ethBalance;
}

async function getTokenBaseBalances(account: string, chainId: number) {
  if (!isAddress(account) || !Object.keys(COVALENT_CHAIN_NAME).includes(chainId.toString())) return [];
  let tokens: any = [];
  if (chainId === 56) {
    const { data: response } = await axios.post(`${API_URL}/html/getTokenBalances`, { chainId, address: account });
    tokens = response.map((item) => ({ ...item, isScam: false }));
  } else {
    const baseURL = `https://eth-mainnet.g.alchemy.com/v2/bXqwnLZHuGoI2wcSnabNiQJL0K83OTnQ`;

    // Data for making the request to query token balances
    const data = JSON.stringify({
      jsonrpc: "2.0",
      method: "alchemy_getTokenBalances",
      headers: {
        "Content-Type": "application/json",
      },
      params: [`${account}`],
      id: 42,
    });

    // config object for making a request with axios
    const config = {
      method: "post",
      url: baseURL,
      headers: {
        "Content-Type": "application/json",
      },
      data: data,
    };

    let response = await axios(config);
    response = response["data"];

    // Getting balances from the response
    const balances = response["result"];

    // Remove tokens with zero balance
    const nonZeroBalances = await balances.tokenBalances.filter((token) => {
      return parseInt(token.tokenBalance) !== 0;
    });

    tokens = await Promise.all(
      nonZeroBalances.map(async (token) => {
        const options = {
          method: "POST",
          url: baseURL,
          headers: {
            accept: "application/json",
            "content-type": "application/json",
          },
          data: {
            id: 1,
            jsonrpc: "2.0",
            method: "alchemy_getTokenMetadata",
            params: [token.contractAddress],
          },
        };

        // getting the token metadata
        const { data: metadata } = await axios.request(options);
        return {
          ...metadata.result,
          balance: token.tokenBalance / Math.pow(10, metadata.result.decimals),
          address: token.contractAddress,
        };
      })
    );
    tokens = tokens.map((token) => ({ ...token, isScam: false }));
  }
  const ethBalance = await getNativeBalance(account, chainId);

  tokens.push({
    address: DEX_GURU_WETH_ADDR,
    balance: ethBalance / Math.pow(10, 18),
    decimals: 18,
    name: NATIVE_CURRENCIES[chainId].name,
    symbol: NATIVE_CURRENCIES[chainId].symbol,
  });

  return tokens;
}

const fetchTokenInfo = async (token: any, chainId: number, address: string, signer: any) => {
  try {
    let reward = {
        pendingRewards: 0,
        totalRewards: 0,
        symbol: "",
        isETH: false,
      },
      isReward = false;

    try {
      let calls = [
        {
          address: token.address,
          name: "dividendTracker",
          params: [],
        },
      ];
      const claimableResult = await multicall(claimableTokenAbi, calls, chainId);
      const dividendTracker = claimableResult[0][0];
      let rewardToken: any,
        pendingRewards = 0,
        totalRewards = 0;
      try {
        const dividendTrackerContract = getDividendTrackerContract(chainId, dividendTracker);
        const rewardTokenAddress = await dividendTrackerContract.rewardToken();
        const rewardTokenBaseinfo = await fetchTokenBaseInfo(rewardTokenAddress, chainId);
        rewardToken = {
          address: rewardTokenAddress,
          name: rewardTokenBaseinfo[0][0] ?? "",
          symbol: rewardTokenBaseinfo[1][0] ?? "",
          decimals: rewardTokenBaseinfo[2][0] ?? 0,
        };
      } catch (e) {
        rewardToken = {
          address: "0x0",
          name: getNativeSymbol(chainId),
          symbol: getNativeSymbol(chainId),
          decimals: 18,
        };
      }
      calls = [
        {
          address: dividendTracker,
          name: "withdrawableDividendOf",
          params: [address],
        },
        {
          address: dividendTracker,
          name: "withdrawnDividendOf",
          params: [address],
        },
      ];
      const rewardResult = await multicall(dividendTrackerAbi, calls, chainId);
      pendingRewards = rewardResult[0][0];
      totalRewards = rewardResult[1][0];
      reward.pendingRewards =
        pendingRewards / Math.pow(10, token.name.toLowerCase() === "brewlabs" ? 18 : rewardToken.decimals);
      reward.totalRewards =
        totalRewards / Math.pow(10, token.name.toLowerCase() === "brewlabs" ? 18 : rewardToken.decimals);
      reward.symbol = rewardToken.symbol;
      reward.isETH = token.name.toLowerCase() === "brewlabs";
      isReward = true;
    } catch (e) {}

    return {
      reward,
      isReward,
    };
  } catch (error) {
    console.log(error);
    return token;
  }
};

export const getTokenDetails = async (tokens: any, chainId: ChainId, address: string, signer: any) => {
  if (!isAddress(address) || !Object.keys(COVALENT_CHAIN_NAME).includes(chainId.toString()) || !tokens.length)
    return [];
  let data: any;

  data = await Promise.all(
    tokens.map(async (data: any) => {
      const tokenInfo = await fetchTokenInfo(data, chainId, address, signer);
      const serializedToken = { ...data, ...tokenInfo };
      return serializedToken;
    })
  );
  return data;
};

export async function getTokenBalances(account: string, chainId: ChainId, tokenMarketData: any) {
  if (!isAddress(account) || !Object.keys(COVALENT_CHAIN_NAME).includes(chainId.toString())) return [];
  try {
    const items: any = await getTokenBaseBalances(account, chainId);
    let _tokens: any = [];

    for (let i = 0; i < items.length; i++) {
      const address = items[i].address;
      const { usd: price } =
        tokenMarketData[address === DEX_GURU_WETH_ADDR ? WNATIVE[chainId].address.toLowerCase() : address] ||
        defaultMarketData;

      _tokens.push({
        ...items[i],
        price: price ?? 0,
        chainId,
      });
    }

    return _tokens;
  } catch (error) {
    console.log(error);
    return [];
  }
}
