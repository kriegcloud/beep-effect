"use client";

import { cn } from "@beep/notes/lib/utils";

import * as TogglePrimitive from "@radix-ui/react-toggle";
import { cva, type VariantProps } from "class-variance-authority";
import type * as React from "react";

export const toggleVariants = cva(
  cn(
    "inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-bg-ease focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-hidden disabled:pointer-events-none disabled:opacity-50",
    "[&_svg:not([data-icon])]:size-5"
  ),
  {
    defaultVariants: {
      size: "default",
      variant: "default",
    },
    variants: {
      size: {
        circle: "p-3",
        default: "h-10 px-3",
        lg: "h-11 px-5",
        sm: "h-9 px-2",
      },
      variant: {
        default:
          "bg-transparent hover:bg-muted hover:text-muted-foreground data-[state=on]:bg-accent data-[state=on]:text-accent-foreground",
        floating: "rounded-full bg-primary text-primary-foreground",
        outline: "border border-input bg-transparent hover:bg-accent hover:text-accent-foreground",
      },
    },
  }
);

export function Toggle({
  className,
  size,
  variant,
  ...props
}: React.ComponentProps<typeof TogglePrimitive.Root> & VariantProps<typeof toggleVariants>) {
  return <TogglePrimitive.Root className={cn(toggleVariants({ size, variant }), className)} {...props} />;
}
