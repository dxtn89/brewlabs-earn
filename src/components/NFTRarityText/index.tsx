const NFTRarityText = ({
  rarity = 0,
  children,
  className = "",
}: {
  rarity: any;
  children: any;
  className?: string;
}) => {
  switch (rarity) {
    case 0:
      return <span className={`text-[#ECEAEC] ${className}`}>{children}</span>;
    case 1:
      return <span className={`text-[#69FE87] ${className}`}>{children}</span>;
    case 2:
      return <span className={`text-[#69B0F6] ${className}`}>{children}</span>;
    case 3:
      return <span className={`text-[#B050F7] ${className}`}>{children}</span>;
    case 4:
      return <span className={`text-[#F3985F] ${className}`}>{children}</span>;
    case 5:
      return <span className={`text-[#F3985F] ${className}`}>{children}</span>;
    default:
      return <span className={`text-tailwind ${className}`}>{children}</span>;
  }
};

export default NFTRarityText;
