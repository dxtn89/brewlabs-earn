import { Card, CardContent } from "@components/ui/card";

import { useDeployerState } from "state/deploy/deployer.store";

import DeployDetails from "@components/productDeployer/DeployDetails";
import DeployConfirmation from "@components/productDeployer/DeployConfirmation";
import SuccessfulDeploy from "@components/productDeployer/SuccessfulDeploy";

const TokenDeployer = () => {
  const [deployerStep] = useDeployerState("deployerStep");

  return (
    <Card className="max-w-3xl">
      <CardContent className="pt-6">
        {deployerStep === "details" && <DeployDetails />}
        {deployerStep === "confirm" && <DeployConfirmation />}
        {deployerStep === "success" && <SuccessfulDeploy />}
      </CardContent>
    </Card>
  );
};

export default TokenDeployer;
