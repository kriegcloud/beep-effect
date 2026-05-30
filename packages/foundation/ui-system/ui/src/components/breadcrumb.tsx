"use client";

import { CaretRightIcon, DotsThreeIcon } from "@phosphor-icons/react";
import { cn } from "../lib/index.ts";
import type * as React from "react";

/**
 * Breadcrumb component.
 *
 * @example
 * ```tsx
 * import { Breadcrumb } from "@beep/ui/components/breadcrumb"
 *
 * console.log(Breadcrumb)
 * ```
 *
 * @category components
 * @since 0.0.0
 */
function Breadcrumb({ ...props }: React.ComponentPropsWithoutRef<"nav">) {
  return <nav aria-label="breadcrumb" data-slot="breadcrumb" {...props} />;
}

/**
 * Breadcrumb list component.
 *
 * @example
 * ```tsx
 * import { BreadcrumbList } from "@beep/ui/components/breadcrumb"
 *
 * console.log(BreadcrumbList)
 * ```
 *
 * @category components
 * @since 0.0.0
 */
function BreadcrumbList({ className, ...props }: React.ComponentPropsWithoutRef<"ol">) {
  return (
    <ol
      data-slot="breadcrumb-list"
      className={cn(
        "text-muted-foreground flex flex-wrap items-center gap-1.5 text-sm break-words sm:gap-2.5",
        className
      )}
      {...props}
    />
  );
}

/**
 * Breadcrumb item component.
 *
 * @example
 * ```tsx
 * import { BreadcrumbItem } from "@beep/ui/components/breadcrumb"
 *
 * console.log(BreadcrumbItem)
 * ```
 *
 * @category components
 * @since 0.0.0
 */
function BreadcrumbItem({ className, ...props }: React.ComponentPropsWithoutRef<"li">) {
  return <li data-slot="breadcrumb-item" className={cn("inline-flex items-center gap-1.5", className)} {...props} />;
}

/**
 * Breadcrumb link component.
 *
 * @example
 * ```tsx
 * import { BreadcrumbLink } from "@beep/ui/components/breadcrumb"
 *
 * console.log(BreadcrumbLink)
 * ```
 *
 * @category components
 * @since 0.0.0
 */
function BreadcrumbLink({ className, ...props }: React.ComponentPropsWithoutRef<"a">) {
  return (
    <a data-slot="breadcrumb-link" className={cn("hover:text-foreground transition-colors", className)} {...props} />
  );
}

/**
 * Breadcrumb page component.
 *
 * @example
 * ```tsx
 * import { BreadcrumbPage } from "@beep/ui/components/breadcrumb"
 *
 * console.log(BreadcrumbPage)
 * ```
 *
 * @category components
 * @since 0.0.0
 */
function BreadcrumbPage({ className, ...props }: React.ComponentPropsWithoutRef<"span">) {
  return (
    <span
      data-slot="breadcrumb-page"
      role="link"
      aria-disabled="true"
      aria-current="page"
      className={cn("text-foreground font-normal", className)}
      {...props}
    />
  );
}

/**
 * Breadcrumb separator component.
 *
 * @example
 * ```tsx
 * import { BreadcrumbSeparator } from "@beep/ui/components/breadcrumb"
 *
 * console.log(BreadcrumbSeparator)
 * ```
 *
 * @category components
 * @since 0.0.0
 */
function BreadcrumbSeparator({ children, className, ...props }: React.ComponentPropsWithoutRef<"li">) {
  return (
    <li
      data-slot="breadcrumb-separator"
      role="presentation"
      aria-hidden="true"
      className={cn("[&>svg]:size-3.5", className)}
      {...props}
    >
      {children ?? <CaretRightIcon />}
    </li>
  );
}

/**
 * Breadcrumb ellipsis component.
 *
 * @example
 * ```tsx
 * import { BreadcrumbEllipsis } from "@beep/ui/components/breadcrumb"
 *
 * console.log(BreadcrumbEllipsis)
 * ```
 *
 * @category components
 * @since 0.0.0
 */
function BreadcrumbEllipsis({ className, ...props }: React.ComponentPropsWithoutRef<"span">) {
  return (
    <span
      data-slot="breadcrumb-ellipsis"
      role="presentation"
      aria-hidden="true"
      className={cn("flex size-9 items-center justify-center", className)}
      {...props}
    >
      <DotsThreeIcon className="size-4" />
      <span className="sr-only">More</span>
    </span>
  );
}

/**
 * @category components
 * @since 0.0.0
 */
export {
  Breadcrumb,
  BreadcrumbEllipsis,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
};
