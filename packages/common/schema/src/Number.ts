/**
 * Numeric refinement helpers.
 *
 * @module
 * @since 0.0.0
 */

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
 * Refinement that accepts integers in PostgreSQL `serial` column range.
 *
 * @example
 * ```ts
 * import * as S from "effect/Schema"
 * import { isPostgresSerialInt } from "@beep/schema/Number"
 *
 * const Serial = S.Int.check(isPostgresSerialInt)
 * const id = S.decodeUnknownSync(Serial)(1)
 * console.log(id)
 * ```
 *
 * @since 0.0.0
 * @category validation
 */
export const isPostgresSerialInt = S.makeFilterGroup(
  [
    S.isInt({
      identifier: $I`PostgresSerialIntIntegerCheck`,
      title: "Postgres Serial Integer",
      description: "A PostgreSQL serial value must be an integer.",
      message: "Expected a PostgreSQL serial integer",
    }),
    S.isGreaterThan(0, {
      identifier: $I`PostgresSerialIntPositiveCheck`,
      title: "Postgres Serial Positive",
      description: "A PostgreSQL serial value starts at one.",
      message: "Expected a PostgreSQL serial integer greater than zero",
    }),
    S.isLessThanOrEqualTo(2_147_483_647, {
      identifier: $I`PostgresSerialIntMaxCheck`,
      title: "Postgres Serial Max",
      description: "A PostgreSQL serial value must fit in the signed int4 range.",
      message: "Expected a PostgreSQL serial integer less than or equal to 2147483647",
    }),
  ],
  {
    identifier: $I`PostgresSerialIntChecks`,
    title: "Postgres Serial Int",
    description: "Checks for positive signed int4 values produced by PostgreSQL serial columns.",
  }
);

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
