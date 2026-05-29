import { SpinnerGapIcon } from "@phosphor-icons/react";
import { cn } from "../lib/index.ts";
import type { IconProps } from "@phosphor-icons/react";

/**
 * @category components
 * @since 0.0.0
 */
function Spinner({ className, ...props }: IconProps) {
  return (
    <SpinnerGapIcon role="status" aria-label="Loading" className={cn("size-4 animate-spin", className)} {...props} />
  );
}

/**
 * @category components
 * @since 0.0.0
 */
export { Spinner };
