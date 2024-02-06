import { useEffect, useState } from "react";
import { getExplorerLink } from "lib/bridge/helpers";
import { BigNumberFormat, getEllipsis, getExplorerLogo } from "utils/functions";
import { simpleRpcProvider } from "utils/providers";
import {
  ChevronDownSVG,
  DatabaseSVG,
  DeployerSVG,
  LockSVG,
  MinusSVG,
  QuestionSVG,
  WalletCircleSVG,
  downSVG,
  upSVG,
  warningFillSVG,
} from "@components/dashboard/assets/svgs";
import { Tooltip as ReactTooltip } from "react-tooltip";

export default function HolderCard({ list, i, selectedPair, setCriteria, setShowType }) {
  // const { ENSName } = useENSName(isAddress(list.wallet));
  const price = selectedPair.priceUsd;
  const [isContract, setIsContract] = useState(false);

  useEffect(() => {
    if (list.type === "Wallet") {
      const rpcProvider = simpleRpcProvider(selectedPair.chainId);
      rpcProvider
        .getCode(list.address)
        .then((code) => {
          if (code !== "0x") return setIsContract(true);
        })
        .catch((e) => setIsContract(false));
    }
  }, [list.type, list.address, selectedPair.chainId]);

  const type = isContract ? "Contract" : list.type;
  const typeSvgs = {
    Contract: QuestionSVG,
    "Liquidity Pool": DatabaseSVG,
    Deployer: DeployerSVG,
    Wallet: WalletCircleSVG,
    "Staking Pool": LockSVG,
  };

  const typeTexts = {
    Contract: "An unknown contract.",
    "Liquidity Pool": "The liquidity pool for this pair.",
    Deployer: "The contract deployer address.",
    Wallet: "A user wallet address.",
    "Staking Pool": "A staking pool.",
  };

  return (
    <>
      <div className="hidden lg:block">
        <div
          className={`flex justify-between ${
            i % 2 === 0 ? "bg-[#D9D9D90D]" : "bg-[#D9D9D91A]"
          } cursor-pointer items-center rounded-[2px] border border-transparent p-[4px_0px_4px_12px] text-white hover:border-white`}
        >
          <div className="flex flex-1">
            <a
              className="flex w-20 items-center "
              href={getExplorerLink(list.chainId, "address", list.address)}
              target="_blank"
            >
              <img
                src={getExplorerLogo(list.chainId)}
                alt={""}
                className="mr-1.5 h-4 w-4 rounded-full border border-white bg-white"
              />
              <div className="text-white">{getEllipsis(list.address, 6, 0)}</div>
            </a>
            {type === "Deployer" && list.ownerShip >= 2 ? (
              <div className="flex w-[120px] items-center justify-center text-primary">{warningFillSVG}</div>
            ) : (
              <div className="w-[120px]" />
            )}
            <div
              className="flex w-[180px] items-center whitespace-nowrap"
              onClick={() => {
                if (type === "Wallet") {
                  setCriteria(list.address);
                  setShowType(7);
                }
              }}
            >
              <div className="mr-5 text-tailwind [&>svg]:h-4 [&>svg]:w-4" id={"walletType" + i}>
                {typeSvgs[type]}
              </div>
              <div
                className={`mt-0.5 ${
                  type === "Wallet" || type === "Contract" ? "text-[#FFFFFF80]" : "text-primary"
                } font-semibold`}
              >
                {type}
              </div>
              {type === "Wallet" ? (
                <div className="ml-3 text-tailwind [&>svg]:h-3 [&>svg]:w-3">{ChevronDownSVG}</div>
              ) : (
                ""
              )}
            </div>
            <div className="mr-10 flex max-w-[360px] flex-1 items-center" id={"heldAmount" + i}>
              <div className="h-2 w-full overflow-hidden rounded-lg bg-[#ffffff33]">
                <div className="h-full rounded-lg bg-[#FFFFFF80]" style={{ width: list.ownerShip + "%" }} />
              </div>
            </div>
          </div>
          <div className="flex">
            <div className="w-24">{BigNumberFormat(list.balance)}</div>
            <div
              className={`w-[100px] ${
                list.ownerShipStatus === "Up"
                  ? "text-[#32FFB5]"
                  : list.ownerShipStatus === "Draw"
                  ? "text-white"
                  : "text-[#DC4545]"
              } flex items-center`}
            >
              <div className="w-12">{list.ownerShip.toFixed(2)}%</div>
              <div
                className={`ml-2 [&>div>svg]:h-3.5 [&>div>svg]:w-3.5 ${
                  list.ownerShipStatus === "Draw" ? "text-tailwind" : ""
                }`}
              >
                {list.ownerShipStatus === "Up" ? (
                  <div id={"upOwnership" + i}>{upSVG}</div>
                ) : list.ownerShipStatus === "Draw" ? (
                  <div id={"drawOwnership" + i}>{MinusSVG}</div>
                ) : (
                  <div id={"downOwnership" + i}>{downSVG}</div>
                )}
              </div>
            </div>
            <div className="w-20">${BigNumberFormat(list.balance * price)}</div>
          </div>
        </div>
      </div>
      <div className="block lg:hidden">
        <div
          className={`mb-2 flex flex-col ${
            i % 2 === 0 ? "bg-[#D9D9D90D]" : "bg-[#D9D9D91A]"
          } cursor-pointer rounded-[2px] border border-transparent p-[4px_12px] text-white  hover:border-white`}
        >
          <div className="flex flex-wrap justify-between">
            <div className="flex items-center text-white">
              <a
                className="flex items-center"
                href={getExplorerLink(list.chainId, "address", list.address)}
                target="_blank"
              >
                <img
                  src={getExplorerLogo(list.chainId)}
                  alt={""}
                  className="mr-1.5 h-4 w-4 rounded-full border border-white bg-white"
                />
                <div className="text-white">{getEllipsis(list.address, 20, 0)}</div>
              </a>
            </div>
            <div
              className="flex items-center whitespace-nowrap"
              onClick={() => {
                if (type === "Wallet") {
                  setCriteria(list.address);
                  setShowType(7);
                }
              }}
            >
              <div className="mr-2 text-tailwind [&>svg]:h-4 [&>svg]:w-4" id={"walletType1" + i}>
                {typeSvgs[type]}
              </div>
              <div
                className={`mt-0.5 ${
                  type === "Wallet" || type === "Contract" ? "text-[#FFFFFF80]" : "text-primary"
                } font-semibold`}
              >
                {type}
              </div>
              {type === "Wallet" ? (
                <div className="ml-3 text-tailwind [&>svg]:h-3 [&>svg]:w-3">{ChevronDownSVG}</div>
              ) : (
                ""
              )}
            </div>
          </div>

          <div className="flex flex-wrap justify-between">
            <div className="flex  items-center ">
              <div>{selectedPair.baseToken.symbol}:</div>&nbsp;
              <div className="">{BigNumberFormat(list.balance)}</div>
            </div>
            <div className="flex items-center">
              <div>USD:</div>&nbsp;
              <div className="capitalize">${BigNumberFormat(list.balance * price)}</div>
            </div>
          </div>
          <div className="flex flex-wrap justify-between">
            <div className="flex items-center">
              <div>Ownership:</div>&nbsp;
              <div
                className={`${
                  list.ownerShipStatus === "Up"
                    ? "text-[#32FFB5]"
                    : list.ownerShipStatus === "Draw"
                    ? "text-white"
                    : "text-[#DC4545]"
                } flex items-center`}
              >
                <div className="w-12">{list.ownerShip.toFixed(2)}%</div>
                <div
                  className={`[&>div>svg]:h-3.5 [&>div>svg]:w-3.5 ${
                    list.ownerShipStatus === "Draw" ? "text-tailwind" : ""
                  }`}
                >
                  {list.ownerShipStatus === "Up" ? (
                    <div id={"upOwnership1" + i}>{upSVG}</div>
                  ) : list.ownerShipStatus === "Draw" ? (
                    <div id={"drawOwnership1" + i}>{MinusSVG}</div>
                  ) : (
                    <div id={"downOwnership1" + i}>{downSVG}</div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center">
            <div>Held:</div>&nbsp;
            <div className="ml-2 flex max-w-[360px] flex-1 items-center" id={"heldAmount1" + i}>
              <div className="h-2 w-full overflow-hidden rounded-lg bg-[#ffffff33]">
                <div className="h-full rounded-lg bg-[#FFFFFF80]" style={{ width: list.ownerShip + "%" }} />
              </div>
            </div>
          </div>
        </div>
      </div>
      <ReactTooltip anchorId={"upOwnership" + i} place="left" content="Token balance increased in last 30D." />
      <ReactTooltip anchorId={"drawOwnership" + i} place="left" content="Token balance has not changed in 30D." />
      <ReactTooltip anchorId={"downOwnership" + i} place="left" content="Token balance decreased in last 30D." />

      <ReactTooltip anchorId={"upOwnership1" + i} place="left" content="Token balance increased in last 30D." />
      <ReactTooltip anchorId={"drawOwnership1" + i} place="left" content="Token balance has not changed in 30D." />
      <ReactTooltip anchorId={"downOwnership1" + i} place="left" content="Token balance decreased in last 30D." />

      <ReactTooltip anchorId={"walletType" + i} place="left" content={typeTexts[type]} />
      <ReactTooltip anchorId={"walletType1" + i} place="left" content={typeTexts[type]} />

      <ReactTooltip anchorId={"heldAmount" + i} place="top" content={list.ownerShip.toFixed(2) + "%"} />
      <ReactTooltip anchorId={"heldAmount1" + i} place="top" content={list.ownerShip.toFixed(2) + "%"} />
    </>
  );
}
