import { createWeb3Modal, defaultWagmiConfig } from "@web3modal/wagmi/react";
import { Metadata, ProjectId } from "config/constants/wagmi";

import { WagmiConfig } from "wagmi";
import { bsc, mainnet, arbitrum, polygon, avalanche, fantom, cronos, brise, bscTestnet, goerli } from "../chains";

const chains = [bsc, mainnet, arbitrum, polygon, avalanche, fantom, cronos, brise, bscTestnet, goerli];
const wagmiConfig = defaultWagmiConfig({
  chains,
  projectId: ProjectId,
  metadata: Metadata,
});
const ledgerId = '19177a98252e07ddfc9af2083ba8e07ef627cb6103467ffebb3f8f4205fd7927';
createWeb3Modal({ wagmiConfig, projectId: ProjectId, chains, excludeWalletIds: [ledgerId] });

export function WagmiProvider(props) {
  return <WagmiConfig config={wagmiConfig}>{props.children}</WagmiConfig>;
}
