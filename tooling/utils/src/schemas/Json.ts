/**
 * Effect Schema for JSON values.
 *
 * Defines recursive JSON schemas for typed JSON parsing and validation.
 *
 * @since 0.1.0
 */
import * as S from "effect/Schema";
import type { JsonLiteralType } from "./JsonLiteral.js";
import { JsonLiteral } from "./JsonLiteral.js";

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
 * @example
 * ```typescript
 * import { Json } from "@beep/tooling-utils"
 * import * as S from "effect/Schema"
 *
 * const decode = S.decodeUnknownSync(Json)
 *
 * const result = decode({ a: [1, "x", null], b: { c: true } })
 * // => { a: [1, "x", null], b: { c: true } }
 * ```
 *
 * @since 0.1.0
 * @category Schemas/Json
 */

export const Json = S.suspend(
  (): S.Schema<JsonType> => S.Union(JsonLiteral, S.Array(Json), S.Record({ key: S.String, value: Json }))
);

/**
 * Type representing any valid JSON value.
 *
 * @example
 * ```typescript
 * import type { JsonType } from "@beep/tooling-utils"
 *
 * const config: JsonType = {
 *   name: "my-app",
 *   version: 1,
 *   enabled: true,
 *   items: [1, 2, 3]
 * }
 * ```
 *
 * @category Schemas/Json
 * @since 0.1.0
 */
export type JsonType = JsonLiteralType | Array<JsonType> | ReadonlyArray<JsonType> | { [key: string]: JsonType };
