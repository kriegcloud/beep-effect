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
import { BS } from "@beep/schema";

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
export class RdfFormat extends BS.StringLiteralKit("Turtle", "NTriples", "JSONLD")
  .annotations(
    $I.annotations("RdfFormat", {
      title: "RDF Format",
      description: "Supported RDF serialization formats",
    })
  )
  .annotations(
    $I.annotations("RdfFormat", {
      title: "RDF Format",
      description: "Supported RDF serialization formats",
    })
  ) {}

export declare namespace RdfFormat {
  export type Type = typeof RdfFormat.Type;
}

/**
 * RdfFormatMimeType - MIME type mapping for RDF formats
 *
 * Maps each RDF format to its corresponding MIME type for
 * HTTP content negotiation and file handling.
 *
 * @since 0.1.0
 * @category value-objects
 */
export class RdfFormatMimeType extends BS.MappedLiteralKit(
  ["Turtle", BS.MimeType.Enum["text/turtle"]],
  ["NTriples", BS.MimeType.Enum["application/n-triples"]],
  ["JSONLD", BS.MimeType.Enum["application/ld+json"]]
).annotations(
  $I.annotations("RdfFormatMimeType", {
    title: "RDF Format MIME Type",
    description: "MIME type mapping for RDF formats",
  })
) {}

export declare namespace RdfFormatMimeType {
  export type Type = typeof RdfFormatMimeType.Type;
  export type Encoded = typeof RdfFormatMimeType.Encoded;
}

/**
 * Get the MIME type for a given RDF format.
 *
 * @since 0.1.0
 * @category value-objects
 */
export const getMimeType = (format: RdfFormat.Type): RdfFormatMimeType.Type => RdfFormatMimeType.DecodedEnum[format];
