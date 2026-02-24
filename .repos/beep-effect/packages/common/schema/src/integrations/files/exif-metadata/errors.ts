import { $SchemaId } from "@beep/identity/packages";
import * as S from "effect/Schema";

const $I = $SchemaId.create("integrations/files/exif-metadata/errors");

/**
 * Error thrown when EXIF parsing fails at any stage.
 * Uses Schema.TaggedError for validation and serialization support.
 */
export class MetadataParseError extends S.TaggedError<MetadataParseError>()(
  $I`MetadataParseError`,
  {
    message: S.String,
    cause: S.optional(S.Unknown),
    fileName: S.optional(S.String),
    fileType: S.optional(S.String),
    fileSize: S.optional(S.Number),
    phase: S.optional(S.Literal("load", "read", "parse", "decode")),
  },
  $I.annotations("MetadataParseError", {
    description: "Thrown when EXIF/image metadata parsing fails during any phase (load, read, parse, or decode).",
  })
) {}

/**
 * Error thrown when EXIF extraction times out.
 */
export class ExifTimeoutError extends S.TaggedError<ExifTimeoutError>()(
  $I`ExifTimeoutError`,
  {
    message: S.String,
    fileName: S.optional(S.String),
    timeoutMs: S.Number,
  },
  $I.annotations("ExifTimeoutError", {
    description: "Thrown when EXIF metadata extraction exceeds the configured timeout duration.",
  })
) {}

/**
 * Error thrown when a file is too large for EXIF extraction.
 */
export class ExifFileTooLargeError extends S.TaggedError<ExifFileTooLargeError>()(
  $I`ExifFileTooLargeError`,
  {
    message: S.String,
    fileName: S.optional(S.String),
    fileSize: S.Number,
    maxSize: S.Number,
  },
  $I.annotations("ExifFileTooLargeError", {
    description: "Thrown when a file exceeds the maximum allowed size for EXIF metadata extraction.",
  })
) {}
