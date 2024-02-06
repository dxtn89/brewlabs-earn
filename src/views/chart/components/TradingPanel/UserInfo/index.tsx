import { ChevronCircleDownSVG, LinkSVG } from "@components/dashboard/assets/svgs";
import { getExplorerLink } from "lib/bridge/helpers";
import { getEllipsis, getExplorerLogo, numberWithCommas } from "utils/functions";
import TimeAgo from "javascript-time-ago";
import { useEffect, useState } from "react";
import { useMediaQuery } from "react-responsive";
import { isAddress } from "utils";
import { fetchTradingHistoriesByDexScreener } from "@hooks/useTokenAllPairs";
import { useFastRefreshEffect } from "@hooks/useRefreshEffect";
import { getBalances } from "@hooks/useTokenMultiChainBalance";

// Create formatter (English).
const timeAgo = new TimeAgo("en-US");

export default function UserInfo({ selectedPair, active, account, setShowType, setCriteria, totalHistories }) {
  const isXs = useMediaQuery({ query: "(max-width: 450px)" });
  // const account = "0xae837fd1c51705f3f8f232910dfecb9180541b27";

  // const name = useENSName(account);
  const name = null;
  const [buyInfo, setBuyInfo] = useState({ usd: 0, amount: 0, txns: 0, price: 0 });
  const [sellInfo, setSellInfo] = useState({ usd: 0, amount: 0, txns: 0, price: 0 });
  const [isFade, setIsFade] = useState(false);
  const [show, setShow] = useState(false);
  const [balance, setBalance] = useState(0);

  const stringifiedTotalHistories = JSON.stringify(totalHistories);

  const holdingTime = totalHistories.length ? totalHistories[totalHistories.length - 1].timestamp : 0;
  useEffect(() => {
    let _buyInfo = { usd: 0, amount: 0, txns: 0, price: 0 },
      _sellInfo = { usd: 0, amount: 0, txns: 0, price: 0 };
    totalHistories.map((history) => {
      if (history.action === "buy") {
        _buyInfo.txns++;
        _buyInfo.usd += history.amountStable;
        _buyInfo.price += history.price;
        _buyInfo.amount += history.amount;
      } else {
        _sellInfo.txns++;
        _sellInfo.usd += history.amountStable;
        _sellInfo.price += history.price;
        _sellInfo.amount += history.amount;
      }
    });
    setBuyInfo(_buyInfo);
    setSellInfo(_sellInfo);
  }, [stringifiedTotalHistories]);

  const profit = sellInfo.usd - buyInfo.usd;

  useEffect(() => {
    if (active) {
      setShow(true);
      setIsFade(true);
      setTimeout(() => {
        setIsFade(false);
      }, 300);
    } else {
      setIsFade(true);
      setTimeout(() => {
        setShow(false);
      }, 300);
    }
  }, [active]);

  return (
    <div
      className={`transtion-all mt-2 h-fit duration-300 lg:h-[130px] ${isFade ? "opacity-0" : "opacity-100"} ${
        show ? "flex" : "hidden"
      }`}
    >
      <div className="primary-shadow relative flex flex-1 flex-col justify-between rounded bg-[#B9B8B81A] p-[16px_24px_12px_44px] text-sm lg:flex-row">
        <a
          href={getExplorerLink(selectedPair.chainId, "address", account)}
          target="_blank"
          className="absolute left-3 top-3.5"
        >
          <img
            src={getExplorerLogo(selectedPair.chainId)}
            alt={""}
            className="h-6 w-6 rounded-full border border-white bg-white"
          />
        </a>
        <div>
          <a
            href={getExplorerLink(selectedPair.chainId, "address", account)}
            target="_blank"
            className="flex items-center"
          >
            <div className="flex-1 !text-white">
              {account ? (isXs ? getEllipsis(account, 20, 0) : account) : "No wallet connected"}
            </div>
            <div className="ml-1 text-tailwind hover:text-white [&>svg]:h-3 [&>svg]:w-3">{LinkSVG}</div>
          </a>
          <div>{name?.loading ? <br /> : name?.ENSName ?? <br />}</div>
          <div className="relative text-[11px] uppercase text-[#FFFFFF80]">
            <span className="text-[#FFFFFFBF]">HOLDER</span> {holdingTime === 0 ? "No" : timeAgo.format(holdingTime)}
            <div
              className="absolute -left-7 top-0 rotate-[90deg] cursor-pointer text-[#404045] hover:text-white [&>svg]:h-4 [&>svg]:w-4"
              onClick={() => {
                setShowType(0);
                setCriteria("");
              }}
            >
              {ChevronCircleDownSVG}
            </div>
          </div>
          <div className="text-[11px] text-[#FFFFFF80]">
            <span className="text-[#FFFFFFBF]">SWAPPED</span>{" "}
            <span className="text-[#32FFB5]">${numberWithCommas((buyInfo.usd + sellInfo.usd).toFixed(2))} USD</span>{" "}
            {selectedPair.baseToken.symbol} VOLUME
          </div>
          <div className="text-[11px] text-[#FFFFFF80]">
            <span className="text-[#FFFFFFBF]">BALANCE</span>{" "}
            <span className="text-[#FFFFFF80]">
              {numberWithCommas(balance.toFixed(2))} {selectedPair.baseToken.symbol} ~$
              {numberWithCommas((selectedPair.priceUsd * balance).toFixed(2))} USD
            </span>
          </div>
        </div>
        <div className="mt-4 flex min-w-[50%] flex-col justify-between sm:flex-row lg:mt-0">
          <div className="text-[11px] font-medium">
            <div className="text-sm font-normal text-white">Bought</div>
            <div className="text-sm font-bold text-[#32FFB5]">${numberWithCommas(buyInfo.usd.toFixed(2))}</div>
            <div className="whitespace-nowrap text-[#FFFFFFBF]">
              {numberWithCommas(buyInfo.amount.toFixed(2))} {selectedPair.baseToken.symbol}
            </div>
            <div className="whitespace-nowrap text-[#FFFFFFBF]">
              {numberWithCommas((buyInfo.txns ? buyInfo.price / buyInfo.txns : 0).toFixed(3))} Avg. Entry
            </div>
            <div className="text-[#FFFFFF80]">{buyInfo.txns} TX TOTAL</div>
          </div>
          <div className="mx-0 my-2 text-[11px] font-bold font-medium sm:mx-4 sm:my-0">
            <div className="text-sm font-normal text-white">Sold</div>
            <div className="text-sm font-bold text-[#DC4545]">-${numberWithCommas(sellInfo.usd.toFixed(2))}</div>
            <div className="whitespace-nowrap text-[#FFFFFFBF]">
              {numberWithCommas(sellInfo.amount.toFixed(2))} {selectedPair.baseToken.symbol}
            </div>
            <div className="whitespace-nowrap text-[#FFFFFFBF]">
              {numberWithCommas((sellInfo.txns ? sellInfo.price / sellInfo.txns : 0).toFixed(3))} Avg. Exit
            </div>
            <div className="text-[#FFFFFF80]">{numberWithCommas(sellInfo.txns)} TX TOTAL</div>
          </div>
          <div className="font-bold">
            <div className="whitespace-nowrap font-normal text-white">Realised P/L</div>
            <div className={profit >= 0 ? "text-[#32FFB5]" : "text-[#DC4545]"}>
              {profit >= 0 ? "" : "-"}${numberWithCommas(Math.abs(profit).toFixed(2))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
