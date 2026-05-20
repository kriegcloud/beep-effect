/**
 * Shared CTA link wrapper for the OIP home page.
 *
 * @packageDocumentation
 * @since 0.0.0
 */

"use client";

import { buttonVariants } from "@beep/ui/components/ui/button";
import type { ReactNode } from "react";

/**
 * Link rendered with the shared `@beep/ui` button styling.
 *
 * @example
 * ```tsx
 * import { CtaLink } from "@beep/oip-web/components/CtaLink"
 *
 * const link = <CtaLink className="" href="#contact">Contact</CtaLink>
 * console.log(link.type)
 * ```
 *
 * @category components
 * @since 0.0.0
 */
export function CtaLink({
  children,
  className,
  href,
}: {
  readonly children: ReactNode;
  readonly className: string;
  readonly href: string;
}) {
  return (
    <a className={buttonVariants({ className, size: "lg", variant: "ghost" })} href={href}>
      {children}
    </a>
  );
}
