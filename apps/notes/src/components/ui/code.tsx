"use client";

import { cn } from "@beep/notes/lib/utils";
import type React from "react";

export function Code({ className, ...props }: React.HTMLAttributes<HTMLElement>) {
  return (
    <code className={cn("relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm", className)} {...props} />
  );
}
