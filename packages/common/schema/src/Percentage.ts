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
 * Schema for a valid percentage value.
 * Must be a number between 0 and 100 (inclusive).
 * Supports decimal values.
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
 * @since 0.0.0
 * @category DomainModel
 */
export type Percentage = typeof Percentage.Type;

/**
 * Type guard for {@link Percentage}.
 *
 * @since 0.0.0
 * @category Validation
 */
export const isPercentage = S.is(Percentage);

/**
 * Common percentage values
 * Using Schema's .makeUnsafe() constructor which validates by default
 *
 * @since 0.0.0
 * @category Constants
 */
export const ZERO: Percentage = Percentage.makeUnsafe(0);
/**
 * @since 0.0.0
 * @category Constants
 */
export const TWENTY: Percentage = Percentage.makeUnsafe(20);
/**
 * @since 0.0.0
 * @category Constants
 */
export const FIFTY: Percentage = Percentage.makeUnsafe(50);
/**
 * @since 0.0.0
 * @category Constants
 */
export const HUNDRED: Percentage = Percentage.makeUnsafe(100);

/**
 * Convert percentage to decimal (0-1 range)
 * E.g., 50% -> 0.5
 *
 * @since 0.0.0
 * @category Utility
 */
export const toDecimal = (percentage: Percentage): number => percentage / 100;

/**
 * Convert decimal (0-1 range) to percentage
 * E.g., 0.5 -> 50%
 * Note: Uses Schema's .make() for validation
 *
 * @since 0.0.0
 * @category Utility
 */
export const fromDecimal = (decimal: number): Percentage => Percentage.makeUnsafe(decimal * 100);

/**
 * Check if percentage is zero
 *
 * @since 0.0.0
 * @category Validation
 */
export const isZero = (percentage: Percentage): boolean => percentage === 0;

/**
 * Check if percentage is 100%
 *
 * @since 0.0.0
 * @category Validation
 */
export const isFull = (percentage: Percentage): boolean => percentage === 100;

/**
 * Get the complement of a percentage (100 - value)
 * E.g., 30% -> 70%
 *
 * @since 0.0.0
 * @category Utility
 */
export const complement = (percentage: Percentage): Percentage => Percentage.makeUnsafe(100 - percentage);

/**
 * Format percentage as a display string
 *
 * @since 0.0.0
 * @category Formatting
 */
export const format: {
  (percentage: Percentage): (decimalPlaces?: undefined | number) => string;
  (percentage: Percentage, decimalPlaces?: undefined | number): string;
} = F.dual(2, (percentage: Percentage, decimalPlaces = 2): string => `${percentage.toFixed(decimalPlaces)}%`);
