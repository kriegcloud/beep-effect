/**
 * JSON schemas, utilities, and transformers used across the monorepo.
 *
 * Provides literal/recursive schemas plus helpers for JsonPath, property names, and JSON string transformers.
 *
 * @example
 * import * as S from "effect/Schema";
 * import { Json } from "@beep/schema/primitives/json/json";
 *
 * const value = S.decodeSync(Json)({ foo: [1, "bar"] });
 *
 * @category Primitives/Json
 * @since 0.1.0
 */

import { $SchemaId } from "@beep/identity/packages";
import { invariant } from "@beep/invariant";
import type { UnsafeTypes } from "@beep/types";
import { faker } from "@faker-js/faker";
import * as A from "effect/Array";
import type * as B from "effect/Brand";
import * as Effect from "effect/Effect";
import * as Num from "effect/Number";
import * as O from "effect/Option";
import * as S from "effect/Schema";
import { path_regex, prop_regex } from "../../internal/regex/regexes";

const $I = $SchemaId.create("primitives/json/json");

/**
 * JSON literal schema accepting primitive values.
 *
 * @example
 * import * as S from "effect/Schema";
 * import { JsonLiteral } from "@beep/schema/primitives/json/json";
 *
 * const literal = S.decodeSync(JsonLiteral)("hello");
 *
 * @category Primitives/Json
 * @since 0.1.0
 */
export const JsonLiteral = S.Union(S.String, S.Number, S.Boolean, S.Null).annotations(
  $I.annotations("json/JsonLiteral", {
    description: "JSON literal primitives (string, number, boolean, null).",
    arbitrary: () => (fc) => fc.oneof(fc.string(), fc.float(), fc.integer(), fc.boolean(), fc.constant(null)),
  })
);

/**
 * Namespace describing runtime and encoded types for {@link JsonLiteral}.
 *
 * @example
 * import type { JsonLiteral } from "@beep/schema/primitives/json/json";
 *
 * type Literal = JsonLiteral.Type;
 *
 * @category Primitives/Json
 * @since 0.1.0
 */
export declare namespace JsonLiteral {
  /**
   * Runtime type alias for {@link JsonLiteral}.
   *
   * @example
   * import type { JsonLiteral } from "@beep/schema/primitives/json/json";
   *
   * let literal: JsonLiteral.Type;
   *
   * @category Primitives/Json
   * @since 0.1.0
   */
  export type Type = typeof JsonLiteral.Type;
  /**
   * Encoded type alias for {@link JsonLiteral}.
   *
   * @example
   * import type { JsonLiteral } from "@beep/schema/primitives/json/json";
   *
   * let encoded: JsonLiteral.Encoded;
   *
   * @category Primitives/Json
   * @since 0.1.0
   */
  export type Encoded = typeof JsonLiteral.Encoded;
}

/**
 * Recursive JSON schema covering objects and arrays.
 *
 * @example
 * import * as S from "effect/Schema";
 * import { Json } from "@beep/schema/primitives/json/json";
 *
 * S.decodeSync(Json)({ foo: [1, "bar"] });
 *
 * @category Primitives/Json
 * @since 0.1.0
 */
export class Json extends S.suspend(
  (): S.Schema<Json.Type> => S.Union(JsonLiteral, S.Array(Json), S.Record({ key: S.String, value: Json }))
).annotations(
  $I.annotations("json/Json", {
    description: "Recursive JSON value schema.",
  })
) {
  /** Decodes an unknown value into a Json.Type, throwing on failure. */
  static readonly decodeSync = S.decodeSync(Json);
  /** Encodes a Json.Type back into the schema representation. */
  static readonly encodeSync = S.encodeSync(Json);
}

/**
 * Namespace describing runtime and encoded types for {@link Json}.
 *
 * @example
 * import type { Json } from "@beep/schema/primitives/json/json";
 *
 * type JsonValue = Json.Type;
 *
 * @category Primitives/Json
 * @since 0.1.0
 */
