import { Effect, Option, SchemaGetter, SchemaIssue, SchemaTransformation } from "effect";
import * as S from "effect/Schema";

function destructiveTransform<A, B>(
  transform: (input: A) => B
): <I, R>(self: S.Schema<A, I, R>) => S.Schema<Readonly<B>, I, R> {
  return <I, R>(self: S.Schema<A, I, R>): S.Schema<Readonly<B>, I, R> => {
    const decodeInput = S.decodeUnknownEffect(self);

    return S.Any.pipe(
      S.decodeTo(
        S.Any as S.Schema<Readonly<B>, Readonly<B>>,
        SchemaTransformation.make({
          decode: SchemaGetter.transformOrFail((input: unknown) =>
            decodeInput(input).pipe(
              Effect.mapError((error) => error.issue),
              Effect.flatMap((decoded) =>
                Effect.try({
                  try: () => transform(decoded) as Readonly<B>,
                  catch: () =>
                    new SchemaIssue.InvalidValue(Option.some(decoded), {
                      message: "Error applying transformation",
                    }),
                })
              )
            )
          ),
          encode: SchemaGetter.passthrough({ strict: false }),
        })
      )
    ) as S.Schema<Readonly<B>, I, R>;
  };
}

const schema = S.String.pipe(destructiveTransform((value) => value.length));
console.log("decode", S.decodeSync(schema)("beep"));
try {
  console.log(S.decodeSync(schema)(1 as unknown as string));
} catch (error) {
  console.log(String(error));
}
