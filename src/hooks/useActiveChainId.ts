import { useRouter } from "next/router";
import { useEffect, useMemo, useState } from "react";
import { ChainId } from "@brewlabs/sdk";
import { useNetwork } from "wagmi";

import { bsc } from "contexts/wagmi";
import { PAGE_SUPPORTED_CHAINS } from "config/constants/networks";
import { useGlobalState } from "state";
import { isChainSupported } from "utils/wagmi";
import { useReplaceQueryParams } from "./useReplaceQueryParams";
import { useSolanaNetwork } from "contexts/SolanaNetworkContext";

export const useQueryChainId = () => {
  const router = useRouter();
  const { replaceQueryParams } = useReplaceQueryParams();
  const { query } = router;

  const [queryChainId, setQueryChainId] = useState(-1);

  useEffect(() => {
    const page = router.pathname.split("/")[1];
    if (query.chainId === undefined) return;
    if (typeof query.chainId !== "string") return;
    if (!PAGE_SUPPORTED_CHAINS[page]) return;

    if (!PAGE_SUPPORTED_CHAINS[page].includes(+query.chainId)) {
      replaceQueryParams("chainId", PAGE_SUPPORTED_CHAINS[page][0]);
    }
    setQueryChainId(+query.chainId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query.chainId]);

  return queryChainId;
};

export function useLocalNetworkChain() {
  const [sessionChainId] = useGlobalState("sessionChainId");
  const queryChainId = useQueryChainId();

  const chainId = +(sessionChainId || queryChainId);
  if (isChainSupported(chainId)) {
    return chainId;
  } else if (chainId === 900 || chainId === 901) return chainId;

  return undefined;
}

export const useActiveChainId = (): { chainId: ChainId; isWrongNetwork: any; isNotMatched: any; isLoading: any } => {
  const { chain } = useNetwork();
  const localChainId = useLocalNetworkChain();
  const queryChainId = useQueryChainId();
  const isNotMatched = useMemo(() => chain && localChainId && chain.id !== localChainId, [chain, localChainId]);
  // const isNotMatched = false;
  const { isSolanaNetwork, setIsSolanaNetwork } = useSolanaNetwork();
  useEffect(() => {
    if (queryChainId === 900 || queryChainId === 901) setIsSolanaNetwork(true);
    else setIsSolanaNetwork(false);
  }, [queryChainId, setIsSolanaNetwork]);

  if (localChainId == undefined && queryChainId <= 0)
    return {
      chainId: queryChainId,
      isWrongNetwork: (chain?.unsupported ?? false) || isNotMatched,
      // isWrongNetwork: isNotMatched,
      isNotMatched,
      isLoading: true,
    };
  // const chainId = localChainId ?? chain?.id ?? (queryChainId <= 0 ? bsc.id : queryChainId);
  const chainId = localChainId ?? (queryChainId <= 0 ? 901 : queryChainId);

  return {
    chainId,
    isWrongNetwork: (chain?.unsupported ?? false) || isNotMatched,
    // isWrongNetwork: isNotMatched,
    isNotMatched,
    isLoading: false,
  };
};
