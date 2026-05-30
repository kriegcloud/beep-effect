"use client";

import { AlertDialog as AlertDialogPrimitive } from "@base-ui/react/alert-dialog";
import { Button } from "@beep/ui/components/button";
import { cn } from "../lib/index.ts";
import type * as React from "react";

/**
 * Alert dialog component.
 *
 * @example
 * ```tsx
 * import { AlertDialog } from "@beep/ui/components/alert-dialog"
 *
 * console.log(AlertDialog)
 * ```
 *
 * @category components
 * @since 0.0.0
 */
function AlertDialog({ ...props }: AlertDialogPrimitive.Root.Props) {
  return <AlertDialogPrimitive.Root data-slot="alert-dialog" {...props} />;
}

/**
 * Alert dialog trigger component.
 *
 * @example
 * ```tsx
 * import { AlertDialogTrigger } from "@beep/ui/components/alert-dialog"
 *
 * console.log(AlertDialogTrigger)
 * ```
 *
 * @category components
 * @since 0.0.0
 */
function AlertDialogTrigger({ ...props }: AlertDialogPrimitive.Trigger.Props) {
  return <AlertDialogPrimitive.Trigger data-slot="alert-dialog-trigger" {...props} />;
}

/**
 * Alert dialog portal component.
 *
 * @example
 * ```tsx
 * import { AlertDialogPortal } from "@beep/ui/components/alert-dialog"
 *
 * console.log(AlertDialogPortal)
 * ```
 *
 * @category components
 * @since 0.0.0
 */
function AlertDialogPortal({ ...props }: AlertDialogPrimitive.Portal.Props) {
  return <AlertDialogPrimitive.Portal data-slot="alert-dialog-portal" {...props} />;
}

/**
 * Alert dialog overlay component.
 *
 * @example
 * ```tsx
 * import { AlertDialogOverlay } from "@beep/ui/components/alert-dialog"
 *
 * console.log(AlertDialogOverlay)
 * ```
 *
 * @category components
 * @since 0.0.0
 */
function AlertDialogOverlay({ className, ...props }: AlertDialogPrimitive.Backdrop.Props) {
  return (
    <AlertDialogPrimitive.Backdrop
      data-slot="alert-dialog-overlay"
      className={cn(
        "data-open:animate-in data-closed:animate-out data-closed:fade-out-0 data-open:fade-in-0 bg-black/50 duration-100 fixed inset-0 z-50",
        className
      )}
      {...props}
    />
  );
}

/**
 * Alert dialog content component.
 *
 * @example
 * ```tsx
 * import { AlertDialogContent } from "@beep/ui/components/alert-dialog"
 *
 * console.log(AlertDialogContent)
 * ```
 *
 * @category components
 * @since 0.0.0
 */
function AlertDialogContent({
  className,
  size = "default",
  ...props
}: AlertDialogPrimitive.Popup.Props & {
  readonly size?: undefined | "default" | "sm";
}) {
  return (
    <AlertDialogPortal>
      <AlertDialogOverlay />
      <AlertDialogPrimitive.Popup
        data-slot="alert-dialog-content"
        data-size={size}
        className={cn(
          "data-open:animate-in data-closed:animate-out data-closed:fade-out-0 data-open:fade-in-0 data-closed:zoom-out-95 data-open:zoom-in-95 bg-background ring-foreground/10 gap-4 rounded-xl p-4 ring-1 duration-100 data-[size=default]:max-w-xs data-[size=sm]:max-w-xs data-[size=default]:sm:max-w-sm group/alert-dialog-content fixed top-1/2 left-1/2 z-50 grid w-full -translate-x-1/2 -translate-y-1/2 outline-none",
          className
        )}
        {...props}
      />
    </AlertDialogPortal>
  );
}

/**
 * Alert dialog header component.
 *
 * @example
 * ```tsx
 * import { AlertDialogHeader } from "@beep/ui/components/alert-dialog"
 *
 * console.log(AlertDialogHeader)
 * ```
 *
 * @category components
 * @since 0.0.0
 */
function AlertDialogHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="alert-dialog-header"
      className={cn(
        "grid grid-rows-[auto_1fr] place-items-center gap-1.5 text-center has-data-[slot=alert-dialog-media]:grid-rows-[auto_auto_1fr] has-data-[slot=alert-dialog-media]:gap-x-4 sm:group-data-[size=default]/alert-dialog-content:place-items-start sm:group-data-[size=default]/alert-dialog-content:text-left sm:group-data-[size=default]/alert-dialog-content:has-data-[slot=alert-dialog-media]:grid-rows-[auto_1fr]",
        className
      )}
      {...props}
    />
  );
}

