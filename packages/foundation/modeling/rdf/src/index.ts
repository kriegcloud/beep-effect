/**
 * Domain-safe RDF and linked-data value models.
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

/**
 * IRI schema and branded IRI helpers.
 *
 * @category validation
 * @since 0.0.0
 */
export * from "./Iri.ts";
/**
 * JSON-LD schema models.
 *
 * @category json-ld
 * @since 0.0.0
 */
export * from "./JsonLd.ts";
/**
 * RDF/JS schema models.
 *
 * @category rdf
 * @since 0.0.0
 */
export * from "./Rdf.ts";
/**
 * Effect Schema annotation helpers for RDF metadata.
 *
 * @category annotations
 * @since 0.0.0
 */
export * from "./SemanticSchemaMetadata.ts";
/**
 * URI schema and branded URI helpers.
 *
 * @category validation
 * @since 0.0.0
 */
export * from "./Uri.ts";
