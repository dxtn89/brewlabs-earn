import { DeployerSVG, CommunitySVG, NFTSVG } from "@components/dashboard/assets/svgs";
import { IconName } from "@components/DynamicHeroIcon";

type NavigationItem = {
  name: string;
  href: string;
  external: boolean;
  icon: IconName;
  isBeta?: boolean;
  isNew?: boolean;
  svg?: boolean;
  newItem?: number;
};

export const navigationData = [
  {
    name: "Home",
    href: "/",
    external: false,
    icon: "HomeIcon",
  },
  {
    name: "Chart",
    href: "/chart/bsc/0xc9cc6515a1df94aaed156f3bd6efe86a100308fa",
    external: false,
    icon: "PresentationChartLineIcon",
  },
  {
    name: "Invest",
    href: "/staking",
    external: false,
    icon: "ClockIcon",
  },

  {
    name: "Indexes",
    href: "/indexes",
    external: false,
    icon: "Bars3CenterLeftIcon",
  },
  {
    name: "Bridge",
    href: "/bridge",
    external: false,
    icon: "ArrowsRightLeftIcon",
  },

  {
    name: "Swap",
    href: "/swap",
    external: false,
    icon: "ArrowPathRoundedSquareIcon",
  },
  {
    name: "Constructor",
    href: "/constructor",
    external: false,
    icon: "ArrowDownOnSquareIcon",
  },
  {
    name: "Product deployer",
    href: "/deployer",
    external: false,
    icon: "ArrowDownOnSquareIcon",
    svg: DeployerSVG,
    isNew: true,
  },
  {
    name: "Brewlabs NFT",
    href: "/nft",
    external: false,
    icon: "ShoppingBagIcon",
    svg: NFTSVG,
  },
  {
    name: "Communities",
    href: "/communities",
    external: false,
    icon: "ShoppingBagIcon",
    svg: CommunitySVG,
    newItem: 5,
  },
] as NavigationItem[];

export const navigationExtraData = [
  // {
  //   name: "TrueNFT",
  //   href: "https://truenft.io",
  //   external: true,
  //   icon: "PaperAirplaneIcon",
  //   svg: NFTSVG,
  // },
  {
    name: "Airdrop tools",
    href: "https://brewlabs-airdrop.tools/bsc",
    external: true,
    icon: "PaperAirplaneIcon",
  },
  {
    name: "Brewlabs Factory",
    href: "https://brewlabs.info/factory",
    external: true,
    icon: "BuildingOffice2Icon",
  },
  {
    name: "Brewlabs docs",
    href: "https://brewlabs.gitbook.io/welcome-to-brewlabs/important-docs/brewlabs-dapp-terms-of-service",
    external: true,
    icon: "DocumentTextIcon",
  },
] as NavigationItem[];
