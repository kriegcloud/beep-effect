/**
 * Job Schemas for PersistedQueue
 *
 * Defines background job types for async processing.
 * Jobs are persisted and processed with retry semantics.
 *
 * @since 2.0.0
 * @module Domain/Schema/JobSchema
 */

import { Schema } from "effect"

// =============================================================================
// Curation Jobs
// =============================================================================

/**
 * Job to re-embed a canonical entity after alias addition
 *
 * @since 2.0.0
 */
export class EmbeddingJob extends Schema.TaggedClass<EmbeddingJob>()(
  "EmbeddingJob",
  {
    id: Schema.String,
    ontologyId: Schema.String,
    canonicalEntityId: Schema.String,
    reason: Schema.String,
    createdAt: Schema.DateTimeUtcFromSelf
  }
) {
  /**
   * Generate a unique job ID
   */
  static makeId(ontologyId: string, entityId: string, now: number): string {
    return `embed:${ontologyId}:${entityId}:${now}`
  }
}

/**
 * Job to update prompt cache with a new example
 *
 * @since 2.0.0
 */
export class PromptCacheJob extends Schema.TaggedClass<PromptCacheJob>()(
  "PromptCacheJob",
  {
    id: Schema.String,
    ontologyId: Schema.String,
    exampleId: Schema.String,
    isNegative: Schema.Boolean,
    createdAt: Schema.DateTimeUtcFromSelf
  }
) {
  /**
   * Generate a unique job ID
   */
  static makeId(ontologyId: string, exampleId: string, now: number): string {
    return `cache:${ontologyId}:${exampleId}:${now}`
  }
}

// =============================================================================
// Entity Resolution Jobs
// =============================================================================

/**
 * Job to recompute entity similarity scores
 *
 * @since 2.0.0
 */
export class SimilarityRecomputeJob extends Schema.TaggedClass<SimilarityRecomputeJob>()(
  "SimilarityRecomputeJob",
  {
    id: Schema.String,
    ontologyId: Schema.String,
    entityId: Schema.String,
    reason: Schema.Literal("alias_added", "embedding_updated", "manual"),
    createdAt: Schema.DateTimeUtcFromSelf
  }
) {
  static makeId(ontologyId: string, entityId: string, now: number): string {
    return `similarity:${ontologyId}:${entityId}:${now}`
  }
}

/**
 * Job to rebuild blocking tokens for an entity
 *
 * @since 2.0.0
 */
export class BlockingTokenJob extends Schema.TaggedClass<BlockingTokenJob>()(
  "BlockingTokenJob",
  {
    id: Schema.String,
    ontologyId: Schema.String,
    entityId: Schema.String,
    text: Schema.String,
    createdAt: Schema.DateTimeUtcFromSelf
  }
) {
  static makeId(ontologyId: string, entityId: string, now: number): string {
    return `blocking:${ontologyId}:${entityId}:${now}`
  }
}

// =============================================================================
// Webhook/Notification Jobs
// =============================================================================

/**
 * Job to send webhook notification
 *
 * @since 2.0.0
 */
export class WebhookJob extends Schema.TaggedClass<WebhookJob>()(
  "WebhookJob",
  {
    id: Schema.String,
    url: Schema.String,
    eventType: Schema.String,
    payload: Schema.Unknown,
    createdAt: Schema.DateTimeUtcFromSelf
  }
) {
  static makeId(eventType: string, now: number): string {
    return `webhook:${eventType}:${now}`
  }
}

// =============================================================================
// Combined Job Schema
// =============================================================================

/**
 * Union of all background job types
 *
 * @since 2.0.0
 */
export const BackgroundJobSchema = Schema.Union(
  EmbeddingJob,
  PromptCacheJob,
  SimilarityRecomputeJob,
  BlockingTokenJob,
  WebhookJob
)

/**
 * Type of all background jobs
 *
 * @since 2.0.0
 */
export type BackgroundJob = typeof BackgroundJobSchema.Type

/**
 * Job metadata for retry tracking
 *
 * @since 2.0.0
 */
export const JobMetadataSchema = Schema.Struct({
  id: Schema.String,
  attempts: Schema.Number,
  lastError: Schema.optionalWith(Schema.String, { as: "Option" }),
  lastAttemptAt: Schema.optionalWith(Schema.DateTimeUtcFromSelf, { as: "Option" })
})

/**
 * Type of job metadata
 *
 * @since 2.0.0
 */
export type JobMetadata = typeof JobMetadataSchema.Type
