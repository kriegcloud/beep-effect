"use client";

import { withVariants } from "@udecode/cn";
import { cva } from "class-variance-authority";

const badgeVariants = cva(
  // + h-fit w-fit
  "inline size-fit shrink-0 rounded-full border align-middle font-semibold break-normal transition-colors focus:outline-hidden",
  {
    defaultVariants: {
      size: "sm",
      variant: "default",
    },
    variants: {
      focused: {
        true: "",
      },
      size: {
        sm: "px-2 py-1",
        // px-2.5
        xs: "px-2 py-0.5 text-sm",
      },
      variant: {
        default:
          // - bg-primary hover:bg-primary/80
          "border-transparent bg-primary/80 text-primary-foreground hover:bg-primary/60",
        destructive: "border-transparent bg-destructive text-background hover:bg-destructive/80",
        outline: "text-foreground",
        secondary:
          // - hover:bg-secondary/80
          "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/60",
      },
    },
  }
);

export const Badge = withVariants("div", badgeVariants, ["variant", "size", "focused"]);
