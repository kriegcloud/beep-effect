import { Effect, Function as Fn, Option, SchemaIssue } from "effect";
import * as S from "effect/Schema";

const { dual } = Fn;

const destructiveTransform: {
  <Self extends S.Top, B>(
    transform: (input: Self["Type"]) => B
  ): (self: Self) => S.declareConstructor<Readonly<B>, Self["Encoded"], readonly []>;
  <Self extends S.Top, B>(
    self: Self,
    transform: (input: Self["Type"]) => B
  ): S.declareConstructor<Readonly<B>, Self["Encoded"], readonly []>;
} = dual(
  2,
  <Self extends S.Top, B>(
    self: Self,
    transform: (input: Self["Type"]) => B
  ): S.declareConstructor<Readonly<B>, Self["Encoded"], readonly []> => {
    const decodeInput = S.decodeUnknownEffect(self);

    return S.declareConstructor<Readonly<B>, Self["Encoded"]>()(
      [],
      () => (input, _ast, options) =>
        decodeInput(input, options).pipe(
          Effect.mapError((error) => error.issue),
          Effect.flatMap((decoded) =>
            Effect.try({
              try: () => transform(decoded),
              catch: () =>
                new SchemaIssue.InvalidValue(Option.some(decoded), {
                  message: "Error applying transformation",
                }),
            })
          )
        )
    );
  }
);

const schema = destructiveTransform(S.String, (value) => value.length);
console.log("decode", S.decodeSync(schema)("beep"));
console.log("encode", S.encodeSync(schema)(4));
