/**
 * Percentage - Value object for percentage values (0-100)
 *
 * A branded type representing a valid percentage value constrained to 0-100.
 * Supports decimal values (e.g., 12.5%, 99.99%).
 * Uses Schema.brand for compile-time type safety.
 *
 * @module @beep/schema/Percentage
 */
import { $SchemaId } from "@beep/identity";
import { Function as F } from "effect";
import * as S from "effect/Schema";

const $I = $SchemaId.create("Percentage");

/**
 * Schema for a valid percentage value between 0 and 100 (inclusive).
 *
 * @example
 * ```ts
 * import * as S from "effect/Schema"
 * import { Percentage } from "@beep/schema/Percentage"
 *
 * const value = S.decodeUnknownSync(Percentage)(75.5)
 * console.log(value) // 75.5
 * ```
 *
 * @category DomainModel
 * @since 0.0.0
 */
export const Percentage = S.Number.check(
  S.makeFilterGroup([S.isGreaterThanOrEqualTo(0), S.isLessThanOrEqualTo(100)])
).pipe(
  S.brand("Percentage"),
  $I.annoteSchema("Percentage", {
    description:
      "Schema for a valid percentage value.\nMust be a number between 0 and 100 (inclusive).\nSupports decimal values.",
  })
);

/**
 * Type for {@link Percentage}. {@inheritDoc Percentage}
 *
 * @example
 * ```ts
 * import type { Percentage } from "@beep/schema/Percentage"
 *
 * const discount: Percentage = 25 as Percentage
 * ```
 *
 * @since 0.0.0
 * @category DomainModel
 */
export type Percentage = typeof Percentage.Type;

/**
 * Type guard for {@link Percentage}.
 *
 * @example
 * ```ts
 * import { isPercentage } from "@beep/schema/Percentage"
 *
 * console.log(isPercentage(50)) // true
 * console.log(isPercentage(150)) // false
 * ```
 *
 * @since 0.0.0
 * @category Validation
 */
export const isPercentage = S.is(Percentage);

/**
 * Percentage constant for 0%.
 *
 * @example
 * ```ts
 * import { ZERO } from "@beep/schema/Percentage"
 *
 * console.log(ZERO) // 0
 * ```
 *
 * @since 0.0.0
 * @category Constants
 */
export const ZERO: Percentage = Percentage.makeUnsafe(0);
/**
 * Percentage constant for 20%.
 *
 * @since 0.0.0
 * @category Constants
 */
export const TWENTY: Percentage = Percentage.makeUnsafe(20);
/**
 * Percentage constant for 50%.
 *
 * @since 0.0.0
 * @category Constants
 */
export const FIFTY: Percentage = Percentage.makeUnsafe(50);
/**
 * Percentage constant for 100%.
 *
 * @since 0.0.0
 * @category Constants
 */
export const HUNDRED: Percentage = Percentage.makeUnsafe(100);

/**
 * Convert a percentage to its decimal representation (0-1 range).
 *
 * @example
 * ```ts
 * import { toDecimal, FIFTY } from "@beep/schema/Percentage"
 *
 * console.log(toDecimal(FIFTY)) // 0.5
 * ```
 *
 * @since 0.0.0
 * @category Utility
 */
export const toDecimal = (percentage: Percentage): number => percentage / 100;

/**
 * Convert a decimal (0-1 range) to a percentage value.
 *
 * @example
 * ```ts
 * import { fromDecimal } from "@beep/schema/Percentage"
 *
 * const pct = fromDecimal(0.75)
 * console.log(pct) // 75
 * ```
 *
 * @since 0.0.0
 * @category Utility
 */
export const fromDecimal = (decimal: number): Percentage => Percentage.makeUnsafe(decimal * 100);

/**
 * Check if a percentage value is zero.
 *
 * @example
 * ```ts
 * import { isZero, ZERO, FIFTY } from "@beep/schema/Percentage"
 *
 * console.log(isZero(ZERO)) // true
 * console.log(isZero(FIFTY)) // false
 * ```
 *
 * @since 0.0.0
 * @category Validation
 */
export const isZero = (percentage: Percentage): boolean => percentage === 0;

/**
 * Check if a percentage value is 100%.
 *
 * @example
 * ```ts
 * import { isFull, HUNDRED, FIFTY } from "@beep/schema/Percentage"
 *
 * console.log(isFull(HUNDRED)) // true
 * console.log(isFull(FIFTY)) // false
 * ```
 *
 * @since 0.0.0
 * @category Validation
 */
export const isFull = (percentage: Percentage): boolean => percentage === 100;

/**
 * Get the complement of a percentage (100 - value).
 *
 * @example
 * ```ts
 * import { complement, TWENTY } from "@beep/schema/Percentage"
 *
 * const result = complement(TWENTY)
 * console.log(result) // 80
 * ```
 *
 * @since 0.0.0
 * @category Utility
 */
export const complement = (percentage: Percentage): Percentage => Percentage.makeUnsafe(100 - percentage);

/**
 * Format a percentage as a display string with configurable decimal places.
 *
 * @example
 * ```ts
 * import { format, FIFTY } from "@beep/schema/Percentage"
 *
 * console.log(format(FIFTY, 0)) // "50%"
 * console.log(format(FIFTY, 2)) // "50.00%"
 * ```
 *
 * @since 0.0.0
 * @category Formatting
 */
export const format: {
  (percentage: Percentage): (decimalPlaces?: undefined | number) => string;
  (percentage: Percentage, decimalPlaces?: undefined | number): string;
} = F.dual(2, (percentage: Percentage, decimalPlaces = 2): string => `${percentage.toFixed(decimalPlaces)}%`);
