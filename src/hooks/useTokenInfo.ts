import { ethers } from "ethers";

import { useSlowRefreshEffect } from "./useRefreshEffect";
import { useContext, useEffect, useState } from "react";
import axios from "axios";
import { EXPLORER_API_KEYS, EXPLORER_API_URLS } from "config/constants/networks";
import brewlabsABI from "config/abi/brewlabs.json";
import multicall from "utils/multicall";
import { getContract } from "utils/contractHelpers";
import { isAddress } from "ethers/lib/utils.js";
import { API_URL } from "config/constants";
import { CommunityContext } from "contexts/CommunityContext";
import { BASE_URL, COVALENT_API_KEYS, COVALENT_CHAIN_NAME, DEXSCREENER_CHAINNAME, DEXTOOLS_CHAINNAME } from "config";

export async function getBaseInfos(address, chainId) {
  try {
    const calls = [
      {
        name: "name",
        address: address,
      },
      {
        name: "symbol",
        address: address,
      },
      {
        name: "decimals",
        address: address,
      },
    ];
    const result = await multicall(brewlabsABI, calls, chainId);
    return { name: result[0][0], symbol: result[1][0], decimals: result[2][0] / 1 };
  } catch (e) {
    console.log(e);
    return { name: "", symbol: "", decimals: 0 };
  }
}
function useTokenInfo(address: string, chainId: number) {
  const [owner, setOwner] = useState("");
  const [deployer, setDeployer] = useState("");
  const [totalSupply, setTotalSupply] = useState("");
  const [name, setName] = useState("");
  const [symbol, setSymbol] = useState("");
  const [decimals, setDecimals] = useState(18);

  async function fetchInfo() {
    try {
      const tokenContract = getContract(chainId, address, brewlabsABI);
      axios
        .get(
          `${EXPLORER_API_URLS[chainId]}?module=account&action=tokentx&contractaddress=${address}&address=${ethers.constants.AddressZero}&page=1&offset=1&apikey=${EXPLORER_API_KEYS[chainId]}`
        )
        .then((result) => {
          setDeployer(result.data.result[0]?.to);
        })
        .catch((e) => console.log(e));

      getBaseInfos(address, chainId)
        .then((result) => {
          setName(result.name);
          setSymbol(result.symbol);
          setDecimals(result.decimals);
        })
        .catch((e) => console.log(e));

      tokenContract
        .totalSupply()
        .then((data) => setTotalSupply(data))
        .catch((e) => console.log(e));

      tokenContract
        .owner()
        .then((data) => setOwner(data))
        .catch((e) => console.log(e));
    } catch (e) {
      console.log(e);
    }
  }

  useSlowRefreshEffect(() => {
    if (!ethers.utils.isAddress(address)) {
      setOwner("");
      setDeployer("");
      return;
    }
    fetchInfo();
  }, [address, chainId]);
  return { owner, deployer, totalSupply, name, symbol, decimals };
}

export async function fetchDexInfos(token, chainId) {
  try {
    const result = await axios.post(`${API_URL}/chart/getDexData`, {
      url: `https://api.dextools.io/v1/token?chain=${DEXTOOLS_CHAINNAME[chainId]}&address=${token}&page=1&pageSize=5`,
    });
    let tokenInfos = { metrics: { holders: 0, totalSupply: 0 } };
    if (result.data.success) tokenInfos = result.data.result.data;
    return {
      ...tokenInfos,
      holders: tokenInfos.metrics.holders,
      totalSupply: tokenInfos.metrics.totalSupply,
      chainId,
    };
  } catch (e) {
    console.log(e);
    return {};
  }
}

