/* eslint-disable react-hooks/exhaustive-deps */
import { motion, AnimatePresence } from "framer-motion";

import Container from "components/layout/Container";
import PageWrapper from "components/layout/PageWrapper";
import PageHeader from "components/layout/PageHeader";
import WordHighlight from "components/text/WordHighlight";
import StyledButton from "views/directory/StyledButton";
import CommunityList from "./CommunityList";
import CommunityModal from "./CommunityModal";
import { useState } from "react";
import NFTComponent from "@components/NFTComponent";
import { DocSVG } from "@components/dashboard/assets/svgs";

const Community = () => {
  const [communityOpen, setCommunityOpen] = useState(false);
  return (
    <PageWrapper>
      <CommunityModal open={communityOpen} setOpen={setCommunityOpen} />
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
                  <WordHighlight content="Community Proposals" />
                  <a
                    className="primary-shadow mt-2 flex w-fit items-center rounded bg-[#FFFFFF1A] p-2 font-roboto text-xs font-bold !text-primary transition hover:scale-[1.1]"
                    href="https://brewlabs.gitbook.io/welcome-to-brewlabs/brewlabs-defi-products/brewlabs-2023/live-communities"
                    target="_blank"
                  >
                    <div>LEARN MORE</div>
                    <div className="ml-1 [&>svg]:!h-2.5 [&>svg]:!w-2.5">{DocSVG}</div>
                  </a>
                </div>
              }
            />
            <Container className="pb-[180px] font-brand">
              <div className="mb-20 flex flex-col items-center justify-between sm:flex-row">
                <div>
                  <div className="text-lg leading-[1.2] text-primary">Welcome to the Brewlabs Community Proposals</div>
                  <div className="mt-1.5 max-w-[1000px] text-sm leading-[1.2]">
                    This tool is designed to allow communities to submit, vote and determine pathways through governance
                    proposals. Decentralised organisations, community members and teams can use this tool to vote
                    together on significant decentralised decision making. Each community may have different proposal
                    requirements, be sure research and to join your community to help guide the project and discover new
                    ideas.
                  </div>
                </div>
                <div className="ml-0 mt-6 flex w-full items-center justify-end sm:ml-6 sm:mt-0 sm:w-fit sm:justify-start">
                  <div className={`mr-3`}>
                    <NFTComponent />
                  </div>
                  {/* <a href="https://t.me/MaverickBL" target="_blank"> */}
                  <StyledButton className="whitespace-nowrap p-[10px_12px]" onClick={() => setCommunityOpen(true)}>
                    Submit&nbsp;<span className="font-normal">new community</span>
                  </StyledButton>
                  {/* </a> */}
                </div>
              </div>
              <CommunityList />
            </Container>
          </div>
        </motion.div>
      </AnimatePresence>
    </PageWrapper>
  );
};

export default Community;
