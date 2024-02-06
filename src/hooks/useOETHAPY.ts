import axios from "axios";
import { useEffect, useState } from "react";

export async function fetchOETHMontlyAPY() {
  const { data: response } = await axios.get("https://analytics.ousd.com/api/v2/oeth/apr/trailing_history/30");
  return response.trailing_history[0].trailing_apy / 100;
}

export const useOETHMonthlyAPY = () => {
  const [apy, setAPY] = useState(null);
  useEffect(() => {
    fetchOETHMontlyAPY()
      .then((apy) => {
        setAPY(apy);
      })
      .catch((e) => console.log(e));
  }, []);
  return apy;
};

export const useOETHWeeklyAPY = () => {
  const [apy, setAPY] = useState(null);
  useEffect(() => {
    axios
      .get("https://analytics.ousd.com/api/v2/oeth/apr/trailing_history/7")
      .then((data) => {
        setAPY(data.data.trailing_history[0].trailing_apy / 100);
      })
      .catch((e) => console.log(e));
  }, []);
  return apy;
};
