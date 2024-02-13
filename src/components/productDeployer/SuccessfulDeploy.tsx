import { useState } from "react";
import { useAccount } from "wagmi";
import { ExternalLink, UserCheck2 } from "lucide-react";

import TokenSummary from "@components/productDeployer/TokenSummary";

import { getBlockExplorerLink, getExplorerLogo } from "utils/functions";
import { useActiveChainId } from "@hooks/useActiveChainId";

import { addTokenToMetamask } from "lib/bridge/helpers";
import { BridgeToken } from "config/constants/types";

import { useDeployerState } from "state/deploy/deployer.store";
import { ShieldCheckIcon } from "@heroicons/react/24/outline";

const SuccessfulDeploy = () => {
  const { connector, address } = useAccount();
  const { chainId } = useActiveChainId();
  const [isCopied, setIsCopied] = useState(false);
  const [deployedAddress] = useDeployerState("deployedAddress");
  const [{ tokenSymbol, tokenDecimals }] = useDeployerState("tokenInfo");

  const onCopyAddress = () => {
    setIsCopied(true);
    setTimeout(() => {
      setIsCopied(false);
    }, 1000);
    navigator.clipboard.writeText(getBlockExplorerLink(deployedAddress, "token", chainId));
  };

  function onAddToMetamask() {
    addTokenToMetamask(connector, {
      symbol: tokenSymbol,
      decimals: tokenDecimals,
      address: deployedAddress,
    } as unknown as BridgeToken);
  }

  return (
    <div className="flex flex-col gap-4">
      <h4 className="mb-6 text-3xl">Congratulations your token was deployed!</h4>

      <div className="flex flex-col gap-4">
        <div className="ml-auto flex items-center gap-3">
          <button className="btn-ghost btn btn-xs font-light text-gray-400" onClick={() => onCopyAddress()}>
            {isCopied ? "Copied" : "Copy token address"}
          </button>
          <button className="btn-ghost btn btn-xs font-light text-gray-400" onClick={() => onAddToMetamask()}>
            + Add to MetaMask
          </button>
        </div>
        <div className="tooltip tooltip-bottom" data-tip="View on Block Explorer">
          <a
            target="_blank"
            href={getBlockExplorerLink(deployedAddress, "token", chainId)}
            className="flex items-center rounded-3xl px-4 py-2 shadow-xl shadow-yellow-600/30 ring ring-zinc-600/50"
          >
            <img
              src={getExplorerLogo(chainId)}
              alt="Block explorer"
              className="mr-1.5 h-4 w-4 rounded-full border border-white bg-white"
            />
            <div className="mx-2.5 flex-1 overflow-hidden text-ellipsis whitespace-nowrap text-center font-roboto text-sm font-bold text-white">
              {deployedAddress}
            </div>
            <ExternalLink className="h-4 w-4" />
          </a>
        </div>
      </div>

      <div className="mt-4 flex flex-col gap-4">
        <h4 className="my-2 text-xl">Summary</h4>
        <p className="flex items-center gap-2">
          <ShieldCheckIcon className="h-6 w-6 text-green-500" /> Deployed and verified
        </p>
        <p className="flex items-center gap-2">
          <UserCheck2 className="h-6 w-6" /> Deployed to{" "}
          <span className="rounded-3xl px-2 py-1 text-sm ring-1 ring-zinc-600">{address}</span>
        </p>

        <TokenSummary />
      </div>

      <p className="text-xs text-gray-500">
        Now that your new token has been deployed to your wallet, you can add it to your web3 wallet by copying the
        contract address and adding it to your wallet as a custom token. Please familiarise yourself with your token
        contract address, as you will be required to integrate it frequently to various dAPP’s manually before your
        token is verified by third parties.
      </p>
    </div>
  );
};

export default SuccessfulDeploy;
