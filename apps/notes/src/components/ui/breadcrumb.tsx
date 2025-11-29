"use client";

import { LinkButton } from "@beep/notes/registry/ui/button";
import type { UnsafeTypes } from "@beep/types";

import { cn, createPrimitiveElement, withCn, withProps } from "@udecode/cn";
import type * as React from "react";

import { Icons } from "./icons";

export const Breadcrumb = withProps(withCn(createPrimitiveElement("nav"), ""), {
  "aria-label": "breadcrumb",
});

export const BreadcrumbList = withCn(
  createPrimitiveElement("ol"),
  "relative flex items-center gap-0.5 overflow-x-auto p-1 break-words sm:gap-1"
);

export function BreadcrumbItem({ className, ...props }: React.ComponentProps<"li">) {
  return (
    <>
      <BreadcrumbSeparator className="first-of-type:hidden" />

      <li
        className={cn(
          "inline-flex items-center gap-1.5",
          "[&:last-child_[aria-current=false]]:hidden [&:last-child_[aria-current=page]]:inline-flex",
          "font-semibold",
          className
        )}
        {...props}
      />
    </>
  );
}

export const BreadcrumbTruncateText = withProps(createPrimitiveElement("span"), {
  "data-truncate": true,
} as UnsafeTypes.UnsafeAny);

export function BreadcrumbLink({
  children,
  className,
  truncate = true,
  ...props
}: React.ComponentProps<typeof LinkButton> & {
  truncate?: undefined | boolean;
}) {
  const child = truncate ? <BreadcrumbTruncateText>{children}</BreadcrumbTruncateText> : children;

  return (
    <>
      <LinkButton
        variant="ghost"
        className={cn(
          truncate &&
            "**:data-[truncate=true]:max-w-[100px] **:data-[truncate=true]:truncate md:**:data-[truncate=true]:max-w-[200px]",
          className
        )}
        aria-current={false}
        {...props}
      >
        {child}
      </LinkButton>

      <LinkButton
        variant="ghost"
        className={cn("group hidden shrink-0", className)}
        aria-current="page"
        data-page
        {...props}
      >
        {child}
      </LinkButton>
    </>
  );
}

export function BreadcrumbLinkItem({ children, ...props }: React.ComponentProps<typeof BreadcrumbLink>) {
  return (
    <BreadcrumbItem>
      <BreadcrumbLink {...props}>{children}</BreadcrumbLink>
    </BreadcrumbItem>
  );
}

export const BreadcrumbSeparator = ({ children, className, ...props }: React.ComponentProps<"li">) => (
  <li className={cn("[&>svg]:size-3.5", className)} role="presentation" {...props}>
    {children || <Icons.chevronRight />}
  </li>
);

export const BreadcrumbEllipsis = ({ className, ...props }: React.ComponentProps<"span">) => (
  <span className={cn("flex size-9 items-center justify-center", className)} role="presentation" {...props}>
    <Icons.moreX />

    <span className="sr-only">More</span>
  </span>
);
