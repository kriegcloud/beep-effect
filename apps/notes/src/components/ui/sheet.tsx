"use client";

import { cn } from "@beep/notes/lib/utils";

import * as SheetPrimitive from "@radix-ui/react-dialog";
import { cva, type VariantProps } from "class-variance-authority";
import type * as React from "react";

import { Icons } from "./icons";

const Sheet = SheetPrimitive.Root;

const SheetTrigger = SheetPrimitive.Trigger;

const portalVariants = cva("fixed z-9999 flex", {
  defaultVariants: { modal: true, position: "right" },
  variants: {
    modal: {
      true: "inset-0",
    },
    position: {
      bottom: "items-end",
      left: "justify-start",
      right: "justify-end",
      top: "items-start",
    },
  },
});

interface SheetPortalProps extends SheetPrimitive.DialogPortalProps, VariantProps<typeof portalVariants> {}

function SheetPortal({ children, modal, position, ...props }: SheetPortalProps) {
  return (
    <SheetPrimitive.Portal {...props}>
      <div className={portalVariants({ modal, position })}>{children}</div>
    </SheetPrimitive.Portal>
  );
}

export function SheetOverlay({ children, className, ...props }: React.ComponentProps<typeof SheetPrimitive.Overlay>) {
  return (
    <SheetPrimitive.Overlay className={cn("fixed inset-0 z-9999 transition-all duration-100", className)} {...props} />
  );
}

// Changed
const sheetVariants = cva("fixed z-9999 gap-4 bg-background p-6 shadow-lg transition ease-in-out", {
  defaultVariants: {
    animate: true,
    side: "right",
  },
  variants: {
    animate: {
      true: "data-[state=closed]:animate-out data-[state=closed]:duration-300 data-[state=open]:animate-in data-[state=open]:duration-500",
    },
    side: {
      bottom:
        "inset-x-0 bottom-0 border-t data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom",
      left: "inset-y-0 left-0 h-full w-3/4 border-r data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left sm:max-w-sm",
      right:
        "inset-y-0 right-0 h-full w-3/4 border-l data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right sm:max-w-sm",
      top: "inset-x-0 top-0 border-b data-[state=closed]:slide-out-to-top data-[state=open]:slide-in-from-top",
    },
  },
});

export function SheetContent({
  animate,
  children,
  className,
  closeClassName,
  hideClose,
  modal = true,
  position,
  side,
  onClose,
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Content> &
  VariantProps<typeof sheetVariants> &
  VariantProps<typeof portalVariants> & {
    closeClassName?: string;
    hideClose?: boolean;
    onClose?: () => void;
  }) {
  return (
    <SheetPortal modal={modal} position={position}>
      {!modal && <SheetOverlay />}

      <SheetPrimitive.Content className={cn(sheetVariants({ animate, side }), className)} {...props}>
        {children}

        {!hideClose && (
          <SheetPrimitive.Close
            className={cn(
              "absolute top-4 right-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:focus-ring focus:outline-hidden disabled:pointer-events-none data-[state=open]:bg-secondary",
              closeClassName
            )}
            onClick={onClose}
            aria-label="Close"
          >
            <Icons.x />
          </SheetPrimitive.Close>
        )}
      </SheetPrimitive.Content>
    </SheetPortal>
  );
}

const SheetHeader = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("flex flex-col space-y-2 text-center sm:text-left", className)} {...props} />
);

const SheetFooter = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2", className)} {...props} />
);

export function SheetTitle({ className, ...props }: React.ComponentProps<typeof SheetPrimitive.Title>) {
  return <SheetPrimitive.Title className={cn("text-lg font-semibold text-foreground", className)} {...props} />;
}

export function SheetDescription({ className, ...props }: React.ComponentProps<typeof SheetPrimitive.Description>) {
  return <SheetPrimitive.Description className={cn("text-subtle-foreground", className)} {...props} />;
}

export { Sheet, SheetFooter, SheetHeader, SheetTrigger };
