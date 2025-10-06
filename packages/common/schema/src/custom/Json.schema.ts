import { invariant } from "@beep/invariant";
import { path_regex, prop_regex } from "@beep/schema/regexes";
import type { UnsafeTypes } from "@beep/types";
import { faker } from "@faker-js/faker";
import * as A from "effect/Array";
import type * as B from "effect/Brand";
import * as Num from "effect/Number";
import * as O from "effect/Option";
import * as S from "effect/Schema";
import { JSONPath } from "jsonpath-plus";
import type { Paths } from "type-fest";
/**
 * JSON literal values (primitives accepted by JSON).
 *
 * @since 0.1.0
 * @category JSON
 */
export const JsonLiteral = S.Union(S.String, S.Number, S.Boolean, S.Null).annotations({
  identifier: "JsonLiteral",
  title: "JSON literal",
  description: "JSON literal values (primitives accepted by JSON)",
  arbitrary: () => (fc) => fc.oneof(fc.string(), fc.float(), fc.integer(), fc.boolean(), fc.constant(null)),
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
  (): S.Schema<Json.Type> => S.Union(JsonLiteral, S.Array(Json), S.Record({ key: S.String, value: Json }))
).annotations({
  identifier: "Json",
  title: "Json",
  description: "A Valid JSON",
});
export namespace Json {
  export type Type = JsonLiteral.Type | { [key: string]: Type } | Type[] | ReadonlyArray<Type>;

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

export const equalsJson: (a: Json.Type, b: Json.Type) => boolean = S.equivalence(Json);

/**
 * https://www.ietf.org/archive/id/draft-goessner-dispatch-jsonpath-00.html
 */
export class JsonPath extends S.String.pipe(S.pattern(path_regex), S.brand("JsonPath")).annotations({
  identifier: "JsonPath",
  title: "JSON path",
  description: "JSON path to a property",
  arbitrary: () => (fc) => fc.constantFrom(null).map(() => faker.database.column() as B.Branded<string, "JsonPath">),
}) {
  static readonly is = (value: unknown): value is JsonPath.Type => O.isSome(S.validateOption(JsonPath)(value));
  /**
   * Creates a JsonPath from an array of path segments.
   *
   * Currently supports:
   * - Simple property access (e.g., 'foo.bar')
   * - Array indexing with non-negative integers (e.g., 'foo[0]')
   * - Identifiers starting with letters, underscore, or $ (e.g., '$foo', '_bar')
   * - Dot notation for nested properties (e.g., 'foo.bar.baz')
   *
   * Does not support (yet?).
   * - Recursive descent (..)
   * - Wildcards (*)
   * - Array slicing
   * - Filters
   * - Negative indices
   *
   * @param path Array of string or number segments
   * @returns Valid JsonPath or undefined if invalid
   */
  static readonly create = (path: Array<string | number>): JsonPath.Type => {
    const candidatePath = A.map(path, (p, i) => (Num.isNumber(p) ? `[${p}]` : i === 0 ? p : `.${p}`)).join("");

    invariant(JsonPath.is(candidatePath), `Invalid JsonPath: ${candidatePath}`, {
      file: "packages/common/schema/src/custom/Json.schema.ts",
      line: 118,
      args: [candidatePath],
    });
    return candidatePath;
  };
  /**
   * Splits a JsonPath into its constituent parts.
   * Handles property access and array indexing.
   */
  static readonly split = (path: JsonPath.Type): Array<string> => {
    if (!JsonPath.is(path)) {
      return [];
    }

    return (
      path
        .match(/[a-zA-Z_$][\w$]*|\[\d+]/g)
        ?.map((part) => (part.startsWith("[") ? part.replace(/[[\]]/g, "") : part)) ?? []
    );
  };
  /**
   * Applies a JsonPath to an object.
   */
  static readonly getField = <T extends Json.Type>(object: T, path: Paths<T>): UnsafeTypes.UnsafeAny => {
    return JSONPath({
      path: String(path),
      json: object,
    })[0];
  };
}

export namespace JsonPath {
  export type Type = typeof JsonPath.Type;
  export type Encoded = typeof JsonPath.Encoded;
}

export class JsonProp extends S.NonEmptyString.pipe(
  S.pattern(prop_regex, {
    message: () => "Property name must contain only letters, numbers, and underscores",
  })
) {
  static readonly is = (value: unknown): value is JsonProp.Type => O.isSome(S.validateOption(JsonProp)(value));
}

export namespace JsonProp {
  export type Type = typeof JsonProp.Type & { __JsonPath: true; __JsonProp: true };
  export type Encoded = typeof JsonProp.Encoded;
}