export declare namespace Json {
  /**
   * Runtime type alias for {@link Json}.
   *
   * @example
   * import type { Json } from "@beep/schema/primitives/json/json";
   *
   * type JsonValue = Json.Type;
   *
   * @category Primitives/Json
   * @since 0.1.0
   */
  export type Type = JsonLiteral.Type | { readonly [key: string]: Type } | ReadonlyArray<Type>;
  /**
   * Encoded type alias for {@link Json}.
   *
   * @example
   * import type { Json } from "@beep/schema/primitives/json/json";
   *
   * type EncodedJson = Json.Encoded;
   *
   * @category Primitives/Json
   * @since 0.1.0
   */
  export type Encoded = typeof Json.Encoded;
}

export class JsonObject extends S.Record({ key: S.String, value: S.Union(Json, S.Undefined) }).annotations(
  $I.annotations("json/JsonObject", {
    description: "JSON object schema.",
  })
) {}

export declare namespace JsonObject {
  export type Type = typeof JsonObject.Type;
  export type Encoded = typeof JsonObject.Encoded;
}

/**
 * Array schema containing JSON values.
 *
 * @example
 * import * as S from "effect/Schema";
 * import { JsonArray } from "@beep/schema/primitives/json/json";
 *
 * S.decodeSync(JsonArray)([{ foo: "bar" }]);
 *
 * @category Primitives/Json
 * @since 0.1.0
 */
export const JsonArray = S.Array(Json).annotations(
  $I.annotations("json/JsonArray", {
    description: "Array of JSON-compatible values for serialization",
  })
);

/**
 * Namespace describing types for {@link JsonArray}.
 *
 * @example
 * import type { JsonArray } from "@beep/schema/primitives/json/json";
 *
 * type JsonArrayType = JsonArray.Type;
 *
 * @category Primitives/Json
 * @since 0.1.0
 */
export declare namespace JsonArray {
  /**
   * Runtime type alias for {@link JsonArray}.
   *
   * @example
   * import type { JsonArray } from "@beep/schema/primitives/json/json";
   *
   * type JsonArrayValue = JsonArray.Type;
   *
   * @category Primitives/Json
   * @since 0.1.0
   */
  export type Type = typeof JsonArray.Type;
  /**
   * Encoded type alias for {@link JsonArray}.
   *
   * @example
   * import type { JsonArray } from "@beep/schema/primitives/json/json";
   *
   * type EncodedJsonArray = JsonArray.Encoded;
   *
   * @category Primitives/Json
   * @since 0.1.0
   */
  export type Encoded = typeof JsonArray.Encoded;
}

/**
 * Non-empty JSON array schema.
 *
 * @example
 * import * as S from "effect/Schema";
 * import { NonEmptyJsonArray } from "@beep/schema/primitives/json/json";
 *
 * S.decodeSync(NonEmptyJsonArray)([1]);
 *
 * @category Primitives/Json
 * @since 0.1.0
 */
export const NonEmptyJsonArray = S.NonEmptyArray(Json).annotations(
  $I.annotations("json/NonEmptyJsonArray", {
    description: "Non-empty array of JSON-compatible values requiring at least one element",
  })
);

/**
 * Namespace describing types for {@link NonEmptyJsonArray}.
 *
 * @example
 * import type { NonEmptyJsonArray } from "@beep/schema/primitives/json/json";
 *
 * type NonEmpty = NonEmptyJsonArray.Type;
 *
 * @category Primitives/Json
 * @since 0.1.0
 */
export declare namespace NonEmptyJsonArray {
  /**
   * Runtime type alias for {@link NonEmptyJsonArray}.
   *
   * @example
   * import type { NonEmptyJsonArray } from "@beep/schema/primitives/json/json";
   *
   * type NonEmptyJson = NonEmptyJsonArray.Type;
   *
   * @category Primitives/Json
   * @since 0.1.0
   */
  export type Type = typeof NonEmptyJsonArray.Type;
  /**
   * Encoded type alias for {@link NonEmptyJsonArray}.
   *
   * @example
   * import type { NonEmptyJsonArray } from "@beep/schema/primitives/json/json";
   *
   * type EncodedNonEmpty = NonEmptyJsonArray.Encoded;
   *
   * @category Primitives/Json
   * @since 0.1.0
   */
  export type Encoded = typeof NonEmptyJsonArray.Encoded;
}

