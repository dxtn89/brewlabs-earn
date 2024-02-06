import { NFTSVG, chevronLeftSVG } from "components/dashboard/assets/svgs";
import StyledButton from "../StyledButton";
import Link from "next/link";

const BrewNFT = ({}: {}) => {
  return (
    <div className="flex h-full w-full flex-col justify-center rounded-lg bg-[url('/images/directory/brewlabs-nft-banner.png')] bg-cover p-4 text-black xsm:bg-auto sm:p-[24px_20px_15px_38px]">
      <div className="flex w-fit rounded-lg bg-[#FFFFFF99] p-2.5 text-[24px] font-semibold backdrop-blur-[2px] xsm:text-[30px]">
        <div className="mr-2.5 mt-1.5 xsm:mt-2.5">{NFTSVG}</div>
        <div>Brewlabs NFT Collection is LIVE!</div>
      </div>
      <div className="mt-1.5 max-w-[420px] rounded-lg bg-[#FFFFFF99] p-2.5 text-[10px] font-semibold backdrop-blur-[2px]">
        Take advantage of benefits across the Brewlabs dAPP, as well as other current and future products. Earn native
        currencies such as ETH/BNB/MATIC via NFT Staking
      </div>
      <div className="mt-6 flex h-[28px] w-full justify-end md:mt-1">
        <Link href={"/nft"}>
          <StyledButton type="truenft" className="mr-3 !w-[140px]">
            <div className="flex w-full items-center justify-between pl-4 pr-2 text-sm">
              <div>Mint Now</div>
              <div className="-scale-100">{chevronLeftSVG}</div>
            </div>
          </StyledButton>
        </Link>
        <Link href={"/nft/findoutmore"}>
          <StyledButton type="truenft" className="!w-[140px]">
            <div className="flex w-full items-center justify-between pl-4 pr-2 text-sm">
              <div>More Info</div>
              <div className="-scale-100">{chevronLeftSVG}</div>
            </div>
          </StyledButton>
        </Link>
      </div>
    </div>
  );
};

export default BrewNFT;
