import axios from "axios";
import { DEX_GURU_CHAIN_NAME } from "config";
import { API_URL } from "config/constants";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { isAddress } from "utils";

export function usePairVoteInfo(address: any, chainId: number) {
  const [info, setInfo] = useState(null);

  async function fetchPairInfo() {
    try {
      const { data: response } = await axios.post(`${API_URL}/chart/getPairInfo`, {
        pair: address.toLowerCase(),
        chainId,
      });
      setInfo(response);
    } catch (e) {
      console.log(e);
    }
  }

  async function voteOrAgainst(pair, account, chainId, rate) {
    try {
      const { data: response } = await axios.post(`${API_URL}/chart/voteOrAgainstPair`, {
        pair: pair.toLowerCase(),
        account: account.toLowerCase(),
        chainId,
        rate,
      });
      if (!response.success) toast.error(response.msg);
      fetchPairInfo();
    } catch (e) {
      console.log(e);
    }
  }

  useEffect(() => {
    if (!isAddress(address)) return;
    fetchPairInfo();
  }, [address, chainId]);

  return { info, voteOrAgainst };
}

export function usePairDexInfo(address, chainId) {
  const [info, setInfo] = useState(null);
  useEffect(() => {
    setInfo(null);
    if (!isAddress(address)) return;
    axios
      .post("https://api.dex.guru/v3/tokens", {
        ids: [`${address}-${DEX_GURU_CHAIN_NAME[chainId]}`],
        limit: 1,
        network: DEX_GURU_CHAIN_NAME[chainId],
      })
      .then((result) => {
        const data = result.data.data[0];
        setInfo({
          price: data.priceUSD,
          priceChange: data.priceUSDChange24h * 100,
          symbol: data.symbols[0],
        });
      })
      .catch((e) => console.log(e));
  }, [address, chainId]);
  return { info };
}
