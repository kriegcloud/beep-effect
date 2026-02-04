/**
 * Mock Embedding Provider Fixtures
 *
 * Deterministic embedding providers for testing.
 * Uses simple math functions to generate predictable vectors.
 *
 * @module test/fixtures/MockEmbeddingProvider
 */

import { Effect, Layer } from "effect"
import {
  cosineSimilarity,
  EmbeddingProvider,
  type Embedding,
  type EmbeddingProviderMethods,
  type EmbeddingRequest,
  type ProviderMetadata
} from "../../src/Service/EmbeddingProvider.js"

/**
 * Options for creating a mock embedding provider
 */
export interface MockEmbeddingProviderOptions {
  /**
   * Embedding dimension (default: 768)
   */
  readonly dimension?: number

  /**
   * Provider ID for metadata (default: "nomic")
   */
  readonly providerId?: ProviderMetadata["providerId"]

  /**
   * Model ID for metadata (default: "mock-embed-v1")
   */
  readonly modelId?: string

  /**
   * Custom embedding function (default: deterministic sine-based)
   *
   * @param text - Input text
   * @param dimension - Target dimension
   * @returns Embedding vector
   */
  readonly embedFn?: (text: string, dimension: number) => Embedding
}

/**
 * Default deterministic embedding function
 *
 * Uses text length and character codes to generate predictable vectors.
 * Same text always produces same embedding.
 */
const defaultEmbedFn = (text: string, dimension: number): Embedding => {
  const seed = text.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0)
  return Array.from({ length: dimension }, (_, i) => Math.sin(seed + i * 0.1) * 0.5)
}

/**
 * Create a mock embedding provider with custom options
 *
 * @example
 * ```typescript
 * // Basic usage
 * const MockProvider = makeMockEmbeddingProvider()
 *
 * // Custom dimension
 * const SmallProvider = makeMockEmbeddingProvider({ dimension: 5 })
 *
 * // Custom embedding function
 * const CustomProvider = makeMockEmbeddingProvider({
 *   embedFn: (text, dim) => Array(dim).fill(text.length / 100)
 * })
 * ```
 */
export const makeMockEmbeddingProvider = (
  options: MockEmbeddingProviderOptions = {}
): Layer.Layer<EmbeddingProvider> => {
  const {
    dimension = 768,
    providerId = "nomic",
    modelId = "mock-embed-v1",
    embedFn = defaultEmbedFn
  } = options

  const provider: EmbeddingProviderMethods = {
    metadata: {
      providerId,
      modelId,
      dimension
    },

    embedBatch: (requests: ReadonlyArray<EmbeddingRequest>) =>
      Effect.succeed(requests.map((req) => embedFn(req.text, dimension))),

    cosineSimilarity
  }

  return Layer.succeed(EmbeddingProvider, provider)
}

/**
 * Standard 768-dimension mock embedding provider
 *
 * Use for most tests that need embedding functionality.
 */
export const MockEmbeddingProvider768 = makeMockEmbeddingProvider({ dimension: 768 })

/**
 * Small 5-dimension mock embedding provider
 *
 * Use for tests that need fast/minimal embeddings.
 */
export const MockEmbeddingProvider5 = makeMockEmbeddingProvider({ dimension: 5 })

/**
 * Create embeddings directly (for assertions)
 *
 * @example
 * ```typescript
 * const embedding = mockEmbed("hello world")
 * expect(embedding).toHaveLength(768)
 * ```
 */
export const mockEmbed = (text: string, dimension = 768): Embedding => defaultEmbedFn(text, dimension)
