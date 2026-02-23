/**
 * Json Prop Schema
 *
 * @example
 * import { JsonProp } from "@beep/schema/builders/json-schema/json-prop";
 * import * as S from "effect/Schema";
 *
 * const schema = S.decodeSync(JsonProp)("object");
 *
 * @category Builders/JsonSchema
 * @since 0.1.0
 */

import { $SchemaId } from "@beep/identity/packages";
import * as O from "effect/Option";
import * as S from "effect/Schema";
import { prop_regex } from "../../internal/regex/regexes";

const $I = $SchemaId.create("builders/json-schema/json-prop");
/**
 * Branded schema for JSON property names used in JsonSchema helpers.
 *
 * @category Builders/JsonSchema
 * @since 0.1.0
 * @example
 * import { JsonProp } from "@beep/schema/builders/json-schema";
 * import * as S from "effect/Schema";
 *
 * const prop = S.decodeSync(JsonProp)("city_name");
 */
export class JsonProp extends S.NonEmptyString.pipe(
  S.pattern(prop_regex, {
    message: () => "Property name must contain only letters, numbers, and underscores",
  })
).annotations(
  $I.annotations("JsonProp", {
    description: "Property name must contain only letters, numbers, and underscores",
  })
) {
  static readonly is = (value: unknown): value is JsonProp.Type => O.isSome(S.validateOption(JsonProp)(value));
}

/**
 * Namespace exposing runtime and encoded types for {@link JsonProp}.
 *
 * @category Builders/JsonSchema
 * @since 0.1.0
 * @example
 * import type { JsonProp } from "@beep/schema/builders/json-schema";
 *
 * type Name = JsonProp.Type;
 */
export declare namespace JsonProp {
  /**
   * Runtime type alias emitted by {@link JsonProp}.
   *
   * @example
   * import type { JsonProp } from "@beep/schema/builders/json-schema/json-prop";
   *
   * type Name = JsonProp.Type;
   *
   * @category Builders/JsonSchema
   * @since 0.1.0
   */
  export type Type = typeof JsonProp.Type & { __JsonPath: true; __JsonProp: true };
  /**
   * Encoded representation produced by {@link JsonProp}.
   *
   * @example
   * import type { JsonProp } from "@beep/schema/builders/json-schema/json-prop";
   *
   * const prop: JsonProp.Encoded = "city_name";
   *
   * @category Builders/JsonSchema
   * @since 0.1.0
   */
  export type Encoded = typeof JsonProp.Encoded;
}
