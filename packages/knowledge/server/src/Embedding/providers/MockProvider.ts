/**
 * MockProvider - Mock embedding provider for testing
 *
 * Returns deterministic zero vectors for testing pipeline structure
 * without requiring API calls.
 *
 * @module knowledge-server/Embedding/providers/MockProvider
 * @since 0.1.0
 */

import * as A from "effect/Array";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import { type EmbeddingConfig, EmbeddingProvider, type EmbeddingResult, type TaskType } from "../EmbeddingProvider";

/**
 * Mock embedding configuration
 *
 * @since 0.1.0
 * @category configuration
 */
export const MockConfig: EmbeddingConfig = {
  model: "mock-embedding-model",
  dimensions: 768,
  provider: "mock",
};

/**
 * Create a zero vector of specified dimensions
 */
const createZeroVector = (dimensions: number): ReadonlyArray<number> =>
  A.replicate(0, dimensions) as ReadonlyArray<number>;

/**
 * Create a deterministic mock vector based on text hash
 *
 * Uses a simple hash to generate reproducible vectors for testing
 * entity similarity without relying on real embeddings.
 */
const createDeterministicVector = (text: string, dimensions: number): ReadonlyArray<number> => {
  // Simple hash function for deterministic output
  let hash = 0;
  for (let i = 0; i < text.length; i++) {
    const char = text.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32-bit integer
  }

  // Generate vector from hash
  const vector: number[] = [];
  for (let i = 0; i < dimensions; i++) {
    // Use hash + index to generate each dimension
    const seed = hash + i * 7919; // Prime number for better distribution
    // Normalize to [-1, 1] range like real embeddings
    const value = ((seed % 1000) / 500 - 1) * 0.1;
    vector.push(value);
  }

  return vector;
};

/**
 * MockProvider configuration options
 *
 * @since 0.1.0
 * @category configuration
 */
export interface MockProviderOptions {
  /**
   * Use deterministic vectors based on text hash (for testing similarity)
   * @default false
   */
  readonly deterministic?: boolean;

  /**
   * Custom dimensions (default 768)
   */
  readonly dimensions?: number;
}

/**
 * Create a MockProvider with custom options
 *
 * @since 0.1.0
 * @category constructors
 */
export const makeMockProvider = (options: MockProviderOptions = {}): EmbeddingProvider => {
  const dimensions = options.dimensions ?? 768;
  const deterministic = options.deterministic ?? false;

  const createVector = (text: string): ReadonlyArray<number> =>
    deterministic ? createDeterministicVector(text, dimensions) : createZeroVector(dimensions);

  return {
    config: {
      model: "mock-embedding-model",
      dimensions,
      provider: "mock",
    },

    embed: Effect.fnUntraced(function* (text: string, _taskType: TaskType) {
      yield* Effect.logDebug("MockProvider.embed", { textLength: text.length });
      return {
        vector: createVector(text),
        model: "mock-embedding-model",
        usage: { totalTokens: Math.ceil(text.length / 4) },
      } as EmbeddingResult;
    }),

    embedBatch: Effect.fnUntraced(function* (texts: ReadonlyArray<string>, _taskType: TaskType) {
      yield* Effect.logDebug("MockProvider.embedBatch", { count: texts.length });
      return A.map(texts, (text) => ({
        vector: createVector(text),
        model: "mock-embedding-model",
        usage: { totalTokens: Math.ceil(text.length / 4) },
      })) as ReadonlyArray<EmbeddingResult>;
    }),
  };
};

/**
 * Default MockProvider (zero vectors)
 *
 * @since 0.1.0
 * @category instances
 */
export const MockProviderInstance = makeMockProvider();

/**
 * Deterministic MockProvider (hash-based vectors)
 *
 * Useful for testing similarity computations.
 *
 * @since 0.1.0
 * @category instances
 */
export const DeterministicMockProvider = makeMockProvider({ deterministic: true });

/**
 * Layer providing MockProvider
 *
 * @since 0.1.0
 * @category layers
 */
export const MockProviderLayer = Layer.succeed(EmbeddingProvider, MockProviderInstance);

/**
 * Layer providing DeterministicMockProvider
 *
 * @since 0.1.0
 * @category layers
 */
export const DeterministicMockProviderLayer = Layer.succeed(EmbeddingProvider, DeterministicMockProvider);
