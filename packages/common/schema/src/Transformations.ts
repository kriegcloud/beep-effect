import { Effect, Function as Fn, SchemaIssue, SchemaTransformation } from "effect";
import * as O from "effect/Option";
import * as S from "effect/Schema";

type DestructiveTransform<Self extends S.Top, B> = S.decodeTo<
  S.Schema<Readonly<B>>,
  S.Unknown,
  Self["DecodingServices"]
>;

/**
 * Applies a lossy transform by inferring the target type from a callback result.
 *
 * This helper intentionally does not require an inverse transform. Decoding runs
 * the source schema first, then applies `transform`. Encoding passes the
 * transformed value through unchanged.
 *
 * @example
 * ```ts
 * import * as S from "effect/Schema";
 * import { destructiveTransform } from "@beep/schema/Transformations";
 *
 * const schema = destructiveTransform(S.String, (value) => value.length);
 * ```
 *
 * @since 0.0.0
 */
export const destructiveTransform: {
  <Self extends S.Top, B>(transform: (input: Self["Type"]) => B): (self: Self) => DestructiveTransform<Self, B>;
  <Self extends S.Top, B>(self: Self, transform: (input: Self["Type"]) => B): DestructiveTransform<Self, B>;
} = Fn.dual(
  2,
  <Self extends S.Top, B>(self: Self, transform: (input: Self["Type"]) => B): DestructiveTransform<Self, B> => {
    const decodeInput = S.decodeUnknownEffect(self);
    const output = S.declare<Readonly<B>>((_input): _input is Readonly<B> => true);

    return S.Unknown.pipe(
      S.decodeTo(
        output,
        SchemaTransformation.transformOrFail({
          decode: (input, options) =>
            decodeInput(input, options).pipe(
              Effect.mapError((error) => error.issue),
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
          encode: (decoded) =>
            Effect.fail(
              new SchemaIssue.Forbidden(O.some(decoded), {
                message: "Transformation result is forbidden",
              })
            ),
        })
      )
    );
  }
);
