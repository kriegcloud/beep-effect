import TailwindIndicator from "@beep/notes/components/dev/tailwind-indicator";
import { env } from "@beep/notes/env";
import type * as React from "react";

export function DevToolsServer({ children }: { children: React.ReactNode }) {
  if (env.NODE_ENV === "production") return <>{children}</>;

  return <TailwindIndicator>{children}</TailwindIndicator>;
}
