/**
 * Source-only test kit for lint command internals.
 *
 * @internal
 * @since 0.0.0
 */

export * from "@beep/repo-cli/commands/Lint";
/**
 * Schema-class shape detectors (brand and plain-data kinds), exposed so tests can drive them on fixtures.
 *
 * @category testing
 * @since 0.0.0
 */
export { SchemaFirstSchemaClass } from "../commands/Lint/internal/SchemaFirstSchemaClass.ts";
/**
 * Schema-first rendering adapter, exposed so tests can drive fallback render paths directly.
 *
 * @category testing
 * @since 0.0.0
 */
export { SchemaFirstRender } from "../commands/Lint/SchemaFirst.render.ts";
