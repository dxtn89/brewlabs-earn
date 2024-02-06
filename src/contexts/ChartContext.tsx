import axios from "axios";
import { API_URL } from "config/constants";
import { isArray } from "lodash";
import React, { useEffect, useState } from "react";

const ChartContext: any = React.createContext({
  favourites: [],
  setFavourites: () => {},
  onFavourites: () => {},
  pending: false,
  setPending: () => {},
});

export const DEX_API_URL = process.env.NEXT_PUBLIC_DEX_API_URL;

const ChartContextProvider = ({ children }: any) => {
  const [favourites, setFavourites] = useState([]);
  const [criteria, setCriteria] = useState("");
  const [pending, setPending] = useState(false);

  const getFavourites = () => {
    try {
      let _favourites: any = localStorage.getItem(`chart-favorites`);
      _favourites = JSON.parse(_favourites);
      setFavourites(isArray(_favourites) ? _favourites : []);
    } catch (error) {
      console.log(error);
    }
  };

  const onFavourites = (pair: any, type: number) => {
    if (type === 1) {
      const index = favourites.findIndex(
        (favourite) => favourite.address === pair.address && favourite.chainId === pair.chainId
      );
      if (index !== -1) return;
      localStorage.setItem(`chart-favorites`, JSON.stringify([...favourites, pair]));
      getFavourites();
    }
    if (type === 2) {
      let temp = [...favourites];

      const index = favourites.findIndex(
        (favourite) => favourite.address === pair.address && favourite.chainId === pair.chainId
      );
      temp.splice(index, 1);
      localStorage.setItem(`chart-favorites`, JSON.stringify(temp));
      getFavourites();
    }
  };

  useEffect(() => {
    getFavourites();
  }, []);

  return (
    <ChartContext.Provider
      value={{
        favourites,
        onFavourites,
        criteria,
        setCriteria,
        pending,
        setPending,
      }}
    >
      {children}
    </ChartContext.Provider>
  );
};

export { ChartContext, ChartContextProvider };
