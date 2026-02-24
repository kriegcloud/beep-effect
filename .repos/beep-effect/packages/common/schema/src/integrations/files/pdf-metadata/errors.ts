import { $SchemaId } from "@beep/identity/packages";
import * as S from "effect/Schema";

const $I = $SchemaId.create("integrations/files/pdf-metadata/errors");

/**
 * Error thrown when PDF metadata parsing fails at any stage.
 * Uses Schema.TaggedError for validation and serialization support.
 */
export class PdfParseError extends S.TaggedError<PdfParseError>()(
  $I`PdfParseError`,
  {
    message: S.String,
    cause: S.optional(S.Unknown),
    fileName: S.optional(S.String),
    fileSize: S.optional(S.Number),
    phase: S.optional(S.Literal("load", "read", "parse", "decode")),
  },
  $I.annotations("PdfParseError", {
    description: "Thrown when PDF metadata parsing fails during any phase (load, read, parse, or decode).",
  })
) {}

/**
 * Error thrown when PDF parsing times out.
 */
export class PdfTimeoutError extends S.TaggedError<PdfTimeoutError>()(
  $I`PdfTimeoutError`,
  {
    message: S.String,
    fileName: S.optional(S.String),
    timeoutMs: S.Number,
  },
  $I.annotations("PdfTimeoutError", { description: "Thrown when PDF parsing exceeds the configured timeout duration." })
) {}

/**
 * Error thrown when a PDF file is too large for metadata extraction.
 */
export class PdfFileTooLargeError extends S.TaggedError<PdfFileTooLargeError>()(
  $I`PdfFileTooLargeError`,
  {
    message: S.String,
    fileName: S.optional(S.String),
    fileSize: S.Number,
    maxSize: S.Number,
  },
  $I.annotations("PdfFileTooLargeError", {
    description: "Thrown when a PDF file exceeds the maximum allowed size for metadata extraction.",
  })
) {}

/**
 * Error thrown when the PDF is encrypted and cannot be read without a password.
 */
export class PdfEncryptedError extends S.TaggedError<PdfEncryptedError>()(
  $I`PdfEncryptedError`,
  {
    message: S.String,
    fileName: S.optional(S.String),
  },
  $I.annotations("PdfEncryptedError", {
    description: "Thrown when a PDF file is password-protected and cannot be read without decryption.",
  })
) {}

/**
 * Error thrown when the file is not a valid PDF.
 */
export class PdfInvalidError extends S.TaggedError<PdfInvalidError>()(
  $I`PdfInvalidError`,
  {
    message: S.String,
    fileName: S.optional(S.String),
    cause: S.optional(S.Unknown),
  },
  $I.annotations("PdfInvalidError", {
    description: "Thrown when a file does not conform to valid PDF format specifications.",
  })
) {}
