/**
 * Schema-backed ontology authoring for Effect Schema models.
 *
 * @packageDocumentation
 * @since 0.0.0
 */

/**
 * Package version.
 *
 * @category configuration
 * @since 0.0.0
 */
export const VERSION = "0.0.0" as const;

export * from "./annotations.ts";
export * from "./assembly.ts";
export * from "./create.ts";
export * from "./model.ts";
export * from "./references.ts";
export * from "./projections/jsonld.ts";
export * from "./projections/turtle.ts";
