import MirrorNftAbi from "config/abi/nfts/mirrorNft.json";
import { getFlaskNftAddress, getMirrorNftAddress } from "utils/addressHelpers";
import multicall from "utils/multicall";

export const fetchMirrorNftUserData = async (chainId, account) => {
  if (!account) return { chainId, userData: undefined };

  let result = await multicall(
    MirrorNftAbi,
    [{ address: getMirrorNftAddress(chainId), name: "balanceOf", params: [account] }],
    chainId
  );
  const balance = result[0][0].toNumber();
  if (balance == 0) return { chainId, userData: { balances: [] } };

  let calls = [];
  for (let i = 0; i < balance; i++) {
    calls.push({
      address: getMirrorNftAddress(chainId),
      name: "tokenOfOwnerByIndex",
      params: [account, i],
    });
  }
  result = await multicall(MirrorNftAbi, calls, chainId);
  const tokenIds = result.map((tokenId) => tokenId[0].toNumber());

  calls = tokenIds.map((tokenId) => ({ address: getFlaskNftAddress(chainId), name: "rarityOf", params: [tokenId] }));
  result = await multicall(MirrorNftAbi, calls, chainId);

  const balances = tokenIds.map((tokenId, index) => ({
    tokenId,
    rarity: result[index][0].toNumber(),
  }));

  return { chainId, userData: { balances } };
};
