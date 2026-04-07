/**
 * Schemas and model-field helpers for working with `globalThis.Float16Array`
 * values.
 *
 * Use this module when the domain model should keep native `Float16Array`
 * instances, but JSON create and update payloads still need a plain array-of-
 * numbers representation.
 *
 * This module requires a runtime that exposes `globalThis.Float16Array`.
 *
 * @module @beep/schema/Float16Array
 * @since 0.0.0
 */
import { $SchemaId } from "@beep/identity";
import { SchemaTransformation } from "effect";
import * as A from "effect/Array";
import * as S from "effect/Schema";
import { Model } from "effect/unstable/schema";

const $I = $SchemaId.create("Float16Array");

/**
 * Schema that accepts native `Float16Array` instances.
 *
 * This is useful for internal boundaries that already operate on typed arrays
 * and only need runtime schema validation plus reusable schema metadata.
 *
 * @category Validation
 * @since 0.0.0
 * @example
 * ```ts
 * import * as S from "effect/Schema";
 * import { Float16Arr } from "@beep/schema/Float16Array";
 *
 * const decodeFloat16Array = S.decodeUnknownSync(Float16Arr);
 * const value = decodeFloat16Array(new Float16Array([1, 2, 3]));
 *
 * console.log(value.length); // 3
 * ```
 */
export const Float16Arr = S.instanceOf<globalThis.Float16ArrayConstructor, globalThis.Float16Array>(
  globalThis.Float16Array
).pipe(
  $I.annoteSchema("Float16Arr", {
    description: "A schema that validates native Float16Array instances.",
  })
);

/**
 * Type for {@link Float16Arr}.
 *
 * @category DomainModel
 * @since 0.0.0
 */
export type Float16Arr = typeof Float16Arr.Type;

/**
 * Bidirectional schema that decodes arrays of numbers into `Float16Array`
 * values.
 *
 * Decoding allocates a new `Float16Array` from the provided numeric array.
 * Encoding converts the typed array back into a standard array of numbers so it
 * can be transported through JSON-friendly boundaries.
 *
 * @category Validation
 * @since 0.0.0
 * @example
 * ```ts
 * import * as S from "effect/Schema";
 * import { Float16ArrayFromArray } from "@beep/schema/Float16Array";
 *
 * const decodeFloat16Array = S.decodeUnknownSync(Float16ArrayFromArray);
 * const encodeFloat16Array = S.encodeSync(Float16ArrayFromArray);
 *
 * const value = decodeFloat16Array([0.5, 1.25, 2.75]);
 * const encoded = encodeFloat16Array(value);
 *
 * console.log(value instanceof Float16Array); // true
 * console.log(encoded); // [0.5, 1.25, 2.75]
 * ```
 */
export const Float16ArrayFromArray = S.Number.pipe(
  S.Array,
  S.decodeTo(
    Float16Arr,
    SchemaTransformation.transform({
      decode: (values) => new globalThis.Float16Array(values),
      encode: A.fromIterable,
    })
  ),
  $I.annoteSchema("Float16ArrayFromArray", {
    description:
      "A bidirectional schema that decodes numeric arrays into Float16Array values and encodes Float16Array values back to arrays.",
  })
);

/**
 * Type for {@link Float16ArrayFromArray}.
 *
 * @category DomainModel
 * @since 0.0.0
 */
export type Float16ArrayFromArray = typeof Float16ArrayFromArray.Type;

/**
 * Namespace members for {@link Float16ArrayFromArray}.
 *
 * @category DomainModel
 * @since 0.0.0
 */
export declare namespace Float16ArrayFromArray {
  /**
   * Encoded representation accepted by {@link Float16ArrayFromArray}.
   *
   * This stays as a plain array of numbers so JSON payloads can represent
   * typed-array content without a custom wire format.
   *
   * @category DomainModel
   * @since 0.0.0
   * @example
   * ```ts
   * import { type Float16ArrayFromArray } from "@beep/schema/Float16Array";
   *
   * const payload: Float16ArrayFromArray.Encoded = [0.5, 1.25, 2.75];
   *
   * console.log(payload.length); // 3
   * ```
   */
  export type Encoded = typeof Float16ArrayFromArray.Encoded;
}

/**
 * Model field helper for storing `Float16Array` values in variant-based model
 * schemas.
 *
 * Database-facing `insert` and `update` variants require native
 * `Float16Array` instances, while `jsonCreate` and `jsonUpdate` accept plain
 * numeric arrays through {@link Float16ArrayFromArray}. This field does not
 * define a `json` variant, allowing read-side JSON serialization to be chosen
 * explicitly by the surrounding model.
 *
 * @category fields
 * @since 0.0.0
 */
export const Float16ArrayField = Model.Field({
  insert: Float16Arr,
  update: Float16Arr,
  jsonCreate: Float16ArrayFromArray,
  jsonUpdate: Float16ArrayFromArray,
});
