/**
 * ArrayBuffer schema helpers.
 *
 * Encodes and validates binary ArrayBuffer instances with identity annotations.
 *
 * @category Primitives/Binary
 * @since 0.1.0
 */
import { BeepId } from "@beep/identity/BeepId";
import { SchemaId } from "@beep/identity/packages";
import * as S from "effect/Schema";

const Id = BeepId.from(SchemaId.identifier).compose("primitives/array-buffer");
/**
 * Schema for validating native `ArrayBuffer` instances.
 *
 * @category Primitives/Binary
 * @since 0.1.0
 */
export class ArrBuffer extends S.instanceOf(ArrayBuffer).annotations(
  Id.annotations("ArrayBuffer", {
    description: "An Array Buffer",
  })
) {
  static readonly is = S.is(this);
}

/**
 * Namespace describing the encoded and decoded types for {@link ArrBuffer}.
 *
 * @category Primitives/Binary
 * @since 0.1.0
 */
export declare namespace ArrBuffer {
  /**
   * Runtime type for {@link ArrBuffer}.
   *
   * @category Primitives/Binary
   * @since 0.1.0
   */
  export type Type = S.Schema.Type<typeof ArrBuffer>;
  /**
   * Encoded type for {@link ArrBuffer}.
   *
   * @category Primitives/Binary
   * @since 0.1.0
   */
  export type Encoded = S.Schema.Encoded<typeof ArrBuffer>;
}
