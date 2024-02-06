import { CHART_PERIOD_RESOLUTION, LIVECOIN_APIS } from "config/constants";

export async function getMarketInfo(chartPeriod) {
  let i;
  for (i = 0; i < LIVECOIN_APIS.length; i++) {
    try {
      const response = await fetch(new Request("https://api.livecoinwatch.com/overview/history"), {
        method: "POST",
        headers: new Headers({
          "content-type": "application/json",
          "x-api-key": LIVECOIN_APIS[i],
        }),
        body: JSON.stringify({
          currency: "USD",
          start: Date.now() - 1000 * CHART_PERIOD_RESOLUTION[chartPeriod].period,
          end: Date.now(),
        }),
      });

      if (response.status !== 200) return [];

      let result = await response.json();
      let temp: any = [];
      for (let i = 0; i < result.length; i++) {
        temp.push(result[i].cap);
      }
      return temp;
    } catch (error) {
      console.log(error);
    }
  }
  if (i === LIVECOIN_APIS.length) {
    return [];
  }
}
