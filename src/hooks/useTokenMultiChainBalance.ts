/* eslint-disable react-hooks/rules-of-hooks */
import { ChainId } from "@brewlabs/sdk";
import { ERC20_ABI } from "config/abi/erc20";
import { Contract } from "ethers";
import { useEffect, useState } from "react";
import multicall from "utils/multicall";
import { simpleRpcProvider } from "utils/providers";

export async function getMultiChainTotalBalances(tokens: any, address: any) {
  let totalBalance = 0;
  const balances = await Promise.all(
    tokens.map(async (data) => {
      try {
        const provider = simpleRpcProvider(data.chainId);
        const tokenContract = new Contract(data.address, ERC20_ABI, provider);
        const balance = await tokenContract.balanceOf(address);
        return { ...data, balance };
      } catch (e) {
        return { ...data, balance: 0 };
      }
    })
  );
  for (let i = 0; i < balances.length; i++) totalBalance += balances[i].balance / Math.pow(10, balances[i].decimals);
  return totalBalance;
}

export const useTotalUserBalance = (tokens: any, address: any) => {
  const [totalBalance, setTotalBalance] = useState(0);
  const tokenStringified = JSON.stringify(tokens);
  useEffect(() => {
    if (!address) return;
    getMultiChainTotalBalances(tokens, address)
      .then((data) => setTotalBalance(data))
      .catch((e) => console.log(e));
  }, [address, tokenStringified]);
  return totalBalance;
};

export async function getBalances(tokens: any, addresses: any) {
  let balances = new Object();
  let totalBalance = 0;
  await Promise.all(
    Object.keys(tokens).map(async (key: any, i) => {
      try {
        if (!tokens[key][i]?.decimals) return null;
        const calls = addresses[key].map((address, i) => {
          return {
            name: "balanceOf",
            params: [address],
            address: tokens[key][i].address,
          };
        });
        const result = await multicall(ERC20_ABI, calls, key);
        const tokenDatas = result.map((data, i) => {
          const balance = data / Math.pow(10, tokens[key][i].decimals);
          totalBalance += balance;
          return { ...tokens[key][i], balance, account: addresses[key][i] };
        });
        balances[key] = tokenDatas;
      } catch (e) {}
    })
  );
  return { balances, totalBalance };
}

const useTokenBalances = (tokens: any, addresses: any) => {
  const [balances, setBalances] = useState(null);
  const [totalBalance, setTotalBalance] = useState(null);

  const strigifiedTokens = JSON.stringify(tokens);
  const strigifiedAddresses = JSON.stringify(addresses);

  useEffect(() => {
    getBalances(tokens, addresses)
      .then((result) => {
        setTotalBalance(result.totalBalance);
        setBalances(result.balances);
      })
      .catch((e) => console.log(e));
  }, [strigifiedTokens, strigifiedAddresses]);

  return { balances, totalBalance };
};

export default useTokenBalances;
