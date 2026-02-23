import { pipe } from "effect";
import * as A from "effect/Array";
import * as HashMap from "effect/HashMap";
import * as O from "effect/Option";
import * as ParseResult from "effect/ParseResult";
import * as S from "effect/Schema";
import * as Struct from "effect/Struct";

interface KeyOrderLookupSchema<
  Keys extends ReadonlyArray<string | number | symbol>,
  Fields extends { readonly [x in Keys[number]]: S.Struct.Field },
> extends S.transformOrFail<S.Array$<S.Tuple<[typeof S.Number, typeof S.Unknown]>>, S.Struct<Fields>> {
  readonly keys: Keys;
  readonly fields: Fields;
}

const makeKeyOrderLookupClass = <
  Keys extends ReadonlyArray<string | number | symbol>,
  Fields extends { readonly [x in Keys[number]]: S.Struct.Field },
>(
  keys: Keys,
  fields: Fields
) => {
  const reverseLookup = pipe(
    keys,
    A.map((key, index) => [key as string, index] as const),
    HashMap.fromIterable
  );

  const StructSchema = S.Struct(fields);

  return class extends pipe(
    S.Array(S.Tuple(S.Number, S.Unknown)),
    S.transformOrFail(StructSchema, {
      strict: true,
      decode: (tuples, _, ast) => {
        const [issues, keyValuePairs] = pipe(
          tuples,
          A.map(([index, value]) =>
            pipe(
              A.get(keys, index),
              O.match({
                onSome: (key) => ParseResult.succeed([key, value] as [Keys[number], unknown]),
                onNone: () =>
                  ParseResult.fail(new ParseResult.Unexpected(index, `Index ${index} not found in keys array`)),
              })
            )
          ),
          A.separate
        );

        return pipe(
          issues,
          A.match({
            onNonEmpty: (issues) => ParseResult.fail(new ParseResult.Composite(ast, tuples, issues)),
            onEmpty: () =>
              pipe(keyValuePairs, Object.fromEntries, ParseResult.decodeUnknown(S.encodedSchema(StructSchema))),
          })
        );
      },
      encode: (struct, _, ast) => {
        const [issues, indexValuePairs] = pipe(
          Struct.entries(struct),
          A.map(([key, value]) =>
            pipe(
              HashMap.get(reverseLookup, key),
              O.match({
                onSome: (index) => ParseResult.succeed([index, value] as const),
                onNone: () => ParseResult.fail(new ParseResult.Unexpected(key, `Key ${key} not found in keys array`)),
              })
            )
          ),
          A.separate
        );

        return pipe(
          issues,
          A.match({
            onNonEmpty: (issues) => ParseResult.fail(new ParseResult.Composite(ast, struct, issues)),
            onEmpty: () => ParseResult.succeed(indexValuePairs),
          })
        );
      },
    })
  ) {
    static keys = keys;
    static fields = fields;
  } as KeyOrderLookupSchema<Keys, Fields>;
};

const KeyOrderLookupSchema = <
  Keys extends ReadonlyArray<string | number | symbol>,
  Fields extends { readonly [x in Keys[number]]: S.Struct.Field },
>(
  keys: Keys,
  fields: Fields
): KeyOrderLookupSchema<Keys, Fields> => makeKeyOrderLookupClass(keys, fields);

export { KeyOrderLookupSchema };
