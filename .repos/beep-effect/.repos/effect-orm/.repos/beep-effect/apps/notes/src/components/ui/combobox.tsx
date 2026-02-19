"use client";

import { cn } from "@beep/notes/lib/utils";
import { Button } from "@beep/notes/registry/ui/button";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@beep/notes/registry/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@beep/notes/registry/ui/popover";
import React from "react";

import { Icons } from "./icons";

const frameworks = [
  {
    label: "Next.js",
    value: "next.js",
  },
  {
    label: "SvelteKit",
    value: "sveltekit",
  },
  {
    label: "Nuxt.js",
    value: "nuxt.js",
  },
  {
    label: "Remix",
    value: "remix",
  },
  {
    label: "Astro",
    value: "astro",
  },
];

export function Combobox() {
  const [open, setOpen] = React.useState(false);
  const [value, setValue] = React.useState("");

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className="w-[200px] justify-between"
          aria-expanded={open}
          icon={<Icons.chevronsUpDown className="shrink-0 opacity-50" />}
          iconPlacement="right"
          role="combobox"
        >
          {value ? frameworks.find((framework) => framework.value === value)?.label : "Select framework..."}
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-[200px] p-0">
        <Command>
          <CommandInput placeholder="Search framework..." />

          <CommandEmpty>No framework found.</CommandEmpty>

          <CommandGroup>
            {frameworks.map((framework) => (
              <CommandItem
                key={framework.value}
                value={framework.value}
                onSelect={(currentValue) => {
                  setValue(currentValue === value ? "" : currentValue);
                  setOpen(false);
                }}
              >
                <Icons.check className={cn("mr-2", value === framework.value ? "opacity-100" : "opacity-0")} />

                {framework.label}
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
