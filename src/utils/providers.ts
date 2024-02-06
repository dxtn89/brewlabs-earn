import { NETWORKS } from "config/constants/networks";
import { ethers } from "ethers";
import { sample } from "lodash";

export const simpleRpcProvider = (chainId: number) =>
  new ethers.providers.JsonRpcProvider(sample(NETWORKS[chainId] ? NETWORKS[chainId].rpcUrls : NETWORKS[56].rpcUrls));

// eslint-disable-next-line import/no-anonymous-default-export
export default null;
