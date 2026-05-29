import { cn } from "../lib/index.ts";
import type * as React from "react";

/**
 * Card component.
 *
 * @example
 * ```tsx
 * import { Card } from "@beep/ui/components/card"
 *
 * console.log(Card)
 * ```
 *
 * @category components
 * @since 0.0.0
 */
function Card({
  className,
  size = "default",
  ...props
}: React.ComponentProps<"div"> & { readonly size?: undefined | "default" | "sm" }) {
  return (
    <div
      data-slot="card"
      data-size={size}
      className={cn(
        "ring-foreground/10 bg-card text-card-foreground gap-4 overflow-hidden rounded-xl py-4 text-sm ring-1 has-data-[slot=card-footer]:pb-0 has-[>img:first-child]:pt-0 data-[size=sm]:gap-3 data-[size=sm]:py-3 data-[size=sm]:has-data-[slot=card-footer]:pb-0 *:[img:first-child]:rounded-t-xl *:[img:last-child]:rounded-b-xl group/card flex flex-col",
        className
      )}
      {...props}
    />
  );
}

/**
 * Card header component.
 *
 * @example
 * ```tsx
 * import { CardHeader } from "@beep/ui/components/card"
 *
 * console.log(CardHeader)
 * ```
 *
 * @category components
 * @since 0.0.0
 */
function CardHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-header"
      className={cn(
        "gap-1 rounded-t-xl px-4 group-data-[size=sm]/card:px-3 [.border-b]:pb-4 group-data-[size=sm]/card:[.border-b]:pb-3 group/card-header @container/card-header grid auto-rows-min items-start has-data-[slot=card-action]:grid-cols-[1fr_auto] has-data-[slot=card-description]:grid-rows-[auto_auto]",
        className
      )}
      {...props}
    />
  );
}

/**
 * Card title component.
 *
 * @example
 * ```tsx
 * import { CardTitle } from "@beep/ui/components/card"
 *
 * console.log(CardTitle)
 * ```
 *
 * @category components
 * @since 0.0.0
 */
function CardTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-title"
      className={cn("text-base leading-snug font-medium group-data-[size=sm]/card:text-sm", className)}
      {...props}
    />
  );
}

/**
 * Card description component.
 *
 * @example
 * ```tsx
 * import { CardDescription } from "@beep/ui/components/card"
 *
 * console.log(CardDescription)
 * ```
 *
 * @category components
 * @since 0.0.0
 */
function CardDescription({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="card-description" className={cn("text-muted-foreground text-sm", className)} {...props} />;
}

/**
 * Card action component.
 *
 * @example
 * ```tsx
 * import { CardAction } from "@beep/ui/components/card"
 *
 * console.log(CardAction)
 * ```
 *
 * @category components
 * @since 0.0.0
 */
function CardAction({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-action"
      className={cn("col-start-2 row-span-2 row-start-1 self-start justify-self-end", className)}
      {...props}
    />
  );
}

/**
 * Card content component.
 *
 * @example
 * ```tsx
 * import { CardContent } from "@beep/ui/components/card"
 *
 * console.log(CardContent)
 * ```
 *
 * @category components
 * @since 0.0.0
 */
function CardContent({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="card-content" className={cn("px-4 group-data-[size=sm]/card:px-3", className)} {...props} />;
}

/**
 * Card footer component.
 *
 * @example
 * ```tsx
 * import { CardFooter } from "@beep/ui/components/card"
 *
 * console.log(CardFooter)
 * ```
 *
 * @category components
 * @since 0.0.0
 */
function CardFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-footer"
      className={cn("bg-muted/50 rounded-b-xl border-t p-4 group-data-[size=sm]/card:p-3 flex items-center", className)}
      {...props}
    />
  );
}

/**
 * @category components
 * @since 0.0.0
 */
export { Card, CardAction, CardContent, CardDescription, CardFooter, CardHeader, CardTitle };
