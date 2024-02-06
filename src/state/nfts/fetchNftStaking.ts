import NftStakingAbi from "config/abi/nfts/nftStaking.json";
import { getNftStakingAddress } from "utils/addressHelpers";
import multicall from "utils/multicall";

export const fetchNftStakingPublicData = async (chainId) => {
  const calls = ["performanceFee", "totalStaked", "oneTimeLimit", "startBlock", "bonusEndBlock", "rewardPerBlock"].map(
    (method) => ({
      address: getNftStakingAddress(chainId),
      name: method,
    })
  );

  const result = await multicall(NftStakingAbi, calls, chainId);
  return {
    chainId,
    performanceFee: result[0][0].toString(),
    totalStaked: result[1][0].toNumber(),
    oneTimeLimit: result[2][0].toNumber(),
    startBlock: result[3][0].toNumber(),
    bonusEndBlock: result[4][0].toNumber(),
    rewardPerBlock: result[5][0].toString(),
  };
};

export const fetchNftStakingUserData = async (chainId, account) => {
  if (!account) return { chainId, stakedInfo: { amount: 0, tokenIds: [] } };

  let result = await multicall(
    NftStakingAbi,
    [
      { address: getNftStakingAddress(chainId), name: "stakedInfo", params: [account] },
      { address: getNftStakingAddress(chainId), name: "pendingReward", params: [account] },
    ],
    chainId
  );

  return {
    chainId,
    userData: {
      stakedAmount: result[0][0].toNumber(),
      stakedTokenIds: result[0][1].map((t) => t.toNumber()),
      earnings: result[1][0].toString(),
    },
  };
};
