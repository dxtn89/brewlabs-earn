import { Check, X } from "lucide-react";
import { numberWithCommas } from "utils/functions";
import { useDeployerState } from "state/deploy/deployer.store";
import { Avatar, AvatarImage } from "@components/ui/avatar";

const TokenSummary = () => {
  const [
    {
      tokenName,
      tokenDescription,
      tokenSymbol,
      tokenDecimals,
      tokenTotalSupply,
      tokenImmutable,
      tokenRevokeFreeze,
      tokenRevokeMint,
      tokenBurnPercentage,
    },
  ] = useDeployerState("tokenInfo");
  const [tokenImageDisplayUrl] = useDeployerState("tokenImageDisplayUrl");

  return (
    <dl className="mb-8 mt-12 divide-y divide-gray-600 rounded-xl bg-zinc-600/20 text-sm lg:col-span-7 lg:px-8 lg:py-2">
      <div className="flex items-center justify-between p-4">
        <dt className="text-gray-400">Token name</dt>
        <dd className="font-medium text-gray-200">{tokenName}</dd>
      </div>

      {tokenImageDisplayUrl && (
        <div className="flex items-center justify-between p-4">
          <dt className="text-gray-400">Token image</dt>
          <dd className="font-medium text-gray-200">
            <Avatar className="ring ring-zinc-900">
              <AvatarImage src={tokenImageDisplayUrl} width={500} height={500} alt="Token image" />
            </Avatar>
          </dd>
        </div>
      )}

      <div className="flex items-center justify-between p-4">
        <dt className="text-gray-400">Token symbol</dt>
        <dd className="font-medium text-gray-200">{tokenSymbol}</dd>
      </div>
      <div className="flex items-center justify-between p-4">
        <dt className="text-gray-400">Token decimals</dt>
        <dd className="font-medium text-gray-200">{tokenDecimals}</dd>
      </div>
      <div className="flex items-center justify-between p-4">
        <dt className=" text-gray-400">Amount of tokens</dt>
        <dd className="font-medium text-gray-200">
          {numberWithCommas(Number(tokenTotalSupply))} {tokenSymbol}
        </dd>
      </div>

      {tokenDescription && (
        <div className="flex flex-col gap-4 p-4">
          <dt className="text-gray-400">Token description</dt>
          <dd className="font-medium text-gray-200">{tokenDescription}</dd>
        </div>
      )}

      <div className="flex items-center justify-between p-4">
        <dt className="text-gray-400">Token is immutable</dt>
        <dd className="font-medium text-gray-200">{tokenImmutable ? <Check /> : <X />}</dd>
      </div>

      <div className="flex items-center justify-between p-4">
        <dt className="text-gray-400">Token can revoke freeze</dt>
        <dd className="font-medium text-gray-200">{tokenRevokeFreeze ? <Check /> : <X />}</dd>
      </div>

      <div className="flex items-center justify-between p-4">
        <dt className="text-gray-400">Token can revoke mint</dt>
        <dd className="font-medium text-gray-200">{tokenRevokeMint ? <Check /> : <X />}</dd>
      </div>

      <div className="flex items-center justify-between p-4">
        <dt className="text-gray-400">Token burn percentage</dt>
        <dd className="font-medium text-gray-200">{tokenBurnPercentage}%</dd>
      </div>
    </dl>
  );
};

export default TokenSummary;
