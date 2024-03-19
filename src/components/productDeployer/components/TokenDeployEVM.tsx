import { ethers } from "ethers";
import { useNetwork } from "wagmi";
import { Pen } from "lucide-react";
import { formatEther } from "viem";
import { toast } from "react-toastify";
import { Button } from "components/ui/button";
import { useTokenFactory } from "state/deploy/hooks";
import { useFactory } from "hooks/useFactory";
import { useActiveChainId } from "hooks/useActiveChainId";
import { useDeployerState, setDeployedAddress, setDeployerStep } from "state/deploy/deployer.store";
import { getNativeSymbol } from "lib/bridge/helpers";
import TokenFactoryAbi from "config/abi/token/factory.json";

interface TokenDeployEVMProps {
  setIsDeploying: (args: boolean) => void;
}

const TokenDeployEVM = ({ setIsDeploying }: TokenDeployEVMProps) => {
  const { chain: EVMChain } = useNetwork();
  const { chainId, isLoading } = useActiveChainId();

  const [
    {
      tokenName,
      tokenImage,
      tokenDescription,
      tokenSymbol,
      tokenDecimals,
      tokenTotalSupply,
      tokenImmutable,
      tokenRevokeFreeze,
      tokenRevokeMint,
    },
  ] = useDeployerState("tokenInfo");

  const factory = useTokenFactory(EVMChain.id);
  const { onCreate } = useFactory(chainId, factory.payingToken.isNative ? factory.serviceFee : "0");

  const handleTokenDeployEVM = async () => {
    try {
      setIsDeploying(true);
      const tx = await onCreate(tokenName, tokenSymbol, tokenDecimals, tokenTotalSupply.toString());

      const iface = new ethers.utils.Interface(TokenFactoryAbi);

      for (let i = 0; i < tx.logs.length; i++) {
        try {
          const log = iface.parseLog(tx.logs[i]);
          if (log.name === "StandardTokenCreated") {
            const token = log.args.token;
            setDeployedAddress(token);
            setDeployerStep("success");
            break;
          }
        } catch (e) {}
      }
      setIsDeploying(false);
    } catch (e) {
      toast.error("Error deploying token contract");
      setIsDeploying(false);
    }
  };

  return (
    <>
      <div className="flex items-center justify-between p-4">
        <div className="font-bold text-gray-200">Total fee</div>
        <div className="font-bold text-brand">
          {`${formatEther(BigInt(factory.serviceFee))}  ${getNativeSymbol(chainId)}`}
        </div>
      </div>

      <div className="mt-4 flex gap-2">
        <Button type="button" onClick={() => setDeployerStep("details")} className="flex w-full items-center gap-2">
          Edit <Pen className="h-4 w-4" />
        </Button>

        <Button type="button" onClick={() => handleTokenDeployEVM()} variant="brand" className="w-full">
          Deploy
        </Button>
      </div>
    </>
  );
};

export default TokenDeployEVM;
