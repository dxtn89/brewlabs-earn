/* eslint-disable react-hooks/exhaustive-deps */
import { motion, AnimatePresence } from "framer-motion";

import { chevronLeftSVG } from "components/dashboard/assets/svgs";
import Container from "components/layout/Container";
import WordHighlight from "components/text/WordHighlight";

import StyledButton from "views/directory/StyledButton";
import Link from "next/link";
import CommunitySummary from "./CommunitySummary";
import InfoPanel from "./InfoPanel";
import Proposal from "./Proposal";
import { useEffect, useState } from "react";
import useTokenBalances from "@hooks/useTokenMultiChainBalance";
import PageWrapper from "@components/layout/PageWrapper";

const CommunityDetail = ({ community }: { community: any }) => {
  let tokens = new Object();
  Object.keys(community.currencies).map(
    (key, i) => (tokens[key] = community.treasuries[key].map((data) => community.currencies[key]))
  );
  const { totalBalance } = useTokenBalances(tokens, community.treasuries);

  const totalSupply = community.totalSupply / Math.pow(10, community.currencies[community.coreChainId].decimals);
  const circulatingSupply = totalSupply - totalBalance;

  return (
    <PageWrapper>
      <AnimatePresence exitBeforeEnter>
        <motion.div
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.5 }}
          transition={{ duration: 0.3 }}
        >
          <div className="absolute left-0 top-0 max-h-screen w-full overflow-y-scroll ">
            <Container className="pb-[150px] pt-20  font-brand">
              <header className="flex items-center justify-between font-brand sm:pr-0">
                <h1 className="text-3xl text-slate-700 dark:text-slate-400 sm:text-4xl">
                  <div className="text-[40px]">
                    <WordHighlight content="Brewlabs Community" />
                  </div>
                </h1>
                <Link href={"/communities"}>
                  <StyledButton className="!w-fit p-[10px_12px_10px_24px] !font-normal">
                    <div className="absolute left-1 top-[11px] scale-[85%]">{chevronLeftSVG}</div>
                    Back
                  </StyledButton>
                </Link>
              </header>
              <div className="mt-4" />
              <CommunitySummary community={community} />
              <div className="mt-4" />
              <InfoPanel community={community} circulatingSupply={circulatingSupply} />
              <div className="mt-10 sm:mt-2" />
              <Proposal community={community} />
            </Container>
          </div>
        </motion.div>
      </AnimatePresence>
    </PageWrapper>
  );
};

export default CommunityDetail;
