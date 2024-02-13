import { useContext, useState } from "react";
import { Cog8ToothIcon } from "@heroicons/react/24/outline";
import { DocumentTextIcon } from "@heroicons/react/24/outline";
import { SwapContext } from "contexts/SwapContext";
import PageHeader from "components/layout/PageHeader";
import Container from "components/layout/Container";
import PageWrapper from "components/layout/PageWrapper";
import WordHighlight from "components/text/WordHighlight";
import { InfoSVG } from "components/dashboard/assets/svgs";

import { useLPTokens } from "hooks/constructor/useLPTokens";
import { useActiveChainId } from "hooks/useActiveChainId";
import { getExplorerLink } from "lib/bridge/helpers";
import { useUserSlippageTolerance } from "state/user/hooks";
import { getLpManagerAddress } from "utils/addressHelpers";

import Modal from "components/Modal";
import SettingModal from "views/swap/components/modal/SettingModal";

import BasePanel from "./BasePanel";
import AddLiquidityPanel from "./AddLiquidityPanel";

export default function Constructor() {
  const { chainId } = useActiveChainId();

  const [curAction, setCurAction] = useState("default");
  const [selectedLP, setSelectedLP] = useState(0);
  const [showCount, setShowCount] = useState(3);

  const { lpTokens, loading: isLoading, fetchLPTokens }: any = useLPTokens();

  const {
    slippageInput,
    autoMode,
    slippage,
    setSlippageInput,
    setAutoMode,
    openSettingModal,
    setOpenSettingModal,
  }: any = useContext(SwapContext);
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

  const sortedTokens =
    lpTokens && lpTokens.sort((a, b) => b.balance * b.price - a.balance * a.price).slice(0, showCount);

  return (
    <PageWrapper>
      <PageHeader
        title={
          <>
            Manage various <WordHighlight content="liquidity" /> positions with the Brewlabs Constructor.
          </>
        }
        summary={
          <>
            Brewlabs consturctor allows users to manage liquidity positions from various decentralised exchanges.
            The constructor convienetanly collates all liquidity pool tokens held in your connected wallet. Make 
            and unmake liquidity pool tokens with the construtor tool.
          </>
        }
      >
        <a
          className="btn mt-4"
          target="_blank"
          href="https://brewlabs.gitbook.io/welcome-to-brewlabs/brewlabs-defi-products/brewlabs-2022/live-brewlabs-farms-and-vaults"
        >
          <DocumentTextIcon className="h-auto w-6" />
          Learn more
        </a>
      </PageHeader>

      <Container className="overflow-hidden font-brand">
        <div className="relative mx-auto mb-4 flex w-fit min-w-[90%] max-w-[660px] flex-col gap-1 rounded-3xl border-t px-4 pb-10 pt-4 dark:border-slate-600 dark:bg-zinc-900 sm:min-w-[540px] sm:px-10 md:mx-0">
          <div className="mt-2 text-2xl text-white">Liquidity Constructor</div>
          <div className="absolute right-7 top-6" onClick={() => setOpenSettingModal(true)}>
            <Cog8ToothIcon className="h-6 w-6 cursor-pointer hover:animate-spin dark:text-primary" />
          </div>
          <a
            className="mt-9 flex cursor-pointer items-center justify-center rounded-[30px] border border-[#FFFFFF80] text-[#FFFFFFBF] transition hover:text-white"
            target="_blank"
            href={getExplorerLink(chainId, "address", getLpManagerAddress(chainId))}
            rel="noreferrer"
          >
            <div className="flex w-full items-start justify-between p-[16px_12px_16px_12px] sm:p-[16px_40px_16px_40px]">
              <div className="mt-2 scale-150 text-white">{InfoSVG}</div>
              <div className="ml-4 flex-1 text-sm xsm:ml-6">
                Important message to project owners: To ensure tax-free liquidity token creation for users of this
                constructor, please whitelist the following address
              </div>
            </div>
          </a>
          {curAction === "default" ? (
            <BasePanel
              setCurAction={setCurAction}
              sortedTokens={sortedTokens}
              count={lpTokens?.length ?? 0}
              showCount={showCount}
              setShowCount={setShowCount}
              isLoading={isLoading}
            />
          ) : curAction === "addLiquidity" ? (
            <AddLiquidityPanel onBack={() => setCurAction("default")} fetchLPTokens={fetchLPTokens} />
          ) : (
            ""
          )}
        </div>
      </Container>

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
    </PageWrapper>
  );
}
