"use client";

import { cn } from "@beep/notes/lib/utils";

import {
  Resizable as ResizablePrimitive,
  type ResizeHandle as ResizeHandlePrimitive,
  useResizeHandle,
  useResizeHandleState,
} from "@platejs/resizable";
import { cva, type VariantProps } from "class-variance-authority";
import type * as React from "react";

export const mediaResizeHandleVariants = cva(
  cn(
    "absolute inset-y-0 flex w-4 flex-col justify-center select-none",
    "after:flex after:h-12 after:max-h-[50%] after:w-1.5 after:rounded-[20px] after:opacity-0 after:transition-opacity after:duration-200 after:ease-in-out after:content-['_'] group-hover/media:after:opacity-100",
    "after:bg-opacity-[60] after:border after:border-white/90 after:bg-black/60"
  ),
  {
    variants: {
      direction: {
        left: "left-0 pl-[5px]",
        right: "right-0 items-end pr-[5px]",
      },
    },
  }
);

const resizeHandleVariants = cva(cn("absolute z-40"), {
  variants: {
    direction: {
      bottom: "w-full cursor-row-resize",
      left: "h-full cursor-col-resize",
      right: "h-full cursor-col-resize",
      top: "w-full cursor-row-resize",
    },
  },
});

type ResizeHandleProps = React.ComponentProps<typeof ResizeHandlePrimitive> & VariantProps<typeof resizeHandleVariants>;

export function ResizeHandle({ className, options, ...props }: ResizeHandleProps) {
  const state = useResizeHandleState(options ?? {});
  const resizeHandle = useResizeHandle(state);

  if (state.readOnly) return null;

  return (
    <div
      className={cn(resizeHandleVariants({ direction: options?.direction }), className)}
      data-resizing={state.isResizing}
      {...resizeHandle.props}
      {...props}
    />
  );
}

const resizableVariants = cva("", {
  variants: {
    align: {
      center: "mx-auto",
      left: "mr-auto",
      right: "ml-auto",
    },
  },
});

type ResizableProps = React.ComponentProps<typeof ResizablePrimitive> & VariantProps<typeof resizableVariants>;

export function Resizable({ align, className, ...props }: ResizableProps) {
  return <ResizablePrimitive {...props} className={cn(resizableVariants({ align }), className)} />;
}
