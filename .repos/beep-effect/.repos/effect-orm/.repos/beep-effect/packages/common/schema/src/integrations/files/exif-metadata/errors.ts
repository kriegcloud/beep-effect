import * as S from "effect/Schema";

/**
 * Error thrown when EXIF parsing fails at any stage.
 * Uses Schema.TaggedError for validation and serialization support.
 */
export class MetadataParseError extends S.TaggedError<MetadataParseError>()("MetadataParseError", {
  message: S.String,
  cause: S.optional(S.Unknown),
  fileName: S.optional(S.String),
  fileType: S.optional(S.String),
  fileSize: S.optional(S.Number),
  phase: S.optional(S.Literal("load", "read", "parse", "decode")),
}) {}

/**
 * Error thrown when EXIF extraction times out.
 */
export class ExifTimeoutError extends S.TaggedError<ExifTimeoutError>()("ExifTimeoutError", {
  message: S.String,
  fileName: S.optional(S.String),
  timeoutMs: S.Number,
}) {}

/**
 * Error thrown when a file is too large for EXIF extraction.
 */
export class ExifFileTooLargeError extends S.TaggedError<ExifFileTooLargeError>()("ExifFileTooLargeError", {
  message: S.String,
  fileName: S.optional(S.String),
  fileSize: S.Number,
  maxSize: S.Number,
}) {}
