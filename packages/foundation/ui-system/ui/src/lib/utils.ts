/**
 * Utility functions for the UI component library.
 *
 * @example
 * ```ts
 * import { cn } from "@beep/ui/lib/utils"
 *
 * console.log(cn)
 * ```
 *
 * @category utilities
 * @since 0.0.0
 * @packageDocumentation
 */

import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import type { ClassValue } from "clsx";

/**
 * Cn export.
 *
 * @example
 * ```ts
 * import { cn } from "@beep/ui/lib/utils"
 *
 * console.log(cn)
 * ```
 *
 * @category utilities
 * @since 0.0.0
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
