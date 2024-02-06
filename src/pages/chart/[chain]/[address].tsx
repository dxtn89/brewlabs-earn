import type { NextPage } from "next";
import { useRouter } from "next/router";
import Chart from "views/chart";

const ChartPage: NextPage = () => {
  const router = useRouter();
  const { chain, address }: any = router.query;
  return <Chart chain={chain} address={address} />;
};

export default ChartPage;
