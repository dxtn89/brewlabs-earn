import { ChainId, NATIVE_CURRENCIES, Token, WNATIVE } from "@brewlabs/sdk";

const { ARBITRUM } = ChainId;
const tokens = {
  eth: NATIVE_CURRENCIES[ChainId.ARBITRUM],
};

export default tokens;
