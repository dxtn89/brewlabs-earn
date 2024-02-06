import { ChainId, WNATIVE } from "@brewlabs/sdk";

import TokenFactoryAbi from "config/abi/token/factory.json";
import { tokens } from "config/constants/tokens";
import { ethers } from "ethers";
import { serializeToken } from "state/user/hooks/helpers";
import { isAddress } from "utils";
import { getTokenFactoryAddress } from "utils/addressHelpers";
import multicall from "utils/multicall";

export const fetchTokenFactoryData = async (chainId: ChainId) => {
  const calls = [
    {
      address: getTokenFactoryAddress(chainId),
      name: "payingToken",
    },
    {
      address: getTokenFactoryAddress(chainId),
      name: "serviceFee",
    },
  ];
  const result = await multicall(TokenFactoryAbi, calls, chainId);
  return {
    chainId,
    payingToken: {
      ...serializeToken(
        Object.values(tokens[chainId]).find(
          (t: any) => t.address === result[0][0] || (result[0][0] === ethers.constants.AddressZero && t.isNative)
        )
      ),
      address: isAddress(result[0][0]),
    },
    serviceFee: result[1][0].toString(),
  };
};
