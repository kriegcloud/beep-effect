/**
 * OpenAiProvider - OpenAI embedding provider
 *
 * Uses OpenAI's text-embedding-3-small model with configurable dimensions.
 *
 * @module knowledge-server/Embedding/providers/OpenAiProvider
 * @since 0.1.0
 */
import * as Config from "effect/Config";
import * as Context from "effect/Context";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import * as A from "effect/Array";
import * as Str from "effect/String";
import { pipe } from "effect/Function";
import {
  EmbeddingProvider,
  EmbeddingError,
  type EmbeddingConfig,
  type EmbeddingResult,
  type TaskType,
} from "../EmbeddingProvider";

// =============================================================================
// OpenAI Client Types (minimal interface for our needs)
// =============================================================================

/**
 * Minimal OpenAI embeddings response type
 */
interface OpenAiEmbeddingsResponse {
  data: ReadonlyArray<{
    embedding: ReadonlyArray<number>;
    index: number;
  }>;
  model: string;
  usage: {
    prompt_tokens: number;
    total_tokens: number;
  };
}

/**
 * OpenAI client interface
 */
interface OpenAiClient {
  readonly embeddings: {
    create: (params: {
      model: string;
      input: string | ReadonlyArray<string>;
      dimensions?: number;
    }) => Promise<OpenAiEmbeddingsResponse>;
  };
}

// =============================================================================
// Configuration
// =============================================================================

/**
 * OpenAI provider configuration options
 *
 * @since 0.1.0
 * @category configuration
 */
export interface OpenAiProviderOptions {
  /**
   * OpenAI API key
   */
  readonly apiKey: string;

  /**
   * Model to use for embeddings
   * @default "text-embedding-3-small"
   */
  readonly model?: string;

  /**
   * Output dimensions (text-embedding-3-small supports up to 1536)
   * @default 768
   */
  readonly dimensions?: number;

  /**
   * Base URL for OpenAI API (for proxies or Azure)
   */
  readonly baseUrl?: string;

  /**
   * Maximum batch size for embedBatch
   * @default 100
   */
  readonly maxBatchSize?: number;
}

/**
 * Default OpenAI embedding model
 */
const DEFAULT_MODEL = "text-embedding-3-small";

/**
 * Default dimensions (matches our pgvector column)
 */
const DEFAULT_DIMENSIONS = 768;

/**
 * Maximum batch size per API call
 */
const DEFAULT_MAX_BATCH_SIZE = 100;

// =============================================================================
// OpenAI Client Service
// =============================================================================

/**
 * OpenAI client tag for dependency injection
 *
 * @since 0.1.0
 * @category context
 */
export interface OpenAiClientService {
  readonly client: OpenAiClient;
}

export const OpenAiClientService = Context.GenericTag<OpenAiClientService>(
  "@beep/knowledge-server/OpenAiClientService"
);

/**
 * Create OpenAI client from options
 */
const createOpenAiClient = (options: OpenAiProviderOptions): Effect.Effect<OpenAiClient, EmbeddingError> =>
  Effect.gen(function* () {
    // Dynamic import to avoid bundling issues when openai is not installed
    const { default: OpenAI } = yield* Effect.tryPromise({
      try: () => import("openai"),
      catch: (error) =>
        new EmbeddingError({
          message: `Failed to load OpenAI SDK: ${String(error)}`,
          provider: "openai",
          retryable: false,
        }),
    });

    return new OpenAI({
      apiKey: options.apiKey,
      ...(options.baseUrl && { baseURL: options.baseUrl }),
    });
  });

// =============================================================================
// Provider Implementation
// =============================================================================

/**
 * Create OpenAI provider from options
 *
 * @since 0.1.0
 * @category constructors
 */
