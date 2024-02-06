import { useState, useEffect } from "react";
import useActiveWeb3React from "hooks/useActiveWeb3React";
import { AGGREGATOR_SUBGRAPH_NAMES, ROUTER_SUBGRAPH_NAMES } from "config/constants/swap";

export const useGraphEndPoint = () => {
  const { chainId } = useActiveWeb3React();

  const [graphEndpoint, setGraphEndPoint] = useState<{ [path: string]: string }>({});

  useEffect(() => {
    if (chainId) {
      setGraphEndPoint({
        aggregator: AGGREGATOR_SUBGRAPH_NAMES[chainId]
          ? chainId === 56
            ? `https://api.thegraph.com/subgraphs/name/kittystardev/brewlabs-aggregator-bsc`
            : `https://api.thegraph.com/subgraphs/name/devscninja/${AGGREGATOR_SUBGRAPH_NAMES[chainId]}`
          : undefined,
        router: ROUTER_SUBGRAPH_NAMES[chainId]
          ? `https://api.thegraph.com/subgraphs/name/brainstormk/${ROUTER_SUBGRAPH_NAMES[chainId]}`
          : undefined,
      });
    }
  }, [chainId]);

  return graphEndpoint;
};
