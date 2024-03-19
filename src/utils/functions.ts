import { ChainId, Currency, NATIVE_CURRENCIES, Token, WNATIVE } from "@brewlabs/sdk";
import { ethers } from "ethers";
import { AugmentedChainId, CHAIN_ICONS, EMPTY_TOKEN_LOGO, EXPLORER_LOGO, EXPLORER_NAMES, EXPLORER_URLS } from "config/constants/networks";
import { getNativeSymbol } from "lib/bridge/helpers";
import { DEX_LOGOS } from "config/constants/swap";
import { toast } from "react-toastify";
import { isAddress } from "utils";

export function numberWithCommas(x: any) {
  const strList = x.toString().split(".");
  if (strList.length === 1) return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return strList[0].toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") + "." + strList[1];
}

export const BigNumberFormat = (str: any, decimals: number = 2) => {
  if (!str) return (0).toFixed(decimals);
  const length = Math.floor(Math.log10(str));
  if (Number(str) >= 1000000000000000)
    return `${numberWithCommas((str / Math.pow(10, length)).toFixed(decimals))}e+${length - 12}T`;
  else if (Number(str) >= 1000000000000) return `${numberWithCommas((str / 1000000000000).toFixed(decimals))}T`;
  else if (Number(str) >= 1000000000) return `${numberWithCommas((str / 1000000000).toFixed(decimals))}B`;
  else if (Number(str) >= 1000000) return `${numberWithCommas((str / 1000000).toFixed(decimals))}M`;
  else if (Number(str) >= 1000) return `${numberWithCommas((str / 1000).toFixed(decimals))}K`;
  else return `${numberWithCommas(str.toFixed(decimals))}`;
};

export function getBlockExplorerLink(
  data: string | number,
  type: "transaction" | "token" | "address" | "block" | "countdown",
  chainId: AugmentedChainId = ChainId.ETHEREUM
): string {
  switch (type) {
    case "transaction": {
      return `${EXPLORER_URLS[chainId]}/tx/${data}`;
    }
    case "token": {
      return `${EXPLORER_URLS[chainId]}/token/${data}`;
    }
    case "block": {
      return `${EXPLORER_URLS[chainId]}/block/${data}`;
    }
    case "countdown": {
      return `${EXPLORER_URLS[chainId]}/block/countdown/${data}`;
    }
    default: {
      return `${EXPLORER_URLS[chainId]}/address/${data}`;
    }
  }
}

export const getBlockExplorerLogo = (chainId: AugmentedChainId = ChainId.ETHEREUM) => {
  return `/images/explorer/${EXPLORER_NAMES[chainId].toLowerCase()}.png`;
};

export const makeBigNumber = (amount, decimals) => {
  let decimalCount = amount.split(".")[1]?.length;
  decimalCount = decimalCount ? decimalCount : 0;
  const subDecimals = decimalCount - decimals;
  let _amount = amount;
  if (subDecimals > 0) _amount = _amount.slice(0, amount.length - subDecimals);
  return ethers.utils.parseUnits(_amount, decimals);
};

export const formatDollar = (value, decimals = 2) => {
  if (value < 0) return "-$" + (-value).toFixed(decimals);
  return "$" + value.toFixed(decimals);
};

export const sumOfArray = (arr) => {
  let total = 0;
  for (let i = 0; i < arr.length; i++) total += arr[i];
  return total;
};

export const priceFormat = (str) => {
  const strlist = Number(str).toFixed(14).split(".");
  let c = 0;
  let value = "";
  if (strlist.length > 1) {
    while (strlist[1][c++] === "0");
    const temp = strlist[1].slice(0, c + 4);
    value = strlist[1].substring(temp.length - 5, temp.length - 1);
  }
  return { count: c - 1, value };
};

export const getEmptyTokenLogo = (chainId) => EMPTY_TOKEN_LOGO[chainId] ?? EMPTY_TOKEN_LOGO[56];
export const getChainLogo = (chainId) => CHAIN_ICONS[chainId] ?? "/images/networks/unkown.png";
export const getExplorerLogo = (chainId) => EXPLORER_LOGO[chainId] ?? "/images/networks/unkown.png";
export const getDexLogo = (exchange) => DEX_LOGOS[exchange];

export const getIndexName = (tokens) => {
  // if (tokens.length === 2)
  return tokens
    .map((t) => t.symbol.replace(WNATIVE[t.chainId].symbol, getNativeSymbol(t.chainId)).toUpperCase())
    .join("-");
  // return tokens
  // .map((t, index) => (index > 0 ? t.symbol.substring(0, 1) : t.symbol.replace("WBNB", "BNB").replace("WETH", "ETH")))
  // .join("-");
};

export const formatIPFSString = (url) => {
  let _url = url;
  if (url.includes("ipfs://")) _url = "https://maverickbl.mypinata.cloud/ipfs/" + _url.replace("ipfs://", "");
  else if (url.includes("https://ipfs.io/ipfs/"))
    _url = "https://maverickbl.mypinata.cloud/ipfs/" + _url.replace("https://ipfs.io/ipfs/", "");
  else if (url.includes("ipfs://ipfs/"))
    _url = "https://maverickbl.mypinata.cloud/ipfs/" + _url.replace("ipfs://ipfs/", "");
  return _url;
};

export const getAddLiquidityUrl = (dexId: string, token1: Currency, token2: Currency, chainId: number) => {
  if (!token1 || !token2) return "#";
  return `/add/${chainId}/${dexId}/${
    token1.isNative || token1.symbol === WNATIVE[chainId].symbol ? getNativeSymbol(chainId) : isAddress(token1.address)
  }/${
    token2.isNative || token2.symbol === WNATIVE[chainId].symbol ? getNativeSymbol(chainId) : isAddress(token2.address)
  }`;
};

export const getRemoveLiquidityUrl = (dexId: string, token1: Currency, token2: Currency, chainId: number) => {
  if (!token1 || !token2) return "#";
  return `/remove/${chainId}/${dexId}/${
    token1.isNative || token1.symbol === WNATIVE[chainId].symbol ? getNativeSymbol(chainId) : isAddress(token1.address)
  }/${
    token2.isNative || token2.symbol === WNATIVE[chainId].symbol ? getNativeSymbol(chainId) : isAddress(token2.address)
  }`;
};

export const getStringfy = (data: any) => {
  return JSON.stringify(data);
};

export const showError = (errorMsg: string) => {
  if (errorMsg) toast.error(errorMsg);
};

export const getEllipsis = (address: string, left = 6, right = 4) => {
  if (!address) return;
  return address.slice(0, left) + "..." + address.substring(address.length - right);
};