export const makeOpenAiProvider = (options: OpenAiProviderOptions): Effect.Effect<EmbeddingProvider, EmbeddingError> =>
  Effect.gen(function* () {
    const client = yield* createOpenAiClient(options);

    const model = options.model ?? DEFAULT_MODEL;
    const dimensions = options.dimensions ?? DEFAULT_DIMENSIONS;
    const maxBatchSize = options.maxBatchSize ?? DEFAULT_MAX_BATCH_SIZE;

    const config: EmbeddingConfig = {
      model,
      dimensions,
      provider: "openai",
    };

    /**
     * Prepare text for embedding (add task type prefix for asymmetric search)
     */
    const prepareText = (text: string, taskType: TaskType): string => {
      // OpenAI doesn't require prefixes like Nomic, but we trim and normalize
      const normalized = pipe(text, Str.trim);
      // Return as-is for OpenAI (model handles both query and document)
      return taskType === "search_query" ? normalized : normalized;
    };

    /**
     * Call OpenAI embeddings API
     */
    const callApi = (
      input: string | ReadonlyArray<string>
    ): Effect.Effect<OpenAiEmbeddingsResponse, EmbeddingError> =>
      Effect.tryPromise({
        try: () =>
          client.embeddings.create({
            model,
            input,
            dimensions,
          }),
        catch: (error) => {
          const message = error instanceof Error ? error.message : String(error);
          const isRateLimit = message.includes("rate_limit") || message.includes("429");
          const isTimeout = message.includes("timeout") || message.includes("ETIMEDOUT");

          return new EmbeddingError({
            message: `OpenAI API error: ${message}`,
            provider: "openai",
            retryable: isRateLimit || isTimeout,
            cause: String(error),
          });
        },
      });

    const embed = (text: string, taskType: TaskType): Effect.Effect<EmbeddingResult, EmbeddingError> =>
      Effect.gen(function* () {
        const preparedText = prepareText(text, taskType);

        yield* Effect.logDebug("OpenAiProvider.embed", {
          textLength: preparedText.length,
          taskType,
        });

        const response = yield* callApi(preparedText);
        const firstEmbedding = response.data[0];

        if (!firstEmbedding) {
          return yield* Effect.fail(
            new EmbeddingError({
              message: "OpenAI returned empty embedding response",
              provider: "openai",
              retryable: false,
            })
          );
        }

        return {
          vector: firstEmbedding.embedding,
          model: response.model,
          usage: {
            totalTokens: response.usage.total_tokens,
          },
        };
      });

    const embedBatch = (
      texts: ReadonlyArray<string>,
      taskType: TaskType
    ): Effect.Effect<ReadonlyArray<EmbeddingResult>, EmbeddingError> =>
      Effect.gen(function* () {
        if (texts.length === 0) {
          return [];
        }

        yield* Effect.logDebug("OpenAiProvider.embedBatch", {
          count: texts.length,
          taskType,
        });

        const preparedTexts = A.map(texts, (text) => prepareText(text, taskType));

        // Process in batches if needed
        const batches = A.chunksOf(preparedTexts, maxBatchSize);
        const results: EmbeddingResult[] = [];

        for (const batch of batches) {
          const response = yield* callApi(batch);

          // Sort by index to maintain order
          const sortedData = pipe(
            response.data,
            A.sortBy((a, b) => a.index - b.index)
          );

          for (const item of sortedData) {
            results.push({
              vector: item.embedding,
              model: response.model,
              usage: {
                totalTokens: Math.floor(response.usage.total_tokens / batch.length),
              },
            });
          }
        }

        return results;
      });

    return {
      config,
      embed,
      embedBatch,
    };
  });

// =============================================================================
// Layers
// =============================================================================

/**
 * Create OpenAiProvider layer from options
 *
 * @since 0.1.0
 * @category layers
 */
export const OpenAiProviderLayer = (options: OpenAiProviderOptions): Layer.Layer<EmbeddingProvider, EmbeddingError> =>
  Layer.effect(EmbeddingProvider, makeOpenAiProvider(options));

/**
 * Create OpenAiProvider layer from environment config
 *
 * Reads OPENAI_API_KEY from environment.
 *
 * @since 0.1.0
 * @category layers
 */
export const OpenAiProviderLayerFromEnv: Layer.Layer<EmbeddingProvider, EmbeddingError> = Layer.effect(
  EmbeddingProvider,
  Effect.gen(function* () {
    const apiKey = yield* Config.string("OPENAI_API_KEY").pipe(
      Effect.mapError(
        (error) =>
          new EmbeddingError({
            message: `Missing OPENAI_API_KEY: ${String(error)}`,
            provider: "openai",
            retryable: false,
          })
      )
    );

    // Optional config values
    const model = yield* Config.string("OPENAI_EMBEDDING_MODEL").pipe(
      Config.withDefault(DEFAULT_MODEL),
      Effect.mapError(
        (error) =>
          new EmbeddingError({
            message: `Invalid OPENAI_EMBEDDING_MODEL: ${String(error)}`,
            provider: "openai",
            retryable: false,
          })
      )
    );

    const dimensions = yield* Config.integer("OPENAI_EMBEDDING_DIMENSIONS").pipe(
      Config.withDefault(DEFAULT_DIMENSIONS),
      Effect.mapError(
        (error) =>
          new EmbeddingError({
            message: `Invalid OPENAI_EMBEDDING_DIMENSIONS: ${String(error)}`,
            provider: "openai",
            retryable: false,
          })
      )
    );

    return yield* makeOpenAiProvider({
      apiKey,
      model,
      dimensions,
    });
  })
);
