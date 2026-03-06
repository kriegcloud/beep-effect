import { $SchemaId } from "@beep/identity";
import * as S from "effect/Schema";
import { isNegative, isNonNegative, isNonPositive, isPositive } from "./Number.ts";

const $I = $SchemaId.create("Int");

/**
 * Branded schema for finite integers.
 *
 * @since 0.0.0
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
 * @since 0.0.0
 */
export type Int = typeof Int.Type;

/**
 * Branded schema for positive integers.
 *
 * @since 0.0.0
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
 * @since 0.0.0
 */
export type PosInt = typeof PosInt.Type;

/**
 * Branded schema for negative integers.
 *
 * @since 0.0.0
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
 * @since 0.0.0
 */
export type NegInt = typeof NegInt.Type;

/**
 * Branded schema for non-positive integers.
 *
 * @since 0.0.0
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
 * @since 0.0.0
 */
export type NonPositiveInt = typeof NonPositiveInt.Type;

/**
 * Branded schema for non-negative integers.
 *
 * @since 0.0.0
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
 * @since 0.0.0
 */
export type NonNegativeInt = typeof NonNegativeInt.Type;
