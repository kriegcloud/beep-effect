import * as S from "effect/Schema";

/**
 * JSON literal values (primitives accepted by JSON).
 *
 * @since 0.1.0
 * @category JSON
 */
export const JsonLiteral = S.Union(
  S.String,
  S.Number,
  S.Boolean,
  S.Null,
).annotations({
  identifier: "JsonLiteral",
  title: "JSON literal",
  description: "JSON literal values (primitives accepted by JSON)",
  arbitrary: () => (fc) =>
    fc.oneof(
      fc.string(),
      fc.float(),
      fc.integer(),
      fc.boolean(),
      fc.constant(null),
    ),
});
export namespace JsonLiteral {
  export type Type = typeof JsonLiteral.Type;
  export type Encoded = typeof JsonLiteral.Encoded;
}

/**
 * General JSON structure (recursive).
 *
 * Equivalent to:
 * ```ts
 * type Json =
 *   | string | number | boolean | null
 *   | { [key: string]: Json }
 *   | Json[] | ReadonlyArray<Json>;
 * ```
 *
 * Implementation notes:
 * - Uses `S.suspend` to break the recursive cycle.
 * - Uses `S.Record({ key: S.String, value: Schema })` to model objects.
 *
 * ## Example
 * ```ts
 * const decode = S.decodeUnknown(Json.Schema);
 * const ok = decode({ a: [1, "x", null], b: { c: true } });
 * const bad = decode({ toJSON: () => 1 } as any); // functions are not JSON
 * ```
 *
 * @since 0.1.0
 * @category JSON
 */
export const Json = S.suspend(
  (): S.Schema<Json.Type> =>
    S.Union(
      JsonLiteral,
      S.Array(Json),
      S.Record({ key: S.String, value: Json }),
    ),
).annotations({
  identifier: "Json",
  title: "Json",
  description: "A Valid JSON",
});
export namespace Json {
  export type Type =
    | JsonLiteral.Type
    | { [key: string]: Type }
    | Type[]
    | ReadonlyArray<Type>;

  export type Encoded = typeof Json.Encoded;
}

export const JsonArray = S.Array(Json);

export namespace JsonArray {
  export type Type = typeof JsonArray.Type;
  export type Encoded = typeof JsonArray.Encoded;
}

export const NonEmptyJsonArray = S.NonEmptyArray(Json);

export namespace NonEmptyJsonArray {
  export type Type = typeof NonEmptyJsonArray.Type;
  export type Encoded = typeof NonEmptyJsonArray.Encoded;
}
// Derive a deep structural Equivalence<Json> from the Json schema.
// This is preferred over writing our own deep-eq, and integrates with Effect.
// Docs: Schema -> Equivalence.
export const jsonEq = S.equivalence(Json); // Equivalence.Equivalence<Json>
