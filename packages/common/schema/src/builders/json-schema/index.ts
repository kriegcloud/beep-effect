/**
 * JsonProp
 *
 * @example
 * import * as Builders from "@beep/schema/builders";
 * import * as S from "effect/Schema";
 * const decoded = S.decodeSync(Builders.JsonSchema.JsonProp)("some-prop");
 *
 * @category Surface/Builders
 * @since 0.1.0
 */
export * from "./json-prop";

/**
 * $JsonType
 *
 * @example
 * import * as Builders from "@beep/schema/builders";
 * import * as S from "effect/Schema";
 * const decoded = S.is(Builders.JsonSchema.$JsonType)("object");
 *
 * @category Surface/Builders
 * @since 0.1.0
 */
export * from "./json-type";
/**
 * JsonSchema
 *
 * @example
 * import * as Builders from "@beep/schema/builders";
 * import * as S from "effect/Schema";
 * import * as JSONSchema from "effect/JSONSchema";
 * const isJsonSchema = S.is(Builders.JsonSchema.JsonSchema)(JSONSchema.make(S.String));
 *
 * @category Surface/Builders
 * @since 0.1.0
 */
export * from "./json-schema";