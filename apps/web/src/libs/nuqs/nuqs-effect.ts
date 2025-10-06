import * as Either from "effect/Either";
import * as Eq from "effect/Equal";
import * as S from "effect/Schema";
import { createParser } from "nuqs";

export function createSchemaParser<T, E extends string>(schema: S.Schema<T, E>) {
  const encoder = S.encodeUnknownEither(schema);
  const decoder = S.decodeUnknownEither(schema);
  return createParser({
    parse: (queryValue) => {
      const result = decoder(queryValue);
      return Either.getOrNull(result);
    },
    serialize: (value) => {
      const result = encoder(value);
      return Either.getOrThrowWith(
        result,
        (cause) =>
          new Error(`Failed to encode value ${value}`, {
            cause,
          })
      );
    },
    eq: (a, b) => Eq.equals(a, b),
  });
}
