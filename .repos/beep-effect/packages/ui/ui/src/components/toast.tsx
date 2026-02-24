"use client";

import { Toast as ToastPrimitive } from "@base-ui/react/toast";
import { cn } from "@beep/ui-core/utils";
import { XIcon } from "@phosphor-icons/react";
import type { VariantProps } from "class-variance-authority";
import { cva } from "class-variance-authority";
import * as React from "react";

const ToastProvider = ToastPrimitive.Provider;

const ToastViewport = React.forwardRef<HTMLDivElement, ToastPrimitive.Viewport.Props & { className?: string }>(
  ({ className, ...props }, ref) => (
    <ToastPrimitive.Viewport
      ref={ref}
      className={cn(
        "fixed top-0 z-[100] flex max-h-screen w-full flex-col-reverse p-4 sm:top-auto sm:right-0 sm:bottom-0 sm:flex-col md:max-w-[420px]",
        className
      )}
      {...props}
    />
  )
);
ToastViewport.displayName = "ToastViewport";

const toastVariants = cva(
  "group pointer-events-auto relative flex w-full items-center justify-between space-x-2 overflow-hidden rounded-md border p-4 pr-6 shadow-lg transition-all data-[ending]:animate-out data-[starting]:animate-in data-[ending]:fade-out-80 data-[ending]:slide-out-to-right-full data-[starting]:slide-in-from-top-full data-[starting]:sm:slide-in-from-bottom-full",
  {
    variants: {
      variant: {
        default: "border bg-background text-foreground",
        destructive: "destructive group border-destructive bg-destructive text-destructive-foreground",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

interface ToastRootProps extends Omit<ToastPrimitive.Root.Props, "toast">, VariantProps<typeof toastVariants> {
  toast: ToastPrimitive.Root.ToastObject<ToastData>;
}

interface ToastData {
  variant?: "default" | "destructive";
}

const Toast = React.forwardRef<HTMLDivElement, ToastRootProps>(({ className, variant, toast, ...props }, ref) => {
  const resolvedVariant = variant ?? toast.data?.variant ?? "default";
  return (
    <ToastPrimitive.Root
      ref={ref}
      toast={toast}
      className={cn(toastVariants({ variant: resolvedVariant }), className)}
      {...props}
    />
  );
});
Toast.displayName = "Toast";

const ToastAction = React.forwardRef<HTMLButtonElement, ToastPrimitive.Action.Props & { className?: string }>(
  ({ className, ...props }, ref) => (
    <ToastPrimitive.Action
      ref={ref}
      className={cn(
        "inline-flex h-8 shrink-0 items-center justify-center rounded-md border bg-transparent px-3 font-medium text-sm transition-colors hover:bg-secondary focus:outline-none focus:ring-1 focus:ring-ring disabled:pointer-events-none disabled:opacity-50 group-[.destructive]:border-muted/40 group-[.destructive]:focus:ring-destructive group-[.destructive]:hover:border-destructive/30 group-[.destructive]:hover:bg-destructive group-[.destructive]:hover:text-destructive-foreground",
        className
      )}
      {...props}
    />
  )
);
ToastAction.displayName = "ToastAction";

const ToastClose = React.forwardRef<HTMLButtonElement, ToastPrimitive.Close.Props & { className?: string }>(
  ({ className, ...props }, ref) => (
    <ToastPrimitive.Close
      ref={ref}
      className={cn(
        "absolute top-1 right-1 rounded-md p-1 text-foreground/50 opacity-0 transition-opacity hover:text-foreground focus:opacity-100 focus:outline-none focus:ring-1 group-hover:opacity-100 group-[.destructive]:text-red-300 group-[.destructive]:focus:ring-red-400 group-[.destructive]:focus:ring-offset-red-600 group-[.destructive]:hover:text-red-50",
        className
      )}
      {...props}
    >
      <XIcon className={"h-4 w-4"} />
    </ToastPrimitive.Close>
  )
);
ToastClose.displayName = "ToastClose";

const ToastTitle = React.forwardRef<HTMLHeadingElement, ToastPrimitive.Title.Props & { className?: string }>(
  ({ className, ...props }, ref) => (
    <ToastPrimitive.Title ref={ref} className={cn("font-semibold text-sm [&+div]:text-xs", className)} {...props} />
  )
);
ToastTitle.displayName = "ToastTitle";

const ToastDescription = React.forwardRef<
  HTMLParagraphElement,
  ToastPrimitive.Description.Props & { className?: string }
>(({ className, ...props }, ref) => (
  <ToastPrimitive.Description ref={ref} className={cn("text-sm opacity-90", className)} {...props} />
));
ToastDescription.displayName = "ToastDescription";

type ToastProps = React.ComponentPropsWithoutRef<typeof Toast>;

type ToastActionElement = React.ReactElement<typeof ToastAction>;

export {
  type ToastProps,
  type ToastActionElement,
  type ToastData,
  ToastProvider,
  ToastViewport,
  Toast,
  ToastTitle,
  ToastDescription,
  ToastClose,
  ToastAction,
  ToastPrimitive,
};
