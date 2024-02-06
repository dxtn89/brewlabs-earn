import { gql } from "graphql-request";

export const SWAP_LOGS = gql`
  query getSwapLogs($first: Int!, $skip: Int!, $caller: String!) {
    logs: swaps(orderDirection: desc, first: $first, skip: $skip, where: { from: $caller }) {
      id
      transaction {
        id
      }
      pair {
        token0 {
          id
        }
        token1 {
          id
        }
      }
      amount0In
      amount0Out
      amount1In
      amount1Out
      to
      timestamp
    }
  }
`;

export const PAIR_DAY_DATA = gql`
  query pairDayDatas($pairAddress: Bytes!, $startTimestamp: Int!) {
    pairDayDatas(
      first: 1000
      orderBy: date
      orderDirection: desc
      where: { pairAddress_in: $pairAddress, date_gt: $startTimestamp }
    ) {
      id
      date
      dailyVolumeToken0
      dailyVolumeToken1
      totalSupply
    }
  }
`;
export const PAIR_DAY_DATA_BULK = (pairs, startTimestamp) => {
  let pairsString = `[`;
  pairs.map((pair) => {
    return (pairsString += `"${pair}"`);
  });
  pairsString += "]";
  const queryString = `
    query days {
      pairDayDatas(first: 1000, orderBy: date, orderDirection: asc, where: { pairAddress_in: ${pairsString}, date_gt: ${startTimestamp} }) {
        id
        pairAddress
        date
        dailyVolumeToken0
        dailyVolumeToken1
        dailyVolumeUSD
        reserve0
        reserve1
        reserveUSD
        totalSupply
      }
    } 
`;
  return gql`
    ${queryString}
  `;
};
