/**
 * JSON Schema builder namespace mirroring the legacy module.
 *
 * @example
 * import * as Builders from "@beep/schema-v2/builders";
 *
 * const schema = Builders.JsonSchema.JsonSchema;
 *
 * @category Surface/Builders
 * @since 0.1.0
 */

/**
 * Introspection builders (custom fields, relationship utilities, etc.).
 *
 * @example
 * import * as Builders from "@beep/schema-v2/builders";
 *
 * const schema = Builders.Introspection.CustomFieldSchema;
 *
 * @category Surface/Builders
 * @since 0.1.0
 */
export * as JsonSchema from "./json-schema";
