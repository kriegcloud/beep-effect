import type { IconProps } from "@phosphor-icons/react";
import { SpinnerGapIcon } from "@phosphor-icons/react";
import { cn } from "../lib/index.ts";

function Spinner({ className, ...props }: IconProps) {
  return (
    <SpinnerGapIcon role="status" aria-label="Loading" className={cn("size-4 animate-spin", className)} {...props} />
  );
}

export { Spinner };
