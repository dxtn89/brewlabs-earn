import { useState } from "react";
import SelectToken from "views/directory/DeployerModal/TokenDeployer/SelectToken";
import Deploy from "views/directory/DeployerModal/TokenDeployer/Deploy";
import Summarize from "views/directory/DeployerModal/TokenDeployer/Summarize";

import Confirmation from "components/productDeployer/Confirmation";

import { Card, CardContent } from "@components/ui/card";

import { useDeployerState } from "state/deploy/deployer.store";

const TokenDeployer = () => {
  // const [tokenType, setTokenType] = useState(1);
  const [name, setName] = useState("");
  const [symbol, setSymbol] = useState("");
  const [decimals, setDecimals] = useState(18);
  const [totalSupply, setTotalSupply] = useState();
  const [deployedAddress, setDeployedAddress] = useState("");

  const [deployerStep] = useDeployerState("deployerStep");

  return (
    <Card className="max-w-3xl">
      <CardContent className="pt-6">
        {deployerStep === "details" && (
          <Deploy
            values={{
              name,
              symbol,
              decimals,
              totalSupply,
              setName,
              setSymbol,
              setDecimals,
              setTotalSupply,
              setDeployedAddress,
            }}
          />
        )}
        {deployerStep === "confirm" && <Confirmation />}

        {/* {deployerStep === 3 && (
          <Summarize setOpen={() => {}} values={{ name, symbol, decimals, totalSupply, deployedAddress }} />
        )} */}
      </CardContent>
    </Card>
  );
};

export default TokenDeployer;
