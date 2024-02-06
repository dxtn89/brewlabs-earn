import { CommunityContext } from "contexts/CommunityContext";
import type { NextPage } from "next";
import { useRouter } from "next/router";
import { useContext } from "react";
import CommunityDetail from "views/community/CommunityDetail";

const CommunityPage: NextPage = () => {
  const router = useRouter();
  const { communities }: any = useContext(CommunityContext);
  const { id }: any = router.query;

  const filteredCommunity = communities?.find((data) => data.pid === id / 1);
  if (!filteredCommunity) return <div></div>;
  return <CommunityDetail community={filteredCommunity} />;
};

export default CommunityPage;
