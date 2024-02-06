import axios from "axios";
import { TOKENLIST_URI } from "config/constants";
import { customTokensForDeploy } from "config/constants/tokens";

export async function fetchTokenList(chainId: number) {
  try {
    if (!TOKENLIST_URI[chainId]) {
      return customTokensForDeploy[chainId] ?? [];
    }
    const result = await axios.get(TOKENLIST_URI[chainId]);
    return [...(customTokensForDeploy[chainId] ?? []), ...result.data.tokens];
  } catch (error) {
    console.log(error);
    return [];
  }
}
