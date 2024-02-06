import { ChainId } from "@brewlabs/sdk";
import Soon from "@components/Soon";
import { XMarkSVG, checkCircleSVG } from "@components/dashboard/assets/svgs";
import Container from "@components/layout/Container";
import { NETWORKS } from "config/constants/networks";
import { useEffect, useState } from "react";
import { getChainLogo } from "utils/functions";
import StyledButton from "views/directory/StyledButton";

const FindProject = () => {
  const networks = [
    NETWORKS[ChainId.ETHEREUM],
    NETWORKS[ChainId.BSC_MAINNET],
    NETWORKS[8453],
    NETWORKS[ChainId.POLYGON],
    NETWORKS[ChainId.AVALANCHE],
    NETWORKS[ChainId.FANTOM],
    NETWORKS[ChainId.ARBITRUM],
  ];

  const [selectedNetwork, setSelectedNetwork] = useState(0);
  const [selectedItem, setSelectedItem] = useState(0);

  useEffect(() => {
    setSelectedItem(0);
  }, [selectedNetwork]);

  const airdropSubLinks = {
    [ChainId.ETHEREUM]: "eth",
    [ChainId.BSC_MAINNET]: "bsc",
    [ChainId.POLYGON]: "matic",
    [ChainId.AVALANCHE]: "avax",
    [ChainId.FANTOM]: "ftm",
    [ChainId.BASE]: "base",
    [ChainId.ARBITRUM]: "arbitrum",
  };

  const items = [
    {
      name: "Airdrop tool",
      link: "https://brewlabs-airdrop.tools/",
      detail:
        "Brewlabs airdrop tool is a simple multisend tool that allows users to transfer tokens or NFTs to target wallets. Transfer tokens to hundreds or thousands of addresses quickly and seemlessly with this affordable solution to suite your multi-transfer needs.",
      activeNetwork: [
        ChainId.ETHEREUM,
        ChainId.BSC_MAINNET,
        ChainId.POLYGON,
        ChainId.AVALANCHE,
        ChainId.FANTOM,
        ChainId.BASE,
        ChainId.ARBITRUM,
      ],
      isSoon: [],
    },
    {
      name: "Decentralised Exchange",
      link: "https://earn.brewlabs.info/swap",
      detail:
        "BrewSwap allow users to swap pairs of tokens in a decentralised liquidity pools. Liquidity providers can earn fees in real time for the provision of liquidity. ",
      activeNetwork: [ChainId.POLYGON],
      isSoon: [ChainId.ETHEREUM, ChainId.BSC_MAINNET],
      isBeta: [ChainId.POLYGON],
    },
    {
      name: "Staking",
      link: "https://earn.brewlabs.info/staking",
      detail:
        "Teams can deploy staking pools directly to the Brewlabs pool directory. Staking pools are similar to real world term deposits, users will lock tokens for a period of time and earn interest on they locked tokens.",
      activeNetwork: [ChainId.ETHEREUM, ChainId.BSC_MAINNET, ChainId.POLYGON],
      isSoon: [],
    },
    {
      name: "Yield farm",
      link: "https://earn.brewlabs.info/farm",
      detail:
        "Teams can deploy yield farms directly to the Brewlabs pool directory. Yield farms incentivise user to create and stake liquidity tokens for certain pairs, when a user stakes a liquidity token, the user can earn a reward.",
      activeNetwork: [ChainId.ETHEREUM, ChainId.BSC_MAINNET, ChainId.POLYGON],
      isSoon: [],
    },
    {
      name: "Yield farm deployer",
      link: "https://earn.brewlabs.info/deployer/farm",
      detail:
        "Teams can use this tool to deploy a yield farm for their project, the deployer wizard will create the contract for the team and post it to the yield farm directory",
      activeNetwork: [ChainId.ETHEREUM, ChainId.BSC_MAINNET, ChainId.POLYGON, ChainId.BASE, ChainId.ARBITRUM],
      isSoon: [],
    },
    {
      name: "Token deployer",
      link: "/deployer/token",
      detail:
        "Teams can use this tool to deploy a token for their project, the deployer wizard will create the contract for the team and post it to the token directory",
      activeNetwork: [ChainId.ETHEREUM, ChainId.BSC_MAINNET, ChainId.POLYGON],
      isSoon: [],
    },
    {
      name: "Indexes",
      link: "https://earn.brewlabs.info/indexes",
      detail:
        "A simple tool to allow a user to create baskets (index) of up to 5 tokens that can be purchased in a single transaction. Users can share their index with other users and communities. Earn a commission when a user enter and exits your index.",
      activeNetwork: [ChainId.BSC_MAINNET, ChainId.POLYGON],
      isSoon: [],
    },
    {
      name: "Zapper",
      link: "https://earn.brewlabs.info/zapper",
      detail:
        "Create liquidity positions across various yield farms within your selected network with a simple one-click entry. Easily convert your earned rewards into stablecoins.",
      activeNetwork: [ChainId.ETHEREUM, ChainId.BSC_MAINNET],
      isSoon: [],
    },
    {
      name: "Swap aggegation",
      link: "https://earn.brewlabs.info/swap",
      detail:
        "BrewSwap will seek to find the best price for your swap across multiple liquidity pools, this tool will always quote the user the best price and pathway to take, then allow the user to process the quoted swap.",
      activeNetwork: [ChainId.ETHEREUM, ChainId.BSC_MAINNET, ChainId.POLYGON],
      isSoon: [],
    },
    {
      name: "Communities",
      link: "https://earn.brewlabs.info/communities",
      detail:
        "A tool allowing teams and token holders to freely or with a fee to post proposals, polls, important community decisions, bounties and noteworthy news. ",
      activeNetwork: [ChainId.ETHEREUM, ChainId.BSC_MAINNET, ChainId.POLYGON],
      isSoon: [],
    },
    {
      name: "Constructor",
      link: "https://earn.brewlabs.info/constructor",
      detail:
        "The core tool that creates liquidity pairs for users, if you are exploring liquidity provision, this tool will allow you to make a pair for your desired liquidity pool. ",
      activeNetwork: [ChainId.ETHEREUM, ChainId.BSC_MAINNET],
      isSoon: [],
    },
    {
      name: "NFT Staking",
      link: "https://earn.brewlabs.info/nftstaking",
      detail:
        "Brewlabs NFTs offer a range of benefits across multiple products and platforms. Find out more about the Brewlabs NFT value proposition, long term use case and earning features as a Brewlabs NFT holder.",
      activeNetwork: [ChainId.ETHEREUM, ChainId.BSC_MAINNET],
      isSoon: [],
    },
    {
      name: "Token Bridge",
      link: "https://earn.brewlabs.info/bridge",
      detail: "Transfer a range of assets between networks. Including layer one and layer two networks.",
      activeNetwork: [],
      isSoon: [],
    },
    {
      name: "LP Token lock",
      link: "https://freezer.brewlabs.info",
      detail: "Lock your liquidity with the Brewlabs Freezer, a token locking and vesting platform",
      activeNetwork: [ChainId.ETHEREUM, ChainId.BSC_MAINNET],
      isSoon: [],
    },
    {
      name: "Brewlabs token bridge",
      link: "https://earn.brewlabs.info/bridge",
      detail: "Transfer your Brewlabs token between networks with this tool.",
      activeNetwork: [ChainId.ETHEREUM, ChainId.BSC_MAINNET, ChainId.POLYGON],
      isSoon: [],
    },
    {
      name: "Treasury",
      link: {
        [ChainId.ETHEREUM]: "https://etherscan.io/tokenholdings?a=0x64961Ffd0d84b2355eC2B5d35B0d8D8825A774dc",
        [ChainId.BSC_MAINNET]: "https://bscscan.com/tokenholdings?a=0x5Ac58191F3BBDF6D037C6C6201aDC9F99c93C53A",
      },
      detail:
        "Visit the Brewlabs treasury on this network, observe the balances and fees collected by a range of products and tools in real-time.",
      activeNetwork: [ChainId.ETHEREUM, ChainId.BSC_MAINNET],
      isSoon: [],
    },
    {
      name: "Charting tools",
      link: "https://earn.brewlabs.info/chart",
      detail:
        "BrewCharts allow simple cryptocurrency charting for users including of orderboook, community information and score, swap and advdance charting tools for users.",
      activeNetwork: [ChainId.ETHEREUM, ChainId.BSC_MAINNET],
      isSoon: [],
    },
  ];

  return (
    <Container>
      <div>
        <h2 className="font-brand text-lg font-semibold leading-8 tracking-widest text-dark dark:text-brand">
          Find a product
        </h2>
        <p className="mt-2 font-brand text-4xl font-bold tracking-widest text-gray-900">Product and tool suite</p>
        <p className="mt-4 text-base leading-7 text-gray-600">
          Each listed product or tool generates income for the Brewlabs ecosystem.
        </p>
      </div>

      <div className="mt-10 flex flex-wrap justify-between gap-y-12">
        <div>
          {networks.map((network, i) => {
            return (
              <div
                className={`${
                  selectedNetwork === i ? "bg-[#4B5563] text-white" : "bg-[#4B556340] text-[#FFFFFF40] hover:opacity-70"
                } primary-shadow mb-2.5 flex w-[200px] cursor-pointer items-center rounded-[12px] p-[6px_16px] font-roboto font-bold transition`}
                key={i}
                onClick={() => setSelectedNetwork(i)}
              >
                <img
                  src={getChainLogo(parseInt(network.chainId))}
                  alt={""}
                  className="mr-4 h-[18px] w-[18px] rounded-full"
                />
                <div className="overflow-hidden text-ellipsis whitespace-nowrap text-sm">{network.chainName}</div>
              </div>
            );
          })}
        </div>

        <div className="flex flex-col flex-wrap gap-x-12 text-sm sm:max-h-72">
          {items.map((item: any, i) => {
            return (
              <div key={i}>
                <div
                  className={`${
                    selectedItem === i
                      ? "text-primary"
                      : item.activeNetwork.includes(parseInt(networks[selectedNetwork].chainId))
                      ? "text-white hover:opacity-70"
                      : "text-tailwind"
                  } my-1.5 mr-8 flex cursor-pointer items-center font-roboto font-bold`}
                  onClick={() =>
                    item.activeNetwork.includes(parseInt(networks[selectedNetwork].chainId)) && setSelectedItem(i)
                  }
                >
                  <div className="mr-1.5 [&>svg]:h-4 [&>svg]:w-4">
                    {item.activeNetwork.includes(parseInt(networks[selectedNetwork].chainId))
                      ? checkCircleSVG
                      : XMarkSVG}
                  </div>
                  <div>{item.name}</div>
                  {item.isSoon.includes(parseInt(networks[selectedNetwork].chainId)) ? (
                    <Soon className="!relative !top-0 !text-[10px]" />
                  ) : (
                    ""
                  )}
                  {(item?.isBeta ?? []).includes(parseInt(networks[selectedNetwork].chainId)) ? (
                    <Soon className="!relative !top-0 !text-[10px]" text={"Beta"} />
                  ) : (
                    ""
                  )}
                </div>

                {selectedItem === i ? (
                  <div className="primary-shadow my-4 flex h-fit w-full flex-col rounded-2xl bg-zinc-800 p-6 font-brand xsm:hidden">
                    <div className="text-2xl text-primary">{items[selectedItem].name}</div>
                    <div className="mt-4 text-xs text-white">{items[selectedItem].detail}</div>
                    <div className="flex w-full flex-1 items-end justify-end">
                      <a
                        target="_blank"
                        href={
                          selectedItem === 14
                            ? items[selectedItem].link[parseInt(networks[selectedNetwork].chainId)]
                            : items[selectedItem].link
                        }
                      >
                        <StyledButton className="!h-fit !w-fit p-[8px_12px]">Go to tool</StyledButton>
                      </a>
                    </div>
                  </div>
                ) : (
                  ""
                )}
              </div>
            );
          })}
        </div>

        {selectedItem !== -1 ? (
          <div className="primary-shadow hidden h-fit w-full flex-col rounded-2xl bg-zinc-800 p-6 font-brand xsm:flex lg:w-96 ">
            <h4 className="text-2xl font-bold text-primary">{items[selectedItem].name}</h4>
            <p className="mt-4 text-xs tracking-wider text-white">{items[selectedItem].detail}</p>
            <div className="flex w-full flex-1 items-end justify-end">
              <a
                target="_blank"
                href={
                  selectedItem === 0
                    ? items[selectedItem].link + airdropSubLinks[parseInt(networks[selectedNetwork].chainId)]
                    : selectedItem === 14
                    ? items[selectedItem].link[parseInt(networks[selectedNetwork].chainId)]
                    : items[selectedItem].link
                }
              >
                <button className="btn-secondary btn mt-4">Go to tool</button>
              </a>
            </div>
          </div>
        ) : (
          ""
        )}
      </div>
    </Container>
  );
};

export default FindProject;
