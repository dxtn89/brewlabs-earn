"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronUpDownIcon, CheckIcon } from "@heroicons/react/24/solid";

import { cn } from "lib/utils";
import { setDeployerStep } from "state/deploy/deployer.store";

import { Button } from "@components/ui/button";
import { Command, CommandGroup, CommandItem } from "@components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@components/ui/popover";

const productDeployLinks = [
  {
    value: "/deployer/deploy-farm",
    label: "Yield Farm",
  },
  {
    value: "/deployer/deploy-token",
    label: "Token",
  },
  {
    value: "/deployer/deploy-index",
    label: "Index",
  },
];

const ButtonProductDeploy = () => {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState("");

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="brand" role="combobox" aria-expanded={open} className="mt-4 w-[200px] justify-between">
          {value ? productDeployLinks.find((product) => product.value === value)?.label : "Deploy a new product..."}
          <ChevronUpDownIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0">
        <Command>
          <CommandGroup>
            {productDeployLinks.map((item) => (
              <CommandItem
                key={item.value}
                value={item.value}
                onSelect={() => {
                  router.push(item.value);
                  setDeployerStep("details");
                  setOpen(false);
                }}
              >
                {item.label}
                <CheckIcon className={cn("ml-auto h-4 w-4", value === item.value ? "opacity-100" : "opacity-0")} />
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
};

export default ButtonProductDeploy;
