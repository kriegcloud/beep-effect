"use client";

import { cn } from "@beep/notes/lib/utils";

import * as RadioGroupPrimitive from "@radix-ui/react-radio-group";
import type * as React from "react";

import { Icons } from "./icons";

export function RadioGroup({ className, ...props }: React.ComponentProps<typeof RadioGroupPrimitive.Root>) {
  return <RadioGroupPrimitive.Root className={cn("grid gap-2", className)} {...props} />;
}

export function RadioGroupItem({
  children,
  className,
  variant = "radio",
  ...props
}: React.ComponentProps<typeof RadioGroupPrimitive.Item> & {
  variant?: undefined | "none" | "radio";
}) {
  return (
    <RadioGroupPrimitive.Item
      className={cn(
        variant === "radio" &&
          "size-4 rounded-full border border-ring ring-offset-background focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:outline-hidden disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    >
      {variant === "radio" && (
        <RadioGroupPrimitive.Indicator className="flex items-center justify-center">
          <Icons.circle className="size-2.5 fill-primary text-primary" />
        </RadioGroupPrimitive.Indicator>
      )}

      {variant === "none" && children}
    </RadioGroupPrimitive.Item>
  );
}
