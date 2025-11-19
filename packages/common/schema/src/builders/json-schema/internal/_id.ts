import { BeepId, SchemaId } from "@beep/identity";

/**
 * Identity helper for JSON Schema builder artifacts.
 *
 * Ensures docgen references the same namespace for JSON Schema exports.
 *
 * @example
 * import { Id } from "@beep/schema/builders/json-schema/_id";
 *
 * const Meta = Id.annotations("JsonSchema", { title: "JsonSchema" });
 *
 * @category Builders/JsonSchema
 * @since 0.1.0
 * @internal
 */
const module = `${SchemaId.string()}/builders/json-schema` as const

export const Id = {
  JsonProp: BeepId.from(`${module}/json-prop`),
  JsonSchema: BeepId.from(`${module}/json-prop`),
  JsonType: BeepId.from(`${module}/json-type`)
} as const;
