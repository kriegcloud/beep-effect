"use client";

import { useToggleLeftPanel } from "@beep/notes/hooks/useResizablePanel";
import { cn } from "@beep/notes/lib/utils";
import { Button } from "@beep/notes/registry/ui/button";
import type React from "react";

export const CloseButton = ({ children }: React.PropsWithChildren) => {
  const toggle = useToggleLeftPanel();

  return (
    <Button
      size="iconSm"
      variant="nav"
      className={cn("opacity-0 group-hover/sidebar:opacity-100")}
      onClick={() => toggle()}
      tooltip="Close sidebar"
      tooltipContentProps={{
        side: "right",
      }}
    >
      {children}
    </Button>
  );
};
