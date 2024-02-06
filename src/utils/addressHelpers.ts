import { ChainId, EXCHANGE_MAP, ROUTER_ADDRESS_MAP } from "@brewlabs/sdk";
import addresses from "config/constants/contracts";
import { AppId, Chef } from "config/constants/types";

export const getAddress = (address: any, chainId: ChainId = ChainId.BSC_MAINNET): string => {
  if (address[chainId] || address[ChainId.BSC_MAINNET]) {
    return address[chainId] ? address[chainId] : address[ChainId.BSC_MAINNET];
  }

  return address[Object.keys(address)[0]];
};

export const getMasterChefAddress = (chainId: ChainId) => {
  return getAddress(addresses.masterChef, chainId);
};
export const getMulticallAddress = (chainId: ChainId) => {
  return getAddress(addresses.multiCall, chainId);
};
export const getTokenFactoryAddress = (chainId: ChainId) => {
  return getAddress(addresses.tokenFactory, chainId);
};
export const getFarmFactoryAddress = (chainId: ChainId) => {
  return getAddress(addresses.farmFactory, chainId);
};
export const getIndexFactoryAddress = (chainId: ChainId) => {
  return getAddress(addresses.indexFactory, chainId);
};
export const getFlaskNftAddress = (chainId: ChainId) => {
  return getAddress(addresses.flaskNft, chainId);
};
export const getMirrorNftAddress = (chainId: ChainId) => {
  return getAddress(addresses.mirrorNft, chainId);
};
export const getNftStakingAddress = (chainId: ChainId) => {
  return getAddress(addresses.nftStaking, chainId);
};

export const getLpManagerAddress = (chainId: ChainId) => {
  return addresses.lpManager[chainId];
};
export const getLpManagerV2Address = (chainId: ChainId) => {
  return addresses.lpManagerV2[chainId];
};
export const getTokenTransferAddress = (chainId: ChainId) => {
  return getAddress(addresses.tokenTransfer, chainId);
};
export const getAggregatorAddress = (chainId: ChainId) => {
  return getAddress(addresses.aggregator, chainId);
};
export const getBrewlabsAggregationRouterAddress = (chainId: ChainId) => {
  return getAddress(addresses.brewlabsAggregationRouter, chainId);
};
export const getBrewlabsRouterAddress = (chainId: ChainId) => {
  return ROUTER_ADDRESS_MAP[EXCHANGE_MAP[chainId]?.[0]?.key]?.[chainId];
};
export const getBrewlabsFeeManagerAddress = (chainId: ChainId) => {
  return getAddress(addresses.brewlabsFeeManager, chainId);
};
export const getZapperAddress = (chainId: ChainId) => {
  return getAddress(addresses.zapper, chainId);
};
export const getVerificationAddress = (chainId: ChainId) => {
  return getAddress(addresses.verification, chainId);
};
export const getPancakeMasterChefAddress = () => {
  return getAddress(addresses.pancakeMasterChef);
};
export const getBananaAddress = (chainId: ChainId) => {
  return getAddress(addresses.banana, chainId);
};
export const getMasterApeAddress = (chainId: ChainId) => {
  return getAddress(addresses.masterApe, chainId);
};
export const getApePriceGetterAddress = (chainId: ChainId) => {
  return getAddress(addresses.apePriceGetter, chainId);
};
export const getNativeWrappedAddress = (chainId: ChainId) => {
  return getAddress(addresses.nativeWrapped, chainId);
};
export const getExternalMasterChefAddress = (appId: AppId, version = Chef.MASTERCHEF) => {
  return appId !== AppId.SUSHISWAP ? addresses.externalMasterChef[appId] : addresses.externalMasterChef[appId][version];
};
export const addressWithout0x = (address: string) => {
  return address.replace("0x", "");
};
