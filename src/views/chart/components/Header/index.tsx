import { ChartSquareSVG, NFTSVG, SwitchSVG } from "@components/dashboard/assets/svgs";
import { SearchInput } from "./SearchInput";
import { useGlobalState } from "state";
import UserDashboard from "@components/dashboard/UserDashboard";
import { useActiveChainId } from "@hooks/useActiveChainId";
import { getChainLogo } from "utils/functions";
import { NATIVE_CURRENCIES, WNATIVE } from "@brewlabs/sdk";
import { useDexPrice } from "@hooks/useTokenPrice";
import NFTComponent from "@components/NFTComponent";
import { tokens } from "config/constants/tokens";
import { TrendingPairs } from "./TrendingPairs";
import TokenLogo from "@components/logo/TokenLogo";
import getTokenLogoURL from "utils/getTokenLogoURL";

export default function Header({ showReverse, setShowReverse }) {
  const [isOpen, setIsOpen] = useGlobalState("userSidebarOpen");
  const [, setSidebarContent] = useGlobalState("userSidebarContent");
  const { chainId } = useActiveChainId();
  const { price } = useDexPrice(chainId, WNATIVE[chainId].address.toLowerCase());
  const { price: bitCoinPrice } = useDexPrice(1, tokens[1].wbtc.address.toLowerCase());

  return (
    <>
      <div className="relative z-[101] mt-10 flex sm:flex-row flex-col">
        <div className="flex flex-1">
          <div className="relative flex-1">
            <SearchInput />
            <a
              href={"https://t.me/MaverickBL"}
              target={"_blank"}
              className="absolute -bottom-5 right-0 cursor-pointer font-brand text-xs !text-[#FFFFFF59] hover:!text-white"
            >
              Advertise with us
            </a>
          </div>
        </div>

        <div
          className={`ml-4 flex w-fit items-center justify-between text-tailwind sm:mt-0 mt-4 ${
            showReverse ? "2xl:w-[320px]" : "2xl:w-[292px]"
          }`}
        >
          <div className="primary-shadow mr-2 hidden h-[44px] items-center rounded-md bg-[#202023] p-2.5 font-roboto text-xs font-medium text-white md:flex">
            <img src={getChainLogo(chainId)} alt={""} className="h-4 w-4 rounded-full" />
            <div className="ml-1.5 leading-[1.2]">
              <div>{NATIVE_CURRENCIES[chainId].symbol}</div>
              <div className="whitespace-nowrap">
                {(price ?? 0).toFixed(2)} <span className="text-[8px] text-[#FFFFFF80]">USD</span>
              </div>
            </div>
          </div>
          <div className="primary-shadow mr-2 hidden h-[44px] items-center rounded-md bg-[#202023] p-2.5 font-roboto text-xs font-medium text-white md:flex">
            <TokenLogo src={getTokenLogoURL(tokens[1].wbtc.address, 1)} alt={""} classNames="h-4 w-4 rounded-full" />
            <div className="ml-1.5 leading-[1.2]">
              <div>Bitcoin</div>
              <div className="whitespace-nowrap">
                {(bitCoinPrice ?? 0).toFixed(2)} <span className="text-[8px] text-[#FFFFFF80]">USD</span>
              </div>
            </div>
          </div>
          <div className="flex">
            <div
              className="mr-4 cursor-pointer  transition hover:text-white [&>svg]:!h-5 [&>svg]:!w-5"
              onClick={() => {
                setIsOpen(isOpen === 1 ? 1 : 2);
                setSidebarContent(<UserDashboard />);
              }}
            >
              {ChartSquareSVG}
            </div>
            <div
              className="mr-4 cursor-pointer transition hover:text-white  [&>svg]:!h-5 [&>svg]:!w-5"
              onClick={() => setShowReverse(!showReverse)}
            >
              {SwitchSVG}
            </div>
            <NFTComponent />
          </div>
        </div>
      </div>
      <TrendingPairs />
    </>
  );
}
