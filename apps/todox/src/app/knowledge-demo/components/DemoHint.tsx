"use client";

import { Tooltip, TooltipContent, TooltipTrigger } from "@beep/todox/components/ui/tooltip";
import { InfoIcon } from "@phosphor-icons/react";
import type * as React from "react";

interface DemoHintProps {
  readonly children: React.ReactNode;
  readonly hint: string;
  readonly side?: undefined | "top" | "bottom" | "left" | "right";
}

export function DemoHint({ children, hint, side = "bottom" }: DemoHintProps) {
  return (
    <Tooltip>
      <TooltipTrigger render={() => <>{children}</>} />
      <TooltipContent side={side} className="max-w-xs">
        <p className="text-sm">{hint}</p>
      </TooltipContent>
    </Tooltip>
  );
}

interface DemoHintIconProps {
  readonly hint: string;
  readonly side?: undefined | "top" | "bottom" | "left" | "right";
  readonly className?: undefined | string;
}

export function DemoHintIcon({ hint, side = "right", className }: DemoHintIconProps) {
  return (
    <Tooltip>
      <TooltipTrigger
        render={() => (
          <span className={className}>
            <InfoIcon className="size-4 text-muted-foreground hover:text-foreground cursor-help transition-colors" />
          </span>
        )}
      />
      <TooltipContent side={side} className="max-w-xs">
        <p className="text-sm">{hint}</p>
      </TooltipContent>
    </Tooltip>
  );
}
