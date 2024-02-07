import ChainSelect from "views/swap/components/ChainSelect";

import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@components/ui/form";

import { Input } from "@components/ui/input";

import { useActiveChainId } from "hooks/useActiveChainId";
import { useTokenFactory } from "state/deploy/hooks";
import { useFactory } from "hooks/useFactory";
import { toast } from "react-toastify";
import { useContext } from "react";
import { DashboardContext } from "contexts/DashboardContext";
import { ethers } from "ethers";
import TokenFactoryAbi from "config/abi/token/factory.json";
import { getNativeSymbol, handleWalletError } from "lib/bridge/helpers";

import { Button } from "@components/ui/button";
import { InputFile } from "@components/ui/inputFile";
import { Textarea } from "@components/ui/textarea";

import { tokenDeployerSchema } from "config/schemas/tokenDeployerSchema";

import { setTokenInfo, setDeployerStep } from "state/deploy/deployer.store";

const Deploy = ({ values }) => {
  const { name, symbol, decimals, totalSupply, setName, setSymbol, setDecimals, setTotalSupply, setDeployedAddress } =
    values;

  const { chainId } = useActiveChainId();

  const factory = useTokenFactory(chainId);

  const { onCreate } = useFactory(chainId, factory.payingToken.isNative ? factory.serviceFee : "0");

  const { pending, setPending }: any = useContext(DashboardContext);

  const showError = (errorMsg: string) => {
    if (errorMsg) toast.error(errorMsg);
  };

  const handleDeploy = async () => {
    if (totalSupply === 0) {
      toast.error("Total supply should be greater than zero");
      return;
    }

    setPending(true);

    try {
      // deploy farm contract
      const tx = await onCreate(name, symbol, decimals, totalSupply);

      const iface = new ethers.utils.Interface(TokenFactoryAbi);
      for (let i = 0; i < tx.logs.length; i++) {
        try {
          const log = iface.parseLog(tx.logs[i]);
          if (log.name === "StandardTokenCreated") {
            const token = log.args.token;
            setDeployedAddress(token);
            // setStep(3);
            break;
          }
        } catch (e) {}
      }
    } catch (e) {
      console.log(e);
      handleWalletError(e, showError, getNativeSymbol(chainId));
      // setStep(2);
    }
    setPending(false);
  };

  const form = useForm<z.infer<typeof tokenDeployerSchema>>({
    resolver: zodResolver(tokenDeployerSchema),
    defaultValues: {
      tokenName: "",
      tokenSymbol: "",
      tokenDecimals: 18,
      tokenTotalSupply: 0,
      tokenImage: undefined,
      tokenDescription: "",
    },
  });

  const onSubmit = (data: z.infer<typeof tokenDeployerSchema>) => {
    console.log(data);

    // Store the form data in deployer store
    setTokenInfo(data);

    setDeployerStep("confirm");
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="mb-8 space-y-4">
        <div className="my-8">
          <h4 className="mb-6 text-xl ">Choose a network to deploy on</h4>
          <ChainSelect id="chain-select" />
        </div>

        <div className="divider" />

        <div className="my-8">
          <h4 className="mb-6 text-xl">Token details</h4>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-4">
              <FormField
                control={form.control}
                name="tokenName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Token name</FormLabel>
                    <FormControl>
                      <Input placeholder="ie: Brewlabs" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="tokenSymbol"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Token symbol</FormLabel>
                    <FormControl>
                      <Input placeholder="ie: BNB" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="tokenDecimals"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Token decimals</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="tokenTotalSupply"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>How many tokens do you want to create?</FormLabel>
                    <FormControl>
                      <Input placeholder="ie: 100 000" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="tokenImage"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Token icon</FormLabel>
                  <FormControl>
                    <InputFile {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="tokenDescription"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Token description</FormLabel>
                <FormControl>
                  <Textarea {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="divider" />

        <Button variant="brand" type="submit" className="w-full">
          Deploy token
        </Button>
      </form>
    </Form>
  );
};

export default Deploy;
