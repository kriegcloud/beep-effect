/**
 * Module for number utilities.
 *
 * @module @beep/utils/Number
 * @since 0.0.0
 */
import { Number as Num } from "effect";

/**
 * Determines if the given input is a number and is positive (greater than or equal to 0).
 *
 * This utility function serves as a type guard ensuring the input is a `number`
 * and meets the condition of being >= 0. Useful when validating or filtering
 * data in both functional and effect contexts.
 *
 * @example
 * ```typescript
 * import { isPositive } from "@beep/utils/Number";
 * import * as A from "effect/Array";
 *
 * const values = [3, -1, 0, 42, -7];
 *
 * // Basic usage: Filter out negative numbers
 * const positives = A.filter(values, isPositive);
 * console.log(positives); // Output: [3, 0, 42]
 *
 * // Type guard usage to refine unknown input types
 * const value: unknown = 5;
 * if (isPositive(value)) {
 *   console.log(`${value} is a positive number`);
 * }
 * ```
 *
 * @see Num.isGreaterThanOrEqualTo for comparison implementation details.
 *
 * @example
 * ```typescript
 * import { Console } from "effect";
 * import { isPositive } from "@beep/utils/Number";
 *
 * const processNumber = (n: unknown) =>
 *   isPositive(n)
 *     ? Console.log(`${n} is valid and positive.`)
 *     : Console.log(`Invalid input. Expected positive number, got: ${String(n)}`);
 *
 * void processNumber(10);
 * ```
 *
 * @since 0.0.0
 * @category Validation
 * @param u - The value to check.
 * @returns True if the value is a number and is positive, false otherwise.
 */
export const isPositive: (u: unknown) => u is number = (u: unknown): u is number =>
  Num.isNumber(u) && Num.isGreaterThanOrEqualTo(0)(u);

/**
 * Re-export of `effect/Number`.
 *
 * @since 0.0.0
 * @category Utility
 */
export * from "effect/Number";

/**
 * Checks whether a value is an integer.
 *
 * @since 0.0.0
 * @category Validation
 */
export const isInteger: (u: unknown) => u is number = (u: unknown): u is number =>
  Num.isNumber(u) && Number.isInteger(u);
