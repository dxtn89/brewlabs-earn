import FlaskNftAbi from "config/abi/nfts/flaskNft.json";
import Erc20Abi from "config/abi/erc20.json";
import { getFlaskNftAddress } from "utils/addressHelpers";
import multicall from "utils/multicall";

export const fetchFlaskNftPublicData = async (chainId) => {
  const calls = [
    "mintFee",
    "brewsMintFee",
    "upgradeFee",
    "brewsUpgradeFee",
    "oneTimeLimit",
    "maxSupply",
    "totalSupply",
  ].map((method) => ({
    address: getFlaskNftAddress(chainId),
    name: method,
  }));

  const result = await multicall(FlaskNftAbi, calls, chainId);
  return {
    chainId,
    mintFee: { brews: result[1][0].toString(), stable: result[0][0].toString() },
    upgradeFee: { brews: result[3][0].toString(), stable: result[2][0].toString() },
    oneTimeLimit: result[4][0].toNumber(),
    maxSupply: result[5][0].toNumber(),
    totalSupply: result[6][0].toNumber(),
  };
};

export const fetchFlaskNftUserData = async (chainId, account, tokens) => {
  if (!account) return { chainId, userData: undefined };

  let result = await multicall(
    FlaskNftAbi,
    [{ address: getFlaskNftAddress(chainId), name: "balanceOf", params: [account] }],
    chainId
  );
  const balance = result[0][0].toNumber();

  let calls = [];
  for (let i = 0; i < balance; i++) {
    calls.push({
      address: getFlaskNftAddress(chainId),
      name: "tokenOfOwnerByIndex",
      params: [account, i],
    });
  }
  result = await multicall(FlaskNftAbi, calls, chainId);
  const tokenIds = result.map((tokenId) => tokenId[0].toNumber());

  calls = tokenIds.map((tokenId) => ({ address: getFlaskNftAddress(chainId), name: "rarityOf", params: [tokenId] }));
  result = await multicall(FlaskNftAbi, calls, chainId);

  const balances = tokenIds.map((tokenId, index) => ({
    tokenId,
    rarity: result[index][0].toNumber(),
  }));

  const allowances = await multicall(
    Erc20Abi,
    tokens.map((token) => ({ address: token, name: "allowance", params: [account, getFlaskNftAddress(chainId)] })),
    chainId
  );

  return { chainId, userData: { balances, allowances: allowances.map((allowance) => allowance[0].toString()) } };
};
