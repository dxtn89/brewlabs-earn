/* eslint-disable react-hooks/exhaustive-deps */

import StyledButton from "../../StyledButton";
import StyledInput from "@components/StyledInput";
import { numberWithCommas } from "utils/functions";
import { useActiveChainId } from "@hooks/useActiveChainId";
import { useTokenFactory } from "state/deploy/hooks";
import { useFactory } from "./hooks";
import { toast } from "react-toastify";
import { useContext } from "react";
import { DashboardContext } from "contexts/DashboardContext";
import { ethers } from "ethers";
import TokenFactoryAbi from "config/abi/token/factory.json";
import { getNativeSybmol, handleWalletError } from "lib/bridge/helpers";

const Deploy = ({ setOpen, step, setStep, values }) => {
  const { name, symbol, decimals, totalSupply, setName, setSymbol, setDecimals, setTotalSupply, setDeployedAddress } =
    values;

  const { chainId } = useActiveChainId();

  const factory = useTokenFactory(chainId);

  const { onCreate } = useFactory(chainId, factory.payingToken.isNative ? factory.serviceFee : "0");

  const { pending, setPending }: any = useContext(DashboardContext);

  const showError = (errorMsg: string) => {
    if (errorMsg) toast.error(errorMsg);
  };

  const handleDeploy = async () => {
    if (totalSupply === 0) {
      toast.error("Total supply should be greater than zero");
      return;
    }

    setPending(true);

    try {
      // deploy farm contract
      const tx = await onCreate(name, symbol, decimals, totalSupply);

      const iface = new ethers.utils.Interface(TokenFactoryAbi);
      for (let i = 0; i < tx.logs.length; i++) {
        try {
          const log = iface.parseLog(tx.logs[i]);
          if (log.name === "StandardTokenCreated") {
            const token = log.args.token;
            setDeployedAddress(token);
            setStep(3);
            break;
          }
        } catch (e) {}
      }
    } catch (e) {
      console.log(e);
      handleWalletError(e, showError, getNativeSybmol(chainId));
      setStep(2);
    }
    setPending(false);
  };

  return (
    <div className="font-brand text-white">
      <div className="mt-4">
        <div className="mb-1 text-sm">1. Select a name for your token</div>
        <StyledInput
          type={"text"}
          placeholder="i.e Brewlabs Token....."
          value={name}
          setValue={setName}
          className="primary-shadow h-12 w-full rounded-lg bg-[#18181A] text-white"
        />
      </div>

      <div className="mt-4">
        <div className="mb-1 text-sm">2. Select a symbol for your token</div>
        <StyledInput
          type={"text"}
          placeholder="i.e BNB"
          value={symbol}
          setValue={setSymbol}
          className="primary-shadow h-12 w-full rounded-lg bg-[#18181A] text-white"
        />
      </div>
      <div className="mt-4">
        <div className="mb-1 text-sm">3. Select decimals for your token</div>
        <StyledInput
          type={"text"}
          placeholder="i.e 18"
          value={decimals}
          setValue={setDecimals}
          className="primary-shadow h-12 w-full rounded-lg bg-[#18181A] text-white"
        />
      </div>
      <div className="mt-4">
        <div className="mb-1 text-sm">4. How many tokens do you want to create?</div>
        <StyledInput
          type={"text"}
          placeholder="i.e 10000000"
          value={totalSupply}
          setValue={setTotalSupply}
          className="primary-shadow h-12 w-full rounded-lg bg-[#18181A] text-white"
        />
      </div>
      <div className="my-6 text-sm leading-[1.8]">
        <div>Summary</div>
        <div className="flex justify-between">
          <div>Token name</div>
          <div className={name ? "text-white" : "text-[#FFFFFF40]"}>{name ? name : "Pending..."}</div>
        </div>
        <div className="flex justify-between">
          <div>Token symbol</div>
          <div className={symbol ? "text-white" : "text-[#FFFFFF40]"}>{symbol ? symbol : "Pending..."}</div>
        </div>
        <div className="flex justify-between">
          <div>Token decimals</div>
          <div className={decimals ? "text-white" : "text-[#FFFFFF40]"}>{decimals ? decimals : "Pending..."}</div>
        </div>
        <div className="flex justify-between">
          <div>Amount of tokens</div>
          <div className={totalSupply ? "text-white" : "text-[#FFFFFF40]"}>
            {totalSupply ? `${numberWithCommas(Number(totalSupply).toFixed(2))} ${symbol}` : "Pending..."}
          </div>
        </div>
        <div className="flex justify-between">
          <div>Fee</div>
          <div className="text-[#FFFFFF40]">
            {ethers.utils.formatEther(factory.serviceFee)} {getNativeSybmol(chainId)}
          </div>
        </div>
      </div>
      <div className="mb-5 h-[1px] w-full bg-[#FFFFFF80]" />
      <StyledButton
        type="primary"
        className="!h-12"
        disabled={!name || !symbol || !decimals || !totalSupply || pending}
        pending={pending}
        onClick={() => handleDeploy()}
      >
        Create my token
      </StyledButton>
    </div>
  );
};

export default Deploy;
