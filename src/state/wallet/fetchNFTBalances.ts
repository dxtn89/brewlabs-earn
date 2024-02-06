import { ChainId } from "@brewlabs/sdk";
import axios from "axios";
import { COVALENT_API_KEYS, COVALENT_CHAIN_NAME } from "config";
import { isAddress } from "utils";
import { formatIPFSString } from "utils/functions";

async function fetchETHNFTs(account: string, chainId: ChainId) {
  try {
    let _ownedNFTs = [];
    let pageKey;
    do {
      const baseURL = `https://eth-mainnet.g.alchemy.com/v2/bXqwnLZHuGoI2wcSnabNiQJL0K83OTnQ`;
      const url = `${baseURL}/getNFTs/?owner=${account}&pageKey=${pageKey}`;
      const response = await axios.get(url);
      _ownedNFTs.push(...response.data.ownedNfts);
      pageKey = response.data.pageKey;
    } while (pageKey);
    let ownedNFTs = [];
    for (let i = 0; i < _ownedNFTs.length; i++) {
      const data = _ownedNFTs[i];

      const isAnimation = data.metadata.animation_url && data.metadata.animation_url.length;
      let animation = isAnimation ? data.metadata.animation_url : null;
      let image = data.metadata.image;
      animation = animation ?? "";
      image = image ?? "";
      animation = formatIPFSString(animation);
      image = formatIPFSString(image);

      let collectionName = data.contractMetadata.openSea.collectionName ?? data.contractMetadata.name;
      collectionName = collectionName ?? "Unknown";

      let name = data.title === "" ? collectionName : data.title;
      name = name === "" ? "Unknown" : name;

      ownedNFTs.push({
        type: data.contractMetadata.tokenType,
        collectionName,
        address: data.contract.address,
        description: data.description,
        logo: image,
        chainId: 1,
        balance: data.balance,
        name,
        tokenId: BigInt(_ownedNFTs[i].id.tokenId).toString(),
      });
    }
    return ownedNFTs;
  } catch (e) {
    console.log(e);
  }
}

async function fetchBSCNFT(account: string, chainId: ChainId) {
  try {
    const { data: response } = await axios.get(
      `https://api.covalenthq.com/v1/${COVALENT_CHAIN_NAME[chainId]}/address/${account}/balances_nft/?`,
      { headers: { Authorization: `Bearer ${COVALENT_API_KEYS[0]}` } }
    );
    if (response.error) return [];
    const items = response.data.items;
    let ownedNFTs = [];
    items.map((item) =>
      item.nft_data.map((nft) => {
        ownedNFTs.push({
          type: item.supports_erc.includes("erc721") ? "erc721" : "erc1155",
          collectionName: item.contract_name,
          address: response.data.address,
          description: nft.external_data?.description ?? "",
          logo: nft.external_data?.image ?? "",
          chainId,
          balance: item.balance,
          name: nft.external_data?.name ?? item.contract_name,
          tokenId: BigInt(nft.token_id).toString(),
        });
      })
    );
    return ownedNFTs;
  } catch (e) {
    console.log(e);
  }
}

export async function getNFTBalances(account: string, chainId: ChainId) {
  if (!isAddress(account) || !Object.keys(COVALENT_CHAIN_NAME).includes(chainId.toString())) return [];

  if (chainId === ChainId.BSC_MAINNET) {
    const nfts = await fetchBSCNFT(account, chainId);
    return nfts;
  } else {
    const nfts = await fetchETHNFTs(account, chainId);
    return nfts;
  }
}
