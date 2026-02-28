import { $SchemaId } from "@beep/identity/packages";
import * as S from "effect/Schema";

const $I = $SchemaId.create("NumberChecks");

/**
 * Refinement that accepts positive numbers.
 *
 * @since 0.0.0
 */
export const isPositive = S.isGreaterThan(0);

/**
 * Refinement that accepts non-negative numbers.
 *
 * @since 0.0.0
 */
export const isNonNegative = S.isGreaterThanOrEqualTo(0);

/**
 * Refinement that accepts negative numbers.
 *
 * @since 0.0.0
 */
export const isNegative = S.isLessThan(0);

/**
 * Refinement that accepts non-positive numbers.
 *
 * @since 0.0.0
 */
export const isNonPositive = S.isLessThanOrEqualTo(0);

/**
 * Branded schema for non-negative integers.
 *
 * @since 0.0.0
 */
export const NonNegativeInt = S.Int.check(isNonNegative).pipe(
  S.brand("NonNegativeInt"),
  S.annotate(
    $I.annote("NonNegativeInt", {
      description: "A non-negative integer",
    })
  )
);

/**
 * Type for {@link NonNegativeInt}.
 *
 * @since 0.0.0
 */
export type NonNegativeInt = typeof NonNegativeInt.Type;
