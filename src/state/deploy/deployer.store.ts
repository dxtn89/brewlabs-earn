import { z } from "zod";
import { tokenDeployerSchema } from "config/schemas/tokenDeployerSchema";
import { createGlobalState } from "react-hooks-global-state";

interface DeployerStore {
  deployNetwork: number;
  deployerStep: "details" | "confirm" | "deploy" | "success" | "error" | "loading";
  tokenInfo: z.infer<typeof tokenDeployerSchema>;
}

// Create a single global state object
const deployerStore = {
  deployNetwork: 1,
  deployerStep: "details",
  tokenInfo: {
    tokenName: "",
    tokenSymbol: "",
    tokenImage: undefined,
    tokenDecimals: 18,
    tokenTotalSupply: 0,
    tokenDescription: "",
  },
} as DeployerStore;

const { useGlobalState: useDeployerState, setGlobalState } = createGlobalState(deployerStore);

export const setTokenInfo = (tokenInfo: z.infer<typeof tokenDeployerSchema>) => {
  setGlobalState("tokenInfo", () => tokenInfo);
};

export const setDeployerStep = (step: DeployerStore["deployerStep"]) => {
  setGlobalState("deployerStep", () => step);
};

export { useDeployerState };
