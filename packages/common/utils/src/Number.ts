/**
 * Module for number utilities.
 *
 * @module @beep/utils/Number
 * @since 0.0.0
 */
import * as Num from "effect/Number";

/**
 * Determines if the given input is a number and is positive (greater than or equal to 0).
 *
 * This utility function serves as a type guard ensuring the input is a `number`
 * and meets the condition of being >= 0. Useful when validating or filtering
 * data in both functional and effect contexts.
 *
 * @example
 * ```typescript
 * import { isPositive } from "effect"; // Assuming this function is exported from a module
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
 * import { Effect, Console } from "effect";
 *
 * const processNumber = (n: unknown) =>
 *   Effect.gen(function* () {
 *     if (isPositive(n)) {
 *       yield* Console.log(`${n} is valid and positive.`);
 *     } else {
 *       throw new Error(`Invalid input. Expected positive number, got: ${n}`);
 *     }
 *   });
 *
 * const program = processNumber(10).pipe(
 *   Effect.catchAll((error) =>
 *     Console.log(`Error occurred: ${error.message}`)
 *   )
 * );
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

export const isInteger: (u: unknown) => u is number = (u: unknown): u is number =>
  Num.isNumber(u) && Number.isInteger(u);
