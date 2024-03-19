import { z } from "zod";
import { tokenDeployerSchema } from "config/schemas/tokenDeployerSchema";
import { createGlobalState } from "react-hooks-global-state";

interface DeployerStore {
  deployedAddress: string;
  tokenImageDisplayUrl: string;
  deployerStep: "details" | "confirm" | "success";
  tokenInfo: z.infer<typeof tokenDeployerSchema>;
}

// Create a single global state object
const deployerStore = {
  deployedAddress: "",
  deployerStep: "details",
  tokenImageDisplayUrl: "",
  tokenInfo: {
    tokenName: "",
    tokenSymbol: "",
    tokenImage: undefined,
    tokenDecimals: 9,
    tokenTotalSupply: 1000,
    tokenDescription: "Token Description",
    tokenImmutable: false,
    tokenRevokeFreeze: false,
    tokenRevokeMint: false,
    // tokenBurnPercentage: "0",
  },
} as DeployerStore;

const { useGlobalState: useDeployerState, setGlobalState } = createGlobalState(deployerStore);

export const setTokenInfo = (tokenInfo: z.infer<typeof tokenDeployerSchema>) => {
  setGlobalState("tokenInfo", () => tokenInfo);
};

export const setDeployerStep = (step: DeployerStore["deployerStep"]) => {
  setGlobalState("deployerStep", () => step);
};

export const setDeployedAddress = (deployedAddress: string) => {
  setGlobalState("deployedAddress", () => deployedAddress);
};

export const setTokenImageDisplayUrl = (tokenImageDisplayUrl: string) => {
  setGlobalState("tokenImageDisplayUrl", () => tokenImageDisplayUrl);
};

export { useDeployerState };
