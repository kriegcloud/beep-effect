/**
 * MockProvider - Mock embedding provider for testing
 *
 * Returns deterministic zero vectors or hash-based vectors for testing
 * pipeline structure without requiring API calls.
 *
 * Implements @effect/ai EmbeddingModel.Service interface.
 *
 * @module knowledge-server/Embedding/providers/MockProvider
 * @since 0.1.0
 */
import * as EmbeddingModel from "@effect/ai/EmbeddingModel";
import * as A from "effect/Array";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";

// =============================================================================
// Constants
// =============================================================================

/**
 * Default mock embedding dimensions
 */
const MOCK_DIMENSIONS = 768;

// =============================================================================
// Vector Generation
// =============================================================================

/**
 * Create a zero vector of specified dimensions
 */
const createZeroVector = (dimensions: number): Array<number> => A.replicate(0, dimensions);

/**
 * Create a deterministic mock vector based on text hash
 *
 * Uses a simple hash to generate reproducible vectors for testing
 * entity similarity without relying on real embeddings.
 */
const createDeterministicVector = (text: string, dimensions: number): Array<number> => {
  // Simple hash function for deterministic output
  let hash = 0;
  for (let i = 0; i < text.length; i++) {
    const char = text.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32-bit integer
  }

  // Generate vector from hash
  const vector = A.empty<number>();
  for (let i = 0; i < dimensions; i++) {
    // Use hash + index to generate each dimension
    const seed = hash + i * 7919; // Prime number for better distribution
    // Normalize to [-1, 1] range like real embeddings
    const value = ((seed % 1000) / 500 - 1) * 0.1;
    vector.push(value);
  }

  return vector;
};

// =============================================================================
// Configuration
// =============================================================================

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
  readonly deterministic?: undefined | boolean;

  /**
   * Custom dimensions (default 768)
   */
  readonly dimensions?: undefined | number;
}

// =============================================================================
// Service Implementation
// =============================================================================

/**
 * Create a mock EmbeddingModel.Service with custom options
 *
 * @param options - Optional configuration
 * @returns EmbeddingModel.Service implementation
 *
 * @since 0.1.0
 * @category constructors
 */
export const makeMockService = (options: MockProviderOptions = {}): EmbeddingModel.Service => {
  const dimensions = options.dimensions ?? MOCK_DIMENSIONS;
  const deterministic = options.deterministic ?? false;

  const createVector = (text: string): Array<number> =>
    deterministic ? createDeterministicVector(text, dimensions) : createZeroVector(dimensions);

  return {
    embed: (input: string) =>
      Effect.gen(function* () {
        yield* Effect.logDebug("MockEmbeddingModel.embed", { textLength: input.length });
        return createVector(input);
      }),

    embedMany: (inputs: ReadonlyArray<string>) =>
      Effect.gen(function* () {
        yield* Effect.logDebug("MockEmbeddingModel.embedMany", { count: inputs.length });
        return A.map(inputs, createVector);
      }),
  };
};

// =============================================================================
// Layers
// =============================================================================

/**
 * Layer providing mock EmbeddingModel for tests
 *
 * Returns zero vectors - useful for testing pipeline structure.
 *
 * @example
 * ```ts
 * import { EmbeddingServiceLive, MockEmbeddingModelLayer } from "@beep/knowledge-server/Embedding";
 * import { layer } from "@beep/testkit";
 * import * as Layer from "effect/Layer";
 *
 * const TestLayer = EmbeddingServiceLive.pipe(
 *   Layer.provide(MockEmbeddingModelLayer)
 * );
 *
 * layer(TestLayer)("EmbeddingService", (it) => {
 *   it.effect("embeds text", () => ...);
 * });
 * ```
 *
 * @since 0.1.0
 * @category layers
 */
export const MockEmbeddingModelLayer: Layer.Layer<EmbeddingModel.EmbeddingModel> = Layer.succeed(
  EmbeddingModel.EmbeddingModel,
  makeMockService()
);

/**
 * Layer providing deterministic mock EmbeddingModel for tests
 *
 * Returns hash-based vectors - useful for testing similarity computations.
 *
 * @since 0.1.0
 * @category layers
 */
export const DeterministicMockEmbeddingModelLayer: Layer.Layer<EmbeddingModel.EmbeddingModel> = Layer.succeed(
  EmbeddingModel.EmbeddingModel,
  makeMockService({ deterministic: true })
);

/**
 * Create a mock EmbeddingModel layer with custom options
 *
 * @param options - Configuration options
 * @returns Layer providing EmbeddingModel.EmbeddingModel
 *
 * @since 0.1.0
 * @category constructors
 */
export const makeMockEmbeddingModelLayer = (options: MockProviderOptions): Layer.Layer<EmbeddingModel.EmbeddingModel> =>
  Layer.succeed(EmbeddingModel.EmbeddingModel, makeMockService(options));

// =============================================================================
// Deprecated Exports (backward compatibility)
// =============================================================================

/**
 * Mock embedding configuration (deprecated)
 *
 * @deprecated Use MockEmbeddingModelLayer instead
 * @since 0.1.0
 * @category configuration
 */
export const MockConfig = {
  model: "mock-embedding-model",
  dimensions: MOCK_DIMENSIONS,
  provider: "mock",
};
