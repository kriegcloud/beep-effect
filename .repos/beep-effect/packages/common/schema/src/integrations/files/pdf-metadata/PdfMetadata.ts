import { $SchemaId } from "@beep/identity/packages";
import { DateTimeUtcFromAllAcceptable } from "@beep/schema/primitives";
import * as O from "effect/Option";
import * as S from "effect/Schema";

const $I = $SchemaId.create("integrations/files/pdf-metadata");

const withNullableOption = <A, I, R>(schema: S.Schema<A, I, R>) =>
  S.optionalWith(schema, {
    as: "Option",
    nullable: true,
  });

/**
 * PDF metadata extracted from the document info dictionary.
 * Contains standard PDF document properties as defined by the PDF specification.
 */
export class PdfMetadata extends S.Class<PdfMetadata>($I`PdfMetadata`)(
  {
    /** Document title */
    title: withNullableOption(S.String).annotations({
      description: "The document's title",
    }),

    /** Document author */
    author: withNullableOption(S.String).annotations({
      description: "The name of the person who created the document",
    }),

    /** Document subject */
    subject: withNullableOption(S.String).annotations({
      description: "The subject of the document",
    }),

    /** Document keywords */
    keywords: withNullableOption(S.String).annotations({
      description: "Keywords associated with the document",
    }),

    /** Application that created the document */
    creator: withNullableOption(S.String).annotations({
      description: "The application that created the original document",
    }),

    /** PDF producer (application that converted to PDF) */
    producer: withNullableOption(S.String).annotations({
      description: "The application that converted the document to PDF",
    }),

    /** Document creation date */
    creationDate: withNullableOption(DateTimeUtcFromAllAcceptable).annotations({
      description: "The date and time the document was created",
    }),

    /** Document modification date */
    modificationDate: withNullableOption(DateTimeUtcFromAllAcceptable).annotations({
      description: "The date and time the document was most recently modified",
    }),

    /** PDF version (e.g., "1.7", "2.0") */
    pdfVersion: withNullableOption(S.String).annotations({
      description: "The PDF specification version",
    }),

    /** Total number of pages */
    pageCount: S.NonNegativeInt.annotations({
      description: "Total number of pages in the document",
    }),

    /** Whether the PDF is encrypted */
    isEncrypted: S.Boolean.annotations({
      description: "Whether the document is encrypted",
    }),

    /** Whether the PDF is linearized (optimized for web viewing) */
    isLinearized: withNullableOption(S.Boolean).annotations({
      description: "Whether the document is linearized for fast web viewing",
    }),

    /** File size in bytes */
    fileSize: withNullableOption(S.NonNegativeInt).annotations({
      description: "Size of the PDF file in bytes",
    }),

    /** Raw metadata record for additional properties */
    raw: S.optional(S.Record({ key: S.String, value: S.Unknown })).annotations({
      description: "Raw metadata dictionary for additional properties",
    }),
  },
  $I.annotations("PdfMetadata", {
    description: "PDF document metadata extracted from the info dictionary",
  })
) {
  /**
   * Create an empty PdfMetadata instance with default values.
   */
  static readonly empty = (): PdfMetadata =>
    new PdfMetadata({
      title: O.none(),
      author: O.none(),
      subject: O.none(),
      keywords: O.none(),
      creator: O.none(),
      producer: O.none(),
      creationDate: O.none(),
      modificationDate: O.none(),
      pdfVersion: O.none(),
      pageCount: 0,
      isEncrypted: false,
      isLinearized: O.none(),
      fileSize: O.none(),
    });
}

export declare namespace PdfMetadata {
  export type Type = typeof PdfMetadata.Type;
  export type Encoded = typeof PdfMetadata.Encoded;
}

/**
 * Raw PDF info dictionary value type.
 */
export type PdfMetadataValue = Record<string, unknown>;

/**
 * Returns an empty raw PDF metadata record.
 */
export const constEmptyPdfMetadata = (): PdfMetadataValue => ({});
