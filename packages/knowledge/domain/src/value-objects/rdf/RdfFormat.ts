import { $KnowledgeDomainId } from "@beep/identity/packages";
import { BS } from "@beep/schema";

const $I = $KnowledgeDomainId.create("value-objects/rdf/RdfFormat");

export class RdfFormat extends BS.StringLiteralKit("Turtle", "NTriples", "JSONLD").annotations(
  $I.annotations("RdfFormat", {
    title: "RDF Format",
    description: "Supported RDF serialization formats",
  })
) {}

export declare namespace RdfFormat {
  export type Type = typeof RdfFormat.Type;
}

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

export const getMimeType = (format: RdfFormat.Type): RdfFormatMimeType.Type => RdfFormatMimeType.DecodedEnum[format];
