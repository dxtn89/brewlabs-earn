import PageWrapper from "components/layout/PageWrapper";
import Header from "./components/Header";
import { useContext, useEffect, useState } from "react";
import { useSwapActionHandlers } from "state/swap/hooks";
import { ChartContext } from "contexts/ChartContext";
import Modal from "@components/Modal";
import SettingModal from "views/swap/components/modal/SettingModal";
import { SwapContext } from "contexts/SwapContext";
import { useUserSlippageTolerance } from "state/user/hooks";
import { Oval } from "react-loader-spinner";
import { addPairs } from "state/chart";
import { useDispatch } from "react-redux";
import { usePairsByCriteria } from "state/chart/hooks";
import { isAddress } from "utils";
import { fetchAllPairs } from "state/chart/fetchPairInfo";
import { DEXSCREENER_CHAINNAME } from "config";
import { NATIVE_CURRENCIES, Token, WNATIVE } from "@brewlabs/sdk";
import { Field } from "state/swap/actions";
import TokenInfo from "./components/TokenInfo";
import { useTokenHolders, useTokenMarketInfos } from "@hooks/useTokenInfo";
import TradingPanel from "./components/TradingPanel";

export default function Chart({ chain, address }) {
  const chainId = Number(Object.keys(DEXSCREENER_CHAINNAME).find((key, i) => chain === DEXSCREENER_CHAINNAME[key]));
  const pair: any = usePairsByCriteria(address, chainId, 1);
  const [showReverse, setShowReverse] = useState(true);
  const [selectedPair, setSelectedPair] = useState(null);

  const { onCurrencySelection } = useSwapActionHandlers();
  const dispatch: any = useDispatch();

  const stringifiedPair = JSON.stringify(pair);
  useEffect(() => {
    if (!pair || !pair.length) return;
    setSelectedPair(pair[0]);
    setTokens();
  }, [stringifiedPair]);

  function setTokens() {
    if (!pair || !pair.length) return;
    const selectedPair = pair[0];
    let token0: any;
    if (selectedPair.baseToken.address === WNATIVE[selectedPair.chainId].address.toLowerCase())
      token0 = NATIVE_CURRENCIES[selectedPair.chainId];
    else token0 = new Token(selectedPair.chainId, selectedPair.baseToken.address, 18, selectedPair.baseToken.symbol);
    onCurrencySelection(Field.OUTPUT, token0);

    let token1: any;
    if (selectedPair.quoteToken.address === WNATIVE[selectedPair.chainId].address.toLowerCase())
      token1 = NATIVE_CURRENCIES[selectedPair.chainId];
    else token1 = new Token(selectedPair.chainId, selectedPair.quoteToken.address, 18, selectedPair.quoteToken.symbol);
    onCurrencySelection(Field.INPUT, token1);
  }

  useEffect(() => {
    if (!isAddress(address) || !chain) return;
    fetchAllPairs(address, chain)
      .then((pairs) => {
        dispatch(addPairs(pairs));
      })
      .catch((e) => console.log(e));
  }, [chain, address]);

  const { infos: marketInfos }: any = useTokenMarketInfos(selectedPair);
  const { holders30d }: any = useTokenHolders(selectedPair?.baseToken?.address, selectedPair?.chainId);

  const { pending }: any = useContext(ChartContext);

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

  return (
    <PageWrapper>
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
      <div className={`px-3 pb-48 font-roboto md:px-6 xl:pb-10 3xl:md:px-16 ${pending ? "opacity-50" : ""}`}>
        {selectedPair ? (
          <div className="relative mx-auto mt-24 w-full lg:mt-0">
            <Header setShowReverse={setShowReverse} showReverse={showReverse} />
            <TokenInfo
              selectedPair={{
                ...selectedPair,
                baseToken: { ...selectedPair.baseToken, decimals: marketInfos?.decimals ?? 18 },
              }}
              showReverse={showReverse}
              marketInfos={marketInfos}
            />
            <TradingPanel
              selectedPair={{
                ...selectedPair,
                baseToken: { ...selectedPair.baseToken, decimals: marketInfos?.decimals ?? 18 },
              }}
              showReverse={showReverse}
              marketInfos={marketInfos}
              holders30d={holders30d}
            />
          </div>
        ) : (
          <div className="flex h-screen w-full items-center justify-center">
            <Oval
              width={80}
              height={80}
              color={"#3F3F46"}
              secondaryColor="black"
              strokeWidth={4}
              strokeWidthSecondary={4}
            />
          </div>
        )}
      </div>
    </PageWrapper>
  );
}
