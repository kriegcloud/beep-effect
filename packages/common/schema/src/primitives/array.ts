/**
 * Array schemas and helpers for comma-delimited payloads.
 *
 * Provides branded numeric arrays and transforms for string <-> array conversions.
 *
 * @category Primitives/Array
 * @since 0.1.0
 */

import { $SchemaId } from "@beep/identity/packages";
import * as A from "effect/Array";
import * as S from "effect/Schema";
import * as Str from "effect/String";

const $I = $SchemaId.create("primitives/array");
/**
 * Schema for arrays of numbers with identity annotations.
 *
 * @category Primitives/Array
 * @since 0.1.0
 */
export class ArrayOfNumbers extends S.Array(S.Number).annotations(
  $I.annotations("ArrayOfNumbers", {
    description: "Array of numbers",
  })
) {
  static readonly is = S.is(this);
}

/**
 * Namespace describing the encoded and decoded types for {@link ArrayOfNumbers}.
 *
 * @category Primitives/Array
 * @since 0.1.0
 */
export declare namespace ArrayOfNumbers {
  /**
   * Runtime type for {@link ArrayOfNumbers}.
   *
   * @category Primitives/Array
   * @since 0.1.0
   */
  export type Type = S.Schema.Type<typeof ArrayOfNumbers>;
  /**
   * Encoded type for {@link ArrayOfNumbers}.
   *
   * @category Primitives/Array
   * @since 0.1.0
   */
  export type Encoded = S.Schema.Encoded<typeof ArrayOfNumbers>;
}

/**
 * Transforms between comma-delimited strings and literal arrays.
 *
 * @category Primitives/Array
 * @since 0.1.0
 */
export const arrayToCommaSeparatedString = <A extends string | number | boolean>(
  literalSchema: S.Schema<A, A, never>
) =>
  S.transform(S.String, S.Array(literalSchema), {
    decode: (str) => Str.split(",")(str) as A.NonEmptyArray<A>,
    encode: (array) => array.join(","),
    strict: true,
  }).annotations(
    $I.annotations("arrayToCommaSeparatedString", {
      description: "Converts an array to a comma separated string",
    })
  );

export const EmptyArrayOf = <A, E, R>(schema: S.Schema<A, E, R>) =>
  S.Array(schema).pipe(S.filter((i) => i.length === 0 || "must be empty array"));


export declare class EmptyArray extends S.declare((u: unknown): u is [] => A.isArray(u) && A.isNonEmptyReadonlyArray(u)).annotations(
  $I.annotations("EmptyArrayOfUnknown", {
    description: "Empty array of unknown",
  })
) {

}

export declare namespace EmptyArray {
  export type Type = S.Schema.Type<typeof EmptyArray>;
  export type Encoded = S.Schema.Encoded<typeof EmptyArray>;
}
