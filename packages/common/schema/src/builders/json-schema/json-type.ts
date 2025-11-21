/**
 * JSON Schema `type` keyword schemas.
 *
 * @category Builders/JsonSchema
 * @since 0.1.0
 */
import { StringLiteralKit } from "@beep/schema/derived/kits/string-literal-kit";
import { Id } from "./internal";

/**
 * Enumerates JSON Schema `type` keywords.
 *
 * @category Builders/JsonSchema
 * @since 0.1.0
 * @example
 * import { $JsonType } from "@beep/schema/builders/json-schema/json-type";
 * import * as S from "effect/Schema";
 *
 * const schema = S.decodeSync($JsonType)("object");
 */
export class $JsonType extends StringLiteralKit(
  "object",
  "array",
  "string",
  "number",
  "boolean",
  "null",
  "integer"
).annotations(
  Id.JsonType.annotations("$JsonType", {
    description: "The possible json types as string literals",
  })
) {}

/**
 * Namespace describing the encoded and decoded types for {@link $JsonType}.
 *
 * @category Builders/JsonSchema
 * @since 0.1.0
 */
export declare namespace $JsonType {
  /**
   * Runtime union corresponding to {@link $JsonType}.
   *
   * @example
   * import type { $JsonType } from "@beep/schema/builders/json-schema/json-type";
   *
   * const accepts: $JsonType.Type = "object";
   *
   * @category Builders/JsonSchema
   * @since 0.1.0
   */
  export type Type = typeof $JsonType.Type;

  /**
   * Runtime union corresponding to {@link $JsonType}.
   *
   * @example
   * import type { $JsonType } from "@beep/schema/builders/json-schema/json-type";
   *
   * const accepts: $JsonType.Encoded = "object";
   *
   * @category Builders/JsonSchema
   * @since 0.1.0
   */
  export type Encoded = typeof $JsonType.Encoded;
}
