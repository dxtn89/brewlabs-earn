import { ChainId } from "@brewlabs/sdk";
import { fetchOETHMontlyAPY } from "@hooks/useOETHAPY";
import { getBalances } from "@hooks/useTokenMultiChainBalance";
import { fetchDexGuruPrice } from "@hooks/useTokenPrice";
import axios from "axios";
import { DEX_GURU_CHAIN_NAME } from "config";
import { TOKENLIST_URI } from "config/constants";
import contracts from "config/constants/contracts";
import { EXPLORER_API_KEYS, EXPLORER_API_URLS } from "config/constants/networks";
import { NFT_RARE_COUNT } from "config/constants/nft";
import { customTokensForDeploy, tokens } from "config/constants/tokens";
import { simpleRpcProvider } from "utils/providers";
import { zeroAddress } from "viem";

export async function getTransactions() {
  try {
    let count = 0,
      count24h = 0;
    const _tokens: any = [tokens[ChainId.ETHEREUM].brews, tokens[ChainId.BSC_MAINNET].brews];
    await Promise.all(
      _tokens.map(async (token, i) => {
        let query = {
          current_token_id: `${token.address.toLowerCase()}-${DEX_GURU_CHAIN_NAME[token.chainId]}`,
          order: "desc",
          sort_by: "timestamp",
          token_status: "all",
          with_full_totals: true,
        };
        const query24h = { ...query, date: { start_date: Date.now() - 3600 * 24 * 1000, end_date: Date.now() } };
        const response = await Promise.all([
          axios.post("https://api.dex.guru/v3/tokens/transactions/count", query),
          axios.post("https://api.dex.guru/v3/tokens/transactions/count", query24h),
        ]);
        count += response[0].data.count;
        count24h += response[1].data.count;
        return;
      })
    );
    return { count, count24h };
  } catch (e) {
    console.log(e);
    return { count: 0, count24h: 0 };
  }
}

export async function getNFTStakingValues() {
  try {
    let stakedCount = 0;
    await Promise.all(
      [
        { chainId: 1, address: contracts.nftStaking[1] },
        { chainId: 56, address: contracts.nftStaking[56] },
      ].map(async (data, i) => {
        const result = await axios.get(
          `${EXPLORER_API_URLS[data.chainId]}?module=account&action=txlist&address=${
            data.address
          }&page=1&offset=50&sort=desc&apikey=${EXPLORER_API_KEYS[data.chainId]}`
        );
        const txs = result.data.result.filter(
          (tx) => tx.functionName.includes("deposit") && tx.timeStamp > Date.now() / 1000 - 3600 * 24
        );
        stakedCount += txs.length;
      })
    );
    return { apy: 0, stakedCount };
  } catch (e) {
    console.log(e);
    return { apy: 0, stakedCount: 0 };
  }
}

const getFeeCollected = async () => {
  let balances = { 1: 0, 56: 0 };
  await Promise.all(
    [
      { chainId: 1, address: "0x64961Ffd0d84b2355eC2B5d35B0d8D8825A774dc" },
      { chainId: 56, address: "0x408c4aDa67aE1244dfeC7D609dea3c232843189A" },
      { chainId: 56, address: "0x5Ac58191F3BBDF6D037C6C6201aDC9F99c93C53A" },
    ].map(async (data) => {
      const provider = simpleRpcProvider(data.chainId);
      const balance: any = await provider.getBalance(data.address);
      balances[data.chainId] += balance / Math.pow(10, 18);
    })
  );
  return balances;
};

const getChangedFeeCollected = async () => {
  let values = { 1: 0, 56: 0 };
  await Promise.all(
    [
      { chainId: 1, address: "0x64961Ffd0d84b2355eC2B5d35B0d8D8825A774dc" },
      { chainId: 56, address: "0x408c4aDa67aE1244dfeC7D609dea3c232843189A" },
      { chainId: 56, address: "0x5Ac58191F3BBDF6D037C6C6201aDC9F99c93C53A" },
    ].map(async (data) => {
      const result = await axios.get(
        `${EXPLORER_API_URLS[data.chainId]}?module=account&action=txlistinternal&address=${
          data.address
        }&page=1&offset=50&sort=desc&apikey=${EXPLORER_API_KEYS[data.chainId]}}`
      );
      let _balance = 0;
      if (!result.data.result) return {};

      result.data.result
        .filter((tx) => tx.to === data.address.toLowerCase() && tx.timeStamp > Date.now() / 1000 - 3600 * 24)
        .map((tx) => (_balance += tx.value / Math.pow(10, 18)));
      values[data.chainId] += _balance;
    })
  );
  return values;
};

