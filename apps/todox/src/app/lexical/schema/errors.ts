/**
 * Tagged error classes for Lexical utilities.
 *
 * @since 0.1.0
 */
import { $TodoxId } from "@beep/identity/packages";
import * as S from "effect/Schema";

const $I = $TodoxId.create("lexical/schema/errors");

/**
 * Error thrown when URL validation or sanitization fails.
 *
 * @since 0.1.0
 */
export class InvalidUrlError extends S.TaggedError<InvalidUrlError>()(
  $I`InvalidUrlError`,
  {
    message: S.String,
    url: S.String,
  },
  $I.annotations("InvalidUrlError", {
    description: "Error thrown when URL validation or sanitization fails",
  })
) {}

/**
 * Error thrown when JSON parsing fails.
 *
 * @since 0.1.0
 */
export class ParseError extends S.TaggedError<ParseError>()(
  $I`ParseError`,
  {
    message: S.String,
    input: S.String,
  },
  $I.annotations("ParseError", {
    description: "Error thrown when JSON parsing fails",
  })
) {}

/**
 * Error thrown when document hash validation fails.
 *
 * @since 0.1.0
 */
export class InvalidDocumentHashError extends S.TaggedError<InvalidDocumentHashError>()(
  $I`InvalidDocumentHashError`,
  {
    message: S.String,
    hash: S.String,
  },
  $I.annotations("InvalidDocumentHashError", {
    description: "Error thrown when document hash validation fails",
  })
) {}

/**
 * Error thrown when compression or decompression fails.
 *
 * @since 0.1.0
 */
export class CompressionError extends S.TaggedError<CompressionError>()(
  $I`CompressionError`,
  {
    message: S.String,
    cause: S.optional(S.String),
  },
  $I.annotations("CompressionError", {
    description: "Error thrown when compression or decompression fails",
  })
) {}
