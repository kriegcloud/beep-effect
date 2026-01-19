/**
 * EmbeddingProvider - Embedding provider abstraction for knowledge graph
 *
 * Provides a unified interface for embedding operations used in
 * entity similarity and grounding verification.
 *
 * @module knowledge-server/Embedding/EmbeddingProvider
 * @since 0.1.0
 */
import * as Context from "effect/Context";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
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
  | "clustering" // For entity clustering
  | "classification"; // For type classification

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
 * Result of an embedding operation
 *
 * @since 0.1.0
 * @category schemas
 */
export interface EmbeddingResult {
  /**
   * The embedding vector
   */
  readonly vector: ReadonlyArray<number>;

  /**
   * Model used to generate embedding
   */
  readonly model: string;

  /**
   * Token usage statistics (if available)
   */
  readonly usage?: {
    readonly totalTokens: number;
  };
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

/**
 * EmbeddingProvider interface - Embedding provider abstraction
 *
 * Implementations can wrap different embedding providers (OpenAI, Nomic, Voyage, etc.)
 * while exposing a consistent interface for the knowledge graph services.
 *
 * @since 0.1.0
 * @category services
 */
export interface EmbeddingProvider {
  /**
   * Provider configuration
   */
  readonly config: EmbeddingConfig;

  /**
   * Generate embedding for a single text
   *
   * @param text - Text to embed
   * @param taskType - Type of embedding task (affects prefixes for asymmetric search)
   * @returns Embedding result with vector
   */
  readonly embed: (text: string, taskType: TaskType) => Effect.Effect<EmbeddingResult, EmbeddingError>;

  /**
   * Generate embeddings for multiple texts (batched)
   *
   * @param texts - Texts to embed
   * @param taskType - Type of embedding task
   * @returns Array of embedding results (same order as input)
   */
  readonly embedBatch: (
    texts: ReadonlyArray<string>,
    taskType: TaskType
  ) => Effect.Effect<ReadonlyArray<EmbeddingResult>, EmbeddingError>;
}

/**
 * EmbeddingProvider Tag for dependency injection
 *
 * @since 0.1.0
 * @category context
 */
export const EmbeddingProvider = Context.GenericTag<EmbeddingProvider>("@beep/knowledge-server/EmbeddingProvider");

/**
 * Mock EmbeddingProvider for testing
 *
 * Returns zero vectors - useful for testing pipeline structure.
 *
 * @since 0.1.0
 * @category testing
 */
export const MockEmbeddingProvider: EmbeddingProvider = {
  config: {
    model: "mock-embedding-model",
    dimensions: 768,
    provider: "mock",
  },

  embed: (_text: string, _taskType: TaskType) =>
    Effect.succeed({
      vector: new Array(768).fill(0) as ReadonlyArray<number>,
      model: "mock-embedding-model",
      usage: { totalTokens: 0 },
    }),

  embedBatch: (texts: ReadonlyArray<string>, _taskType: TaskType) =>
    Effect.succeed(
      texts.map(() => ({
        vector: new Array(768).fill(0) as ReadonlyArray<number>,
        model: "mock-embedding-model",
        usage: { totalTokens: 0 },
      }))
    ),
};

/**
 * Layer providing MockEmbeddingProvider
 *
 * @since 0.1.0
 * @category layers
 */
export const MockEmbeddingProviderLayer = Layer.succeed(EmbeddingProvider, MockEmbeddingProvider);
