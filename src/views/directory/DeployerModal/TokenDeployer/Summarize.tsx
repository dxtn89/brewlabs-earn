/* eslint-disable react-hooks/exhaustive-deps */

import StyledButton from "../../StyledButton";
import { getBlockExplorerLink, getExplorerLogo, numberWithCommas } from "utils/functions";
import { useActiveChainId } from "@hooks/useActiveChainId";
import { LinkSVG } from "@components/dashboard/assets/svgs";
import { useState } from "react";
import { addTokenToMetamask } from "lib/bridge/helpers";
import { useAccount } from "wagmi";
import { BridgeToken } from "config/constants/types";

const Summarize = ({ setOpen, values }) => {
  const { name, symbol, decimals, totalSupply, deployedAddress } = values;
  const { chainId } = useActiveChainId();
  const { connector } = useAccount();
  const [isCopied, setIsCopied] = useState(false);

  const onCopyAddress = () => {
    setIsCopied(true);
    setTimeout(() => {
      setIsCopied(false);
    }, 1000);
    navigator.clipboard.writeText(getBlockExplorerLink(deployedAddress, "token", chainId));
  };

  function onAddToMetamask() {
    console.log(deployedAddress);
    addTokenToMetamask(connector, {
      address: deployedAddress,
      decimals,
      symbol,
    } as unknown as BridgeToken);
  }

  return (
    <div className="font-brand text-white">
      <div className="mt-5">
        <div className="font-roboto text-sm font-semibold">Congratulations your token was deployed to your wallet!</div>
        <div className="mt-2.5 flex">
          <div className="relative flex-1">
            <a
              target="_blank"
              href={getBlockExplorerLink(deployedAddress, "token", chainId)}
              className="primary-shadow relative flex h-12 items-center justify-between rounded-xl bg-[#18181A] px-4 sm:px-[28px]"
            >
              <img
                src={getExplorerLogo(chainId)}
                alt={""}
                className="mr-1.5 h-4 w-4 rounded-full border border-white bg-white"
              />
              <div className="mx-2.5 flex-1 overflow-hidden text-ellipsis whitespace-nowrap text-center font-roboto text-sm font-bold text-white">
                {deployedAddress}
              </div>
              <div className="text-tailwind">{LinkSVG}</div>
            </a>
            <div className="absolute -bottom-6 right-0 flex text-xs text-[#FFFFFF80]">
              <div className="cursor-pointer hover:text-white" onClick={() => onCopyAddress()}>
                {isCopied ? "COPIED" : "COPY TOKEN ADDRESS"}
              </div>
              <div className="ml-4 cursor-pointer hover:text-white" onClick={() => onAddToMetamask()}>
                +ADD TOKEN TO METMAMASK
              </div>
            </div>
          </div>
          <div className="ml-4 flex h-12 w-20 items-center justify-center rounded-xl bg-[#3AFDB7] font-roboto text-xs font-bold text-black">
            Deployed
          </div>
        </div>
      </div>
      <div className="mb-6 mt-8 font-roboto text-sm font-medium leading-[1.8]">
        <div>Summary</div>
        <div className="mt-1 flex justify-between">
          <div>Status</div>
          <div>Deployed and verified</div>
        </div>
        <div className="flex justify-between">
          <div>Token name</div>
          <div>{name}</div>
        </div>
        <div className="flex justify-between">
          <div>Token symbol</div>
          <div>{symbol}</div>
        </div>
        <div className="flex justify-between">
          <div>Token decimals</div>
          <div>{decimals}</div>
        </div>
        <div className="flex justify-between">
          <div>Amount of tokens</div>
          <div>{totalSupply ? `${numberWithCommas(Number(totalSupply).toFixed(2))} ${symbol}` : "Pending..."}</div>
        </div>

        <div className="flex justify-between">
          <div>Deployed to </div>
          <div className="ml-8 flex-1 overflow-hidden text-ellipsis whitespace-nowrap text-right">
            {deployedAddress}
          </div>
        </div>
      </div>
      <div className="mb-2 h-[1px] w-full bg-[#FFFFFF80]" />
      <div className="mb-10 text-sm text-[#FFFFFF80]">
        Now that your new token has been deployed to your wallet, you can add it to your web3 wallet by copying the
        contract address and adding it to your wallet as a custom token. Please familiarise yourself with your token
        contract address, as you will be required to integrate it frequently to various dAPP’s manually before your
        token is verified by third parties.
      </div>
      <StyledButton type="primary" className="!h-12" onClick={() => setOpen(false)}>
        Close
      </StyledButton>
    </div>
  );
};

export default Summarize;
