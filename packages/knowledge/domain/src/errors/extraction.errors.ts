import { $KnowledgeDomainId } from "@beep/identity/packages";
import { KnowledgeEntityIds } from "@beep/shared-domain";
import * as S from "effect/Schema";

const $I = $KnowledgeDomainId.create("errors/extraction");

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

export class LlmExtractionError extends S.TaggedError<LlmExtractionError>($I`LlmExtractionError`)(
  "LlmExtractionError",
  {
    extractionId: S.optional(KnowledgeEntityIds.ExtractionId),
    chunkIndex: S.optional(S.Number),
    message: S.String,
    retryable: S.Boolean,
    cause: S.optional(S.String),
  },
  $I.annotations("LlmExtractionError", {
    description: "LLM failed to extract knowledge from text",
  })
) {}

export class ExtractionTimeoutError extends S.TaggedError<ExtractionTimeoutError>($I`ExtractionTimeoutError`)(
  "ExtractionTimeoutError",
  {
    extractionId: KnowledgeEntityIds.ExtractionId,
    stage: S.String,
    durationMs: S.Number,
    message: S.String,
  },
  $I.annotations("ExtractionTimeoutError", {
    description: "Extraction operation timed out",
  })
) {}

export class ExtractionValidationError extends S.TaggedError<ExtractionValidationError>($I`ExtractionValidationError`)(
  "ExtractionValidationError",
  {
    extractionId: S.optional(KnowledgeEntityIds.ExtractionId),
    field: S.optional(S.String),
    reason: S.String,
    message: S.String,
  },
  $I.annotations("ExtractionValidationError", {
    description: "Extracted data failed schema validation",
  })
) {}

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

export class ExtractionGenericError extends S.TaggedError<ExtractionGenericError>($I`ExtractionGenericError`)(
  "ExtractionGenericError",
  {
    extractionId: S.optional(KnowledgeEntityIds.ExtractionId),
    message: S.String,
    cause: S.optional(S.String),
  },
  $I.annotations("ExtractionGenericError", {
    description: "Generic extraction error (fallback)",
  })
) {}

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
