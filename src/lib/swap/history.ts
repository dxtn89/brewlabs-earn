import { request } from "graphql-request";
import { waitForTransaction } from "@wagmi/core";

import { SWAP_LOGS as AGGREGATOR_SWAP_LOGS } from "config/queries/aggregator";
import { SWAP_LOGS as ROUTER_SWAP_LOGS } from "config/queries/router";
import { ChainId } from "@brewlabs/sdk";

const pageSize = 1000;

export const getSwapLogs = async (graphEndpoint: { [path: string]: string }, caller: string, chainId: ChainId) => {
  if (!caller) return [];
  const aggregatorSwapLogs = await getSwapLogsFromAggregator(graphEndpoint.aggregator, caller);
  const routerSwapLogs = await getSwapLogsFromRouter(graphEndpoint.router, caller, chainId);
  return routerSwapLogs.concat(aggregatorSwapLogs);
};

export const getSwapLogsFromRouter = async (graphEndpoint: string, caller: string, chainId: ChainId) => {
  if (!graphEndpoint) return [];

  let logs: any[] = [];
  let page = 0;
  const first = pageSize;
  while (true) {
    try {
      const data: any = await request(graphEndpoint, ROUTER_SWAP_LOGS, {
        first,
        skip: page * pageSize,
        caller,
      });
      if (data) {
        logs = data.logs.concat(logs);
      }
      if (!data || data.logs.length < pageSize) break;
      page += 1;
    } catch (graphError) {
      console.log({ graphError });
      break;
    }
  }

  return logs.map((log) => {
    const {
      id,
      transaction: { id: transactionHash },
      pair: {
        token0: { id: token0 },
        token1: { id: token1 },
      },
      amount0In,
      amount0Out,
      amount1In,
      amount1Out,
      timestamp,
    } = log;

    if (Number(amount0In) > 0) {
      return {
        _tokenIn: token0,
        _tokenOut: token1,
        _amountIn: amount0In,
        _amountOut: amount1Out,
        transactionHash,
        source: "router",
        timestamp,
      };
    } else {
      return {
        _tokenIn: token1,
        _tokenOut: token0,
        _amountIn: amount1In,
        _amountOut: amount0Out,
        transactionHash,
        source: "router",
        timestamp,
      };
    }
  });
};

export const getSwapLogsFromAggregator = async (graphEndpoint: string, caller: string) => {
  if (!graphEndpoint) return [];

  let logs: any[] = [];
  let page = 0;
  const first = pageSize;

  // eslint-disable-next-line no-constant-condition
  while (true) {
    try {
      // eslint-disable-next-line no-await-in-loop
      const data: any = await request(graphEndpoint, AGGREGATOR_SWAP_LOGS, {
        first,
        skip: page * pageSize,
        caller,
      });
      if (data) {
        logs = data.logs.concat(logs);
      }
      if (!data || data.logs.length < pageSize) break;
      page += 1;
    } catch (graphError) {
      console.error({ graphError });
      break;
    }
  }
  return logs.map((log) => ({ ...log, source: "aggregator", timestamp: log.blockTimestamp }));
};
