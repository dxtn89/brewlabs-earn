import type { NextPage } from "next";
import { useRouter } from "next/router";
import DeployerPanel from "views/deployer";

const Deployer: NextPage = () => {
  const router = useRouter();
  const { type }: any = router.query;
  return <DeployerPanel page={3} type={type} />;
};

export default Deployer;
