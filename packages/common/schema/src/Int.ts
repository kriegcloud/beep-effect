/**
 * Integer schemas and refinements.
 *
 * @module
 * @since 0.0.0
 */

import { $SchemaId } from "@beep/identity";
import * as S from "effect/Schema";
import { isNegative, isNonNegative, isNonPositive, isPositive } from "./Number.ts";

const $I = $SchemaId.create("Int");

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
 * @category Validation
 */
export const Int = S.Int.pipe(S.brand("Int"))
  .check(
    S.isFinite({
      message: "Expected a finite integer",
      description: "A finite integer",
    })
  )
  .annotate(
    $I.annote("Int", {
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
 * @category DomainModel
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
 * @category Validation
 */
export const PosInt = Int.pipe(S.brand("PosInt"))
  .check(
    isPositive.annotate({
      message: "Expected a positive integer",
      description: "A positive integer",
    })
  )
  .annotate(
    $I.annote("PosInt", {
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
 * @category DomainModel
 */
export type PosInt = typeof PosInt.Type;

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
 * @category Validation
 */
export const NegInt = Int.pipe(S.brand("NegInt"))
  .check(
    isNegative.annotate({
      message: "Expected a negative integer",
      description: "A negative integer",
    })
  )
  .annotate(
    $I.annote("NegInt", {
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
 * @category DomainModel
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
 * @category Validation
 */
export const NonPositiveInt = Int.pipe(S.brand("NonPositiveInt"))
  .check(
    isNonPositive.annotate({
      message: "Expected a non-positive integer",
      description: "A non-positive integer",
    })
  )
  .annotate(
    $I.annote("NonPositiveInt", {
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
 * @category DomainModel
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
 * @category Validation
 */
export const NonNegativeInt = Int.pipe(S.brand("NonNegativeInt"))
  .check(
    isNonNegative.annotate({
      message: "Expected a non-negative integer",
      description: "A non-negative integer",
    })
  )
  .annotate(
    $I.annote("NonNegativeInt", {
      description: "A non-negative integer",
    })
  );

/**
 * Type for {@link NonNegativeInt}.
 *
 * @example
 * ```ts
 * import type { NonNegativeInt } from "@beep/schema/Int"
 *
 * const index: NonNegativeInt = 0 as NonNegativeInt
 * ```
 *
 * @since 0.0.0
 * @category DomainModel
 */
export type NonNegativeInt = typeof NonNegativeInt.Type;
