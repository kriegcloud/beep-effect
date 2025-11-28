"use client";

import { withVariants } from "@udecode/cn";
import { cva } from "class-variance-authority";

const cardVariants = cva("rounded-lg bg-card text-card-foreground", {
  defaultVariants: {
    variant: "default",
  },
  variants: {
    variant: {
      cv: "flex flex-col overflow-hidden border border-border/70 p-3",
      cvRow: "",
      default: "border shadow-xs",
    },
  },
});

export const Card = withVariants("div", cardVariants, ["variant"]);

const cardHeaderVariants = cva("flex flex-col space-y-1", {
  defaultVariants: {
    variant: "default",
  },
  variants: {
    variant: {
      cv: "",
      default: "p-6",
    },
  },
});

export const CardHeader = withVariants("div", cardHeaderVariants, ["variant"]);

const cardTitleVariants = cva("leading-none font-semibold tracking-tight", {
  defaultVariants: {
    variant: "default",
  },
  variants: {
    variant: {
      cv: "text-base",
      default: "text-lg",
    },
  },
});

export const CardTitle = withVariants("h3", cardTitleVariants, ["variant"]);

const cardDescriptionVariants = cva("text-subtle-foreground", {
  defaultVariants: {
    variant: "default",
  },
  variants: {
    variant: {
      default: "",
    },
  },
});

export const CardDescription = withVariants("p", cardDescriptionVariants, ["variant"]);

const cardContentVariants = cva("", {
  defaultVariants: {
    variant: "default",
  },
  variants: {
    variant: {
      cv: "[font-family:var(--font-state)] text-pretty text-subtle-foreground",
      default: "p-6 pt-0",
    },
  },
});

export const CardContent = withVariants("div", cardContentVariants, ["variant"]);

const cardFooterVariants = cva("flex items-center", {
  defaultVariants: {
    variant: "default",
  },
  variants: {
    variant: {
      cv: "",
      default: "p-6 pt-0",
    },
  },
});

export const CardFooter = withVariants("div", cardFooterVariants, ["variant"]);
