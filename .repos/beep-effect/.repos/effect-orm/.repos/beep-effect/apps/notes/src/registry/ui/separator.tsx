"use client";

import { cn } from "@beep/notes/lib/utils";

import * as SeparatorPrimitive from "@radix-ui/react-separator";
import { cva, type VariantProps } from "class-variance-authority";
import type * as React from "react";

const separatorVariants = cva("shrink-0 bg-border", {
  defaultVariants: {
    orientation: "horizontal",
  },
  variants: {
    orientation: {
      horizontal: "h-px w-full",
      vertical: "h-full w-px",
    },
  },
});

export function Separator({
  className,
  decorative = true,
  orientation = "horizontal",
  ...props
}: React.ComponentProps<typeof SeparatorPrimitive.Root> & VariantProps<typeof separatorVariants>) {
  return (
    <SeparatorPrimitive.Root
      orientation={orientation}
      className={cn(
        separatorVariants({
          orientation,
        }),
        className
      )}
      decorative={decorative}
      {...props}
    />
  );
}
