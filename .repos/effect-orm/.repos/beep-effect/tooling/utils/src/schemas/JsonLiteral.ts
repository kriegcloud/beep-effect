/**
 * JSON literal value schema.
 *
 * Defines schema for JSON primitives (string, number, boolean, null).
 *
 * @since 0.1.0
 */
import * as S from "effect/Schema";

/**
 * JSON literal values (primitives accepted by JSON).
 *
 * Represents primitive types that can be serialized in JSON:
 * string, number, boolean, or null.
 *
 * @example
 * ```typescript
 * import { JsonLiteral } from "@beep/tooling-utils"
 * import * as S from "effect/Schema"
 *
 * const decode = S.decodeUnknownSync(JsonLiteral)
 *
 * decode("hello")  // => "hello"
 * decode(42)       // => 42
 * decode(true)     // => true
 * decode(null)     // => null
 * ```
 *
 * @since 0.1.0
 * @category Schemas/Json
 */
export const JsonLiteral = S.Union(S.String, S.Number, S.Boolean, S.Null).annotations({
  identifier: "@beep/tooling-utils/schemas/JsonLiteral.Schema",
  title: "JsonLiteral",
  description: "JSON literal values (primitives accepted by JSON)",
});

/**
 * Type representing JSON literal values.
 *
 * @example
 * ```typescript
 * import type { JsonLiteralType } from "@beep/tooling-utils"
 *
 * const value: JsonLiteralType = "hello"
 * const num: JsonLiteralType = 42
 * ```
 *
 * @category Schemas/Json
 * @since 0.1.0
 */
export type JsonLiteralType = typeof JsonLiteral.Type;
