import { ChainId } from "@brewlabs/sdk";
import axios from "axios";
import BigNumber from "bignumber.js";

import erc20ABI from "config/abi/erc20.json";
import masterchefABI from "config/abi/farm/masterchef.json";
import farmImplAbi from "config/abi/farm/farmImpl.json";
import dualFarmImplABI from "config/abi/farm/brewlabsDualFarm.json";

import { API_URL } from "config/constants";
import { SerializedFarmConfig } from "config/constants/types";
import { getMasterChefAddress } from "utils/addressHelpers";
import multicall from "utils/multicall";

export const fetchFarmUserAllowances = async (
  account: string,
  chainId: ChainId,
  farmsToFetch: SerializedFarmConfig[]
) => {
  const masterChefAddress = getMasterChefAddress(chainId);

  const calls = farmsToFetch.map((farm) => {
    return {
      address: farm.lpAddress,
      name: "allowance",
      params: [account, farm.contractAddress ?? masterChefAddress],
    };
  });

  const rawLpAllowances = await multicall(erc20ABI, calls, chainId);
  const parsedLpAllowances = rawLpAllowances.map((lpBalance) => {
    return new BigNumber(lpBalance).toJSON();
  });
  return parsedLpAllowances;
};

export const fetchFarmUserTokenBalances = async (
  account: string,
  chainId: ChainId,
  farmsToFetch: SerializedFarmConfig[]
) => {
  try {
    const calls = farmsToFetch.map((farm) => {
      return {
        address: farm.lpAddress,
        name: "balanceOf",
        params: [account],
      };
    });

    const rawTokenBalances = await multicall(erc20ABI, calls, chainId);
    const parsedTokenBalances = rawTokenBalances.map((tokenBalance) => {
      return new BigNumber(tokenBalance).toJSON();
    });
    return parsedTokenBalances;
  } catch (e) {
    return [];
  }
};

export const fetchFarmUserStakedBalances = async (
  account: string,
  chainId: ChainId,
  farmsToFetch: SerializedFarmConfig[]
) => {
  try {
    const masterChefAddress = getMasterChefAddress(chainId);

    let data = [];

    // fetch normal farms
    let rawStakedBalances = await multicall(
      masterchefABI,
      farmsToFetch
        .filter((f) => !f.category)
        .map((farm) => ({
          address: farm.contractAddress ?? masterChefAddress,
          name: "userInfo",
          params: [farm.poolId, account],
        })),
      chainId
    );

    farmsToFetch
      .filter((f) => !f.category)
      .forEach((farm, index) => {
        data.push({
          pid: farm.pid,
          farmId: farm.farmId,
          poolId: farm.poolId,
          chainId: farm.chainId,
          stakedBalance: rawStakedBalances[index][0].toString(),
        });
      });

    // fetch factroy-created farms
    rawStakedBalances = await multicall(
      farmImplAbi,
      farmsToFetch
        .filter((f) => f.category)
        .map((farm) => ({
          address: farm.contractAddress,
          name: "userInfo",
          params: [account],
        })),
      chainId
    );

    farmsToFetch
      .filter((f) => f.category)
      .forEach((farm, index) => {
        data.push({
          pid: farm.pid,
          farmId: farm.farmId,
          poolId: farm.poolId,
          chainId: farm.chainId,
          stakedBalance: rawStakedBalances[index][0].toString(),
        });
      });

    return data;
  } catch (e) {
    console.log(e);
    return [];
  }
};

