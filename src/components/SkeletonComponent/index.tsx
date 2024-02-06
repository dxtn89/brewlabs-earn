import Skeleton from "react-loading-skeleton";

export const SkeletonComponent = ({ className = "" }: { className?: string }) => {
  return (
    <Skeleton
      style={{ width: "100%", maxWidth: "100px", minWidth: "50px" }}
      baseColor={"#3e3e3e"}
      highlightColor={"#686363"}
      className={className}
    />
  );
};
