"use client";

import { cn } from "@beep/notes/lib/utils";

import * as CheckboxPrimitive from "@radix-ui/react-checkbox";
import { CheckIcon, SquareIcon } from "lucide-react";
import type * as React from "react";

function Checkbox({ className, ...props }: React.ComponentProps<typeof CheckboxPrimitive.Root>) {
  return (
    <CheckboxPrimitive.Root
      className={cn(
        "group peer flex size-4 shrink-0 items-center justify-center rounded-sm border border-primary bg-primary ring-offset-background disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:text-primary-foreground data-[state=indeterminate]:text-primary-foreground data-[state=unchecked]:bg-background",
        className
      )}
      {...props}
    >
      <CheckboxPrimitive.Indicator className={cn("flex items-center justify-center text-current")}>
        <CheckIcon className="inset-0 size-0 group-data-[state=checked]:size-4" />
        <SquareIcon className="size-0 group-data-[state=indeterminate]:size-4" />
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  );
}

export { Checkbox };
