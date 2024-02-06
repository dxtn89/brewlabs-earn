import { useContext } from "react";
import { useUserSlippageTolerance } from "state/user/hooks";
import { Cog8ToothIcon, MapIcon } from "@heroicons/react/24/outline";

import { SwapContext } from "contexts/SwapContext";
import { TransferToUserSVG } from "@components/dashboard/assets/svgs";

import Modal from "@components/Modal";
import Security from "@components/SwapComponents/Security";
import SlippageText from "@components/SwapComponents/SlippageText";

import ChainSelect from "./components/ChainSelect";
import SettingModal from "./components/modal/SettingModal";
import SubNav from "./components/nav/SubNav";

import AddLiquidityPanel from "./AddLiquidityPanel";
import SwapPanel from "./SwapPanel";
import SwapRewards from "./components/SwapRewards";

export default function SwapBoard({ type = "swap", disableChainSelect = false }) {
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
    isSwapAndTransfer,
    setIsSwapAndTransfer,
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

  return (
    <div
      className={`relative mx-auto mb-4 flex w-full max-w-2xl flex-col gap-1 rounded-3xl border-t px-3 pb-10 pt-4 shadow-xl shadow-amber-500/10 dark:border-slate-600 dark:bg-zinc-900 sm:px-10 md:mx-0`}
    >
      <div className="mb-8 flex items-center justify-between">
        <SubNav />

        <div className="ml-auto flex items-center gap-1">
          <button
            type="button"
            data-tip="Send to another user"
            onClick={() => setIsSwapAndTransfer(!isSwapAndTransfer)}
            className={`btn-ghost btn btn-sm tooltip ${isSwapAndTransfer ? "text-primary" : "text-gray-400"}`}
          >
            {TransferToUserSVG}
          </button>

          <button
            type="button"
            data-tip="No Brewlabs NFT found."
            className="btn-ghost btn btn-sm tooltip text-gray-400"
          >
            <MapIcon className="h-auto w-6" />
          </button>

          <button
            type="button"
            data-tip="Open settings"
            onClick={() => setOpenSettingModal(true)}
            className="btn-ghost btn btn-sm tooltip text-gray-400"
          >
            <Cog8ToothIcon className="h-6 w-6 hover:animate-spin dark:text-primary" />
          </button>
        </div>
      </div>

      <div className="flex items-center justify-between">
        {swapTab !== 1 && <Security size="lg" />}
        <SlippageText className="!text-xs" />
      </div>

      {!disableChainSelect && <ChainSelect id="chain-select" />}

      <div className="flex flex-col">
        {swapTab === 0 && <SwapPanel />}
        {swapTab === 1 && (addLiquidityStep === "ViewHarvestFees" ? <SwapRewards /> : <AddLiquidityPanel />)}
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
            slippage={slippage}
            setAutoMode={setAutoMode}
            slippageInput={slippageInput}
            parseCustomSlippage={parseCustomSlippage}
          />
        </Modal>
      )}
    </div>
  );
}
