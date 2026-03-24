import { cn } from "@beep/ui/lib";
import type { IconProps } from "@phosphor-icons/react";

import { SpinnerGap } from "@phosphor-icons/react";

function Spinner({ className, ...props }: IconProps) {
  return <SpinnerGap role="status" aria-label="Loading" className={cn("size-4 animate-spin", className)} {...props} />;
}

export { Spinner };
