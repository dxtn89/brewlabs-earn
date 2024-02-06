import PageHeader from "components/layout/PageHeader";
import Container from "components/layout/Container";
import PageWrapper from "components/layout/PageWrapper";
import WordHighlight from "components/text/WordHighlight";
import { useState } from "react";
import PairList from "./PairList";
import ChartPanel from "./ChartPanel";

export default function Info() {
  const [selectedPair, setSelectedPair] = useState({});

  return (
    <PageWrapper>
      <PageHeader
        title={
          <>
            Exchange tokens at the <WordHighlight content="best" /> rate on the market.
          </>
        }
      />
      <Container className="font-brand">
        <div className="-mt-4 mb-10">
          <div className="text-xl text-primary">BrewSwap pools</div>
          <div className="mt-2 text-sm">
            Observe the volume and fee collection from various liquidity pools across the BrewSwap decentralised
            exchange. Users can easily join pools and start earning a portion of fee revenue by using the “join pool”
            feature. Fee revenue is generated from swap, bridge and index volume and is distributed to users who supply
            liquidity instantly.
          </div>
        </div>
        <ChartPanel />

        <PairList selectedPair={selectedPair} setSelectedPair={setSelectedPair} />
      </Container>
    </PageWrapper>
  );
}