/**
 * Structural equivalence for JSON values derived from the schema.
 *
 * @example
 * import { jsonEq } from "@beep/schema/primitives/json/json";
 *
 * jsonEq({ foo: 1 }, { foo: 1 });
 *
 * @category Primitives/Json
 * @since 0.1.0
 */
export const jsonEq = S.equivalence(Json);

/**
 * Boolean equality helper delegating to {@link jsonEq}.
 *
 * @example
 * import { equalsJson } from "@beep/schema/primitives/json/json";
 *
 * equalsJson({ foo: 1 }, { foo: 2 });
 *
 * @category Primitives/Json
 * @since 0.1.0
 */
export const equalsJson: (left: Json.Type, right: Json.Type) => boolean = S.equivalence(Json);

/**
 * JsonPath schema enforcing RFC-style property navigation expressions.
 *
 * @example
 * import * as S from "effect/Schema";
 * import { JsonPath } from "@beep/schema/primitives/json/json";
 *
 * const path = S.decodeSync(JsonPath)("user.address[0].city");
 *
 * @category Primitives/Json
 * @since 0.1.0
 */
export class JsonPath extends S.String.pipe(S.pattern(path_regex), S.brand("JsonPath")).annotations(
  $I.annotations("json/JsonPath", {
    description: "JSON path pointing to a nested property.",
    arbitrary: () => (fc) => fc.constantFrom(null).map(() => faker.database.column() as B.Branded<string, "JsonPath">),
  })
) {
  static readonly is = (value: unknown): value is JsonPath.Type => O.isSome(S.validateOption(JsonPath)(value));

  /**
   * Creates a JsonPath from an array of path segments.
   *
   * @param segments Readonly path segments that may be strings or indexes.
   * @returns Valid JsonPath or throws if invalid.
   */
  static readonly create = (path: Array<string | number>): JsonPath.Type => {
    const candidatePath = A.join(
      A.map(path, (p, i) => (Num.isNumber(p) ? `[${p}]` : i === 0 ? p : `.${p}`)),
      ""
    );

    invariant(JsonPath.is(candidatePath), `Invalid JsonPath: ${candidatePath}`, {
      file: "packages/common/schema/src/custom/Json.schema.ts",
      line: 118,
      args: [candidatePath],
    });
    return candidatePath;
  };

  /** Splits a JsonPath into its dot/bracket components. */
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

/**
 * Namespace describing runtime and encoded types for {@link JsonPath}.
 *
 * @example
 * import type { JsonPath } from "@beep/schema/primitives/json/json";
 *
 * type Path = JsonPath.Type;
 *
 * @category Primitives/Json
 * @since 0.1.0
 */
export declare namespace JsonPath {
  /**
   * Runtime type alias for {@link JsonPath}.
   *
   * @example
   * import type { JsonPath } from "@beep/schema/primitives/json/json";
   *
   * type PathValue = JsonPath.Type;
   *
   * @category Primitives/Json
   * @since 0.1.0
   */
  export type Type = typeof JsonPath.Type;
  /**
   * Encoded type alias for {@link JsonPath}.
   *
   * @example
   * import type { JsonPath } from "@beep/schema/primitives/json/json";
   *
   * type PathEncoded = JsonPath.Encoded;
   *
   * @category Primitives/Json
   * @since 0.1.0
   */
  export type Encoded = typeof JsonPath.Encoded;
}

/**
 * Schema validating property names with alphanumeric/underscore characters.
 *
 * @example
 * import * as S from "effect/Schema";
 * import { JsonProp } from "@beep/schema/primitives/json/json";
 *
 * S.decodeSync(JsonProp)("status");
 *
 * @category Primitives/Json
 * @since 0.1.0
 */
export class JsonProp extends S.NonEmptyString.pipe(
  S.pattern(prop_regex, {
    message: () => "Property name must contain only letters, numbers, and underscores",
  })
).annotations(
  $I.annotations("json/JsonProp", {
    description: "Property name must contain only letters, numbers, and underscores",
  })
) {
  static readonly is = (value: unknown): value is JsonProp.Type => O.isSome(S.validateOption(JsonProp)(value));
}

/**
 * Namespace describing runtime and encoded types for {@link JsonProp}.
 *
 * @example
 * import type { JsonProp } from "@beep/schema/primitives/json/json";
 *
 * type Prop = JsonProp.Type;
 *
 * @category Primitives/Json
 * @since 0.1.0
 */
export declare namespace JsonProp {
  /**
   * Runtime type alias for {@link JsonProp}.
   *
   * @example
   * import type { JsonProp } from "@beep/schema/primitives/json/json";
   *
   * type Prop = JsonProp.Type;
   *
   * @category Primitives/Json
   * @since 0.1.0
   */
  export type Type = typeof JsonProp.Type & { readonly __JsonPath: true; readonly __JsonProp: true };
  /**
   * Encoded type alias for {@link JsonProp}.
   *
   * @example
   * import type { JsonProp } from "@beep/schema/primitives/json/json";
   *
   * type PropEncoded = JsonProp.Encoded;
   *
   * @category Primitives/Json
   * @since 0.1.0
   */
  export type Encoded = typeof JsonProp.Encoded;
}

/**
 * Transformer that converts a JSON string or array of strings into a validated array of strings.
 *
 * @example
 * import * as S from "effect/Schema";
 * import { JsonStringToStringArray } from "@beep/schema/primitives/json/json";
 *
 * const tags = S.decodeSync(JsonStringToStringArray)('["a","b"]');
 *
 * @category Primitives/Json
 * @since 0.1.0
 */
export const JsonStringToStringArray = S.transformOrFail(S.Union(S.String, S.Array(S.String)), S.Array(S.String), {
  decode: Effect.fnUntraced(function* (input) {
    if (A.isArray(input)) {
      return yield* S.decodeUnknown(S.Array(S.String))(input).pipe(
        Effect.orElse(() => Effect.succeed([] as ReadonlyArray<string>))
      );
    }

    const parsed = yield* S.decode(S.parseJson())(input as string).pipe(Effect.orElse(() => Effect.succeed(null)));

    return yield* S.decodeUnknown(S.Array(S.String))(parsed).pipe(
      Effect.orElse(() => Effect.succeed([] as ReadonlyArray<string>))
    );
  }),
  encode: (array) => S.encode(S.parseJson())(array).pipe(Effect.mapError((e) => e.issue)),
  strict: true,
}).annotations(
  $I.annotations("json/JsonStringToStringArray", {
    description: "Transforms JSON string or raw array input into an array of strings.",
  })
);

/**
 * Generic transformer that parses JSON strings (or accepts arrays) into validated arrays of arbitrary schemas.
 *
 * @example
 * import * as S from "effect/Schema";
 * import { JsonStringToArray } from "@beep/schema/primitives/json/json";
 *
 * const Numbers = JsonStringToArray(S.Number);
 * const parsed = S.decodeSync(Numbers)("[1,2,3]");
 *
 * @category Primitives/Json
 * @since 0.1.0
 */
export const JsonStringToArray = <A>(itemSchema: S.Schema<A, UnsafeTypes.UnsafeAny, never>) =>
  S.transformOrFail(S.Union(S.String, S.Array(S.Unknown)), S.Array(itemSchema), {
    decode: Effect.fnUntraced(function* (input) {
      if (A.isArray(input)) {
        return yield* S.decodeUnknown(S.Array(itemSchema))(input).pipe(
          Effect.tapError((error) =>
            Effect.logError("Failed to validate array in JsonStringToArray", { error, input })
          ),
          Effect.orElse(() => Effect.succeed([] as ReadonlyArray<A>))
        );
      }

      const parsed = yield* S.decode(S.parseJson())(input as string).pipe(
        Effect.tapError((error) =>
          Effect.logError("Failed to parse JSON string in JsonStringToArray", { error, input })
        ),
        Effect.orElse(() => Effect.succeed(null))
      );

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
    encode: (array) => S.encode(S.parseJson())(array).pipe(Effect.mapError((e) => e.issue)),
    strict: true,
  }).annotations(
    $I.annotations("json/JsonStringToArray", {
      description: "Transforms JSON strings or raw arrays into validated arrays for the provided schema.",
    })
  );
