import PageHeader from "components/layout/PageHeader";
import Container from "components/layout/Container";
import PageWrapper from "components/layout/PageWrapper";

import SwapBoard from "./SwapBoard";
import { DocumentTextIcon } from "@heroicons/react/24/outline";
import WordHighlight from "@components/text/WordHighlight";

export default function Swap() {
  return (
    <PageWrapper>
      <PageHeader
        title={
          <>
            Exchange tokens at the <WordHighlight content="best" /> rate on the market.
          </>
        }
        summary={
          <>
            Brewlabs BrewSwap is an aggregated decentralised exchange (aDEX) that seeks the most affordable swap route
            for the user. The BrewSwap aggregator feature fetches price’s for your swap through a number of relay
            contracts to obtain the ideal swap from the industries largest liquidity pools. The combined decentralised
            exchange features allow for unique liquidity pool creation and token tax management, instant fee issuance to
            liquidity providers and innovate fee reduction benefits for Brewlabs NFT holders.
          </>
        }
      >
        <a
          className="btn mt-4"
          target="_blank"
          href="https://brewlabs.gitbook.io/welcome-to-brewlabs/brewlabs-defi-products/brewlabs-2023/testing-brewswap-router"
        >
          <DocumentTextIcon className="h-auto w-6" />
          Learn more
        </a>
      </PageHeader>

      <Container>
        <SwapBoard />
      </Container>
    </PageWrapper>
  );
}