async function fetchFarmUserEarningByCategory(
  category: number,
  account: string,
  chainId: ChainId,
  farmsToFetch: SerializedFarmConfig[]
) {
  try {
    const _farms = farmsToFetch.filter((f) => !f.enableEmergencyWithdraw).filter((f) => f.category === category);

    let abi = masterchefABI,
      calls: any = _farms.map((farm) => ({
        address: farm.contractAddress,
        name: "pendingRewards",
        params: [account],
      }));

    const masterChefAddress = getMasterChefAddress(chainId);

    switch (category) {
      case 0:
        calls = _farms.map((farm) => ({
          address: farm.contractAddress ?? masterChefAddress,
          name: "pendingRewards",
          params: [farm.poolId, account],
        }));
        break;
      case 1:
        abi = farmImplAbi;
        break;
      case 2:
        abi = dualFarmImplABI;
        break;
      default:
        break;
    }

    const rawEarnings = calls.length ? await multicall(abi, calls, chainId) : [];

    let data = [];
    _farms.forEach((farm, index) => {
      let values: any = {
        pid: farm.pid,
        farmId: farm.farmId,
        poolId: farm.poolId,
        chainId: farm.chainId,
      };
      if (farm.category === 2)
        values = {
          ...values,
          earnings: rawEarnings[index][0][0].toString(),
          earnings1: rawEarnings[index][0][1].toString(),
        };
      else
        values = {
          ...values,
          earnings: rawEarnings[index][0].toString(),
        };
      data.push(values);
    });
    return data;
  } catch (e) {
    console.log(e);
    return [];
  }
}

export const fetchFarmUserEarnings = async (
  account: string,
  chainId: ChainId,
  farmsToFetch: SerializedFarmConfig[]
) => {
  try {
    const earnings = await Promise.all([
      fetchFarmUserEarningByCategory(0, account, chainId, farmsToFetch),
      fetchFarmUserEarningByCategory(1, account, chainId, farmsToFetch),
      fetchFarmUserEarningByCategory(2, account, chainId, farmsToFetch),
    ]);
    return [...earnings[0], ...earnings[1], ...earnings[2]];
  } catch (e) {
    return [];
  }
};

export const fetchFarmUserReflections = async (
  account: string,
  chainId: ChainId,
  farmsToFetch: SerializedFarmConfig[]
) => {
  try {
    const masterChefAddress = getMasterChefAddress(chainId);

    let data = [];

    // fetch normal farms
    let rawReflections = await multicall(
      masterchefABI,
      farmsToFetch
        .filter((f) => !f.enableEmergencyWithdraw)
        .filter((f) => !f.category)
        .map((farm) => ({
          address: farm.contractAddress ?? masterChefAddress,
          name: "pendingReflections",
          params: [farm.poolId, account],
        })),
      chainId
    );

    farmsToFetch
      .filter((f) => !f.enableEmergencyWithdraw)
      .filter((f) => !f.category)
      .map((farm, index) => {
        data.push({
          pid: farm.pid,
          farmId: farm.farmId,
          poolId: farm.poolId,
          chainId: farm.chainId,
          reflections: rawReflections[index][0].toString(),
        });
      });

    // fetch factroy-created farms
    rawReflections = await multicall(
      farmImplAbi,
      farmsToFetch
        .filter((f) => !f.enableEmergencyWithdraw)
        .filter((f) => f.category)
        .map((farm) => ({
          address: farm.contractAddress,
          name: "pendingReflections",
          params: [account],
        })),
      chainId
    );

    farmsToFetch
      .filter((f) => !f.enableEmergencyWithdraw)
      .filter((f) => f.category)
      .forEach((farm, index) => {
        data.push({
          pid: farm.pid,
          farmId: farm.farmId,
          poolId: farm.poolId,
          chainId: farm.chainId,
          reflections: rawReflections[index][0].toString(),
        });
      });

    return data;
  } catch (e) {
    console.log(e);
    return [];
  }
};

export const fetchFarmUserDeposits = async (farm, account) => {
  const res = await axios.post(`${API_URL}/deposit/${account}/single`, { type: "farm", id: farm.pid });

  const ret = res?.data ?? [];

  let record = { pid: farm.pid, deposits: [] };
  record.deposits = ret.filter((d) => d.farmId === farm.pid);

  return record;
};
