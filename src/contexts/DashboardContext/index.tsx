/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState } from "react";

import { useSlowRefreshEffect } from "hooks/useRefreshEffect";
import { fetchFeaturedPrices } from "./fetchFeaturedPrices";

const DashboardContext: any = React.createContext({
  tokens: [],
  featuredPriceHistory: [],
  pending: false,
  selectedDeployer: "",
  viewType: 0,
  chartPeriod: 0,
  setViewType: () => {},
  setSelectedDeployer: () => {},
  setPending: () => {},
  setChartPeriod: () => {},
});

const DashboardContextProvider = ({ children }: any) => {
  const [pending, setPending] = useState(false);
  const [featuredPriceHistory, setFeaturedPriceHistory] = useState([]);
  const [selectedDeployer, setSelectedDeployer] = useState("");
  const [viewType, setViewType] = useState(0);
  const [chartPeriod, setChartPeriod] = useState(0);

  useSlowRefreshEffect(() => {
    fetchFeaturedPrices()
      .then((data) => setFeaturedPriceHistory(data))
      .catch((e) => console.log(e));
  }, []);

  return (
    <DashboardContext.Provider
      value={{
        pending,
        setPending,
        featuredPriceHistory,
        selectedDeployer,
        setSelectedDeployer,
        viewType,
        setViewType,
        chartPeriod,
        setChartPeriod,
      }}
    >
      {children}
    </DashboardContext.Provider>
  );
};

export { DashboardContext, DashboardContextProvider };
