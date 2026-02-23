"use client";

import { cn } from "@beep/ui-core/utils";
import type * as React from "react";
import { Group, Panel, Separator } from "react-resizable-panels";

function ResizablePanelGroup({ className, ...props }: React.ComponentProps<typeof Group>) {
  return <Group data-slot="resizable-panel-group" className={cn("flex h-full w-full", className)} {...props} />;
}

function ResizablePanel({ ...props }: React.ComponentProps<typeof Panel>) {
  return <Panel data-slot="resizable-panel" {...props} />;
}

interface ResizableHandleProps extends React.ComponentProps<typeof Separator> {
  readonly withHandle?: undefined | boolean;
  readonly orientation?: undefined | "horizontal" | "vertical";
}

function ResizableHandle({
  withHandle: _withHandle,
  orientation = "horizontal",
  className,
  ...props
}: ResizableHandleProps) {
  const isVertical = orientation === "vertical";

  // Style the separator itself as the visual handle - no children to avoid event interference
  return (
    <Separator
      data-slot="resizable-handle"
      className={cn(
        "relative bg-transparent transition-colors hover:bg-muted-foreground/20",
        isVertical
          ? "h-2 w-full cursor-row-resize before:absolute before:left-1/2 before:top-1/2 before:h-1 before:w-10 before:-translate-x-1/2 before:-translate-y-1/2 before:rounded-full before:bg-muted-foreground/40"
          : "h-full w-2 cursor-col-resize before:absolute before:left-1/2 before:top-1/2 before:h-8 before:w-1 before:-translate-x-1/2 before:-translate-y-1/2 before:rounded-full before:bg-muted-foreground/40",
        className
      )}
      {...props}
    />
  );
}

export { ResizablePanelGroup, ResizablePanel, ResizableHandle };
