import { formatEther } from "viem";
import { Button } from "components/ui/button";
import { numberWithCommas } from "utils/functions";
import { useDeployerState } from "state/deploy/deployer.store";
import { getNativeSymbol } from "lib/bridge/helpers";
import { useTokenFactory } from "state/deploy/hooks";
import { useActiveChainId } from "hooks/useActiveChainId";

const Confirmation = () => {
  const [{ tokenName, tokenSymbol, tokenDecimals, tokenTotalSupply }] = useDeployerState("tokenInfo");
  const { chainId } = useActiveChainId();
  const factory = useTokenFactory(chainId);

  return (
    <div className="my-8 max-w-xl">
      <h4 className="mb-6 text-xl">Summary</h4>

      <p className="my-8">You are about to deploy a new token contract on the X network. Please confirm the details.</p>

      <dl className="mt-8 divide-y divide-gray-600 text-sm lg:col-span-7 lg:mt-0 lg:pr-8">
        <div className="flex items-center justify-between pb-4">
          <dt className="text-gray-400">Token name</dt>
          <dd className="font-medium text-gray-200">{tokenName}</dd>
        </div>

        <div className="flex items-center justify-between py-4">
          <dt className="text-gray-400">Token symbol</dt>
          <dd className="font-medium text-gray-200">{tokenSymbol}</dd>
        </div>
        <div className="flex items-center justify-between py-4">
          <dt className="text-gray-400">Token decimals</dt>
          <dd className="font-medium text-gray-200">{tokenDecimals}</dd>
        </div>
        <div className="flex items-center justify-between py-4">
          <dt className=" text-gray-400">Total supply</dt>
          <dd className="font-medium text-gray-200">
            {numberWithCommas(Number(tokenTotalSupply))} {tokenSymbol}
          </dd>
        </div>
        <div className="flex items-center justify-between pt-4">
          <dt className="font-bold text-gray-200">Total fee</dt>
          <dd className="font-bold text-brand">
            {formatEther(BigInt(factory.serviceFee))} {getNativeSymbol(chainId)}
          </dd>
        </div>
      </dl>
      <Button variant="brand" className="w-full">
        Deploy
      </Button>
    </div>
  );
};

export default Confirmation;
