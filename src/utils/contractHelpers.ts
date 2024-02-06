import { ethers } from "ethers";
import { ChainId } from "@brewlabs/sdk";
import { brewsToken } from "config/constants/tokens";
import { AppId, Chef } from "config/constants/types";

// ABI
import bep20Abi from "config/abi/erc20.json";
import erc721Abi from "config/abi/erc721.json";
import aggregatorAbi from "config/abi/swap/brewlabsAggregator.json";
import brewlabsPairAbi from "config/abi/brewlabsPair.json";
import brewlabsRouterAbi from "config/abi/swap/brewlabsRouter.json";
import brewlabsFeeManagerAbi from "config/abi/swap/brewlabsFeeManager.json";
import brewlabsAggregationRouterAbi from "config/abi/swap/BrewlabsAggregationRouter.json";
import verifictionAbi from "config/abi/brewlabsFactoryVerification.json";
import lockupStaking from "config/abi/staking/brewlabsLockup.json";
import lpManagerAbi from "config/abi/brewlabsLiquidityManager.json";
import lpManagerV2Abi from "config/abi/brewlabsLiquidityManagerV2.json";
import zapperAbi from "config/abi/brewlabsZapInConstructor.json";
import externalMasterChefAbi from "config/abi/externalMasterchef.json";
import lpTokenAbi from "config/abi/lpToken.json";
import masterChef from "config/abi/farm/masterchef.json";
import masterChefV2 from "config/abi/farm/masterchefV2.json";
import MultiCallAbi from "config/abi/Multicall.json";
import singleStaking from "config/abi/staking/singlestaking.json";
import claimableTokenAbi from "config/abi/claimableToken.json";
import dividendTrackerAbi from "config/abi/dividendTracker.json";
import UnLockAbi from "config/abi/staking/brewlabsUnLockup.json";
import IndexAbi from "config/abi/indexes/index.json";
import IndexImplAbi from "config/abi/indexes/indexImpl.json";
import IndexImplV2Abi from "config/abi/indexes/indexImpl_v2.json";
import IndexFactoryAbi from "config/abi/indexes/factory.json";
import FarmImplAbi from "config/abi/farm/farmImpl.json";
import FarmFactoryAbi from "config/abi/farm/factory.json";
import FlaskNftAbi from "config/abi/nfts/flaskNft.json";
import MirrorNftAbi from "config/abi/nfts/mirrorNft.json";
import NftStakingAbi from "config/abi/nfts/nftStaking.json";
import TokenFactoryAbi from "config/abi/token/factory.json";

// Addresses
import {
  getMulticallAddress,
  getLpManagerAddress,
  getLpManagerV2Address,
  getAggregatorAddress,
  getZapperAddress,
  getVerificationAddress,
  getPancakeMasterChefAddress,
  getExternalMasterChefAddress,
  getBrewlabsAggregationRouterAddress,
  getBrewlabsFeeManagerAddress,
  getFarmFactoryAddress,
  getIndexFactoryAddress,
  getFlaskNftAddress,
  getMirrorNftAddress,
  getNftStakingAddress,
  getTokenFactoryAddress,
} from "utils/addressHelpers";
import { simpleRpcProvider } from "./providers";

export const getContract = (
  chainId: ChainId,
  address: string,
  abi: any,
  signer?: ethers.Signer | ethers.providers.Provider
) => {
  if (!address) return null;
  const signerOrProvider = signer ?? simpleRpcProvider(chainId);
  return new ethers.Contract(address, abi, signerOrProvider);
};
export const getBrewsTokenContract = (chainId: ChainId, signer?: ethers.Signer | ethers.providers.Provider) => {
  return getContract(chainId, brewsToken[chainId].address, bep20Abi, signer);
};

export const getClaimableTokenContract = (
  chainId: ChainId,
  address: string,
  signer?: ethers.Signer | ethers.providers.Provider
) => {
  return getContract(chainId, address, claimableTokenAbi, signer);
};

export const getDividendTrackerContract = (
  chainId: ChainId,
  address: string,
  signer?: ethers.Signer | ethers.providers.Provider
) => {
  return getContract(chainId, address, dividendTrackerAbi, signer);
};

export const getBep20Contract = (
  chainId: ChainId,
  address: string,
  signer?: ethers.Signer | ethers.providers.Provider
) => {
  return getContract(chainId, address, bep20Abi, signer);
};
export const getErc721Contract = (
  chainId: ChainId,
  address: string,
  signer?: ethers.Signer | ethers.providers.Provider
) => {
  return getContract(chainId, address, erc721Abi, signer);
};
export const getLpContract = (
  chainId: ChainId,
  address: string,
  signer?: ethers.Signer | ethers.providers.Provider
) => {
  return getContract(chainId, address, lpTokenAbi, signer);
};
export const getSingleStakingContract = (
  chainId: ChainId,
  address: string,
  signer?: ethers.Signer | ethers.providers.Provider
) => {
  return getContract(chainId, address, singleStaking, signer);
};
export const getLockupStakingContract = (
  chainId: ChainId,
  address: string,
  signer?: ethers.Signer | ethers.providers.Provider
) => {
  return getContract(chainId, address, lockupStaking, signer);
};

export const getUnLockStakingContract = (
  chainId: ChainId,
  address: string,
  signer?: ethers.Signer | ethers.providers.Provider
) => {
  return getContract(chainId, address, UnLockAbi, signer);
};

