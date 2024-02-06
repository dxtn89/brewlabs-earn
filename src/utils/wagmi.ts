import memoize from "lodash/memoize";
import { useMemo } from "react";
import { providers } from "ethers";
import { type HttpTransport } from "viem";
import { type PublicClient, usePublicClient, useWalletClient, type WalletClient } from "wagmi";

import { SupportedChains } from "config/constants/networks";

export const CHAIN_IDS = SupportedChains.map((c) => c.id);

export const isChainSupported = memoize((chainId: number) => CHAIN_IDS.includes(chainId));
export const isChainTestnet = memoize((chainId: number) => SupportedChains.find((c) => c.id === chainId)?.["testnet"]);

export function publicClientToProvider(publicClient: PublicClient) {
  const { chain, transport } = publicClient;
  const network = {
    chainId: chain.id,
    name: chain.name,
    ensAddress: chain.contracts?.ensRegistry?.address,
  };
  if (transport.type === "fallback")
    return new providers.FallbackProvider(
      (transport.transports as ReturnType<HttpTransport>[]).map(({ value }) => {
        return new providers.JsonRpcProvider(value?.url, network);
      })
    );
  return new providers.JsonRpcProvider(transport.url, network);
}

/** Hook to convert a viem Public Client to an ethers.js Provider. */
export function useProvider({ chainId }: { chainId?: number } = {}) {
  const publicClient = usePublicClient({ chainId });
  return useMemo(() => publicClientToProvider(publicClient), [publicClient]);
}

export function walletClientToSigner(walletClient: WalletClient) {
  const { account, chain, transport } = walletClient;
  const network = {
    chainId: chain.id,
    name: chain.name,
    ensAddress: chain.contracts?.ensRegistry?.address,
  };
  const provider = new providers.Web3Provider(transport as any, network);
  const signer = provider.getSigner(account.address);
  return signer;
}

/** Hook to convert a viem Wallet Client to an ethers.js Signer. */
export function useSigner() {
  const { data: walletClient } = useWalletClient();
  return useMemo(() => ({ data: walletClient ? walletClientToSigner(walletClient) : undefined }), [walletClient]);
}
