import { getEllipsis, getExplorerLogo } from "utils/functions";
import { getExplorerLink, getNativeSybmol } from "lib/bridge/helpers";
import StyledPrice from "@components/StyledPrice";
import { useRef } from "react";
import { ChevronDownSVG } from "@components/dashboard/assets/svgs";

export default function HistoryCard({ list, i, setCriteria, setShowType, selectedPair, isAccount }) {
  // const { ENSName } = useENSName(isAddress(list.wallet));
  const ENSName = null;
  const makerRef1: any = useRef();
  const makerRef2: any = useRef();
  return (
    <>
      <a
        onClick={(e) => {
          if (!makerRef1.current.contains(e.target) && window) {
            window.open(getExplorerLink(list.chainId, "transaction", list.txHash), "_blank");
          }
        }}
        className="hidden lg:block"
      >
        <div
          className={`flex justify-between ${
            i % 2 === 0 ? "bg-[#D9D9D90D]" : "bg-[#D9D9D91A]"
          } cursor-pointer items-center rounded-[2px] border border-transparent p-[4px_0px_4px_12px] ${
            list.action === "buy"
              ? "text-[#32FFB5] hover:border-[#32ffb473]"
              : "text-[#DC4545] hover:border-[#DC454573]"
          }`}
        >
          <div className="flex">
            <div className="flex w-[90px] items-center text-[#FFFFFF80]">
              <img
                src={getExplorerLogo(list.chainId)}
                alt={""}
                className="mr-1.5 h-4 w-4 rounded-full border border-white bg-white"
              />
              <div>{getEllipsis(list.txHash, 6, 0)}</div>
            </div>
            <div className="w-[160px] whitespace-nowrap">{list.time}</div>
            <div className="w-[110px] whitespace-nowrap text-[#FFFFFF80]">{list.ago}</div>
            <div className="w-[60px] capitalize">{list.action}</div>
            <div className="w-[70px] text-white">
              <StyledPrice price={list.price} itemClassName="!text-[8px]" />
            </div>
            <div
              className="flex w-[100px] items-center justify-between"
              onClick={() => {
                setCriteria(list.wallet);
                setShowType(7);
              }}
              ref={makerRef1}
            >
              {ENSName ?? getEllipsis(list.wallet, 5, 4)}
              {!isAccount ? <div className="ml-2 text-[#ffffff80]">{ChevronDownSVG}</div> : ""}
            </div>
          </div>
          <div className="flex">
            <div className="w-20">{list.amount}</div>
            <div className="w-14">{list.nativeAmount}</div>
            <div className="w-20">${list.usdValue}</div>
          </div>
        </div>
      </a>
      <a
        onClick={(e) => {
          if (!makerRef2.current.contains(e.target) && window) {
            window.open(getExplorerLink(list.chainId, "transaction", list.txHash), "_blank");
          }
        }}
        key={i}
        target="_blank"
        className="block lg:hidden"
      >
        <div
          className={`mb-2 flex flex-col ${
            i % 2 === 0 ? "bg-[#D9D9D90D]" : "bg-[#D9D9D91A]"
          } cursor-pointer rounded-[2px] border border-transparent p-[4px_12px] ${
            list.action === "buy"
              ? "text-[#32FFB5] hover:border-[#32ffb473]"
              : "text-[#DC4545] hover:border-[#DC454573]"
          }`}
        >
          <div className="flex flex-wrap justify-between">
            <div className="flex items-center text-white">
              <div className="flex items-center">
                <img
                  src={getExplorerLogo(list.chainId)}
                  alt={""}
                  className="mr-1.5 h-4 w-4 rounded-full border border-white bg-white"
                />
                <div className="text-[#FFFFFF80]">{getEllipsis(list.txHash, 20, 0)}</div>
              </div>
            </div>
            <div className="flex items-center">
              <div className="whitespace-nowrap">{list.time}</div>
            </div>
          </div>
          <div
            className="my-1 flex w-[140px] items-center justify-between whitespace-nowrap text-white"
            onClick={() => {
              setCriteria(list.wallet);
              setShowType(7);
            }}
            ref={makerRef2}
          >
            <div>Maker: {ENSName ?? getEllipsis(list.wallet, 5, 4)}</div>
            {!isAccount ? <div className="ml-2 text-[#ffffff80]">{ChevronDownSVG}</div> : ""}
          </div>
          <div className="flex flex-wrap justify-between">
            <div className="flex items-center text-white">
              <div>Price:</div>&nbsp;
              <div className="">
                <StyledPrice price={list.price} itemClassName="!text-[8px]" />
              </div>
            </div>
            <div className="flex items-center text-[#FFFFFF80]">
              <div>Ago:</div>&nbsp;
              <div className="whitespace-nowrap">{list.ago}</div>
            </div>
          </div>
          <div className="flex flex-wrap justify-between">
            <div className="flex  items-center ">
              <div>{selectedPair.baseToken.symbol}:</div>&nbsp;
              <div className="">{list.amount}</div>
            </div>
            <div className="flex items-center">
              <div>{getNativeSybmol(selectedPair.chainId)}:</div>&nbsp;
              <div className="">{list.nativeAmount}</div>
            </div>
          </div>
          <div className="flex flex-wrap justify-between">
            <div className="flex items-center">
              <div>Action:</div>&nbsp;
              <div className="capitalize">{list.action}</div>
            </div>
            <div className="flex items-center">
              <div>USD:</div>&nbsp;
              <div className="">${list.usdValue}</div>
            </div>
          </div>
        </div>
      </a>
    </>
  );
}
