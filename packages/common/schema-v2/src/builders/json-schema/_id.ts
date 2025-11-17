import { BeepId, SchemaId } from "@beep/identity";

/**
 * Identity helper for JSON Schema builder artifacts.
 *
 * Ensures docgen references the same namespace for JSON Schema exports.
 *
 * @example
 * import { Id } from "@beep/schema-v2/builders/json-schema/_id";
 *
 * const Meta = Id.annotations("JsonSchema", { title: "JsonSchema" });
 *
 * @category Builders/JsonSchema
 * @since 0.1.0
 * @internal
 */
export const Id = BeepId.from(`${SchemaId.string()}/builders/json-schema`);
