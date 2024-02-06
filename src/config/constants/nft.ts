import { ChainId } from "@brewlabs/sdk";
import { tokens } from "./tokens";

export enum NFT_RARITY {
  COMMON,
  UNCOMMON,
  RARE,
  EPIC,
  LEGENDARY,
  MOD,
}

export enum NFT_RARITY_NAME {
  "Common",
  "Uncommon",
  "Rare",
  "Epic",
  "Legendary",
  "Mod",
}

export const stableCoins = {
  [ChainId.ETHEREUM]: [tokens[ChainId.ETHEREUM].usdc, tokens[ChainId.ETHEREUM].usdt],
  [ChainId.BSC_MAINNET]: [tokens[ChainId.BSC_MAINNET].busd, tokens[ChainId.BSC_MAINNET].usdt],
  [ChainId.POLYGON]: [tokens[ChainId.POLYGON].usdc, tokens[ChainId.POLYGON].usdt],
  [ChainId.BSC_TESTNET]: [tokens[ChainId.BSC_TESTNET].busd],
};

export const rarities = [
  {
    type: "Common",
    benefits: ["50.00% Mint chance", "5.00% Fee reduction across utilities", "Some features"],
    isUpgradeable: true,
    isActive: false,
    features: {
      title: "Some Features",
      data: ["Extended favourites in BrewCharts", "Complete trending heatmap"],
    },
    chainId: 1,
    logo: "/images/nfts/brewlabs-flask-nfts/brewlabs-flask-common.mp4",
    mintLogo: "/images/nfts/brewlabs-flask-nfts/brewlabs-mint-animation-common.mp4",
  },
  {
    type: "Uncommon",
    benefits: ["37.70% Mint chance", "10.00% Fee reduction across utilities", "Governance proposals", "Some features"],
    isUpgradeable: true,
    isActive: false,
    features: {
      title: "Features",
      data: ["Some advertising across BrewCharts", "Extended favourites in BrewCharts", "Complete trending heatmap"],
    },
    chainId: 1,
    logo: "/images/nfts/brewlabs-flask-nfts/brewlabs-flask-uncommon.mp4",
    mintLogo: "/images/nfts/brewlabs-flask-nfts/brewlabs-mint-animation-uncommon.mp4",
  },
  {
    type: "Rare",
    benefits: [
      "10.00% Mint chance",
      "15.00% Fee reduction across utilities",
      "Brewlabs NFT Staking",
      "Governance proposals",
      "Standard Brewer features ",
    ],
    isUpgradeable: false,
    isActive: false,
    features: {
      title: "Standard Brewer Features",
      data: [
        "Access to launch whitelists",
        "Removal of all advertising across BrewCharts",
        "Extended favourites in BrewCharts",
        "Complete trending heatmap",
        "More to come as we build",
      ],
    },
    chainId: 1,
    logo: "/images/nfts/brewlabs-flask-nfts/brewlabs-flask-rare.mp4",
    mintLogo: "/images/nfts/brewlabs-flask-nfts/brewlabs-mint-animation-rare.mp4",
  },
  {
    type: "Epic",
    benefits: [
      "2.00% Mint chance",
      "20.00% Fee reduction across utilities",
      "Brewlabs NFT Staking",
      "Governance proposals",
      "Premium features ",
    ],
    isUpgradeable: false,
    isActive: false,
    features: {
      title: "Premium features",
      data: [
        "Access to project seed rounds",
        "Access to launch whitelists",
        "5.00% discount on development fees",
        "5.00% discount on subscription costs",
        "Removal of all advertising across BrewCharts",
        "Extended favourites in BrewCharts",
        "Complete trending heatmap",
        "More to come as we build",
      ],
    },
    chainId: 1,
    logo: "/images/nfts/brewlabs-flask-nfts/brewlabs-flask-epic.mp4",
    mintLogo: "/images/nfts/brewlabs-flask-nfts/brewlabs-mint-animation-epic.mp4",
  },
  {
    type: "Legendary / Moderator",
    benefits: [
      "0.30% Mint chance",
      "30.00% Fee reduction across utilities",
      "Brewlabs NFT Staking",
      "Governance proposals",
      "Premium Brewer Features ",
    ],
    isUpgradeable: false,
    isActive: false,
    features: {
      title: "Premium Brewer Features",
      data: [
        "Access to project seed rounds",
        "Access to launch whitelists",
        "10.00% discount on development fees",
        "10.00% discount on subscription costs",
        "Removal of all advertising across BrewCharts",
        "Extended favourites in BrewCharts",
        "Complete trending heatmap",
        "More to come as we build",
      ],
    },
    chainId: 1,
    logo: "/images/nfts/brewlabs-flask-nfts/brewlabs-flask-legendary.mp4",
    mintLogo: "/images/nfts/brewlabs-flask-nfts/brewlabs-mint-animation-legendary.mp4",
  },
];

export const NFT_RARE_COUNT = { [ChainId.ETHEREUM]: 3, [ChainId.BSC_MAINNET]: 37 };
