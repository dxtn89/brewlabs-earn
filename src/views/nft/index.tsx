/* eslint-disable react-hooks/exhaustive-deps */
import { motion, AnimatePresence } from "framer-motion";

import Container from "components/layout/Container";
import PageWrapper from "components/layout/PageWrapper";
import PageHeader from "components/layout/PageHeader";
import WordHighlight from "components/text/WordHighlight";
import NFTActions from "./NFTActions";
import NFTList from "./NFTList";
import { DocSVG } from "@components/dashboard/assets/svgs";

const NFT = () => {
  return (
    <PageWrapper>
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, scale: 0.75 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="absolute left-0 top-0 max-h-screen w-full overflow-y-scroll">
            <PageHeader
              title={
                <div className="text-[40px]">
                  <WordHighlight content="Brewlabs NFT's" />
                  <a
                    className="primary-shadow mt-2 flex w-fit items-center rounded bg-[#FFFFFF1A] p-2 font-roboto text-xs font-bold !text-primary transition hover:scale-[1.1]"
                    href="https://brewlabs.gitbook.io/welcome-to-brewlabs/brewlabs-defi-products/brewlabs-2023/live-brewlabs-nft"
                    target="_blank"
                  >
                    <div>LEARN MORE</div>
                    <div className="ml-1 [&>svg]:!h-2.5 [&>svg]:!w-2.5">{DocSVG}</div>
                  </a>
                </div>
              }
            />
            <Container className="font-brand">
              <div className="mb-20">
                <div className="text-lg leading-[1.2] text-primary">
                  {"Mint, upgrade, benefit and earn with Brewlabs NFT's."}
                </div>
                <div className="mt-1.5 max-w-[1000px] text-sm leading-[1.2]">
                  Brewlabs is responsible for number of products and utilities deployed across the decentralised finance
                  industry. The Brewlabs NFT collection allows users to mint a Brewlabs NFT at anytime to gain access to
                  a number of benefits within the Brewlabs ecosystem including fee discounts, premium features,
                  whitelist access and more. Mint an NFT below and unlock the benefits of the Brewlabs NFT. Users can
                  also stake their rare, epic and legendary NFT’s to earn rewards.
                </div>
              </div>
              <NFTActions />
              <div className="mt-3" />
              <NFTList />
            </Container>
          </div>
        </motion.div>
      </AnimatePresence>
    </PageWrapper>
  );
};

export default NFT;
