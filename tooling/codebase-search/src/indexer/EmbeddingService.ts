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
const MODEL_OPTIONS = { quantized: true } as const;
const INFERENCE_OPTIONS = { pooling: "mean", normalize: true } as const;

type NumericTypedArray =
  | Int8Array
  | Uint8Array
  | Uint8ClampedArray
  | Int16Array
  | Uint16Array
  | Int32Array
  | Uint32Array
  | Float32Array
  | Float64Array;

const isNumericTypedArray = (value: unknown): value is NumericTypedArray =>
  value instanceof Int8Array ||
  value instanceof Uint8Array ||
  value instanceof Uint8ClampedArray ||
  value instanceof Int16Array ||
  value instanceof Uint16Array ||
  value instanceof Int32Array ||
  value instanceof Uint32Array ||
  value instanceof Float32Array ||
  value instanceof Float64Array;

const formatUnknownError = (error: unknown): string => (error instanceof Error ? error.message : String(error));

const toEmbeddingModelError =
  (context: string) =>
  (error: unknown): EmbeddingModelError =>
    error instanceof EmbeddingModelError
      ? error
      : new EmbeddingModelError({
          message: `${context}: ${formatUnknownError(error)}`,
          modelName: MODEL_NAME,
        });

const getFunctionProperty = (value: unknown, key: string): Function | null => {
  if (value === null || typeof value !== "object") {
    return null;
  }
  const candidate = Reflect.get(value, key);
  return typeof candidate === "function" ? candidate : null;
};

const readEmbeddingData = (output: unknown, expectedLength: number, context: string): Float32Array => {
  if (output === null || typeof output !== "object") {
    throw new EmbeddingModelError({
      message: `${context}: model output is not an object`,
      modelName: MODEL_NAME,
    });
  }

  const data = Reflect.get(output, "data");
  let vector: Float32Array;

  if (data instanceof Float32Array) {
    vector = data;
  } else if (isNumericTypedArray(data)) {
    vector = Float32Array.from(data);
  } else if (Array.isArray(data)) {
    if (!A.every(data, (value) => typeof value === "number" && Number.isFinite(value))) {
      throw new EmbeddingModelError({
        message: `${context}: model output contains non-numeric values`,
        modelName: MODEL_NAME,
      });
    }
    vector = Float32Array.from(data);
  } else {
    throw new EmbeddingModelError({
      message: `${context}: model output does not include numeric embedding data`,
      modelName: MODEL_NAME,
    });
  }

  if (vector.length !== expectedLength) {
    throw new EmbeddingModelError({
      message: `${context}: expected ${expectedLength} values, received ${vector.length}`,
      modelName: MODEL_NAME,
    });
  }

  return vector;
};

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
        const transformersModule: unknown = await import("@huggingface/transformers");
        const pipelineFn = getFunctionProperty(transformersModule, "pipeline");
        if (pipelineFn === null) {
          throw new Error("Transformers pipeline loader is unavailable");
        }
        const loaded = await Reflect.apply(pipelineFn, transformersModule, [
          "feature-extraction",
          MODEL_NAME,
          MODEL_OPTIONS,
        ]);
        if (typeof loaded !== "function") {
          throw new Error("Loaded embedding extractor is not callable");
        }
        return loaded;
      },
      catch: toEmbeddingModelError("Failed to load embedding model"),
    });

    const embed: EmbeddingServiceShape["embed"] = Effect.fn("EmbeddingService.embed")(function* (text) {
      return yield* Effect.tryPromise({
        try: async () => {
          const output: unknown = await Reflect.apply(extractor, undefined, [text, INFERENCE_OPTIONS]);
          return readEmbeddingData(output, EMBEDDING_DIMENSIONS, "Embedding inference failed");
        },
        catch: toEmbeddingModelError("Embedding inference failed"),
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
              const output: unknown = await Reflect.apply(extractor, undefined, [Array.from(chunk), INFERENCE_OPTIONS]);
              const flatData = readEmbeddingData(
                output,
                A.length(chunk) * EMBEDDING_DIMENSIONS,
                "Batch embedding inference failed"
              );
              return splitFlatVectors(flatData, A.length(chunk));
            },
            catch: toEmbeddingModelError("Batch embedding inference failed"),
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
 * @param seed seed parameter value.
 * @param length length parameter value.
 * @since 0.0.0
 * @category internal
 * @returns Returns the computed value.
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
