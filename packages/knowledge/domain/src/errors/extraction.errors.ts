/**
 * Extraction errors for Knowledge slice
 *
 * Typed errors for knowledge extraction operations.
 *
 * @module knowledge-domain/errors/extraction
 * @since 0.1.0
 */
import { $KnowledgeDomainId } from "@beep/identity/packages";
import * as S from "effect/Schema";

const $I = $KnowledgeDomainId.create("errors/extraction");

/**
 * Document parsing error during extraction
 *
 * @since 0.1.0
 * @category errors
 */
export class DocumentParseError extends S.TaggedError<DocumentParseError>($I`DocumentParseError`)(
  "DocumentParseError",
  {
    documentId: S.String,
    message: S.String,
    cause: S.optional(S.String),
  },
  $I.annotations("DocumentParseError", {
    description: "Failed to parse source document for extraction",
  })
) {}

/**
 * LLM extraction failure
 *
 * @since 0.1.0
 * @category errors
 */
export class LlmExtractionError extends S.TaggedError<LlmExtractionError>($I`LlmExtractionError`)(
  "LlmExtractionError",
  {
    extractionId: S.optional(S.String),
    chunkIndex: S.optional(S.Number),
    message: S.String,
    retryable: S.Boolean,
    cause: S.optional(S.String),
  },
  $I.annotations("LlmExtractionError", {
    description: "LLM failed to extract knowledge from text",
  })
) {}

/**
 * Extraction timeout error
 *
 * @since 0.1.0
 * @category errors
 */
export class ExtractionTimeoutError extends S.TaggedError<ExtractionTimeoutError>($I`ExtractionTimeoutError`)(
  "ExtractionTimeoutError",
  {
    extractionId: S.String,
    stage: S.String,
    durationMs: S.Number,
    message: S.String,
  },
  $I.annotations("ExtractionTimeoutError", {
    description: "Extraction operation timed out",
  })
) {}

/**
 * Schema validation error during extraction
 *
 * @since 0.1.0
 * @category errors
 */
export class ExtractionValidationError extends S.TaggedError<ExtractionValidationError>($I`ExtractionValidationError`)(
  "ExtractionValidationError",
  {
    extractionId: S.optional(S.String),
    field: S.optional(S.String),
    reason: S.String,
    message: S.String,
  },
  $I.annotations("ExtractionValidationError", {
    description: "Extracted data failed schema validation",
  })
) {}

/**
 * Resource not found during extraction
 *
 * @since 0.1.0
 * @category errors
 */
export class ExtractionNotFoundError extends S.TaggedError<ExtractionNotFoundError>($I`ExtractionNotFoundError`)(
  "ExtractionNotFoundError",
  {
    resourceType: S.String,
    resourceId: S.String,
    message: S.String,
  },
  $I.annotations("ExtractionNotFoundError", {
    description: "Required resource not found during extraction",
  })
) {}

/**
 * Generic extraction error (fallback)
 *
 * @since 0.1.0
 * @category errors
 */
export class ExtractionGenericError extends S.TaggedError<ExtractionGenericError>($I`ExtractionGenericError`)(
  "ExtractionGenericError",
  {
    extractionId: S.optional(S.String),
    message: S.String,
    cause: S.optional(S.String),
  },
  $I.annotations("ExtractionGenericError", {
    description: "Generic extraction error (fallback)",
  })
) {}

/**
 * Union of all extraction error types
 *
 * @since 0.1.0
 * @category errors
 */
export class ExtractionError extends S.Union(
  DocumentParseError,
  LlmExtractionError,
  ExtractionTimeoutError,
  ExtractionValidationError,
  ExtractionNotFoundError,
  ExtractionGenericError
).annotations(
  $I.annotations("ExtractionError", {
    description: "Union of all extraction error types",
  })
) {}

export declare namespace ExtractionError {
  export type Type = typeof ExtractionError.Type;
  export type Encoded = typeof ExtractionError.Encoded;
}
