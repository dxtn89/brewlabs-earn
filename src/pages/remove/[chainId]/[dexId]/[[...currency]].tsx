import { useContext } from "react";
import { useRouter } from "next/router";
import { Cog8ToothIcon } from "@heroicons/react/24/outline";

import { PAGE_SUPPORTED_CHAINS } from "config/constants/networks";
import { SwapContext } from "contexts/SwapContext";
import { useLPTokens } from "hooks/constructor/useLPTokens";
import { useActiveChainId } from "hooks/useActiveChainId";
import { useCurrency } from "hooks/Tokens";
import { getExplorerLink } from "lib/bridge/helpers";
import { useUserSlippageTolerance } from "state/user/hooks";
import { getLpManagerAddress } from "utils/addressHelpers";

import PageHeader from "components/layout/PageHeader";
import Container from "components/layout/Container";
import PageWrapper from "components/layout/PageWrapper";
import WordHighlight from "components/text/WordHighlight";
import { InfoSVG } from "components/dashboard/assets/svgs";

import Modal from "components/Modal";
import SettingModal from "views/swap/components/modal/SettingModal";
import RemoveLiquidityPanel from "views/contructor/RemoveLiquidityPanel";

const RemoveLiquidityPage = () => {
  const router = useRouter();
  const { chainId } = useActiveChainId();
  const { fetchLPTokens }: any = useLPTokens();

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

  const dexId = router.query.dexId;
  const [currencyIdA, currencyIdB] = router.query.currency || [];

  const [currencyA, currencyB] = [useCurrency(currencyIdA) ?? undefined, useCurrency(currencyIdB) ?? undefined];
  const selectedChainId = +router.query.chainId ?? chainId;

  return (
    <PageWrapper>
      <PageHeader
        title={
          <>
            Manage your liquidity with the <WordHighlight content="Brewlabs" /> Constructor.
            <div className="whitespace-wrap mt-5 text-xl font-normal sm:whitespace-nowrap">
              Add or remove liquidity from a number of routers free from any token tax fees.
            </div>
          </>
        }
      />
      <Container className="overflow-hidden font-brand">
        <div className="relative mx-auto mb-4 flex w-fit min-w-[90%] max-w-[660px] flex-col gap-1 rounded-3xl border-t px-4 pb-10 pt-4 dark:border-slate-600 dark:bg-zinc-900 sm:min-w-[540px] sm:px-10 md:mx-0">
          <div className="mt-2 text-2xl text-white">Liquidity Constructor</div>
          <div className="absolute right-7 top-6" onClick={() => setOpenSettingModal(true)}>
            <Cog8ToothIcon className="h-6 w-6 cursor-pointer hover:animate-spin dark:text-primary" />
          </div>
          <a
            className="mt-9 flex cursor-pointer items-center justify-center rounded-[30px] border border-[#FFFFFF80] text-[#FFFFFFBF] transition hover:text-white"
            target="_blank"
            href={getExplorerLink(selectedChainId, "address", getLpManagerAddress(selectedChainId))}
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

          <RemoveLiquidityPanel
            selectedChainId={selectedChainId}
            selecedDexId={dexId}
            fetchLPTokens={fetchLPTokens}
            currencyA={currencyA}
            currencyB={currencyB}
            onBack={() => router.back()}
          />
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
};

RemoveLiquidityPage.chains = PAGE_SUPPORTED_CHAINS["swap"];

export default RemoveLiquidityPage;
