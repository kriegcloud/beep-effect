import { cva } from "class-variance-authority";
import { cn } from "../lib/index.ts";
import type { VariantProps } from "class-variance-authority";
import type * as React from "react";

const alertVariants = cva(
  "grid gap-0.5 rounded-lg border px-2.5 py-2 text-left text-sm has-data-[slot=alert-action]:relative has-data-[slot=alert-action]:pr-18 has-[>svg]:grid-cols-[auto_1fr] has-[>svg]:gap-x-2 *:[svg]:row-span-2 *:[svg]:translate-y-0.5 *:[svg]:text-current *:[svg:not([class*='size-'])]:size-4 w-full relative group/alert",
  {
    variants: {
      variant: {
        default: "bg-card text-card-foreground",
        destructive:
          "text-destructive bg-card *:data-[slot=alert-description]:text-destructive/90 *:[svg]:text-current",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

/**
 * Alert component.
 *
 * @example
 * ```tsx
 * import { Alert } from "@beep/ui/components/alert"
 *
 * console.log(Alert)
 * ```
 *
 * @category components
 * @since 0.0.0
 */
function Alert({ className, variant, ...props }: React.ComponentProps<"div"> & VariantProps<typeof alertVariants>) {
  return <div data-slot="alert" role="alert" className={cn(alertVariants({ variant }), className)} {...props} />;
}

/**
 * Alert title component.
 *
 * @example
 * ```tsx
 * import { AlertTitle } from "@beep/ui/components/alert"
 *
 * console.log(AlertTitle)
 * ```
 *
 * @category components
 * @since 0.0.0
 */
function AlertTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="alert-title"
      className={cn(
        "font-medium group-has-[>svg]/alert:col-start-2 [&_a]:hover:text-foreground [&_a]:underline [&_a]:underline-offset-3",
        className
      )}
      {...props}
    />
  );
}

/**
 * Alert description component.
 *
 * @example
 * ```tsx
 * import { AlertDescription } from "@beep/ui/components/alert"
 *
 * console.log(AlertDescription)
 * ```
 *
 * @category components
 * @since 0.0.0
 */
function AlertDescription({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="alert-description"
      className={cn(
        "text-muted-foreground text-sm text-balance md:text-pretty [&_p:not(:last-child)]:mb-4 [&_a]:hover:text-foreground [&_a]:underline [&_a]:underline-offset-3",
        className
      )}
      {...props}
    />
  );
}

/**
 * Alert action component.
 *
 * @example
 * ```tsx
 * import { AlertAction } from "@beep/ui/components/alert"
 *
 * console.log(AlertAction)
 * ```
 *
 * @category components
 * @since 0.0.0
 */
function AlertAction({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="alert-action" className={cn("absolute top-2 right-2", className)} {...props} />;
}

/**
 * @category components
 * @since 0.0.0
 */
export { Alert, AlertAction, AlertDescription, AlertTitle };
