/**
 * RDF serialization format definitions
 *
 * Defines supported RDF serialization formats and their associated MIME types
 * for serialization and deserialization operations.
 *
 * @module knowledge-domain/value-objects/rdf/RdfFormat
 * @since 0.1.0
 */
import { $KnowledgeDomainId } from "@beep/identity/packages";
import * as S from "effect/Schema";

const $I = $KnowledgeDomainId.create("value-objects/rdf/RdfFormat");

/**
 * RdfFormat - Supported RDF serialization formats
 *
 * Defines the RDF formats supported for serialization and deserialization:
 * - Turtle: Terse RDF Triple Language, human-readable
 * - NTriples: Line-based RDF format, simple parsing
 * - JSONLD: JSON-based RDF format, web-friendly
 *
 * @since 0.1.0
 * @category value-objects
 */
export const RdfFormat = S.Literal("Turtle", "NTriples", "JSONLD").annotations(
  $I.annotations("RdfFormat", {
    title: "RDF Format",
    description: "Supported RDF serialization formats",
  })
);

export type RdfFormat = typeof RdfFormat.Type;

/**
 * Type guard for RdfFormat values.
 *
 * @since 0.1.0
 * @category value-objects
 */
export const isRdfFormat = S.is(RdfFormat);

/**
 * RdfFormatMimeType - MIME type mapping for RDF formats
 *
 * Maps each RDF format to its corresponding MIME type for
 * HTTP content negotiation and file handling.
 *
 * @since 0.1.0
 * @category value-objects
 */
export const RdfFormatMimeType: Record<RdfFormat, string> = {
  Turtle: "text/turtle",
  NTriples: "application/n-triples",
  JSONLD: "application/ld+json",
} as const;

/**
 * Get the MIME type for a given RDF format.
 *
 * @since 0.1.0
 * @category value-objects
 */
export const getMimeType = (format: RdfFormat): string => RdfFormatMimeType[format];
