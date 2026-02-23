/**
 * Utility functions for the UI component library.
 *
 * @since 0.0.0
 * @module
 */
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merge Tailwind CSS class names with conflict resolution.
 *
 * Combines `clsx` for conditional class joining with `tailwind-merge`
 * for intelligent Tailwind class deduplication.
 *
 * @since 0.0.0
 * @category utilities
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
