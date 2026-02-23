"use client";

import { buttonVariants } from "@beep/notes/registry/ui/button";

import * as AlertDialogPrimitive from "@radix-ui/react-alert-dialog";
import { cn, createPrimitiveElement, withCn, withProps, withVariants } from "@udecode/cn";
import { cva } from "class-variance-authority";
import type * as React from "react";

export const AlertDialog = AlertDialogPrimitive.Root;

export const AlertDialogTrigger = AlertDialogPrimitive.Trigger;

export function AlertDialogPortal({ children, ...props }: AlertDialogPrimitive.AlertDialogPortalProps) {
  return (
    <AlertDialogPrimitive.Portal {...props}>
      <div className="fixed inset-0 z-9999 flex items-end justify-center sm:items-center">{children}</div>
    </AlertDialogPrimitive.Portal>
  );
}

export const AlertDialogOverlay = withCn(
  AlertDialogPrimitive.Overlay,
  "fixed inset-0 z-99999 bg-background/80 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:animate-in data-[state=open]:fade-in-0"
);

const alertDialogContentVariants = cva(
  "fixed top-1/2 left-1/2 z-99999 grid w-full max-w-lg -translate-x-1/2 -translate-y-1/2 gap-4 border bg-background p-6 shadow-lg duration-200 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=closed]:zoom-out-95 data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] data-[state=open]:zoom-in-95 sm:rounded-lg"
);

export function AlertDialogContent({ className, ...props }: React.ComponentProps<typeof AlertDialogPrimitive.Content>) {
  return (
    <AlertDialogPortal>
      <AlertDialogOverlay />

      <AlertDialogPrimitive.Content className={cn(alertDialogContentVariants(), className)} {...props} />
    </AlertDialogPortal>
  );
}

export const AlertDialogHeader = withCn(
  createPrimitiveElement("div"),
  "flex flex-col space-y-2 text-center sm:text-left"
);

export const AlertDialogFooter = withCn(createPrimitiveElement("div"), "flex flex-col gap-2");

export const AlertDialogTitle = withCn(AlertDialogPrimitive.Title, "text-lg font-semibold");

export const AlertDialogDescription = withCn(AlertDialogPrimitive.Description, "text-subtle-foreground");

export const AlertDialogAction = withVariants(AlertDialogPrimitive.Action, buttonVariants, [
  "isMenu",
  "variant",
  "size",
  "truncate",
]);

export const AlertDialogCancel = withCn(
  withProps(withVariants(AlertDialogPrimitive.Action, buttonVariants, ["isMenu", "variant", "size", "truncate"]), {
    variant: "outline",
  }),
  "mt-2 sm:mt-0"
);
