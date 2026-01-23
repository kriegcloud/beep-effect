/**
 * Embedding providers - @effect/ai-based provider implementations
 *
 * @module knowledge-server/Embedding/providers
 * @since 0.1.0
 */

// Mock provider for testing
export {
  DeterministicMockEmbeddingModelLayer,
  MockConfig,
  MockEmbeddingModelLayer,
  type MockProviderOptions,
  makeMockEmbeddingModelLayer,
  makeMockService,
} from "./MockProvider";

// OpenAI provider for production
export {
  makeOpenAiEmbeddingLayer,
  type OpenAiEmbeddingConfig,
  OpenAiEmbeddingLayer,
  OpenAiEmbeddingLayerConfig,
} from "./OpenAiLayer";
