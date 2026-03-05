import { Effect, Option, SchemaGetter, SchemaIssue, SchemaTransformation } from "effect";
import * as S from "effect/Schema";

function destructiveTransform<A, B>(
  transform: (input: A) => B
): <I, R>(self: S.Schema<A, I, R>) => S.Schema<Readonly<B>, I, R> {
  return <I, R>(self: S.Schema<A, I, R>): S.Schema<Readonly<B>, I, R> => {
    const transformed = self.pipe(
      S.decodeTo(
        S.Any as S.Schema<Readonly<B>, Readonly<B>>,
        SchemaTransformation.make({
          decode: SchemaGetter.transformOrFail((input: A) =>
            Effect.try({
              try: () => transform(input) as Readonly<B>,
              catch: () =>
                new SchemaIssue.InvalidValue(Option.some(input), {
                  message: "Error applying transformation",
                }),
            })
          ),
          encode: SchemaGetter.passthrough({ strict: false }),
        })
      )
    );

    return transformed.pipe(
      S.catchEncoding((issue) => {
        console.log("catchEncoding issue tag", issue._tag);
        console.log("actual", SchemaIssue.getActual(issue));
        return Option.match(SchemaIssue.getActual(issue), {
          onNone: () => Effect.fail(issue),
          onSome: (actual) => Effect.succeed(Option.some(actual as I)),
        });
      })
    );
  };
}

const schema = S.String.pipe(destructiveTransform((value) => value.length));
try {
  console.log("encode", S.encodeSync(schema)(4));
} catch (e) {
  console.log("thrown", e);
}
