import { NFTSVG } from "@components/dashboard/assets/svgs";
import { useActiveNFT } from "views/nft/hooks/useActiveNFT";
import { BREWNFT_RARITIES } from "config/constants";
import NFTRarityText from "@components/NFTRarityText";

const NFTComponent = ({ className = "" }: { className?: string }) => {
  const activeRarity = useActiveNFT();
  return (
    <div
      className={`tooltip cursor-pointer hover:text-white`}
      id={"ActiveNFT"}
      data-tip={`${BREWNFT_RARITIES[activeRarity] ?? "No"} Brewlabs NFT found!`}
    >
      <NFTRarityText rarity={activeRarity} className="[&>svg]:!h-5 [&>svg]:!w-5">
        {NFTSVG}
      </NFTRarityText>
    </div>
  );
};

export default NFTComponent;
