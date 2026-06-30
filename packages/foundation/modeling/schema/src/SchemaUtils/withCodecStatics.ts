/**
 * Attach the canonical codec statics (`is`, `fromUnknown`, `decodeOption`) to a
 * schema value.
 *
 * This colocates the guard and decoders onto the schema itself so consuming
 * (business-logic) modules call `MySchema.is(value)` / `MySchema.decodeOption(raw)`
 * instead of accumulating a wall of free-floating `const isX = S.is(X)` /
 * `const decodeX = S.decodeUnknownOption(X)` helpers at the top of a file.
 *
 * Intended for branded / refined / union const schemas. `Schema.Class` and
 * `Schema.TaggedClass` lose their constructor identity when piped, so concrete
 * node classes attach the same statics in-body (`static readonly is = S.is(Self)`).
 *
 * @packageDocumentation
 * @since 0.0.0
 */

import * as S from "effect/Schema";
import { withStatics } from "./withStatics.ts";
import type * as O from "effect/Option";

/**
 * The canonical codec statics attached by {@link withCodecStatics}.
 *
 * @example
 * ```ts
 * import type { CodecStatics } from "@beep/schema/SchemaUtils/withCodecStatics"
 * import * as S from "effect/Schema"
 *
 * const accept = (statics: CodecStatics<typeof S.String>) => statics.is("x")
 * console.log(accept)
 * ```
 *
 * @template Sch - The schema the statics decode/guard.
 * @category models
 * @since 0.0.0
 */
export type CodecStatics<Sch extends S.Top> = {
  /**
   * Type guard for decoded values of `Sch`.
   *
   * @since 0.0.0
   */
  readonly is: (input: unknown) => input is Sch["Type"];
  /**
   * Synchronously decode an unknown value, throwing on failure. Use at trusted
   * boundaries where a malformed value is a programmer error.
   *
   * @since 0.0.0
   */
  readonly fromUnknown: (input: unknown) => Sch["Type"];
  /**
   * Decode an unknown value into an `Option`, returning `None` on failure. Use
   * at soft boundaries where a malformed value should be dropped, not thrown.
   *
   * @since 0.0.0
   */
  readonly decodeOption: (input: unknown) => O.Option<Sch["Type"]>;
};

/**
 * Attach {@link CodecStatics} to a schema value. Designed to be used with
 * `.pipe()` (it is unary, so `Schema.pipe(withCodecStatics)` and
 * `withCodecStatics(Schema)` are equivalent).
 *
 * @example
 * ```ts
 * import * as O from "effect/Option"
 * import * as S from "effect/Schema"
 * import { withCodecStatics } from "@beep/schema/SchemaUtils/withCodecStatics"
 *
 * const Slug = S.NonEmptyString.pipe(withCodecStatics)
 *
 * console.log(Slug.is("post")) // true
 * console.log(O.isNone(Slug.decodeOption(""))) // true
 * console.log(Slug.fromUnknown("post")) // "post"
 * ```
 *
 * @template Sch - The schema receiving the codec statics.
 * @param self - The schema receiving the codec statics.
 * @returns The schema with `is`, `fromUnknown`, and `decodeOption` attached.
 * @category constructors
 * @since 0.0.0
 */
export const withCodecStatics = <Sch extends S.Top & S.ConstraintDecoder<unknown>>(
  self: Sch
): Sch & CodecStatics<Sch> =>
  withStatics(
    (schema: Sch): CodecStatics<Sch> => ({
      is: S.is(schema),
      fromUnknown: S.decodeUnknownSync(schema),
      decodeOption: S.decodeUnknownOption(schema),
    })
  )(self);
