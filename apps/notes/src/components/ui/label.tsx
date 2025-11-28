"use client";

import { cn } from "@beep/notes/lib/utils";

import * as LabelPrimitive from "@radix-ui/react-label";
import { cva, type VariantProps } from "class-variance-authority";
import type * as React from "react";

const labelVariants = cva("text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70");

export function Label({
  className,
  disabled,
  ...props
}: React.ComponentProps<typeof LabelPrimitive.Root> & {
  disabled?: boolean;
} & VariantProps<typeof labelVariants>) {
  return (
    <LabelPrimitive.Root
      className={cn(labelVariants(), disabled && "cursor-not-allowed text-muted-foreground", className)}
      {...props}
    />
  );
}