export async function getFeeCollectedValues() {
  try {
    const response = await Promise.all([
      fetchDexGuruPrice(56, tokens[56].wbnb.address),
      fetchDexGuruPrice(1, tokens[1].weth.address),
    ]);
    const bnbPrice = response[0];
    const ethPrice = response[1];
    const result = await Promise.all([getFeeCollected(), getChangedFeeCollected()]);
    const value = result[0];
    const changedValue = result[1];
    const fee = value && ethPrice && bnbPrice ? value[1] * ethPrice + value[56] * bnbPrice : null;
    const fee24h =
      changedValue && ethPrice && bnbPrice ? changedValue[1] * ethPrice + changedValue[56] * bnbPrice : null;
    return { fee, fee24h };
  } catch (e) {
    console.log(e);
    return { fee: 0, fee24h: 0 };
  }
}

async function getChangedBalances(tokens, addresses) {
  let balances = new Object();
  await Promise.all(
    Object.keys(tokens).map(async (chainId, i) => {
      const _balances = await Promise.all(
        tokens[chainId].map(async (token, j) => {
          try {
            const result = await axios.get(
              `${
                EXPLORER_API_URLS[chainId]
              }?module=account&action=tokentx&contractaddress=${token.address.toLowerCase()}&address=${
                addresses[chainId][j]
              }&page=1&offset=50&sort=desc&apikey=${EXPLORER_API_KEYS[chainId]}`
            );
            if (result.data.message !== "OK") return 0;
            const txs = result.data.result.filter(
              (tx) => tx.timeStamp / 1 >= Date.now() / 1000 - 24 * 3600 && tx.to === addresses[chainId][j].toLowerCase()
            );
            let _balance = 0;
            txs.map((data) => (_balance += data.value / Math.pow(10, tokens[chainId][j].decimals)));
            return _balance;
          } catch (e) {
            console.log(e);
            return 0;
          }
        })
      );
      let _balance = 0;
      _balances.map((data) => (_balance += data));
      balances[chainId] = _balance;
    })
  );
  return balances;
}

export async function getTreasuryValues() {
  try {
    const response = await Promise.all([
      fetchDexGuruPrice(56, tokens[56].brews.address),
      fetchDexGuruPrice(1, tokens[1].brews.address),
    ]);
    const bscBrewPrice = response[0];
    const ethBrewprice = response[1];

    const result = await Promise.all([
      getBalances(
        { 1: [tokens[1].brews], 56: [tokens[56].brews, tokens[56].brews] },
        {
          1: ["0x64961ffd0d84b2355ec2b5d35b0d8d8825a774dc"],
          56: ["0x5Ac58191F3BBDF6D037C6C6201aDC9F99c93C53A", "0x408c4aDa67aE1244dfeC7D609dea3c232843189A"],
        }
      ),
      getChangedBalances(
        { 1: [tokens[1].brews], 56: [tokens[56].brews, tokens[56].brews] },
        {
          1: ["0x64961ffd0d84b2355ec2b5d35b0d8d8825a774dc"],
          56: ["0x5Ac58191F3BBDF6D037C6C6201aDC9F99c93C53A", "0x408c4aDa67aE1244dfeC7D609dea3c232843189A"],
        }
      ),
    ]);
    const value = { 1: result[0].balances[1][0].balance, 56: result[0].balances[56][0].balance };
    const value24h = result[1];

    return {
      value: value && ethBrewprice && bscBrewPrice ? value[1] * ethBrewprice + value[56] * bscBrewPrice : null,
      value24h:
        value24h && ethBrewprice && bscBrewPrice ? value24h[1] * ethBrewprice + value24h[56] * bscBrewPrice : null,
    };
  } catch (e) {
    console.log(e);
    return { value: 0, value24h: 0 };
  }
}

export async function getTokenLists(chainId) {
  try {
    const customTokens = (customTokensForDeploy[chainId] ?? []).map((token) => ({
      ...token,
      address: token.address ?? zeroAddress,
      logoURI: token.logo ?? "",
    }));
    if (!TOKENLIST_URI[chainId]) {
      return customTokens ?? [];
    }
    const result = await axios.get(TOKENLIST_URI[chainId]);
    return [...(customTokens ?? []), ...result.data.tokens];
  } catch (e) {
    console.log(e);
    return [];
  }
}
