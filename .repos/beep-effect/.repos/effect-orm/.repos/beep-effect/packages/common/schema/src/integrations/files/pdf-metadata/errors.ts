import * as S from "effect/Schema";

/**
 * Error thrown when PDF metadata parsing fails at any stage.
 * Uses Schema.TaggedError for validation and serialization support.
 */
export class PdfParseError extends S.TaggedError<PdfParseError>()("PdfParseError", {
  message: S.String,
  cause: S.optional(S.Unknown),
  fileName: S.optional(S.String),
  fileSize: S.optional(S.Number),
  phase: S.optional(S.Literal("load", "read", "parse", "decode")),
}) {}

/**
 * Error thrown when PDF parsing times out.
 */
export class PdfTimeoutError extends S.TaggedError<PdfTimeoutError>()("PdfTimeoutError", {
  message: S.String,
  fileName: S.optional(S.String),
  timeoutMs: S.Number,
}) {}

/**
 * Error thrown when a PDF file is too large for metadata extraction.
 */
export class PdfFileTooLargeError extends S.TaggedError<PdfFileTooLargeError>()("PdfFileTooLargeError", {
  message: S.String,
  fileName: S.optional(S.String),
  fileSize: S.Number,
  maxSize: S.Number,
}) {}

/**
 * Error thrown when the PDF is encrypted and cannot be read without a password.
 */
export class PdfEncryptedError extends S.TaggedError<PdfEncryptedError>()("PdfEncryptedError", {
  message: S.String,
  fileName: S.optional(S.String),
}) {}

/**
 * Error thrown when the file is not a valid PDF.
 */
export class PdfInvalidError extends S.TaggedError<PdfInvalidError>()("PdfInvalidError", {
  message: S.String,
  fileName: S.optional(S.String),
  cause: S.optional(S.Unknown),
}) {}
