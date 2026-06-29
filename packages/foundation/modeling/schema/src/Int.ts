/**
 * Integer schemas and refinements.
 *
 * @packageDocumentation
 * @since 0.0.0
 */

import { $SchemaId } from "@beep/identity";
import * as S from "effect/Schema";
import { isNegative, isNonPositive, isPositive, isPostgresSerialInt } from "./Number.ts";

const $I = $SchemaId.create("Int");

const int64Minimum = -BigInt("9223372036854775808");
const int64Maximum = BigInt("9223372036854775807");

/**
 * Branded schema for finite integers.
 *
 * @example
 * ```ts
 * import * as S from "effect/Schema"
 * import { Int } from "@beep/schema/Int"
 *
 * const value = S.decodeUnknownSync(Int)(42)
 * console.log(value) // 42
 * ```
 *
 * @since 0.0.0
 * @category validation
 */
export const Int = S.Int.pipe(S.brand("Int"))
  .check(
    S.isFinite({
      message: "Expected a finite integer",
      description: "A finite integer",
    })
  )
  .pipe(
    $I.annoteSchema("Int", {
      description: "A an integer value",
    })
  );

/**
 * Type for {@link Int}.
 *
 * @example
 * ```ts
 * import type { Int } from "@beep/schema/Int"
 *
 * const add = (a: Int, b: Int): number => a + b
 * ```
 *
 * @since 0.0.0
 * @category models
 */
export type Int = typeof Int.Type;

/**
 * Branded schema for positive integers (greater than zero).
 *
 * @example
 * ```ts
 * import * as S from "effect/Schema"
 * import { PosInt } from "@beep/schema/Int"
 *
 * const value = S.decodeUnknownSync(PosInt)(5)
 * console.log(value) // 5
 * ```
 *
 * @since 0.0.0
 * @category validation
 */
export const PosInt = Int.pipe(S.brand("PosInt"))
  .check(
    isPositive.annotate({
      message: "Expected a positive integer",
      description: "A positive integer",
    })
  )
  .pipe(
    $I.annoteSchema("PosInt", {
      description: "A positive integer",
    })
  );

/**
 * Type for {@link PosInt}.
 *
 * @example
 * ```ts
 * import type { PosInt } from "@beep/schema/Int"
 *
 * const count: PosInt = 1 as PosInt
 * ```
 *
 * @since 0.0.0
 * @category models
 */
export type PosInt = typeof PosInt.Type;

/**
 * Branded schema for PostgreSQL `serial` column values.
 *
 * @example
 * ```ts
 * import * as S from "effect/Schema"
 * import { PostgresSerialInt } from "@beep/schema/Int"
 *
 * const id = S.decodeUnknownSync(PostgresSerialInt)(1)
 * console.log(id)
 * ```
 *
 * @since 0.0.0
 * @category schemas
 */
export const PostgresSerialInt = Int.pipe(S.brand("PostgresSerialInt"))
  .check(isPostgresSerialInt)
  .pipe(
    $I.annoteSchema("PostgresSerialInt", {
      description: "A positive integer in the PostgreSQL serial int4 range.",
    })
  );

/**
 * Type for {@link PostgresSerialInt}.
 *
 * @example
 * ```ts
 * import type { PostgresSerialInt } from "@beep/schema/Int"
 *
 * const id = 1 as PostgresSerialInt
 * console.log(id)
 * ```
 *
 * @since 0.0.0
 * @category models
 */
export type PostgresSerialInt = typeof PostgresSerialInt.Type;

/**
 * Refinement that accepts signed 64-bit integer values.
 *
 * @remarks
 * The full signed int64 range is larger than JavaScript's safe integer range,
 * so this refinement is defined for `bigint` values instead of `number`
 * values.
 *
 * @example
 * ```ts
 * import { isInt64 } from "@beep/schema/Int"
 * import * as S from "effect/Schema"
 *
 * const SignedInt64 = S.BigInt.check(isInt64())
 * console.log(S.is(SignedInt64)(BigInt("9223372036854775807"))) // true
 * ```
 *
 * @since 0.0.0
 * @category validation
 */
export function isInt64(annotations?: S.Annotations.Filter) {
  return S.isBetweenBigInt(
    {
      minimum: int64Minimum,
      maximum: int64Maximum,
    },
    {
      identifier: $I`Int64RangeCheck`,
      title: "Int64 Range",
      description: "A signed 64-bit integer in the inclusive int64 range.",
      expected: "a signed 64-bit integer",
      message: "Expected a signed 64-bit integer",
      ...annotations,
    }
  );
}

/**
 * Branded schema for signed 64-bit integers.
 *
 * @remarks
 * Use this schema for values that are already represented as `bigint`. For
 * JSON or OpenAPI boundaries where int64 values are transported as decimal
 * strings, use {@link Int64FromString}.
 *
 * @example
 * ```ts
 * import { Int64 } from "@beep/schema/Int"
 * import * as S from "effect/Schema"
 *
 * const isSignedInt64 = S.is(Int64)
 * console.log(isSignedInt64(-BigInt("9223372036854775808"))) // true
 * ```
 *
 * @since 0.0.0
 * @category validation
 */
