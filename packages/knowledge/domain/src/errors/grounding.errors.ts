/**
 * Grounding errors for Knowledge slice
 *
 * Typed errors for entity grounding/verification operations.
 *
 * @module knowledge-domain/errors/grounding
 * @since 0.1.0
 */
import { $KnowledgeDomainId } from "@beep/identity/packages";
import * as S from "effect/Schema";

const $I = $KnowledgeDomainId.create("errors/grounding");

/**
 * Entity not found in source text during grounding
 *
 * @since 0.1.0
 * @category errors
 */
export class EntityNotGroundedError extends S.TaggedError<EntityNotGroundedError>($I`EntityNotGroundedError`)(
  "EntityNotGroundedError",
  {
    entityId: S.String,
    mention: S.String,
    documentId: S.optional(S.String),
    message: S.String,
  },
  $I.annotations("EntityNotGroundedError", {
    description: "Entity mention could not be found in source text",
  })
) {}

/**
 * Type mismatch during grounding
 *
 * @since 0.1.0
 * @category errors
 */
export class TypeMismatchError extends S.TaggedError<TypeMismatchError>($I`TypeMismatchError`)(
  "TypeMismatchError",
  {
    entityId: S.String,
    expectedTypes: S.Array(S.String),
    actualTypes: S.Array(S.String),
    message: S.String,
  },
  $I.annotations("TypeMismatchError", {
    description: "Entity types do not match ontology expectations",
  })
) {}

/**
 * Embedding service failure during grounding
 *
 * @since 0.1.0
 * @category errors
 */
export class EmbeddingServiceError extends S.TaggedError<EmbeddingServiceError>($I`EmbeddingServiceError`)(
  "EmbeddingServiceError",
  {
    operation: S.String,
    message: S.String,
    retryable: S.Boolean,
    cause: S.optional(S.String),
  },
  $I.annotations("EmbeddingServiceError", {
    description: "Embedding service failed during grounding",
  })
) {}

/**
 * Similarity threshold not met during grounding
 *
 * @since 0.1.0
 * @category errors
 */
export class LowConfidenceError extends S.TaggedError<LowConfidenceError>($I`LowConfidenceError`)(
  "LowConfidenceError",
  {
    entityId: S.String,
    confidence: S.Number,
    threshold: S.Number,
    message: S.String,
  },
  $I.annotations("LowConfidenceError", {
    description: "Entity grounding confidence below threshold",
  })
) {}

/**
 * Grounding timeout error
 *
 * @since 0.1.0
 * @category errors
 */
export class GroundingTimeoutError extends S.TaggedError<GroundingTimeoutError>($I`GroundingTimeoutError`)(
  "GroundingTimeoutError",
  {
    entityId: S.optional(S.String),
    stage: S.String,
    durationMs: S.Number,
    message: S.String,
  },
  $I.annotations("GroundingTimeoutError", {
    description: "Grounding operation timed out",
  })
) {}

/**
 * Generic grounding error (fallback)
 *
 * @since 0.1.0
 * @category errors
 */
export class GroundingGenericError extends S.TaggedError<GroundingGenericError>($I`GroundingGenericError`)(
  "GroundingGenericError",
  {
    entityId: S.optional(S.String),
    message: S.String,
    cause: S.optional(S.String),
  },
  $I.annotations("GroundingGenericError", {
    description: "Generic grounding error (fallback)",
  })
) {}

/**
 * Union of all grounding error types
 *
 * @since 0.1.0
 * @category errors
 */
export class GroundingError extends S.Union(
  EntityNotGroundedError,
  TypeMismatchError,
  EmbeddingServiceError,
  LowConfidenceError,
  GroundingTimeoutError,
  GroundingGenericError
).annotations(
  $I.annotations("GroundingError", {
    description: "Union of all grounding error types",
  })
) {}

export declare namespace GroundingError {
  export type Type = typeof GroundingError.Type;
  export type Encoded = typeof GroundingError.Encoded;
}
