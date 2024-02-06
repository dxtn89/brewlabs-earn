/* eslint-disable react-hooks/exhaustive-deps */
import { motion, AnimatePresence } from "framer-motion";

import Container from "components/layout/Container";
import PageWrapper from "components/layout/PageWrapper";
import WordHighlight from "components/text/WordHighlight";
import StyledButton from "views/directory/StyledButton";
import RarityCard from "./RarityCard";
import { InfoSVG, chevronLeftSVG } from "@components/dashboard/assets/svgs";
import { useState } from "react";
import DropDown from "@components/dashboard/TokenList/Dropdown";
import MintNFTModal from "../Modals/MintNFTModal";
import Link from "next/link";
import { NFT_RARITY_NAME, rarities } from "config/constants/nft";
import { useAllNftData } from "state/nfts/hooks";

const FindOutMore = () => {
  const [curRarity, setCurRarity] = useState(0);
  const [mintOpen, setMintOpen] = useState(false);

  const { flaskNft, mirrorNft } = useAllNftData();
  const allNfts = [
    ...[].concat(
      ...flaskNft.map((data) =>
        data.userData
          ? data.userData.balances.map((t) => ({
              chainId: data.chainId,
              ...t,
            }))
          : []
      )
    ),
    ...[].concat(
      ...mirrorNft.map((data) =>
        data.userData
          ? data.userData.balances.map((t) => ({
              chainId: data.chainId,
              ...t,
            }))
          : []
      )
    ),
  ];

  let wrappedRarities = rarities;
  let topNFT = { rarity: -1, logo: "", chainId: 1 };
  for (let i = 0; i < allNfts.length; i++) if (topNFT.rarity < allNfts[i].rarity) topNFT = allNfts[i];
  if (topNFT.rarity !== -1) {
    for (let i = 0; i < wrappedRarities.length - 1; i++) wrappedRarities[i].isActive = false;

    wrappedRarities[topNFT.rarity - 1].isActive = true;
    wrappedRarities[topNFT.rarity - 1].chainId = topNFT.chainId;
  }

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
                    <WordHighlight content="Brewlabs NFT Information" />
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
            <Container className="font-brand">
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
              <div className="hidden w-full flex-wrap justify-evenly md:flex xl:flex-nowrap xl:justify-between">
                {wrappedRarities.map((data, i) => {
                  return (
                    <div
                      key={i}
                      className={`mb-6 w-[calc(100%/3)] flex-none rounded p-[15px_6px] xl:w-fit xl:flex-1 ${
                        data.isActive ? "bg-[#B9B8B80D]" : ""
                      }`}
                    >
                      <RarityCard rarity={data} />
                    </div>
                  );
                })}
              </div>

              <div className="flex w-full justify-end md:hidden">
                <DropDown
                  values={wrappedRarities.map((data) => data.type)}
                  width="w-full max-w-[240px]"
                  value={curRarity}
                  setValue={setCurRarity}
                />
              </div>

              <div
                className={`mb-16 mt-6 block rounded p-[15px_6px] md:hidden ${
                  wrappedRarities[curRarity].isActive ? "primary-shadow bg-[#B9B8B80D]" : ""
                }`}
              >
                <RarityCard rarity={wrappedRarities[curRarity]} />
              </div>

              <div className="relative mt-4 flex font-medium text-white">
                <div className="absolute top-0.5 scale-125 [&>*:first-child]:!opacity-100">{InfoSVG}</div>
                <div className="ml-4 text-xs">
                  NFT minting fees (stablecoin) are designated to the following categories: 50% of mint fee to NFT
                  staking protocol, 25% of mint fees to Brewlabs Treasury, 25% of mint fees to Brewlabs development
                  fund. 100% of all BREWLABS tokens used in mint and upgrade fees are sent to Brewlabs Treasury. 100% of
                  all upgrade fees (stablecoin) are sent to Brewlabs Treasury.
                </div>
              </div>

              <div className="relative mb-20 mt-7 flex font-medium text-white">
                <div className="absolute top-0.5 scale-125 [&>*:first-child]:!opacity-100">{InfoSVG}</div>
                <div className="ml-4 text-xs">
                  Brewlabs as a web3 builder aims to incorporate Brewlabs NFT benefits across current and future
                  products, maximising the use case of the Brewlabs NFT collection. Some benefits may not be live as of
                  yet but will be incorporated along with other product benefits as we continue to grow and deliver new
                  innovations to the emerging blockchain and web3 industry.
                </div>
              </div>
            </Container>
          </div>
        </motion.div>
      </AnimatePresence>
    </PageWrapper>
  );
};

export default FindOutMore;
