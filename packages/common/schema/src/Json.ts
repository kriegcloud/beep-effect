/**
 * A module containing effect schema's for json data types
 *
 * @module @beep/schema/Json
 * @since 0.0.0
 */
import { $SchemaId } from "@beep/identity";
import * as S from "effect/Schema";

const $I = $SchemaId.create("Json");

/**
 * Schema for a JSON object (a record of string keys to JSON-compatible values).
 *
 * @example
 * ```ts
 * import * as S from "effect/Schema"
 * import { JsonObject } from "@beep/schema/Json"
 *
 * const decoded = S.decodeUnknownSync(JsonObject)({ name: "Alice", age: 30 })
 * void decoded
 * ```
 *
 * @category Validation
 * @since 0.0.0
 */
export const JsonObject = S.Record(S.String, S.Json).pipe(
  $I.annoteSchema("JsonObject", {
    description: "A Json Object",
  })
);

/**
 * Runtime type extracted from the {@link JsonObject} schema.
 *
 * @category DomainModel
 * @since 0.0.0
 */
export type JsonObject = typeof JsonObject.Type;

/**
 * Schema for a JSON array (an array of JSON-compatible values).
 *
 * @example
 * ```ts
 * import * as S from "effect/Schema"
 * import { JsonArray } from "@beep/schema/Json"
 *
 * const decoded = S.decodeUnknownSync(JsonArray)([1, "two", true, null])
 * void decoded
 * ```
 *
 * @category Validation
 * @since 0.0.0
 */
export const JsonArray = S.Array(S.Json).pipe(
  $I.annoteSchema("JsonArray", {
    description: "A Json Array",
  })
);

/**
 * Runtime type extracted from the {@link JsonArray} schema.
 *
 * @category DomainModel
 * @since 0.0.0
 */
export type JsonArray = typeof JsonArray.Type;
