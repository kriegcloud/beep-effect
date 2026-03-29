/**
 * Common types for CSV parsing
 *
 * @module @beep/schema/csv/parse/types
 * @since 0.0.0
 */
import { $SchemaId } from "@beep/identity";
import { pipe } from "effect";
import * as S from "effect/Schema";
import { Fn } from "../../Fn.ts";

const $I = $SchemaId.create("csv/parse/types");

/**
 * An array containing possibly nullish strings.
 *
 * @category Validation
 * @since 0.0.0
 */
export const HeaderArray = pipe(
  S.String,
  S.NullishOr,
  S.Array,
  $I.annoteSchema("HeaderArray", {
    description: "An array containing possibly nullish strings.",
  })
);

/**
 * Type of {@link HeaderArray} {@inheritDoc HeaderArray}
 *
 * @category Validation
 * @since 0.0.0
 */
export type HeaderArray = typeof HeaderArray.Type;

/**
 * An identity function taking an array containing possibly nullish strings
 * and returning it.
 *
 * @category Validation
 * @since 0.0.0
 */
export const HeaderTransformFunction = Fn({
  input: HeaderArray,
  output: HeaderArray,
}).pipe(
  $I.annoteSchema("HeaderTransformFunction", {
    description: "An identity function taking an array containing possibly nullish strings\nand returning it.",
  })
);

/**
 * Type of {@link HeaderTransformFunction} {@inheritDoc HeaderTransformFunction}
 *
 * @category Validation
 * @since 0.0.0
 */
export type HeaderTransformFunction = typeof HeaderTransformFunction.Type;
