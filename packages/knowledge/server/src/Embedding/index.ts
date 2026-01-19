/**
 * Embedding module - Embedding generation and similarity search
 *
 * Provides embedding generation, caching, and similarity search
 * for knowledge graph entities.
 *
 * @module knowledge-server/Embedding
 * @since 0.1.0
 */

// Provider interface and types
export {
  type EmbeddingConfig,
  EmbeddingError,
  EmbeddingProvider,
  type EmbeddingResult,
  MockEmbeddingProvider,
  MockEmbeddingProviderLayer,
  type TaskType,
} from "./EmbeddingProvider";
// Service
export { EmbeddingService, EmbeddingServiceLive } from "./EmbeddingService";
// Provider implementations
export * from "./providers";
