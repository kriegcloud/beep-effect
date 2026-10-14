import { dual } from "effect/Function";

/**
 * Adds two numbers.
 *
 * **Example** (Add two numbers)
 *
 * ```ts import.meta.vitest name="Add two numbers"
 * 1 + 1 // => 2
 * ```
 *
 * @category utilities
 * @since 0.0.0
 */
export const add: {
  (right: number): (left: number) => number;
  (left: number, right: number): number;
} = dual(2, (left: number, right: number): number => left + right);
