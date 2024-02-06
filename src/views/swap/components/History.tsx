import { useState } from "react";
import clsx from "clsx";
import { ChevronUpIcon } from "@heroicons/react/24/outline";
import { BigNumber } from "ethers";
import { formatUnits } from "ethers/lib/utils";
import { useSwapHistory } from "hooks/swap/useSwapHistory";
import { useCurrency } from "hooks/Tokens";
import useActiveWeb3React from "hooks/useActiveWeb3React";
import { ETH_ADDRESSES } from "config/constants";
import { BigNumberFormat, getBlockExplorerLink, getBlockExplorerLogo } from "utils/functions";
import TokenLogo from "@components/logo/TokenLogo";
import getTokenLogoURL from "utils/getTokenLogoURL";
import { ChevronDownSVG, ChevronRightVG, CircleRightSVG, SwapSVG, downSVG } from "@components/dashboard/assets/svgs";
import StyledButton from "views/directory/StyledButton";

const Row = (data: any) => {
  const {
    data: {
      _tokenIn: srcToken,
      _tokenOut: dstToken,
      _amountIn: _spentAmount,
      _amountOut: _returnAmount,
      transactionHash,
      source,
    },
    index,
  } = data;
  const inputCurrency = useCurrency(ETH_ADDRESSES.includes(srcToken) ? "ETH" : srcToken);
  const outputCurrency = useCurrency(ETH_ADDRESSES.includes(dstToken) ? "ETH" : dstToken);

  const spentAmount = Number(_spentAmount / (source === "aggregator" ? Math.pow(10, inputCurrency?.decimals ?? 0) : 1));
  const returnAmount = Number(
    _returnAmount / (source === "aggregator" ? Math.pow(10, outputCurrency?.decimals ?? 0) : 1)
  );

  const { chainId } = useActiveWeb3React();

  return (
    inputCurrency &&
    outputCurrency && (
      <a
        className={`mb-2 flex items-center justify-between rounded ${
          index % 2 ? "bg-[#D9D9D91A]" : "bg-[#D9D9D90D]"
        } p-[10px] font-roboto text-sm transition-all duration-300 hover:scale-[1.03] hover:border-brand`}
        href={getBlockExplorerLink(transactionHash, "transaction", chainId)}
        target="_blank"
        rel="noreferrer"
      >
        <div className="mr-0 flex max-w-[260px] flex-1 items-center justify-between xs:mr-2 xs:max-w-full sm:xs:max-w-[320px]">
          <div className="flex w-[90px] items-center xs:w-[120px]">
            <TokenLogo src={getTokenLogoURL(inputCurrency.address, chainId)} classNames="h-4 w-4 rounded-full" />
            &nbsp;
            <div className="flex-1 overflow-hidden text-ellipsis whitespace-nowrap text-white">
              {inputCurrency.symbol}
            </div>
            <div>
              &nbsp;~&nbsp;
              {BigNumberFormat(spentAmount, 2)}
            </div>
          </div>
          <span className="mx-3 dark:text-primary">{CircleRightSVG}</span>
          <div className="flex w-[90px] items-center justify-end xs:w-[120px]">
            <div>
              ~&nbsp;
              {BigNumberFormat(returnAmount, 2)}
            </div>
            &nbsp;
            <TokenLogo src={getTokenLogoURL(outputCurrency.address, chainId)} classNames="h-4 w-4 rounded-full" />
            &nbsp;
            <div className="flex-1 overflow-hidden text-ellipsis whitespace-nowrap text-white">
              {outputCurrency.symbol}
            </div>
          </div>
        </div>
        <div className="hidden w-[120px] rounded-md text-xs text-[#FFFFFF80] sm:block">
          1.00 ~ {(returnAmount / spentAmount).toFixed(6)}
        </div>
      </a>
    )
  );
};

const History = () => {
  const logs = useSwapHistory();
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="mt-6">
      <StyledButton
        className="flex !h-10 bg-[#B9B8B81A] font-brand !text-base text-primary hover:border-white hover:text-white"
        type={"default"}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center">
          <div className="mr-1.5">Show History</div>{" "}
          <div className={isExpanded ? "-scale-y-100" : ""}>{ChevronDownSVG}</div>
        </div>
      </StyledButton>

      {isExpanded && (
        <div className="-ml-2 mt-4 w-[calc(100%+16px)] py-3">
          <div className="yellowScroll mt-2 max-h-[300px] overflow-y-scroll px-2">
            {logs.length ? (
              logs.map((data, index) => {
                return <Row data={data} key={index} index={index} />;
              })
            ) : (
              <div className="mb-2 text-center font-brand text-primary">No Histories</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default History;
