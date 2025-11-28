"use client";

import { cn } from "@beep/notes/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";

const srVariants = cva("", {
  defaultVariants: {
    max: "none",
  },
  variants: {
    max: {
      lg: "max-lg:sr-only",
      md: "max-md:sr-only",
      none: "sr-only",
      sm: "max-sm:sr-only",
    },
  },
});

export function SrOnly({ className, max, ...props }: React.ComponentProps<"span"> & VariantProps<typeof srVariants>) {
  return <span className={cn(srVariants({ max }), className)} {...props} />;
}
