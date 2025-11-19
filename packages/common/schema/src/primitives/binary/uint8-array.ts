/**
 * Binary primitive schemas such as Uint8Array wrappers.
 *
 * Useful for encoding blobs within schema use cases (file uploads, crypto payloads, etc.).
 *
 * @example
 * import * as S from "effect/Schema";
 * import { Uint8Arr } from "@beep/schema/primitives/binary/uint8-array";
 *
 * S.decodeSync(Uint8Arr)(new Uint8Array([1, 2, 3]));
 *
 * @category Primitives/Binary
 * @since 0.1.0
 */
import { Id } from "@beep/schema/primitives/binary/_id";
import * as S from "effect/Schema";

/**
 * Schema for branded `Uint8Array` values.
 *
 * @example
 * import * as S from "effect/Schema";
 * import { Uint8Arr } from "@beep/schema/primitives/binary/uint8-array";
 *
 * const bytes = S.decodeUnknownSync(Uint8Arr)(new Uint8Array([0xff]));
 *
 * @category Primitives/Binary
 * @since 0.1.0
 */
export class Uint8Arr extends S.instanceOf(Uint8Array).annotations(
  Id.annotations("uint8-array/Uint8Arr", {
    description: "A Uint8Array",
  })
) {
  static readonly is = S.is(this);
}

/**
 * Namespace exposing helper types for the `Uint8Arr` schema.
 *
 * @example
 * import type { Uint8Arr } from "@beep/schema/primitives/binary/uint8-array";
 *
 * const bytes: Uint8Arr.Type = new Uint8Array();
 *
 * @category Primitives/Binary
 * @since 0.1.0
 */
export declare namespace Uint8Arr {
  /**
   * Runtime type of the `Uint8Arr` schema.
   *
   * @example
   * import type { Uint8Arr } from "@beep/schema/primitives/binary/uint8-array";
   *
   * const value: Uint8Arr.Type = new Uint8Array();
   *
   * @category Primitives/Binary
   * @since 0.1.0
   */
  export type Type = S.Schema.Type<typeof Uint8Arr>;
  /**
   * Encoded representation accepted by the `Uint8Arr` schema.
   *
   * @example
   * import type { Uint8Arr } from "@beep/schema/primitives/binary/uint8-array";
   *
   * const encoded: Uint8Arr.Encoded = new Uint8Array();
   *
   * @category Primitives/Binary
   * @since 0.1.0
   */
  export type Encoded = S.Schema.Encoded<typeof Uint8Arr>;
}
