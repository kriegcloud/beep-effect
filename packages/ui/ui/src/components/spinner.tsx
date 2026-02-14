import { cn } from "@beep/ui-core/utils";
import { SpinnerGapIcon } from "@phosphor-icons/react";
import type { IconProps } from "@phosphor-icons/react";

function Spinner({ className, ...props }: IconProps) {
  return (
    <SpinnerGapIcon role="status" aria-label="Loading" className={cn("size-4 animate-spin", className)} {...props} />
  );
}

export { Spinner };
