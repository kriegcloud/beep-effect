"use client";

import { cn } from "@beep/notes/lib/utils";

import { cva, type VariantProps } from "class-variance-authority";
import type * as React from "react";

const alertVariants = cva(
  "relative w-full rounded-lg border p-4 [&:has(svg)]:pl-11 [&>svg]:absolute [&>svg]:top-4 [&>svg]:left-4 [&>svg]:text-foreground [&>svg+div]:translate-y-[-3px]",
  {
    defaultVariants: {
      variant: "default",
    },
    variants: {
      variant: {
        default: "bg-background text-foreground",
        destructive: "border-destructive/50 text-destructive [&>svg]:text-destructive",
      },
    },
  }
);

export function Alert({
  className,
  variant,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & VariantProps<typeof alertVariants>) {
  return <div className={cn(alertVariants({ variant }), className)} role="alert" {...props} />;
}

export function AlertTitle({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return <h5 className={cn("mb-1 leading-none font-semibold tracking-tight", className)} {...props} />;
}

export function AlertDescription({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  return <div className={cn("[&_p]:leading-relaxed", className)} {...props} />;
}
