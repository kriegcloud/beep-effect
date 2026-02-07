import { $KnowledgeDomainId } from "@beep/identity/packages";
import { KnowledgeEntityIds } from "@beep/shared-domain";
import * as S from "effect/Schema";

const $I = $KnowledgeDomainId.create("errors/grounding");

export class EntityNotGroundedError extends S.TaggedError<EntityNotGroundedError>($I`EntityNotGroundedError`)(
  "EntityNotGroundedError",
  {
    entityId: KnowledgeEntityIds.KnowledgeEntityId,
    mention: S.String,
    documentId: S.optional(S.String),
    message: S.String,
  },
  $I.annotations("EntityNotGroundedError", {
    description: "Entity mention could not be found in source text",
  })
) {}

export class TypeMismatchError extends S.TaggedError<TypeMismatchError>($I`TypeMismatchError`)(
  "TypeMismatchError",
  {
    entityId: KnowledgeEntityIds.KnowledgeEntityId,
    expectedTypes: S.Array(S.String),
    actualTypes: S.Array(S.String),
    message: S.String,
  },
  $I.annotations("TypeMismatchError", {
    description: "Entity types do not match ontology expectations",
  })
) {}

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

export class LowConfidenceError extends S.TaggedError<LowConfidenceError>($I`LowConfidenceError`)(
  "LowConfidenceError",
  {
    entityId: KnowledgeEntityIds.KnowledgeEntityId,
    confidence: S.Number,
    threshold: S.Number,
    message: S.String,
  },
  $I.annotations("LowConfidenceError", {
    description: "Entity grounding confidence below threshold",
  })
) {}

export class GroundingTimeoutError extends S.TaggedError<GroundingTimeoutError>($I`GroundingTimeoutError`)(
  "GroundingTimeoutError",
  {
    entityId: S.optional(KnowledgeEntityIds.KnowledgeEntityId),
    stage: S.String,
    durationMs: S.Number,
    message: S.String,
  },
  $I.annotations("GroundingTimeoutError", {
    description: "Grounding operation timed out",
  })
) {}

export class GroundingGenericError extends S.TaggedError<GroundingGenericError>($I`GroundingGenericError`)(
  "GroundingGenericError",
  {
    entityId: S.optional(KnowledgeEntityIds.KnowledgeEntityId),
    message: S.String,
    cause: S.optional(S.String),
  },
  $I.annotations("GroundingGenericError", {
    description: "Generic grounding error (fallback)",
  })
) {}

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