export const getLpManagerContract = (chainId: ChainId, signer?: ethers.Signer | ethers.providers.Provider) => {
  return getContract(chainId, getLpManagerAddress(chainId), lpManagerAbi, signer);
};
export const getLpManagerV2Contract = (chainId: ChainId, signer?: ethers.Signer | ethers.providers.Provider) => {
  return getContract(chainId, getLpManagerV2Address(chainId), lpManagerV2Abi, signer);
};
export const getMasterchefContract = (
  chainId: ChainId,
  address: string,
  signer?: ethers.Signer | ethers.providers.Provider
) => {
  return getContract(chainId, address, masterChefV2, signer);
};
export const getEmergencyMasterchefContract = (
  chainId: ChainId,
  address: string,
  signer?: ethers.Signer | ethers.providers.Provider
) => {
  return getContract(chainId, address, masterChef, signer);
};

export const getMulticallContract = (chainId: ChainId, signer?: ethers.Signer | ethers.providers.Provider) => {
  return getContract(chainId, getMulticallAddress(chainId), MultiCallAbi, signer);
};

export const getAggregatorContract = (chainId: ChainId, signer?: ethers.Signer | ethers.providers.Provider) => {
  return getContract(chainId, getAggregatorAddress(chainId), aggregatorAbi, signer);
};

export const getBrewlabsAggregationRouterContract = (
  chainId: ChainId,
  signer?: ethers.Signer | ethers.providers.Provider
) => {
  return getContract(chainId, getBrewlabsAggregationRouterAddress(chainId), brewlabsAggregationRouterAbi, signer);
};

export const getTokenFactoryContract = (chainId: ChainId, signer?: ethers.Signer | ethers.providers.Provider) => {
  return getContract(chainId, getTokenFactoryAddress(chainId), TokenFactoryAbi, signer);
};

export const getFarmFactoryContract = (chainId: ChainId, signer?: ethers.Signer | ethers.providers.Provider) => {
  return getContract(chainId, getFarmFactoryAddress(chainId), FarmFactoryAbi, signer);
};

export const getFarmImplContract = (
  chainId: ChainId,
  address: string,
  signer?: ethers.Signer | ethers.providers.Provider
) => {
  return getContract(chainId, address, FarmImplAbi, signer);
};

export const getIndexFactoryContract = (chainId: ChainId, signer?: ethers.Signer | ethers.providers.Provider) => {
  return getContract(chainId, getIndexFactoryAddress(chainId), IndexFactoryAbi, signer);
};

export const getIndexContract = (
  chainId: ChainId,
  address: string,
  version: string,
  signer?: ethers.Signer | ethers.providers.Provider
) => {
  if (version > "V1") {
    return getContract(chainId, address, IndexImplV2Abi, signer);
  }

  return getContract(chainId, address, IndexImplAbi, signer);
};

export const getOldIndexContract = (
  chainId: ChainId,
  address: string,
  signer?: ethers.Signer | ethers.providers.Provider
) => {
  return getContract(chainId, address, IndexAbi, signer);
};

export const getFlaskNftContract = (chainId: ChainId, signer?: ethers.Signer | ethers.providers.Provider) => {
  return getContract(chainId, getFlaskNftAddress(chainId), FlaskNftAbi, signer);
};

export const getMirrorNftContract = (chainId: ChainId, signer?: ethers.Signer | ethers.providers.Provider) => {
  return getContract(chainId, getMirrorNftAddress(chainId), MirrorNftAbi, signer);
};

export const getNftStakingContract = (chainId: ChainId, signer?: ethers.Signer | ethers.providers.Provider) => {
  return getContract(chainId, getNftStakingAddress(chainId), NftStakingAbi, signer);
};

export const getBrewlabsPairContract = (
  chainId: ChainId,
  address: string,
  signer?: ethers.Signer | ethers.providers.Provider
) => {
  return getContract(chainId, address, brewlabsPairAbi, signer);
};
export const getBrewlabsRouterContract = (
  chainId: ChainId,
  address: string,
  signer?: ethers.Signer | ethers.providers.Provider
) => {
  return getContract(chainId, address, brewlabsRouterAbi, signer);
};

export const getBrewlabsFeeManagerContract = (chainId: ChainId, signer?: ethers.Signer | ethers.providers.Provider) => {
  return getContract(chainId, getBrewlabsFeeManagerAddress(chainId), brewlabsFeeManagerAbi, signer);
};

export const getZapInContract = (chainId: ChainId, signer?: ethers.Signer | ethers.providers.Provider) => {
  return getContract(chainId, getZapperAddress(chainId), zapperAbi, signer);
};

export const getExternalMasterChefContract = (
  chainId: ChainId,
  appId: AppId,
  chef = Chef.MASTERCHEF,
  signer?: ethers.Signer | ethers.providers.Provider
) => {
  return getContract(chainId, getExternalMasterChefAddress(appId, chef), externalMasterChefAbi, signer);
};

export const getVerificationContract = (chainId: ChainId, signer?: ethers.Signer | ethers.providers.Provider) => {
  return getContract(chainId, getVerificationAddress(chainId), verifictionAbi, signer);
};

export const getPancakeMasterChefContract = (signer?: ethers.Signer | ethers.providers.Provider) => {
  return getContract(ChainId.BSC_MAINNET, getPancakeMasterChefAddress(), masterChefV2, signer);
};