export const Int64 = S.BigInt.check(isInt64()).pipe(
  S.brand("Int64"),
  $I.annoteSchema("Int64", {
    description: "A signed 64-bit integer represented as a BigInt.",
  })
);

/**
 * Type for {@link Int64}.
 *
 * @example
 * ```ts
 * import { Int64 } from "@beep/schema/Int"
 * import type { Int64 as Int64Value } from "@beep/schema/Int"
 * import * as S from "effect/Schema"
 *
 * const input: unknown = BigInt(42)
 * if (S.is(Int64)(input)) {
 *   const value: Int64Value = input
 *   console.log(value)
 * }
 * ```
 *
 * @since 0.0.0
 * @category models
 */
export type Int64 = typeof Int64.Type;

/**
 * Codec that decodes decimal string input into a branded signed 64-bit
 * integer and encodes it back to a decimal string.
 *
 * @example
 * ```ts
 * import { Effect } from "effect"
 * import { Int64FromString } from "@beep/schema/Int"
 * import * as S from "effect/Schema"
 *
 * const program = S.decodeUnknownEffect(Int64FromString)("9223372036854775807")
 * const result = Effect.runPromise(program)
 * console.log(result)
 * ```
 *
 * @since 0.0.0
 * @category codecs
 */
export const Int64FromString = S.BigIntFromString.pipe(
  S.decodeTo(Int64),
  $I.annoteSchema("Int64FromString", {
    description: "A decimal string codec for signed 64-bit integer BigInt values.",
  })
);

/**
 * Type for {@link Int64FromString}.
 *
 * @example
 * ```ts
 * import { Int64, Int64FromString } from "@beep/schema/Int"
 * import type { Int64FromString as Int64FromStringValue } from "@beep/schema/Int"
 * import * as S from "effect/Schema"
 *
 * const input: unknown = BigInt(0)
 * const acceptsInt64StringValue = (input: Int64FromStringValue) => input
 * if (S.is(Int64FromString)(input)) {
 *   console.log(S.is(Int64)(acceptsInt64StringValue(input)))
 * }
 * ```
 *
 * @since 0.0.0
 * @category models
 */
export type Int64FromString = typeof Int64FromString.Type;

/**
 * Branded schema for negative integers (less than zero).
 *
 * @example
 * ```ts
 * import * as S from "effect/Schema"
 * import { NegInt } from "@beep/schema/Int"
 *
 * const value = S.decodeUnknownSync(NegInt)(-3)
 * console.log(value) // -3
 * ```
 *
 * @since 0.0.0
 * @category validation
 */
export const NegInt = Int.pipe(S.brand("NegInt"))
  .check(
    isNegative.annotate({
      message: "Expected a negative integer",
      description: "A negative integer",
    })
  )
  .pipe(
    $I.annoteSchema("NegInt", {
      description: "A negative integer",
    })
  );

/**
 * Type for {@link NegInt}.
 *
 * @example
 * ```ts
 * import type { NegInt } from "@beep/schema/Int"
 *
 * const debt: NegInt = -10 as NegInt
 * ```
 *
 * @since 0.0.0
 * @category models
 */
export type NegInt = typeof NegInt.Type;

/**
 * Branded schema for non-positive integers (zero or less).
 *
 * @example
 * ```ts
 * import * as S from "effect/Schema"
 * import { NonPositiveInt } from "@beep/schema/Int"
 *
 * S.decodeUnknownSync(NonPositiveInt)(0)
 * S.decodeUnknownSync(NonPositiveInt)(-5)
 * ```
 *
 * @since 0.0.0
 * @category validation
 */
export const NonPositiveInt = Int.pipe(S.brand("NonPositiveInt"))
  .check(
    isNonPositive.annotate({
      message: "Expected a non-positive integer",
      description: "A non-positive integer",
    })
  )
  .pipe(
    $I.annoteSchema("NonPositiveInt", {
      description: "A non-positive integer",
    })
  );

/**
 * Type for {@link NonPositiveInt}.
 *
 * @example
 * ```ts
 * import type { NonPositiveInt } from "@beep/schema/Int"
 *
 * const offset: NonPositiveInt = 0 as NonPositiveInt
 * ```
 *
 * @since 0.0.0
 * @category models
 */
export type NonPositiveInt = typeof NonPositiveInt.Type;

/**
 * Branded schema for non-negative integers (zero or greater).
 *
 * @example
 * ```ts
 * import * as S from "effect/Schema"
 * import { NonNegativeInt } from "@beep/schema/Int"
 *
 * S.decodeUnknownSync(NonNegativeInt)(0)
 * S.decodeUnknownSync(NonNegativeInt)(100)
 * ```
 *
 * @since 0.0.0
 * @category validation
 */
export { NonNegativeInt } from "./Number.ts";
