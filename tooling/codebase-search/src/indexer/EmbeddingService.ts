/**
 * Embedding service for generating vector embeddings from text using the
 * Nomic CodeRankEmbed model via `@huggingface/transformers`.
 *
 * Provides both single and batch embedding operations, wrapping the ONNX
 * feature-extraction pipeline in an Effect-based service interface.
 *
 * @since 0.0.0
 * @module
 */
import { Effect, Layer } from "effect";
import * as A from "effect/Array";
import * as ServiceMap from "effect/ServiceMap";
import { EmbeddingModelError } from "../errors.js";

/**
 * The dimensionality of vectors produced by the Nomic CodeRankEmbed model.
 *
 * @since 0.0.0
 * @category constants
 */
export const EMBEDDING_DIMENSIONS = 768;

/**
 * Default number of texts to process in a single batch during batch embedding.
 *
 * @since 0.0.0
 * @category constants
 */
export const DEFAULT_BATCH_SIZE = 32;

/**
 * The model identifier used for loading the Nomic CodeRankEmbed model.
 *
 * @since 0.0.0
 * @category constants
 */
const MODEL_NAME = "nomic-ai/CodeRankEmbed" as const;

/**
 * Shape of the EmbeddingService interface.
 *
 * @since 0.0.0
 * @category models
 */
export interface EmbeddingServiceShape {
  /**
   * Generate a vector embedding for a single text string.
   *
   * @since 0.0.0
   */
  readonly embed: (text: string) => Effect.Effect<Float32Array, EmbeddingModelError>;
  /**
   * Generate vector embeddings for a batch of text strings.
   * Processes in chunks of `DEFAULT_BATCH_SIZE` to manage memory.
   *
   * @since 0.0.0
   */
  readonly embedBatch: (
    texts: ReadonlyArray<string>
  ) => Effect.Effect<ReadonlyArray<Float32Array>, EmbeddingModelError>;
}

/**
 * Service tag for `EmbeddingService`.
 *
 * Provides vector embedding generation for text using the Nomic CodeRankEmbed ONNX model.
 *
 * @since 0.0.0
 * @category services
 */
export class EmbeddingService extends ServiceMap.Service<EmbeddingService, EmbeddingServiceShape>()(
  "@beep/codebase-search/indexer/EmbeddingService"
) {}

/**
 * Live layer for `EmbeddingService` that loads the Nomic CodeRankEmbed ONNX model
 * and provides real embedding generation via `@huggingface/transformers`.
 *
 * The model is loaded once during layer construction and reused for all
 * subsequent embedding requests. Model loading and inference errors are
 * wrapped in `EmbeddingModelError`.
 *
 * @since 0.0.0
 * @category layers
 */
export const EmbeddingServiceLive: Layer.Layer<EmbeddingService, EmbeddingModelError> = Layer.effect(
  EmbeddingService,
  Effect.gen(function* () {
    const extractor = yield* Effect.tryPromise({
      try: async () => {
        const { pipeline } = await import("@huggingface/transformers");
        return await pipeline("feature-extraction", MODEL_NAME, {
          quantized: true,
        } as Record<string, unknown>);
      },
      catch: (error) =>
        new EmbeddingModelError({
          message: `Failed to load embedding model: ${String(error)}`,
          modelName: MODEL_NAME,
        }),
    });

    const embed: EmbeddingServiceShape["embed"] = Effect.fn("EmbeddingService.embed")(function* (text) {
      return yield* Effect.tryPromise({
        try: async () => {
          const output = await extractor(text, {
            pooling: "mean",
            normalize: true,
          });
          return new Float32Array(output.data as Float32Array);
        },
        catch: (error) =>
          new EmbeddingModelError({
            message: `Embedding inference failed: ${String(error)}`,
            modelName: MODEL_NAME,
          }),
      });
    });

    const splitFlatVectors = (flatData: Float32Array, count: number): ReadonlyArray<Float32Array> => {
      const vectors = A.empty<Float32Array>();
      for (let i = 0; i < count; i++) {
        const start = i * EMBEDDING_DIMENSIONS;
        const end = start + EMBEDDING_DIMENSIONS;
        vectors.push(flatData.slice(start, end));
      }
      return vectors;
    };

    const embedBatch: EmbeddingServiceShape["embedBatch"] = (texts) => {
      if (A.isReadonlyArrayEmpty(texts)) {
        return Effect.succeed(A.empty<Float32Array>());
      }

      return Effect.gen(function* () {
        const chunks = A.chunksOf(texts, DEFAULT_BATCH_SIZE);
        const chunkResults = yield* Effect.forEach(chunks, (chunk) =>
          Effect.tryPromise({
            try: async () => {
              const output = await extractor(chunk as unknown as string[], {
                pooling: "mean",
                normalize: true,
              });
              const flatData = new Float32Array(output.data as Float32Array);
              return splitFlatVectors(flatData, A.length(chunk));
            },
            catch: (error) =>
              new EmbeddingModelError({
                message: `Batch embedding inference failed: ${String(error)}`,
                modelName: MODEL_NAME,
              }),
          })
        );

        return A.flatten(chunkResults);
      });
    };

    return EmbeddingService.of({
      embed,
      embedBatch,
    });
  })
);

/**
 * Generate a deterministic Float32Array of the given length from a seed string.
 * Uses a simple hash-based approach to produce reproducible vectors.
 *
 * @since 0.0.0
 * @category internal
 */
const deterministicVector = (seed: string, length: number): Float32Array => {
  const vector = new Float32Array(length);
  // Simple deterministic hash seeding using djb2-like algorithm
  let hash = 5381;
  for (let i = 0; i < seed.length; i++) {
    const char = seed.charCodeAt(i);
    hash = ((hash << 5) + hash + char) | 0;
  }
  for (let i = 0; i < length; i++) {
    // Generate pseudo-random values from the hash using Murmur-like mixing
    hash = ((hash << 13) ^ hash) | 0;
    hash = (hash * 0x5bd1e995) | 0;
    hash = ((hash >> 15) ^ hash) | 0;
    // Normalize to roughly [-1, 1] range
    vector[i] = (hash & 0xffff) / 32768.0 - 1.0;
  }
  return vector;
};

/**
 * Mock layer for `EmbeddingService` that produces deterministic embeddings
 * without downloading or running any model. Suitable for unit tests.
 *
 * Same input always produces the same 768-dimensional vector. Different inputs
 * produce different vectors.
 *
 * @since 0.0.0
 * @category layers
 */
export const EmbeddingServiceMock: Layer.Layer<EmbeddingService> = Layer.succeed(
  EmbeddingService,
  EmbeddingService.of({
    embed: (text) => Effect.succeed(deterministicVector(text, EMBEDDING_DIMENSIONS)),
    embedBatch: (texts) => {
      if (A.isReadonlyArrayEmpty(texts)) {
        return Effect.succeed(A.empty<Float32Array>());
      }
      return Effect.succeed(A.map(texts, (text) => deterministicVector(text, EMBEDDING_DIMENSIONS)));
    },
  })
);
