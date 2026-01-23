/**
 * Embedding module - Embedding generation and similarity search
 *
 * Provides embedding generation using @effect/ai EmbeddingModel,
 * caching via pgvector, and similarity search for knowledge graph entities.
 *
 * @module knowledge-server/Embedding
 * @since 0.1.0
 */

// Types and errors
export { type EmbeddingConfig, EmbeddingError, type TaskType } from "./EmbeddingProvider";

// Service
export { EmbeddingService, EmbeddingServiceLive } from "./EmbeddingService";
// Provider implementations (@effect/ai-based layers)
export {
  DeterministicMockEmbeddingModelLayer,
  MockEmbeddingModelLayer,
  makeMockEmbeddingModelLayer,
  makeOpenAiEmbeddingLayer,
  type OpenAiEmbeddingConfig,
  OpenAiEmbeddingLayer,
  OpenAiEmbeddingLayerConfig,
} from "./providers";
