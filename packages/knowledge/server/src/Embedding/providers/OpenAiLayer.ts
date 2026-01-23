/**
 * OpenAiLayer - OpenAI EmbeddingModel layer factory
 *
 * Provides preconfigured @effect/ai-openai EmbeddingModel layers for
 * production use with automatic batching and configurable dimensions.
 *
 * @module knowledge-server/Embedding/providers/OpenAiLayer
 * @since 0.1.0
 */
import type * as EmbeddingModel from "@effect/ai/EmbeddingModel";
import { OpenAiClient, OpenAiEmbeddingModel } from "@effect/ai-openai";
import { FetchHttpClient } from "@effect/platform";
import * as Config from "effect/Config";
import type { ConfigError } from "effect/ConfigError";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import * as Redacted from "effect/Redacted";

// =============================================================================
// Constants
// =============================================================================

/**
 * Default OpenAI embedding model
 */
const DEFAULT_MODEL = "text-embedding-3-small";

/**
 * Default embedding dimensions (matches pgvector column)
 */
const DEFAULT_DIMENSIONS = 768;

// =============================================================================
// Types
// =============================================================================

/**
 * Configuration options for OpenAI embedding layer
 *
 * @since 0.1.0
 * @category configuration
 */
export interface OpenAiEmbeddingConfig {
  /**
   * Model to use for embeddings
   * @default "text-embedding-3-small"
   */
  readonly model?: undefined | string;

  /**
   * Output dimensions (text-embedding-3-small supports up to 1536)
   * @default 768
   */
  readonly dimensions?: undefined | number;

  /**
   * Maximum batch size for embedding requests
   * @default 2048
   */
  readonly maxBatchSize?: undefined | number;
}

// =============================================================================
// Layer Factories
// =============================================================================

/**
 * Create OpenAI EmbeddingModel layer with explicit options
 *
 * This is the core layer factory that wraps @effect/ai-openai's
 * OpenAiEmbeddingModel.layerBatched with our defaults.
 *
 * @param options - Optional configuration overrides
 * @returns Layer providing EmbeddingModel.EmbeddingModel, requiring OpenAiClient.OpenAiClient
 *
 * @since 0.1.0
 * @category constructors
 */
export const makeOpenAiEmbeddingLayer = (
  options?: OpenAiEmbeddingConfig
): Layer.Layer<EmbeddingModel.EmbeddingModel, never, OpenAiClient.OpenAiClient> => {
  const config: OpenAiEmbeddingModel.Config.Batched = {
    dimensions: options?.dimensions ?? DEFAULT_DIMENSIONS,
  };
  if (options?.maxBatchSize !== undefined) {
    (config as { maxBatchSize?: number }).maxBatchSize = options.maxBatchSize;
  }
  return OpenAiEmbeddingModel.layerBatched({
    model: options?.model ?? DEFAULT_MODEL,
    config,
  });
};

/**
 * OpenAI EmbeddingModel layer reading configuration from Effect Config
 *
 * Reads the following config values:
 * - OPENAI_API_KEY (required, redacted)
 * - OPENAI_EMBEDDING_MODEL (optional, defaults to "text-embedding-3-small")
 * - OPENAI_EMBEDDING_DIMENSIONS (optional, defaults to 768)
 *
 * @example
 * ```ts
 * import { EmbeddingServiceLive, OpenAiEmbeddingLayerConfig } from "@beep/knowledge-server/Embedding";
 * import * as Layer from "effect/Layer";
 *
 * const KnowledgeLive = EmbeddingServiceLive.pipe(
 *   Layer.provide(OpenAiEmbeddingLayerConfig)
 * );
 * ```
 *
 * @since 0.1.0
 * @category layers
 */
export const OpenAiEmbeddingLayerConfig: Layer.Layer<EmbeddingModel.EmbeddingModel, ConfigError> = Layer.unwrapEffect(
  Effect.gen(function* () {
    const apiKey = yield* Config.redacted("OPENAI_API_KEY");
    const model = yield* Config.string("OPENAI_EMBEDDING_MODEL").pipe(Config.withDefault(DEFAULT_MODEL));
    const dimensions = yield* Config.integer("OPENAI_EMBEDDING_DIMENSIONS").pipe(
      Config.withDefault(DEFAULT_DIMENSIONS)
    );

    return makeOpenAiEmbeddingLayer({ model, dimensions }).pipe(
      Layer.provide(OpenAiClient.layer({ apiKey })),
      Layer.provide(FetchHttpClient.layer)
    );
  })
);

/**
 * OpenAI EmbeddingModel layer with explicit API key
 *
 * Use this when you have the API key available at layer construction time.
 *
 * @example
 * ```ts
 * import { EmbeddingServiceLive, OpenAiEmbeddingLayer } from "@beep/knowledge-server/Embedding";
 * import * as Layer from "effect/Layer";
 *
 * const KnowledgeLive = EmbeddingServiceLive.pipe(
 *   Layer.provide(OpenAiEmbeddingLayer("sk-...", { dimensions: 768 }))
 * );
 * ```
 *
 * @param apiKey - OpenAI API key (plain string, will be converted to Redacted)
 * @param options - Optional configuration overrides
 * @returns Fully composed layer providing EmbeddingModel.EmbeddingModel
 *
 * @since 0.1.0
 * @category layers
 */
export const OpenAiEmbeddingLayer = (
  apiKey: string,
  options?: OpenAiEmbeddingConfig
): Layer.Layer<EmbeddingModel.EmbeddingModel> =>
  makeOpenAiEmbeddingLayer(options).pipe(
    Layer.provide(
      OpenAiClient.layer({
        apiKey: Redacted.make(apiKey),
      })
    ),
    Layer.provide(FetchHttpClient.layer)
  );
