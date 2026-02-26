import { $SchemaId } from "@beep/identity/packages";
import * as S from "effect/Schema";

const $I = $SchemaId.create("NumberChecks");

/**
 * @since 0.0.0
 */
export const isPositive = S.isGreaterThan(0);
/**
 * @since 0.0.0
 */
export const isNonNegative = S.isGreaterThanOrEqualTo(0);
/**
 * @since 0.0.0
 */
export const isNegative = S.isLessThan(0);
/**
 * @since 0.0.0
 */
export const isNonPositive = S.isLessThanOrEqualTo(0);

/**
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
 * @since 0.0.0
 */
export type NonNegativeInt = typeof NonNegativeInt.Type;
