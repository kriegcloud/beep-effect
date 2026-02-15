"use client";

import { cn } from "@beep/todox/lib/utils";
import type * as React from "react";

interface WidgetCardProps {
  readonly title: string;
  readonly subtitle?: undefined | string;
  readonly children: React.ReactNode;
  readonly className?: undefined | string;
}

export function WidgetCard({ title, subtitle, children, className }: WidgetCardProps) {
  return (
    <div
      className={cn("flex flex-col rounded-xl bg-card/60 p-5 backdrop-blur-sm", "border border-border/50", className)}
    >
      <div className="mb-4 flex flex-col gap-0.5">
        <h3 className="text-sm font-semibold text-card-foreground">{title}</h3>
        {subtitle != null && <p className="text-xs text-muted-foreground">{subtitle}</p>}
      </div>
      <div className="flex flex-1 flex-col">{children}</div>
    </div>
  );
}
