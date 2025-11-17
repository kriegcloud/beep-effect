import { invariant } from "@beep/invariant";
import { path_regex, prop_regex } from "@beep/schema/regexes";
import type { UnsafeTypes } from "@beep/types";
import { faker } from "@faker-js/faker";
import * as A from "effect/Array";
import type * as B from "effect/Brand";
import * as Effect from "effect/Effect";
import * as Num from "effect/Number";
import * as O from "effect/Option";
import * as S from "effect/Schema";
import { CustomId } from "./_id";

const Id = CustomId.compose("json");
/**
 * JSON literal values (primitives accepted by JSON).
 *
 * @since 0.1.0
 * @category JSON
 */
export const JsonLiteral = S.Union(S.String, S.Number, S.Boolean, S.Null).annotations(
  Id.annotations("JsonLiteral", {
    description: "JSON literal values (primitives accepted by JSON)",
    arbitrary: () => (fc) => fc.oneof(fc.string(), fc.float(), fc.integer(), fc.boolean(), fc.constant(null)),
  })
);
export declare namespace JsonLiteral {
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
 * const bad = decode({ toJSON: () => 1 } as UnsafeTypes.UnsafeAny); // functions are not JSON
 * ```
 *
 * @since 0.1.0
 * @category JSON
 */
export class Json extends S.suspend(
  (): S.Schema<Json.Type> => S.Union(JsonLiteral, S.Array(Json), S.Record({ key: S.String, value: Json }))
).annotations(
  Id.annotations("Json", {
    description: "A Valid JSON",
  })
) {
  static readonly decodeSync = S.decodeSync(Json);
  static readonly encodeSync = S.encodeSync(Json);
}
export declare namespace Json {
  export type Type = JsonLiteral.Type | { [key: string]: Type } | Type[] | ReadonlyArray<Type>;

  export type Encoded = typeof Json.Encoded;
}

export const JsonArray = S.Array(Json);

export declare namespace JsonArray {
  export type Type = typeof JsonArray.Type;
  export type Encoded = typeof JsonArray.Encoded;
}

export const NonEmptyJsonArray = S.NonEmptyArray(Json);

export declare namespace NonEmptyJsonArray {
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
export class JsonPath extends S.String.pipe(S.pattern(path_regex), S.brand("JsonPath")).annotations(
  Id.annotations("JsonPath", {
    description: "JSON path to a property",
    arbitrary: () => (fc) => fc.constantFrom(null).map(() => faker.database.column() as B.Branded<string, "JsonPath">),
  })
) {
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
}

export declare namespace JsonPath {
  export type Type = typeof JsonPath.Type;
  export type Encoded = typeof JsonPath.Encoded;
}

export class JsonProp extends S.NonEmptyString.pipe(
  S.pattern(prop_regex, {
    message: () => "Property name must contain only letters, numbers, and underscores",
  })
).annotations(
  Id.annotations("JsonProp", {
    description: "Property name must contain only letters, numbers, and underscores",
  })
) {
  static readonly is = (value: unknown): value is JsonProp.Type => O.isSome(S.validateOption(JsonProp)(value));
}

export declare namespace JsonProp {
  export type Type = typeof JsonProp.Type & { __JsonPath: true; __JsonProp: true };
  export type Encoded = typeof JsonProp.Encoded;
}

/**
 * Schema transformer that converts JSON string or Array<string> to Array<string> and vice versa.
 * Uses proper schema validation to ensure the result is actually an array of strings.
 * Falls back to empty array if parsing fails or result is not a valid string array.
 * Accepts both JSON strings and arrays on the encoded side for flexibility.
 *
 * Examples:
 * - '["tag1", "tag2"]' -> ["tag1", "tag2"]
 * - ["tag1", "tag2"] -> ["tag1", "tag2"]
 * - '[]' -> []
 * - [] -> []
 * - 'invalid json' -> []
 * - '["valid", 123, "mixed"]' -> [] (invalid due to mixed types)
 * - 'null' -> []
 */
export const JsonStringToStringArray = S.transformOrFail(S.Union(S.String, S.Array(S.String)), S.Array(S.String), {
  decode: (input) =>
    Effect.gen(function* () {
      // If input is already an array, validate it directly
      if (Array.isArray(input)) {
        return yield* S.decodeUnknown(S.Array(S.String))(input).pipe(Effect.orElse(() => Effect.succeed([])));
      }

      // If input is a string, try to parse the JSON
      const parsed = yield* Effect.try(() => JSON.parse(input as string)).pipe(
        Effect.orElse(() => Effect.succeed(null))
      );

      // Validate that the parsed result is an array of strings
      return yield* S.decodeUnknown(S.Array(S.String))(parsed).pipe(Effect.orElse(() => Effect.succeed([])));
    }),
  encode: (array) => Effect.succeed(JSON.stringify(array)),
  strict: true,
}).annotations(
  Id.annotations("JsonStringToStringArray", {
    description: "Schema transformer that converts JSON string or Array<string> to Array<string> and vice versa.",
  })
);

/**
 * Generic JSON string to array transformer that handles both JSON strings and arrays.
 * Falls back to empty array if parsing fails or validation fails.
 *
 * @param itemSchema - The schema for individual array items
 * @returns A transformer schema that converts between JSON strings/arrays and validated arrays
 */
export const JsonStringToArray = <A>(itemSchema: S.Schema<A, UnsafeTypes.UnsafeAny, never>) =>
  S.transformOrFail(S.Union(S.String, S.Array(S.Unknown)), S.Array(itemSchema), {
    decode: (input) =>
      Effect.gen(function* () {
        // If input is already an array, validate it directly
        if (Array.isArray(input)) {
          return yield* S.decodeUnknown(S.Array(itemSchema))(input).pipe(
            Effect.tapError((error) =>
              Effect.logError("Failed to validate array in JsonStringToArray", { error, input })
            ),
            Effect.orElse(() => Effect.succeed([] as ReadonlyArray<A>))
          );
        }

        // If input is a string, try to parse the JSON
        const parsed = yield* Effect.try(() => JSON.parse(input as string)).pipe(
          Effect.tapError((error) =>
            Effect.logError("Failed to parse JSON string in JsonStringToArray", { error, input })
          ),
          Effect.orElse(() => Effect.succeed(null))
        );

        // Validate that the parsed result is an array of the correct type
        return yield* S.decodeUnknown(S.Array(itemSchema))(parsed).pipe(
          Effect.tapError((error) =>
            Effect.logError("Failed to validate parsed JSON in JsonStringToArray", {
              error,
              parsed,
            })
          ),
          Effect.orElse(() => Effect.succeed([] as ReadonlyArray<A>))
        );
      }),
    encode: (array) => Effect.succeed(JSON.stringify(array)),
    strict: true,
  }).annotations(
    Id.annotations("JsonStringToArray", {
      description: "Schema transformer that converts JSON string or Array<string> to Array<string> and vice versa.",
    })
  );
