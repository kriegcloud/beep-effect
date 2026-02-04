/**
 * Tests for EmbeddingService batch embedding API
 *
 * @since 2.0.0
 * @module test/Service/Embedding.batch
 */

import { Effect, Layer } from "effect"
import { describe, expect, it } from "vitest"
import { EmbeddingService, EmbeddingServiceLive } from "../../src/Service/Embedding.js"
import { EmbeddingCache } from "../../src/Service/EmbeddingCache.js"
import { EmbeddingProvider, type EmbeddingProviderMethods } from "../../src/Service/EmbeddingProvider.js"
import { MetricsService } from "../../src/Telemetry/Metrics.js"

const mockEmbedding = [0.1, 0.2, 0.3, 0.4, 0.5]

// Enable request batching for all tests
const BatchingEnabled = Layer.mergeAll(
  Layer.setRequestBatching(true),
  Layer.setRequestCaching(true)
)

describe("EmbeddingService embedBatch", () => {
  it("batch embeds multiple texts efficiently", async () => {
    const batchCalls = { value: 0 }

    const MockEmbeddingProvider = Layer.succeed(
      EmbeddingProvider,
      {
        metadata: { providerId: "nomic", modelId: "test-model", dimension: 5 },
        embedBatch: (requests) => {
          batchCalls.value++
          return Effect.succeed(requests.map(() => mockEmbedding))
        },
        cosineSimilarity: (_a, _b) => 0.95
      } as EmbeddingProviderMethods
    )

    const TestLayer = EmbeddingServiceLive.pipe(
      Layer.provideMerge(MockEmbeddingProvider),
      Layer.provideMerge(EmbeddingCache.Default),
      Layer.provideMerge(MetricsService.Default),
      Layer.provideMerge(BatchingEnabled)
    )

    const result = await Effect.gen(function*() {
      const svc = yield* EmbeddingService
      return yield* svc.embedBatch(["text1", "text2", "text3"])
    }).pipe(Effect.provide(TestLayer), Effect.runPromise)

    expect(result).toHaveLength(3)
    expect(batchCalls.value).toBe(1) // Single batch call
  })

  it("uses cache for hits, batches misses", async () => {
    const batchCalls = { value: 0 }

    const MockEmbeddingProvider = Layer.succeed(
      EmbeddingProvider,
      {
        metadata: { providerId: "nomic", modelId: "test-model", dimension: 5 },
        embedBatch: (requests) => {
          batchCalls.value++
          return Effect.succeed(requests.map(() => mockEmbedding))
        },
        cosineSimilarity: (_a, _b) => 0.95
      } as EmbeddingProviderMethods
    )

    const TestLayer = EmbeddingServiceLive.pipe(
      Layer.provideMerge(MockEmbeddingProvider),
      Layer.provideMerge(EmbeddingCache.Default),
      Layer.provideMerge(MetricsService.Default),
      Layer.provideMerge(BatchingEnabled)
    )

    const result = await Effect.gen(function*() {
      const svc = yield* EmbeddingService

      // Pre-cache one text using individual embed
      yield* svc.embed("cached", "search_document")
      expect(batchCalls.value).toBe(1)

      // Batch with one cached, two uncached
      return yield* svc.embedBatch(["cached", "new1", "new2"])
    }).pipe(Effect.provide(TestLayer), Effect.runPromise)

    expect(result).toHaveLength(3)
    expect(batchCalls.value).toBe(2) // Two batch calls (initial + new texts)
  })

  it("maintains input order in output", async () => {
    // Create embeddings that are different for each text
    const textEmbeddings: Record<string, ReadonlyArray<number>> = {
      first: [1.0, 0.0, 0.0],
      second: [0.0, 1.0, 0.0],
      third: [0.0, 0.0, 1.0]
    }

    const MockEmbeddingProvider = Layer.succeed(
      EmbeddingProvider,
      {
        metadata: { providerId: "nomic", modelId: "test-model", dimension: 3 },
        embedBatch: (requests) => Effect.succeed(requests.map((r) => textEmbeddings[r.text] ?? mockEmbedding)),
        cosineSimilarity: (_a, _b) => 0.95
      } as EmbeddingProviderMethods
    )

    const TestLayer = EmbeddingServiceLive.pipe(
      Layer.provideMerge(MockEmbeddingProvider),
      Layer.provideMerge(EmbeddingCache.Default),
      Layer.provideMerge(MetricsService.Default),
      Layer.provideMerge(BatchingEnabled)
    )

    const result = await Effect.gen(function*() {
      const svc = yield* EmbeddingService
      return yield* svc.embedBatch(["first", "second", "third"])
    }).pipe(Effect.provide(TestLayer), Effect.runPromise)

    expect(result[0]).toEqual([1.0, 0.0, 0.0])
    expect(result[1]).toEqual([0.0, 1.0, 0.0])
    expect(result[2]).toEqual([0.0, 0.0, 1.0])
  })

  it("handles partial cache hits correctly", async () => {
    let batchedTexts: Array<string> = []

    const MockEmbeddingProvider = Layer.succeed(
      EmbeddingProvider,
      {
        metadata: { providerId: "nomic", modelId: "test-model", dimension: 3 },
        embedBatch: (requests) => {
          batchedTexts = [...batchedTexts, ...requests.map((r) => r.text)]
          return Effect.succeed(requests.map(() => [0.9, 0.9, 0.9]))
        },
        cosineSimilarity: (_a, _b) => 0.95
      } as EmbeddingProviderMethods
    )

    const TestLayer = EmbeddingServiceLive.pipe(
      Layer.provideMerge(MockEmbeddingProvider),
      Layer.provideMerge(EmbeddingCache.Default),
      Layer.provideMerge(MetricsService.Default),
      Layer.provideMerge(BatchingEnabled)
    )

    const result = await Effect.gen(function*() {
      const svc = yield* EmbeddingService

      // Pre-cache "b" and "d"
      yield* svc.embed("b", "search_document")
      yield* svc.embed("d", "search_document")
      batchedTexts = [] // Reset for next batch

      // Batch with mix of cached and uncached
      return yield* svc.embedBatch(["a", "b", "c", "d", "e"])
    }).pipe(Effect.provide(TestLayer), Effect.runPromise)

    expect(result).toHaveLength(5)

    // Only uncached texts should be batched
    expect(batchedTexts).toEqual(["a", "c", "e"])
  })

  it("handles empty batch gracefully", async () => {
    const batchCalls = { value: 0 }

    const MockEmbeddingProvider = Layer.succeed(
      EmbeddingProvider,
      {
        metadata: { providerId: "nomic", modelId: "test-model", dimension: 5 },
        embedBatch: (_requests) => {
          batchCalls.value++
          return Effect.succeed([])
        },
        cosineSimilarity: (_a, _b) => 0.95
      } as EmbeddingProviderMethods
    )

    const TestLayer = EmbeddingServiceLive.pipe(
      Layer.provideMerge(MockEmbeddingProvider),
      Layer.provideMerge(EmbeddingCache.Default),
      Layer.provideMerge(MetricsService.Default),
      Layer.provideMerge(BatchingEnabled)
    )

    const result = await Effect.gen(function*() {
      const svc = yield* EmbeddingService
      return yield* svc.embedBatch([])
    }).pipe(Effect.provide(TestLayer), Effect.runPromise)

    expect(result).toEqual([])
    expect(batchCalls.value).toBe(0) // No batch call for empty input
  })

  it("populates cache after batch embed", async () => {
    const batchCalls = { value: 0 }

    const MockEmbeddingProvider = Layer.succeed(
      EmbeddingProvider,
      {
        metadata: { providerId: "nomic", modelId: "test-model", dimension: 5 },
        embedBatch: (requests) => {
          batchCalls.value++
          return Effect.succeed(requests.map(() => mockEmbedding))
        },
        cosineSimilarity: (_a, _b) => 0.95
      } as EmbeddingProviderMethods
    )

    const TestLayer = EmbeddingServiceLive.pipe(
      Layer.provideMerge(MockEmbeddingProvider),
      Layer.provideMerge(EmbeddingCache.Default),
      Layer.provideMerge(MetricsService.Default),
      Layer.provideMerge(BatchingEnabled)
    )

    await Effect.gen(function*() {
      const svc = yield* EmbeddingService

      // Batch embed some texts
      yield* svc.embedBatch(["text1", "text2", "text3"])

      batchCalls.value = 0 // Reset counter

      // Now individual calls should hit cache
      yield* svc.embed("text1", "search_document")
      yield* svc.embed("text2", "search_document")
      yield* svc.embed("text3", "search_document")
    }).pipe(Effect.provide(TestLayer), Effect.runPromise)

    // No embed calls because all were cached from batch
    expect(batchCalls.value).toBe(0)
  })
})
