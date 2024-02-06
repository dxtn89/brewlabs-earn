import { ChainId } from "@brewlabs/sdk";
import axios from "axios";
import { API_URL } from "config/constants";

export async function getMarketDatas(chainId: ChainId) {
  try {
    const { data: response } = await axios.get(`${API_URL}/cg/prices?chainId=${chainId}`);
    return response.prices;
  } catch (e) {
    console.log(e);
    return {};
  }
}
