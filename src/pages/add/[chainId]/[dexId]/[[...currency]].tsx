import PageHeader from "components/layout/PageHeader";
import Container from "components/layout/Container";
import PageWrapper from "components/layout/PageWrapper";
import WordHighlight from "components/text/WordHighlight";
import { NFTSVG } from "@components/dashboard/assets/svgs";
import { useUserSlippageTolerance } from "state/user/hooks";
import { SwapContext } from "contexts/SwapContext";
import { useContext, useEffect } from "react";
import Security from "@components/SwapComponents/Security";
import SlippageText from "@components/SwapComponents/SlippageText";
import Modal from "@components/Modal";
import BasicLiquidity from "views/swap/components/addLiquidity/BasicLiquidity";
import ChainSelect from "views/swap/components/ChainSelect";
import SubNav from "views/swap/components/nav/SubNav";
import SettingModal from "views/swap/components/modal/SettingModal";
import { useRouter } from "next/router";
import { useActiveChainId } from "@hooks/useActiveChainId";
import { WNATIVE } from "@brewlabs/sdk";
import { brewsToken, usdToken } from "config/constants/tokens";
import { useCurrency } from "@hooks/Tokens";
import CreateLiquidityOption from "views/swap/components/addLiquidity/CreateLiquidityOption";
import SwapRewards from "views/swap/components/SwapRewards";
import SwapPanel from "views/swap/SwapPanel";

export default function Swap() {
  const {
    slippageInput,
    autoMode,
    slippage,
    setSlippageInput,
    setAutoMode,
    swapTab,
    openSettingModal,
    setOpenSettingModal,
    addLiquidityStep,
    setAddLiquidityStep,
    setSwapTab,
  }: any = useContext(SwapContext);

  // txn values
  const [, setUserSlippageTolerance] = useUserSlippageTolerance();

  const parseCustomSlippage = (value: string) => {
    setSlippageInput(value);
    try {
      const valueAsIntFromRoundedFloat = Number.parseInt((Number.parseFloat(value) * 100).toString());
      if (!Number.isNaN(valueAsIntFromRoundedFloat) && valueAsIntFromRoundedFloat < 5000) {
        setUserSlippageTolerance(valueAsIntFromRoundedFloat);
      }
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    setAddLiquidityStep("CreateBasicLiquidityPool");
    setSwapTab(1);
  }, []);

  const router = useRouter();
  const { chainId } = useActiveChainId();

  const selectedChainId = +router.query.chainId ?? chainId;
  const dexId = router.query.dexId;
  const [currencyIdA, currencyIdB] = router.query.currency || [
    WNATIVE[selectedChainId]?.symbol,
    brewsToken[selectedChainId]?.address || usdToken[selectedChainId]?.address,
  ];
  const currencyA = useCurrency(currencyIdA);
  const currencyB = useCurrency(currencyIdB);

  return (
    <PageWrapper>
      <PageHeader
        title={
          <>
            Exchange tokens at the <WordHighlight content="best" /> rate on the market.
          </>
        }
      />
      <Container>
        <div
          className={`relative mx-auto mb-4 flex w-fit min-w-full flex-col gap-1 rounded-3xl border-t px-3 pb-10 pt-4 dark:border-slate-600 dark:bg-zinc-900 sm:min-w-[540px] sm:px-10 md:mx-0`}
        >
          <div
            className="tooltip absolute right-14 top-6 scale-75 cursor-pointer text-[rgb(75,85,99)]"
            data-tip="No Brewlabs NFT found."
          >
            {NFTSVG}
          </div>
          <SubNav />

          <div className="flex items-center justify-between">
            <SlippageText className="!text-xs" />
          </div>

          {<ChainSelect id="chain-select" />}

          <div className="flex flex-col">
            {swapTab === 0 ? (
              <SwapPanel />
            ) : swapTab === 1 ? (
              addLiquidityStep === "ViewHarvestFees" ? (
                <SwapRewards />
              ) : addLiquidityStep === "default" || addLiquidityStep === "CreateNewLiquidityPool" ? (
                <CreateLiquidityOption />
              ) : (
                <BasicLiquidity currencyA={currencyA} currencyB={currencyB} />
              )
            ) : (
              ""
            )}
          </div>

          {openSettingModal && (
            <Modal
              open={openSettingModal}
              onClose={() => {
                setOpenSettingModal(false);
              }}
            >
              <SettingModal
                autoMode={autoMode}
                setAutoMode={setAutoMode}
                slippage={slippage}
                slippageInput={slippageInput}
                parseCustomSlippage={parseCustomSlippage}
              />
            </Modal>
          )}
        </div>
      </Container>
    </PageWrapper>
  );
}
