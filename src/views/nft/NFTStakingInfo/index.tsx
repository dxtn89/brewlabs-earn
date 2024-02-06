/* eslint-disable react-hooks/exhaustive-deps */
import { motion, AnimatePresence } from "framer-motion";
import { Tooltip as ReactTooltip } from "react-tooltip";

import Container from "components/layout/Container";
import PageWrapper from "components/layout/PageWrapper";
import WordHighlight from "components/text/WordHighlight";
import StyledButton from "views/directory/StyledButton";
import { InfoSVG, chevronLeftSVG } from "@components/dashboard/assets/svgs";
import { useState } from "react";
import MintNFTModal from "../Modals/MintNFTModal";
import Link from "next/link";
import { getChainLogo, numberWithCommas } from "utils/functions";
import { useOETHMonthlyAPY } from "@hooks/useOETHAPY";
import useTokenBalances from "@hooks/useTokenMultiChainBalance";
import { tokens } from "config/constants/tokens";
import { NFT_RARE_COUNT } from "config/constants/nft";
import { SkeletonComponent } from "@components/SkeletonComponent";
import useTokenPrice, { useDexPrice } from "@hooks/useTokenPrice";
import { useAllNftData } from "state/nfts/hooks";
import { WNATIVE } from "@brewlabs/sdk";
import { BLOCK_TIMES, SECONDS_PER_YEAR } from "config";
import { formatEther, formatUnits } from "ethers/lib/utils";

