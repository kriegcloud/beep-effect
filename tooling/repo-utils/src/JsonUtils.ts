/**
 * Schema-based JSON utilities using Effect v4 SchemaGetter.
 *
 * Provides effectful JSON serialization through the Schema ecosystem,
 * avoiding direct `JSON.parse` / `JSON.stringify` calls.
 *
 * @module
 * @since 0.0.0
 */

import { thunkEmptyStr } from "@beep/utils";
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
 * @example
 * ```ts
 * import { Effect } from "effect"
 * import { jsonStringifyPretty } from "@beep/repo-utils/JsonUtils"
 *
 * const program = Effect.map(jsonStringifyPretty({ ok: true }), (json) => json.length)
 * void program
 * ```
 *
 * @category utilities
 * @since 0.0.0
 */
export const jsonStringifyPretty: (value: unknown) => Effect.Effect<string, DomainError> = Effect.fn(function* (value) {
  const result = yield* prettyGetter
    .run(O.some(value), {})
    .pipe(
      Effect.mapError((issue) => new DomainError({ message: `JSON serialization failed: ${issue}`, cause: issue }))
    );
  return O.getOrElse(result, thunkEmptyStr);
});

/**
 * Serialize a value to a compact JSON string
 * using `SchemaGetter.stringifyJson`. Returns an Effect with `DomainError`
 * on serialization failure.
 *
 * @example
 * ```ts
 * import { Effect } from "effect"
 * import { jsonStringifyCompact } from "@beep/repo-utils/JsonUtils"
 *
 * const program = Effect.map(jsonStringifyCompact({ ok: true }), (json) => json.length)
 * void program
 * ```
 *
 * @category utilities
 * @since 0.0.0
 */
export const jsonStringifyCompact: (value: unknown) => Effect.Effect<string, DomainError> = Effect.fn(
  function* (value) {
    const result = yield* compactGetter
      .run(O.some(value), {})
      .pipe(Effect.mapError((issue) => new DomainError({ message: `JSON serialization failed: ${issue}` })));
    return O.getOrElse(result, thunkEmptyStr);
  }
);

/**
 * Parse a JSON string into an unknown value using `SchemaGetter.parseJson`.
 * For typed parsing, prefer `Schema.decodeUnknown(Schema.fromJsonString(MySchema))`.
 *
 * @example
 * ```ts
 * import { Effect } from "effect"
 * import { jsonParse } from "@beep/repo-utils/JsonUtils"
 *
 * const program = Effect.map(jsonParse("{\"ok\":true}"), (value) => typeof value)
 * void program
 * ```
 *
 * @category utilities
 * @since 0.0.0
 */
export const jsonParse: (input: string) => Effect.Effect<unknown, DomainError> = Effect.fn(function* (input) {
  return yield* S.decodeUnknownEffect(S.UnknownFromJsonString)(input).pipe(
    Effect.mapError((e) => new DomainError({ message: `JSON parse failed: ${e.message}`, cause: e }))
  );
});
// bench
