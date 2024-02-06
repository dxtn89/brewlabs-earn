import { ChainId } from "@brewlabs/sdk";
import { tokens } from "config/constants/tokens";

export const communities = [
  {
    pid: 1,
    name: "Brewlabs",
    members: 0,
    activeProposals: 0,
    archivedProposals: 0,
    engagement: 0,
    logo: "/images/governance/brewlabs.png",
    currencies: {
      [ChainId.ETHEREUM]: tokens[ChainId.ETHEREUM].brews,
      [ChainId.BSC_MAINNET]: tokens[ChainId.BSC_MAINNET].brews,
      [ChainId.POLYGON]: tokens[ChainId.POLYGON].brews,
    },
    symbol: "Brewlabs",
    type: "token",
    socials: {
      telegram: "https://t.me/brewlabs",
      website: "https://brewlabs.info",
    },
    coreChainId: ChainId.BSC_MAINNET,
    description: `Brewlabs offers a range of decentralised on chain products for users and teams to utilise.\n\n
      As a user you can find all the tools needed to support your decision making and revenue streams on-chain within the Brewlabs platform, managed your portfolio and swap tokens.
      \n\n
      Teams can also utilise Brewlabs platform as a source of web3 tools and deployable smart contract products.`,
    proposals: [],
    totalSupply: "1000000000",
    treasuries: {
      [ChainId.ETHEREUM]: ["0x64961ffd0d84b2355ec2b5d35b0d8d8825a774dc"],
      [ChainId.BSC_MAINNET]: [
        "0x5Ac58191F3BBDF6D037C6C6201aDC9F99c93C53A",
        "0x408c4aDa67aE1244dfeC7D609dea3c232843189A",
      ],
      [ChainId.POLYGON]: ["0x3f0DaF02b9cF0DBa7aeF41C1531450Fda01E8ae9"],
    },
  },
];
