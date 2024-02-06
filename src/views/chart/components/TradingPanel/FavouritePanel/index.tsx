import { StarIcon } from "@heroicons/react/24/solid";
import { ChartContext } from "contexts/ChartContext";
import { useContext, useState } from "react";
import FavouriteCard from "./FavouriteCard";
import DropDown from "views/directory/IndexDetail/Dropdowns/Dropdown";
import { useCGListings, useCMCListings, useWatcherGuruTrending } from "@hooks/chart/useScrappingSite";
import { NETWORKS } from "config/constants/networks";
import { ChainId } from "@brewlabs/sdk";
import { getChainLogo } from "utils/functions";

export default function FavouritePanel() {
  const { favourites }: any = useContext(ChartContext);

  const filters = [
    { icon: <StarIcon className="h-4 w-4" />, name: "Favourites" },
    {
      icon: <img src={"/images/chart/trending/cmc.png"} alt={""} className="h-4 w-4 rounded-full" />,
      name: <div className="text-white">CMC Trending</div>,
    },
    {
      icon: <img src={"/images/chart/trending/cmc.png"} alt={""} className="h-4 w-4 rounded-full" />,
      name: <div className="text-white">CMC Recently Added</div>,
    },
    {
      icon: <img src={"/images/chart/trending/cg.png"} alt={""} className="h-4 w-4 rounded-full" />,
      name: <div className="text-white">CG Trending</div>,
    },
    {
      icon: <img src={"/images/chart/trending/cg.png"} alt={""} className="h-4 w-4 rounded-full" />,
      name: <div className="text-white">CG Top Gainers</div>,
    },
    {
      icon: <img src={"/images/chart/trending/cg.png"} alt={""} className="h-4 w-4 rounded-full" />,
      name: <div className="text-white">CG Top Losers</div>,
    },
    {
      icon: <img src={"/images/chart/trending/watcherguru.png"} alt={""} className="h-4 w-4 rounded-full" />,
      name: <div className="text-white">WG Trending</div>,
    },
  ];
  const [selectedFilter, setSelectedFilter] = useState(0);
  const [selectedNetwork, setSelectedNetwork] = useState(0);

  const { trendings, newListings }: any = useCMCListings();
  const { trendings: cgTrendings, gainers: cgGainers, losers: cgLosers }: any = useCGListings();
  const { trendings: watcherGuruTrendings } = useWatcherGuruTrending();

  const arrays = [
    favourites,
    trendings.map((pair) => pair.name),
    newListings.map((pair) => pair.name),
    cgTrendings.map((pair) => pair.name),
    cgGainers.map((pair) => pair.name),
    cgLosers.map((pair) => pair.name),
    watcherGuruTrendings.map((pair) => pair.name),
  ];
  const networks: any = [
    "All",
    NETWORKS[ChainId.ETHEREUM],
    NETWORKS[ChainId.BSC_MAINNET],
    NETWORKS[ChainId.POLYGON],
    NETWORKS[ChainId.ARBITRUM],
    NETWORKS[8453],
  ];

  return (
    <>
      <div className="flex max-h-[660px] w-[calc(100%+24px)] flex-col">
        <div className="flex items-center justify-between pr-5">
          <DropDown
            value={selectedFilter}
            setValue={setSelectedFilter}
            data={filters.map((filter, i) => (
              <div className="flex items-center text-primary" key={i}>
                <div>{filter.icon}</div>
                <div className=" ml-1 text-xs">{filter.name}</div>
              </div>
            ))}
            height={"40px"}
            rounded={"6px"}
            className="!w-[172px] !bg-[#202023] !text-xs !font-medium !text-[#ffffff58]"
            bodyClassName="!bg-none !bg-[#202023]"
            itemClassName={`hover:!bg-[#29292b] !justify-start !px-2`}
            isBorder={true}
          />

          <DropDown
            value={selectedNetwork}
            setValue={setSelectedNetwork}
            data={networks.map((network: any, i: number) => (
              <div
                className="switch-name flex h-full w-full items-center overflow-hidden text-ellipsis whitespace-nowrap"
                key={i}
              >
                <img
                  src={i === 0 ? "/images/networks/multichain.svg" : getChainLogo(parseInt(network.chainId))}
                  alt={""}
                  className="primary-shadow h-5 w-5 rounded-full"
                />
                <div className="relative ml-1.5 w-full flex-1 overflow-hidden text-ellipsis whitespace-nowrap !text-xs font-medium">
                  {i === 0 ? "ALL" : network.chainName}
                </div>
              </div>
            ))}
            height={"40px"}
            rounded={"6px"}
            className="!w-[100px] !bg-[#202023] !text-xs !text-white"
            bodyClassName="!bg-none !bg-[#202023]"
            itemClassName={`hover:!bg-[#29292b] !justify-start !px-2`}
            isBorder={true}
          />
        </div>
        <div className="yellowScroll -ml-3 mt-3 w-[calc(100%+24px)] flex-1 overflow-x-clip overflow-y-scroll pl-3 pr-5 pt-2">
          {arrays[selectedFilter].map((favourite, i) => {
            return <FavouriteCard key={i} network={networks[selectedNetwork]} pair={favourite} type={selectedFilter} />;
          })}
        </div>
      </div>
    </>
  );
}
