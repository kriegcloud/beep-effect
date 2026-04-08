import { $SchemaId } from "@beep/identity/packages";
import * as S from "effect/Schema";

const $I = $SchemaId.create("NumberChecks");

/**
 * Refinement that accepts positive numbers (greater than zero).
 *
 * @example
 * ```ts
 * import * as S from "effect/Schema"
 * import { isPositive } from "@beep/schema/Number"
 *
 * const PosNum = S.Number.check(isPositive)
 * const value = S.decodeUnknownSync(PosNum)(5)
 * console.log(value) // 5
 * ```
 *
 * @since 0.0.0
 * @category Validation
 */
export const isPositive = S.isGreaterThan(0);

/**
 * Refinement that accepts non-negative numbers (zero or greater).
 *
 * @example
 * ```ts
 * import * as S from "effect/Schema"
 * import { isNonNegative } from "@beep/schema/Number"
 *
 * const NonNeg = S.Number.check(isNonNegative)
 * S.decodeUnknownSync(NonNeg)(0)
 * S.decodeUnknownSync(NonNeg)(42)
 * ```
 *
 * @since 0.0.0
 * @category Validation
 */
export const isNonNegative = S.isGreaterThanOrEqualTo(0);

/**
 * Refinement that accepts negative numbers (less than zero).
 *
 * @example
 * ```ts
 * import * as S from "effect/Schema"
 * import { isNegative } from "@beep/schema/Number"
 *
 * const NegNum = S.Number.check(isNegative)
 * const value = S.decodeUnknownSync(NegNum)(-1)
 * console.log(value) // -1
 * ```
 *
 * @since 0.0.0
 * @category Validation
 */
export const isNegative = S.isLessThan(0);

/**
 * Refinement that accepts non-positive numbers (zero or less).
 *
 * @example
 * ```ts
 * import * as S from "effect/Schema"
 * import { isNonPositive } from "@beep/schema/Number"
 *
 * const NonPos = S.Number.check(isNonPositive)
 * S.decodeUnknownSync(NonPos)(0)
 * S.decodeUnknownSync(NonPos)(-10)
 * ```
 *
 * @since 0.0.0
 * @category Validation
 */
export const isNonPositive = S.isLessThanOrEqualTo(0);

/**
 * Branded schema for non-negative integers.
 *
 * @example
 * ```ts
 * import * as S from "effect/Schema"
 * import { NonNegativeInt } from "@beep/schema/Number"
 *
 * const value = S.decodeUnknownSync(NonNegativeInt)(10)
 * console.log(value) // 10
 * ```
 *
 * @since 0.0.0
 * @category Validation
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
 * @example
 * ```ts
 * import type { NonNegativeInt } from "@beep/schema/Number"
 *
 * const pageSize: NonNegativeInt = 25 as NonNegativeInt
 * ```
 *
 * @since 0.0.0
 * @category DomainModel
 */
export type NonNegativeInt = typeof NonNegativeInt.Type;
