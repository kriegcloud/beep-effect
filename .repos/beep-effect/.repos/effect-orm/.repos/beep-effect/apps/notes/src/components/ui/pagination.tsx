"use client";

import { LinkButton } from "@beep/notes/registry/ui/button";

import { cn, createPrimitiveElement, withCn, withProps } from "@udecode/cn";
import type * as React from "react";

import { Icons } from "./icons";
import { SrOnly } from "./sr-only";

export const Pagination = withCn(
  withProps("nav", {
    "aria-label": "pagination",
    role: "navigation",
  }),
  "mx-auto flex w-full justify-center"
);

export const PaginationContent = withCn(createPrimitiveElement("ul"), "flex flex-row items-center gap-1");

export const PaginationItem = withCn(createPrimitiveElement("li"), "");

export const PaginationLink = ({
  className,
  isActive,
  ...props
}: {
  isActive?: undefined | boolean;
} & Omit<React.ComponentProps<typeof LinkButton>, "variant">) => (
  <PaginationItem>
    <LinkButton
      className={cn("size-10 leading-normal", className)}
      aria-current={isActive ? "page" : undefined}
      {...props}
      variant={isActive ? "outline" : "ghost"}
      label=""
    />
  </PaginationItem>
);

export const PaginationPrevious = ({ className, ...props }: React.ComponentProps<typeof PaginationLink>) => (
  <PaginationLink size="default" className={cn("gap-1 pl-2.5", className)} aria-label="Go to previous page" {...props}>
    <Icons.chevronLeft />

    <span>Previous</span>
  </PaginationLink>
);

export const PaginationNext = ({ className, ...props }: React.ComponentProps<typeof PaginationLink>) => (
  <PaginationLink size="default" className={cn("gap-1 pr-2.5", className)} aria-label="Go to next page" {...props}>
    <span>Next</span>

    <Icons.chevronRight />
  </PaginationLink>
);

export const PaginationEllipsis = ({ className, ...props }: React.ComponentProps<"span">) => (
  <span className={cn("flex size-9 items-center justify-center", className)} {...props}>
    <Icons.moreX />

    <SrOnly>More pages</SrOnly>
  </span>
);
