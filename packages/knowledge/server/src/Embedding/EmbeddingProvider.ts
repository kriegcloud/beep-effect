/**
 * EmbeddingProvider - Embedding types for knowledge graph
 *
 * Provides types and errors for embedding operations used in
 * entity similarity and grounding verification.
 *
 * @module knowledge-server/Embedding/EmbeddingProvider
 * @since 0.1.0
 */
import * as S from "effect/Schema";

/**
 * Task type for embedding generation
 *
 * Different task types may use different embedding strategies
 * for optimal retrieval performance.
 *
 * @since 0.1.0
 * @category schemas
 */
export type TaskType =
  | "search_document" // For document storage (asymmetric search)
  | "search_query" // For queries (asymmetric search)
  | "clustering"; // For entity clustering

/**
 * Configuration for embedding provider
 *
 * @since 0.1.0
 * @category schemas
 */
export interface EmbeddingConfig {
  /**
   * Model identifier
   */
  readonly model: string;

  /**
   * Output vector dimensions
   */
  readonly dimensions: number;

  /**
   * Provider name
   */
  readonly provider: string;
}

/**
 * Embedding generation error
 *
 * @since 0.1.0
 * @category errors
 */
export class EmbeddingError extends S.TaggedError<EmbeddingError>()("EmbeddingError", {
  message: S.String,
  provider: S.String,
  retryable: S.Boolean,
  cause: S.optional(S.String),
}) {}