export function useTokenMarketInfos(pair: any) {
  const [dexInfos, setDexInfos] = useState<any>({});
  const [volume24hChange, setVolume24hChange] = useState(0);

  const { communities }: any = useContext(CommunityContext);

  const isExisitngCommunity = communities.find((community) =>
    Object.keys(community.currencies).find(
      (key, i) => community.currencies[key].address.toLowerCase() === pair?.baseToken?.address?.toLowerCase()
    )
  );
  const community = isExisitngCommunity ? `${BASE_URL}/communities/${isExisitngCommunity.pid}` : "";
  const strigifiedCurrency = JSON.stringify(pair);
  useEffect(() => {
    if (!isAddress(pair?.address)) {
      setDexInfos({});
      return;
    }
    fetchDexInfos(pair.baseToken.address, pair.chainId)
      .then((result) => {
        setDexInfos(result);
      })
      .catch((e) => console.log(e));

    function getVolume(bars) {
      const v1 =
        Number(bars[0]?.volumeUsd ?? 0) +
        Number(bars[1]?.volumeUsd ?? 0) +
        Number(bars[2]?.volumeUsd ?? 0) +
        Number(bars[3]?.volumeUsd ?? 0);
      const v2 =
        Number(bars[4]?.volumeUsd ?? 0) +
        Number(bars[5]?.volumeUsd ?? 0) +
        Number(bars[6]?.volumeUsd ?? 0) +
        Number(bars[7]?.volumeUsd ?? 0);
      setVolume24hChange((v2 ? (v2 - v1) / v2 : 1) * 100);
    }
    if (pair.a === "brewlabs") {
      const url = `${API_URL}/chart/bars?pair=${pair.address.toLowerCase()}&${pair.quoteToken.address}&from=${
        Date.now() - 86400000 * 2
      }&to=${Date.now()}&res=${240}`;
      axios
        .get(url)
        .then((result) => getVolume(result.data))
        .catch((e) => console.log(e));
    } else {
      setVolume24hChange(0);
    }
  }, [strigifiedCurrency]);

  return {
    infos: {
      ...dexInfos,
      volume24hChange,
      community,
      totalSupply: dexInfos.totalSupply ?? 0,
      info: {
        ...dexInfos.info,
        description: isExisitngCommunity?.description ?? dexInfos.info?.description ?? "",
      },
      links: {
        ...dexInfos.links,
        ...(isExisitngCommunity?.socials ?? {}),
      },
      audit: {
        ...dexInfos.audit,
        codeVerified: isExisitngCommunity ? true : dexInfos.audit?.codeVerified,
      },
    },
  };
}

export function useTokenTaxes(address, chainId) {
  const [buyTaxes, setBuyTaxes] = useState(null);
  const [sellTaxes, setSellTaxes] = useState(null);
  async function fetchTaxes() {
    try {
      const { data: response } = await axios.get(`https://api.gopluslabs.io/api/v1/token_security/${chainId}`, {
        params: { contract_addresses: address },
      });
      setBuyTaxes(response.result[address.toLowerCase()].buy_tax * 100);
      setSellTaxes(response.result[address.toLowerCase()].sell_tax * 100);
    } catch (e) {
      console.log(e);
    }
  }

  useEffect(() => {
    if (!isAddress(address)) return;
    fetchTaxes();
  }, [address, chainId]);

  return { buyTaxes, sellTaxes };
}

export function useTokenHolders(address, chainId) {
  const [holders30d, setHolders30D] = useState([]);

  function formatDate(date) {
    var d = new Date(date),
      month = "" + (d.getMonth() + 1),
      day = "" + d.getDate(),
      year = d.getFullYear();

    if (month.length < 2) month = "0" + month;
    if (day.length < 2) day = "0" + day;

    return [year, month, day].join("-");
  }
  async function fetchHolders30d() {
    try {
      const dateString = formatDate(Date.now() - 86400000 * 30);
      const { data: response } = await axios.get(
        `https://api.covalenthq.com/v1/${
          COVALENT_CHAIN_NAME[chainId]
        }/tokens/${address}/token_holders_v2/?page-size=1000&page-number=${0}&date=${dateString}`,
        { headers: { Authorization: `Bearer ${COVALENT_API_KEYS[0]}` } }
      );
      const holders = response.data.items.map((holder) => ({
        ...holder,
        balance: holder.balance / Math.pow(10, holder.contract_decimals),
      }));
      setHolders30D(holders);
    } catch (e) {
      console.log(e);
    }
  }
  useEffect(() => {
    if (!isAddress(address)) return;
    fetchHolders30d();
  }, [address, chainId]);
  return { holders30d };
}
export default useTokenInfo;
