/* eslint-disable react-hooks/exhaustive-deps */

import { useContext, useEffect, useState } from "react";
import CommunityCard from "./CommunityCard";
import SelectionPanel from "./SelectionPanel";
import { useAccount } from "wagmi";
import { isArray } from "lodash";
import axios from "axios";
import { CommunityContext } from "contexts/CommunityContext";

const CommunityList = () => {
  const { communities }: any = useContext(CommunityContext);

  const [favourites, setFavourites] = useState([]);
  const [curFilter, setCurFilter] = useState(0);
  const [criteria, setCriteria] = useState("");

  const { address: account } = useAccount();

  const getFavourites = () => {
    try {
      let _favourites: any = localStorage.getItem(`communityfavourites`);
      _favourites = JSON.parse(_favourites);
      setFavourites(isArray(_favourites) ? _favourites : []);
    } catch (error) {
      console.log(error);
    }
  };
  useEffect(() => {
    getFavourites();
  }, [account]);

  const wrappedCommunities = communities.map((data) => {
    return { ...data, isFavourite: favourites.includes(data.pid) };
  });
  const filteredCommunity = wrappedCommunities
    .filter(
      (data) =>
        data.name.toLowerCase().includes(criteria.toLowerCase()) ||
        data.currencies[data.coreChainId].address.toLowerCase().includes(criteria.toLowerCase())
    )
    .filter((data, i) => (data.isFavourite && curFilter === 1) || curFilter === 0);

  return (
    <div>
      <div className="flex items-center justify-between">
        <div className="hidden text-white sm:block">Communities</div>
        <div className="flex-1 sm:flex-none">
          <SelectionPanel
            curFilter={curFilter}
            setCurFilter={setCurFilter}
            criteria={criteria}
            setCriteria={setCriteria}
            communities={wrappedCommunities}
          />
        </div>
      </div>
      <div>
        {filteredCommunity.map((data, i) => {
          return <CommunityCard community={data} key={i} favourites={favourites} getFavourites={getFavourites} />;
        })}
      </div>
    </div>
  );
};

export default CommunityList;