/**
 * Alert dialog footer component.
 *
 * @example
 * ```tsx
 * import { AlertDialogFooter } from "@beep/ui/components/alert-dialog"
 *
 * console.log(AlertDialogFooter)
 * ```
 *
 * @category components
 * @since 0.0.0
 */
function AlertDialogFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="alert-dialog-footer"
      className={cn(
        "bg-muted/50 -mx-4 -mb-4 rounded-b-xl border-t p-4 flex flex-col-reverse gap-2 group-data-[size=sm]/alert-dialog-content:grid group-data-[size=sm]/alert-dialog-content:grid-cols-2 sm:flex-row sm:justify-end",
        className
      )}
      {...props}
    />
  );
}

/**
 * Alert dialog media component.
 *
 * @example
 * ```tsx
 * import { AlertDialogMedia } from "@beep/ui/components/alert-dialog"
 *
 * console.log(AlertDialogMedia)
 * ```
 *
 * @category components
 * @since 0.0.0
 */
function AlertDialogMedia({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="alert-dialog-media"
      className={cn(
        "bg-muted mb-2 inline-flex size-10 items-center justify-center rounded-md sm:group-data-[size=default]/alert-dialog-content:row-span-2 *:[svg:not([class*='size-'])]:size-6",
        className
      )}
      {...props}
    />
  );
}

/**
 * Alert dialog title component.
 *
 * @example
 * ```tsx
 * import { AlertDialogTitle } from "@beep/ui/components/alert-dialog"
 *
 * console.log(AlertDialogTitle)
 * ```
 *
 * @category components
 * @since 0.0.0
 */
function AlertDialogTitle({ className, ...props }: React.ComponentProps<typeof AlertDialogPrimitive.Title>) {
  return (
    <AlertDialogPrimitive.Title
      data-slot="alert-dialog-title"
      className={cn(
        "text-sm font-medium sm:group-data-[size=default]/alert-dialog-content:group-has-data-[slot=alert-dialog-media]/alert-dialog-content:col-start-2",
        className
      )}
      {...props}
    />
  );
}

/**
 * Alert dialog description component.
 *
 * @example
 * ```tsx
 * import { AlertDialogDescription } from "@beep/ui/components/alert-dialog"
 *
 * console.log(AlertDialogDescription)
 * ```
 *
 * @category components
 * @since 0.0.0
 */
function AlertDialogDescription({
  className,
  ...props
}: React.ComponentProps<typeof AlertDialogPrimitive.Description>) {
  return (
    <AlertDialogPrimitive.Description
      data-slot="alert-dialog-description"
      className={cn(
        "text-muted-foreground *:[a]:hover:text-foreground text-sm text-balance md:text-pretty *:[a]:underline *:[a]:underline-offset-3",
        className
      )}
      {...props}
    />
  );
}

/**
 * Alert dialog action component.
 *
 * @example
 * ```tsx
 * import { AlertDialogAction } from "@beep/ui/components/alert-dialog"
 *
 * console.log(AlertDialogAction)
 * ```
 *
 * @category components
 * @since 0.0.0
 */
function AlertDialogAction({
  className,
  variant = "default",
  size = "default",
  ...props
}: AlertDialogPrimitive.Close.Props & Pick<React.ComponentProps<typeof Button>, "variant" | "size">) {
  return (
    <AlertDialogPrimitive.Close
      data-slot="alert-dialog-action"
      className={cn(className)}
      render={<Button variant={variant} size={size} />}
      {...props}
    />
  );
}

/**
 * Alert dialog cancel component.
 *
 * @example
 * ```tsx
 * import { AlertDialogCancel } from "@beep/ui/components/alert-dialog"
 *
 * console.log(AlertDialogCancel)
 * ```
 *
 * @category components
 * @since 0.0.0
 */
function AlertDialogCancel({
  className,
  variant = "outline",
  size = "default",
  ...props
}: AlertDialogPrimitive.Close.Props & Pick<React.ComponentProps<typeof Button>, "variant" | "size">) {
  return (
    <AlertDialogPrimitive.Close
      data-slot="alert-dialog-cancel"
      className={cn(className)}
      render={<Button variant={variant} size={size} />}
      {...props}
    />
  );
}

/**
 * @category components
 * @since 0.0.0
 */
export {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogOverlay,
  AlertDialogPortal,
  AlertDialogTitle,
  AlertDialogTrigger,
};
