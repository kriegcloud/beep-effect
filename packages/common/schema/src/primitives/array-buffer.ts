/**
 * ArrayBuffer schema helpers.
 *
 * Encodes and validates binary ArrayBuffer instances with identity annotations.
 *
 * @category Primitives/Binary
 * @since 0.1.0
 */

import { Equivalence, type Pretty } from "effect";
import type { LazyArbitrary } from "effect/Arbitrary";
import * as S from "effect/Schema";
import { $ArrayBufferId } from "../internal";

const Id = $ArrayBufferId;

const isArrayBuffer = (i: unknown): i is ArrayBuffer => i instanceof ArrayBuffer;

/**
 * Schema for validating native `ArrayBuffer` instances.
 *
 * @category Primitives/Binary
 * @since 0.1.0
 */

export class ArrayBufferFromSelf extends S.declare(isArrayBuffer).annotations(
  Id.annotations("ArrayBufferFromSelf", {
    description: "An Array Buffer",
    equivalence: (): Equivalence.Equivalence<ArrayBuffer> =>
      Equivalence.make((a, b) => {
        if (a === b) return true;
        if (a.byteLength !== b.byteLength) return false;

        const viewA = new Uint8Array(a);
        const viewB = new Uint8Array(b);

        for (let i = 0; i < viewA.length; i++) {
          if (viewA[i] !== viewB[i]) return false;
        }
        return true;
      }),
    pretty: (): Pretty.Pretty<ArrayBuffer> => (buffer) => `new ArrayBuffer(${buffer.byteLength})`,
    arbitrary: (): LazyArbitrary<ArrayBuffer> => (fc) =>
      fc.uint8Array({ minLength: 0, maxLength: 1024 }).map((uint8Array) => uint8Array.buffer as ArrayBuffer),
  })
) {
  static readonly is = S.is(this);
}

/**
 * Namespace describing the encoded and decoded types for {@link ArrayBufferFromSelf}.
 *
 * @category Primitives/Binary
 * @since 0.1.0
 */
export declare namespace ArrayBufferFromSelf {
  /**
   * Runtime type for {@link ArrayBufferFromSelf}.
   *
   * @category Primitives/Binary
   * @since 0.1.0
   */
  export type Type = S.Schema.Type<typeof ArrayBufferFromSelf>;
  /**
   * Encoded type for {@link ArrayBufferFromSelf}.
   *
   * @category Primitives/Binary
   * @since 0.1.0
   */
  export type Encoded = S.Schema.Encoded<typeof ArrayBufferFromSelf>;
}