const NFTStakingInfo = () => {
  const [mintOpen, setMintOpen] = useState(false);

  const { flaskNft: flaskNfts, data } = useAllNftData();

  const chainId = 56;
  let flaskNft = flaskNfts.find((p) => p.chainId === chainId);
  flaskNft = flaskNft ?? flaskNfts[0];

  const ethPrice = useTokenPrice(chainId, WNATIVE[chainId].address);
  const brewsPrice = useTokenPrice(chainId, flaskNft.brewsToken.address);
  const pool = data.find((p) => p.chainId === chainId);

  const apr =
    flaskNft.mintFee && pool?.totalStaked
      ? (((+formatEther(pool?.rewardPerBlock ?? "0") * ethPrice * SECONDS_PER_YEAR) / BLOCK_TIMES[chainId]) * 100) /
        ((+formatUnits(flaskNft.mintFee.stable, flaskNft.stableTokens[0].decimals) +
          +formatUnits(flaskNft.mintFee.brews, flaskNft.brewsToken.decimals) * brewsPrice) *
          (pool?.totalStaked ?? 0))
      : 0;

  const OETHMontlyAPY = useOETHMonthlyAPY();
  const { balances: NFT_wallet_balance } = useTokenBalances(
    { 1: [tokens[1].oeth, tokens[1].oeth] },
    {
      1: ["0x5b4b372Ef4654E98576301706248a14a57Ed0164", "0xEDDcEa807da853Fed51fa4bF0E8d6C9d1f7f9Caa"],
    }
  );

  const { price: OETHPrice } = useDexPrice(1, tokens[1].oeth.address);

  const infos = [
    {
      title: "Stake Brewlabs NFT",
      logo: "/images/nfts/brewlabs-flask-nfts/brewlabs-flask-rare.png",
      info: {
        title: "What happens when I stake my NFT?",
        detail: [
          "When your NFT is staked you will earn the native currency of the network where you have staked (BNB / ETH / MATIC).",
          "Users can only stake one NFT at a time.",
          "Unstake at anytime.",
        ],
      },
      tooltip: "Staking Brewlabs NFT incurs a performance fee of approximately $2.00 in network currency.",
    },
    {
      title: "Receive Brewlabs Mirror NFT",
      logo: "/images/nfts/brewlabs-flask-nfts/brewlabsflasknft-rare-copy.png",
      info: {
        title: "What is a Brewlabs Mirror NFT?",
        detail: [
          "When staking, your Brewlabs NFT leaves your wallet and enters the staking contract.",
          "The NFT staking contract will mint and transfer to your wallet a Brewlabs Mirror NFT.",
          "Brewlabs dAPPS can then register your wallet for the appropriate benefits via the identification of your Brewlabs Mirror NFT.",
          "Brewlabs Mirror NFT’s are non transferable and burnt when you unstake your Brewlabs NFT.",
        ],
      },
      tooltip: "Unstaking Brewlabs NFT incurs a performance fee of approximately $2.00 in network currency.",
    },
  ];

  const aprByNetworks = [
    {
      chainId: 1,
      apr: 0,
      totalPosition: NFT_wallet_balance && OETHPrice ? NFT_wallet_balance[1][0].balance * OETHPrice : null,
      weeklyROI:
        OETHPrice && OETHMontlyAPY && NFT_wallet_balance
          ? NFT_wallet_balance[1][0].balance * OETHPrice * OETHMontlyAPY
          : null,
      chainName: "ETH",
    },

    {
      chainId: 56,
      apr: apr,
      totalPosition: NFT_wallet_balance && OETHPrice ? NFT_wallet_balance[1][1].balance * OETHPrice : null,
      weeklyROI:
        OETHPrice && OETHMontlyAPY && NFT_wallet_balance
          ? NFT_wallet_balance[1][1].balance * OETHPrice * OETHMontlyAPY
          : null,
      chainName: "BNB",
    },

    {
      chainId: 137,
      apr: null,
      totalPosition: null,
      weeklyROI: null,
      chainName: "MATIC",
    },
  ];
  return (
    <PageWrapper>
      <MintNFTModal open={mintOpen} setOpen={setMintOpen} />
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, scale: 0.75 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="absolute left-0 top-0 max-h-screen w-full overflow-y-scroll">
            <Container className="pb-10 pt-20">
              <header className="flex items-center justify-between font-brand sm:pr-0">
                <h1 className="text-3xl text-slate-700 dark:text-slate-400 sm:text-4xl">
                  <div className="text-[40px]">
                    <WordHighlight content="Brewlabs NFT Staking Info" />
                  </div>
                </h1>
                <div className="hidden lg:flex">
                  <StyledButton className="!w-fit p-[10px_12px] !font-normal" onClick={() => setMintOpen(true)}>
                    Mint Brewlabs NFT
                  </StyledButton>
                  <div className="mr-2" />
                  <Link href={"/nft"}>
                    <StyledButton className="!w-fit p-[10px_12px_10px_24px] !font-normal">
                      <div className="absolute left-1 top-[11px] scale-[85%]">{chevronLeftSVG}</div>
                      Back to NFT
                    </StyledButton>
                  </Link>
                </div>
              </header>
            </Container>
            <Container className="pb-20 font-brand">
              <div className="mb-3 flex w-full justify-end lg:hidden">
                <StyledButton className="!w-fit p-[6px_12px] !font-normal" onClick={() => setMintOpen(true)}>
                  Mint Brewlabs NFT
                </StyledButton>
                <div className="mr-2" />
                <Link href={"/nft"}>
                  <StyledButton className="!w-fit p-[6px_12px_6px_24px] !font-normal">
                    <div className="absolute left-1 top-[7px] scale-[85%]">{chevronLeftSVG}</div>
                    Back to NFT
                  </StyledButton>
                </Link>
              </div>
              <div className="mx-auto mt-[50px]  flex w-full max-w-[600px] flex-col items-center justify-between sm:flex-row sm:items-start">
                {infos.map((data, i) => {
                  return (
                    <>
                      <div key={i} className="w-[257px]">
                        <div className="flex items-center text-[#FFFFFFBF]">
                          <div
                            className="[&>*:first-child]:!h-4 [&>*:first-child]:!w-4 [&>*:first-child]:!opacity-100"
                            id={data.title}
                          >
                            {InfoSVG}
                          </div>
                          <div className="ml-1 text-lg font-medium">{data.title}</div>
                        </div>
                        <div className="mt-2 flex h-[180px] w-full items-center justify-center overflow-hidden rounded">
                          <img src={data.logo} alt={""} className="w-full rounded" />
                        </div>
                        <div className="mt-2">
                          <div className="text-sm text-[#FFFFFFBF]">{data.info.title}</div>
                          <ul className="mt-2 list-disc pl-5 text-xs text-[#FFFFFF80]">
                            {data.info.detail.map((data: string, i: number) => {
                              return <li key={i}>{data}</li>;
                            })}
                          </ul>
                        </div>
                        <ReactTooltip anchorId={data.title} place="top" content={data.tooltip} className="text-xs" />
                      </div>
                      {i === 0 ? (
                        <div className="mb-4 mt-4 flex h-fit rotate-90 flex-col justify-center text-white sm:mb-0 sm:mt-9 sm:h-[180px] sm:rotate-0">
                          <div className="-scale-x-100">{chevronLeftSVG}</div>
                          <div className="mt-1">{chevronLeftSVG}</div>
                        </div>
                      ) : (
                        ""
                      )}
                    </>
                  );
                })}
              </div>
              <div className="relative mx-auto mt-10 flex w-full max-w-[726px] font-medium text-white sm:mt-6">
                <div className="absolute top-0.5 scale-125 [&>*:first-child]:!opacity-100">{InfoSVG}</div>
                <div className="ml-4 text-xs">
                  50% of all Brewlabs mint fees are allocated to various yield farming strategies to earn NFT staking
                  reward. A Brewlabs NFT staking season runs for 9 months with a 3 month compounding period. Season one
                  will have a 3 month genesis period to build NFT staking reward balances. Rewards are issued in the
                  native currency of selected staking network.
                </div>
              </div>
              <div className="mx-auto mt-6 flex w-full max-w-[726px] flex-col justify-between md:flex-row">
                {aprByNetworks.map((data, i) => {
                  return (
                    <div
                      key={i}
                      className="primary-shadow mb-3 h-fit w-full rounded-lg bg-[#B9B8B80D] p-3.5 leading-[1.2] text-white md:mb-0 md:h-[160px] md:w-[220px]"
                    >
                      <div className="flex items-center">
                        <img src={getChainLogo(data.chainId)} alt={""} className="mr-2 h-6 w-6 rounded-full" />
                        <div className="text-lg">
                          {i === 1 ? data.apr ? `${data.apr.toFixed(2)}% APR` : <SkeletonComponent /> : "Pending..."}
                        </div>
                      </div>
                      <div className="mt-3.5 flex justify-between text-sm">
                        <div>
                          <div>
                            {i !== 2 ? (
                              data.totalPosition ? (
                                `$${numberWithCommas(data.totalPosition.toFixed(2))}`
                              ) : (
                                <SkeletonComponent />
                              )
                            ) : (
                              "Pending..."
                            )}
                          </div>

                          <div className="mt-2 flex items-center">
                            <img src={getChainLogo(data.chainId)} alt={""} className="mr-1 h-4 w-4 rounded-full" />
                            <div>{data.chainName}</div>
                          </div>
                        </div>
                        <div className="text-[#FFFFFFBF]">
                          <div>Total position</div>
                          <div className="mt-2">Staking reward</div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </Container>
          </div>
        </motion.div>
      </AnimatePresence>
    </PageWrapper>
  );
};

export default NFTStakingInfo;
