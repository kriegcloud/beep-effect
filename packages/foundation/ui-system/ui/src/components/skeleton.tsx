import { cn } from "../lib/index.ts";
import type React from "react";

/**
 * @category components
 * @since 0.0.0
 */
function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="skeleton" className={cn("bg-muted rounded-md animate-pulse", className)} {...props} />;
}

/**
 * @category components
 * @since 0.0.0
 */
export { Skeleton };
