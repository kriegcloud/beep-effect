/**
 * Lossy schema transformation helpers.
 *
 * @module @beep/schema/Transformations
 * @since 0.0.0
 */

import { Effect, Function as Fn, SchemaIssue, SchemaTransformation, Struct } from "effect";
import * as O from "effect/Option";
import * as S from "effect/Schema";

type DestructiveTransform<Self extends S.Top, B> = S.decodeTo<
  S.Codec<Readonly<B>>,
  typeof S.Unknown,
  Self["DecodingServices"]
>;

const makeDestructiveOutput = <B>(): S.Codec<Readonly<B>> => S.make<S.Codec<Readonly<B>>>(S.Unknown.ast);

/**
 * Applies a lossy transform by inferring the target type from a callback result.
 *
 * This helper intentionally does not require an inverse transform. Decoding runs
 * the source schema first, then applies `transform`. Encoding passes the
 * transformed value through unchanged. Supports both data-first and data-last
 * calling conventions.
 *
 * @example
 * ```ts
 * import * as S from "effect/Schema"
 * import { pipe } from "effect"
 * import { destructiveTransform } from "@beep/schema/Transformations"
 *
 * // data-first
 * const StringLength = destructiveTransform(S.String, (value) => value.length)
 * void StringLength
 *
 * // data-last (pipeable)
 * const Piped = pipe(S.String, destructiveTransform((value) => value.length))
 * void Piped
 * ```
 *
 * @since 0.0.0
 * @category Utility
 */
export const destructiveTransform: {
  <Self extends S.Top, B>(transform: (input: Self["Type"]) => B): (self: Self) => DestructiveTransform<Self, B>;
  <Self extends S.Top, B>(self: Self, transform: (input: Self["Type"]) => B): DestructiveTransform<Self, B>;
} = Fn.dual(
  2,
  <Self extends S.Top, B>(self: Self, transform: (input: Self["Type"]) => B): DestructiveTransform<Self, B> => {
    const decodeInput = S.decodeUnknownEffect(self);
    const output = makeDestructiveOutput<B>();

    return S.Unknown.pipe(
      S.decodeTo(
        output,
        SchemaTransformation.transformOrFail({
          decode: (input, options) =>
            decodeInput(input, options).pipe(
              Effect.mapError(Struct.get("issue")),
              Effect.flatMap((decoded) =>
                Effect.try({
                  try: () => transform(decoded),
                  catch: () =>
                    new SchemaIssue.InvalidValue(O.some(decoded), {
                      message: "Error applying transformation",
                    }),
                })
              )
            ),
          encode: Effect.succeed,
        })
      )
    );
  }
);
