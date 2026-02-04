/**
 * Extraction Entity Definition
 *
 * Defines the Cluster Entity for knowledge graph extraction with:
 * - Streaming progress events
 * - Idempotency key routing
 * - Cached result retrieval
 *
 * @since 2.0.0
 * @module Cluster/ExtractionEntity
 */

import { Entity } from "@effect/cluster"
import * as Rpc from "@effect/rpc/Rpc"
import { Schema } from "effect"
import { ProgressEventSchema } from "../Contract/ProgressStreaming.js"
// IdempotencyKey utilities used by entity handlers
export { computeIdempotencyKey, type ExtractionParams } from "../Utils/IdempotencyKey.js"

// =============================================================================
// RPC Schemas
// =============================================================================

/**
 * Extraction request payload
 */
export const ExtractFromTextPayload = Schema.Struct({
  /** Source text to extract from */
  text: Schema.String,
  /** Ontology identifier (e.g., "foaf", "schema.org") */
  ontologyId: Schema.String,
  /** Ontology content hash for versioning */
  ontologyVersion: Schema.String,
  /** Optional extraction parameters */
  params: Schema.optional(
    Schema.Struct({
      maxTokens: Schema.optional(Schema.Number),
      temperature: Schema.optional(Schema.Number),
      includeConfidence: Schema.optional(Schema.Boolean),
      groundingThreshold: Schema.optional(Schema.Number)
    })
  )
})

export type ExtractFromTextPayload = typeof ExtractFromTextPayload.Type

/**
 * Extraction summary returned on completion
 */
export const ExtractionSummary = Schema.Struct({
  entityCount: Schema.Number,
  relationCount: Schema.Number,
  durationMs: Schema.Number,
  idempotencyKey: Schema.String
})

export type ExtractionSummary = typeof ExtractionSummary.Type

/**
 * Cached result lookup payload
 */
export const GetCachedResultPayload = Schema.Struct({
  idempotencyKey: Schema.String
})

export type GetCachedResultPayload = typeof GetCachedResultPayload.Type

/**
 * Knowledge graph result
 */
export const KnowledgeGraphResult = Schema.Struct({
  entities: Schema.Array(Schema.Any),
  relations: Schema.Array(Schema.Any),
  metadata: Schema.Struct({
    idempotencyKey: Schema.String,
    ontologyId: Schema.String,
    ontologyVersion: Schema.String,
    extractedAt: Schema.String,
    durationMs: Schema.Number
  })
})

export type KnowledgeGraphResult = typeof KnowledgeGraphResult.Type

// =============================================================================
// RPC Definitions
// =============================================================================

/**
 * Extract knowledge graph from text (streaming)
 *
 * Returns a stream of progress events, culminating in extraction_complete.
 * Uses idempotency key for deduplication and caching.
 *
 * Note: Entity routing by idempotency key is handled in the entity handler
 * by computing the key from the payload.
 */
export const ExtractFromTextRpc = Rpc.make("ExtractFromText", {
  payload: ExtractFromTextPayload,
  success: ProgressEventSchema,
  error: Schema.String,
  stream: true
})

/**
 * Get cached extraction result by idempotency key
 *
 * Returns None if no cached result exists or extraction incomplete.
 */
export const GetCachedResultRpc = Rpc.make("GetCachedResult", {
  payload: GetCachedResultPayload,
  success: Schema.Option(KnowledgeGraphResult),
  error: Schema.String
})

/**
 * Cancel an in-progress extraction
 */
export const CancelExtractionRpc = Rpc.make("CancelExtraction", {
  payload: Schema.Struct({
    idempotencyKey: Schema.String,
    reason: Schema.optional(Schema.String)
  }),
  success: Schema.Boolean,
  error: Schema.String
})

/**
 * Get extraction status
 */
export const GetExtractionStatusRpc = Rpc.make("GetExtractionStatus", {
  payload: Schema.Struct({
    idempotencyKey: Schema.String
  }),
  success: Schema.Struct({
    status: Schema.Literal("pending", "running", "complete", "failed"),
    progress: Schema.optional(Schema.Number),
    startedAt: Schema.optional(Schema.String),
    completedAt: Schema.optional(Schema.String),
    error: Schema.optional(Schema.String)
  }),
  error: Schema.String
})

// =============================================================================
// Entity Definition
// =============================================================================

/**
 * Knowledge Graph Extractor Entity
 *
 * Cluster entity that handles extraction requests with:
 * - Automatic sharding by idempotency key
 * - Streaming progress events
 * - Result caching
 * - Cancellation support
 */
export const KnowledgeGraphExtractor = Entity.make("KGExtractor", [
  ExtractFromTextRpc,
  GetCachedResultRpc,
  CancelExtractionRpc,
  GetExtractionStatusRpc
])

export type KnowledgeGraphExtractor = typeof KnowledgeGraphExtractor
