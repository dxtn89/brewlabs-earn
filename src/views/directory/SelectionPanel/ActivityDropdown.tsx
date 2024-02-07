/* eslint-disable react-hooks/exhaustive-deps */
import { CheckIcon, ChevronUpDownIcon } from "@heroicons/react/24/outline";

import { useState } from "react";
import { Command, CommandGroup, CommandItem } from "@components/ui/command";

import { cn } from "lib/utils";
import { Popover, PopoverContent, PopoverTrigger } from "@components/ui/popover";

import { Button } from "@components/ui/button";

const ActivityDropdown = ({ value, setValue, counts }: { setValue?: any; value: string; counts: any }) => {
  const [open, setOpen] = useState(false);

  const filters = [
    {
      label: "Active",
      value: "active",
      color: "#2FD35DBF",
    },
    {
      label: "Finished",
      value: "finished",
      color: "#FFFFFF80",
    },
    {
      label: "New",
      value: "new",
      color: "#EEBB19",
    },
  ];

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" role="combobox" aria-expanded={open} className="w-[200px] justify-between">
          <span className="flex items-center gap-2">
            <span
              className="h-3 w-3 rounded-full"
              style={{ backgroundColor: `${filters.find((item) => item.value === value)?.color}` }}
            ></span>
            {filters.find((item) => item.value === value)?.label}
          </span>
          <ChevronUpDownIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0">
        <Command>
          <CommandGroup>
            {filters.map((category) => (
              <CommandItem
                key={category.value}
                value={category.value}
                onSelect={(currentValue) => {
                  setValue(currentValue === value ? "" : currentValue);
                  setOpen(false);
                }}
              >
                <span className="mr-2 h-3 w-3 rounded-full" style={{ backgroundColor: `${category.color}` }}></span>
                <div className="flex justify-between">
                  {category.label} -{" "}
                  {counts[category.value] && <span className="ml-2 text-xs">({counts[category.value]})</span>}
                </div>
                <CheckIcon className={cn("ml-auto h-4 w-4", value === category.value ? "opacity-100" : "opacity-0")} />
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
};

export default ActivityDropdown;
