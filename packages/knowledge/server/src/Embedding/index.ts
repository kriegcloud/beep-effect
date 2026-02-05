export { type EmbeddingConfig, EmbeddingError, type TaskType } from "./EmbeddingProvider";

export { EmbeddingService, EmbeddingServiceLive } from "./EmbeddingService";

export {
  DeterministicMockEmbeddingModelLayer,
  MockEmbeddingModelLayer,
  makeMockEmbeddingModelLayer,
  makeOpenAiEmbeddingLayer,
  type OpenAiEmbeddingConfig,
  OpenAiEmbeddingLayer,
  OpenAiEmbeddingLayerConfig,
} from "./providers";
