/**
 * Schema-based JSON utilities using Effect v4 SchemaGetter.
 *
 * Provides effectful JSON serialization through the Schema ecosystem,
 * avoiding direct `JSON.parse` / `JSON.stringify` calls.
 *
 * @since 0.0.0
 * @module
 */

import { Effect, SchemaGetter } from "effect";
import * as O from "effect/Option";
import * as S from "effect/Schema";
import { DomainError } from "./errors/index.js";

const prettyGetter = SchemaGetter.stringifyJson({ space: 2 });
const compactGetter = SchemaGetter.stringifyJson();

/**
 * Serialize a value to a pretty-printed JSON string (2-space indent)
 * using `SchemaGetter.stringifyJson`. Returns an Effect with `DomainError`
 * on serialization failure.
 *
 * @since 0.0.0
 * @category Utility
 */
export const jsonStringifyPretty: (value: unknown) => Effect.Effect<string, DomainError> = Effect.fn(function* (value) {
  const result = yield* prettyGetter
    .run(O.some(value), {})
    .pipe(Effect.mapError((issue) => new DomainError({ message: `JSON serialization failed: ${issue}` })));
  return O.getOrElse(result, () => "");
});

/**
 * Serialize a value to a compact JSON string
 * using `SchemaGetter.stringifyJson`. Returns an Effect with `DomainError`
 * on serialization failure.
 *
 * @since 0.0.0
 * @category Utility
 */
export const jsonStringifyCompact: (value: unknown) => Effect.Effect<string, DomainError> = Effect.fn(
  function* (value) {
    const result = yield* compactGetter
      .run(O.some(value), {})
      .pipe(Effect.mapError((issue) => new DomainError({ message: `JSON serialization failed: ${issue}` })));
    return O.getOrElse(result, () => "");
  }
);

/**
 * Parse a JSON string into an unknown value using `SchemaGetter.parseJson`.
 * For typed parsing, prefer `Schema.decodeUnknown(Schema.fromJsonString(MySchema))`.
 *
 * @since 0.0.0
 * @category Utility
 */
export const jsonParse: (input: string) => Effect.Effect<unknown, DomainError> = Effect.fn(function* (input) {
  return yield* S.decodeUnknownEffect(S.UnknownFromJsonString)(input).pipe(
    Effect.mapError((e) => new DomainError({ message: `JSON parse failed: ${e.message}` }))
  );
});
// bench
