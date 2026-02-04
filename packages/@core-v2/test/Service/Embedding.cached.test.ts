/**
 * Tests for EmbeddingService with cache integration
 *
 * @since 2.0.0
 * @module test/Service/Embedding.cached
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

// Helper to create test mock with embedBatch support
const createProviderMock = (callCount: { value: number }) =>
  Layer.succeed(
    EmbeddingProvider,
    {
      metadata: { providerId: "nomic", modelId: "test-model", dimension: 5 },
      embedBatch: (requests) => {
        callCount.value++
        return Effect.succeed(requests.map(() => mockEmbedding))
      },
      cosineSimilarity: (_a, _b) => 0.95
    } as EmbeddingProviderMethods
  )

describe("EmbeddingService with cache", () => {
  it("caches embedding on first call", async () => {
    const callCount = { value: 0 }

    const MockEmbeddingProvider = createProviderMock(callCount)

    const TestLayer = EmbeddingServiceLive.pipe(
      Layer.provideMerge(MockEmbeddingProvider),
      Layer.provideMerge(EmbeddingCache.Default),
      Layer.provideMerge(MetricsService.Default),
      Layer.provideMerge(BatchingEnabled)
    )

    const result = await Effect.gen(function*() {
      const svc = yield* EmbeddingService
      return yield* svc.embed("test text", "search_document")
    }).pipe(Effect.provide(TestLayer), Effect.runPromise)

    expect(result).toEqual(mockEmbedding)
    expect(callCount.value).toBe(1)
  })

  it("returns cached embedding on second call (cache hit)", async () => {
    const callCount = { value: 0 }

    const MockEmbeddingProvider = createProviderMock(callCount)

    const TestLayer = EmbeddingServiceLive.pipe(
      Layer.provideMerge(MockEmbeddingProvider),
      Layer.provideMerge(EmbeddingCache.Default),
      Layer.provideMerge(MetricsService.Default),
      Layer.provideMerge(BatchingEnabled)
    )

    const result = await Effect.gen(function*() {
      const svc = yield* EmbeddingService

      // First call - cache miss
      const first = yield* svc.embed("test text", "search_document")
      expect(callCount.value).toBe(1)

      // Second call - cache hit, should not increment
      const second = yield* svc.embed("test text", "search_document")
      expect(callCount.value).toBe(1) // Still 1!

      return { first, second }
    }).pipe(Effect.provide(TestLayer), Effect.runPromise)

    expect(result.first).toEqual(mockEmbedding)
    expect(result.second).toEqual(mockEmbedding)
  })

  it("does not call model on cache hit", async () => {
    const callCount = { value: 0 }

    const MockEmbeddingProvider = createProviderMock(callCount)

    const TestLayer = EmbeddingServiceLive.pipe(
      Layer.provideMerge(MockEmbeddingProvider),
      Layer.provideMerge(EmbeddingCache.Default),
      Layer.provideMerge(MetricsService.Default),
      Layer.provideMerge(BatchingEnabled)
    )

    await Effect.gen(function*() {
      const svc = yield* EmbeddingService

      // Call 5 times with same text
      for (let i = 0; i < 5; i++) {
        yield* svc.embed("repeated text", "search_document")
      }
    }).pipe(Effect.provide(TestLayer), Effect.runPromise)

    // Model should only be called once
    expect(callCount.value).toBe(1)
  })

  it("calls model for different texts (cache miss)", async () => {
    const callCount = { value: 0 }

    const MockEmbeddingProvider = createProviderMock(callCount)

    const TestLayer = EmbeddingServiceLive.pipe(
      Layer.provideMerge(MockEmbeddingProvider),
      Layer.provideMerge(EmbeddingCache.Default),
      Layer.provideMerge(MetricsService.Default),
      Layer.provideMerge(BatchingEnabled)
    )

    await Effect.gen(function*() {
      const svc = yield* EmbeddingService

      yield* svc.embed("text one", "search_document")
      yield* svc.embed("text two", "search_document")
      yield* svc.embed("text three", "search_document")
    }).pipe(Effect.provide(TestLayer), Effect.runPromise)

    // Each unique text causes a model call
    expect(callCount.value).toBe(3)
  })

  it("different task types are cached separately", async () => {
    const callCount = { value: 0 }

    const MockEmbeddingProvider = createProviderMock(callCount)

    const TestLayer = EmbeddingServiceLive.pipe(
      Layer.provideMerge(MockEmbeddingProvider),
      Layer.provideMerge(EmbeddingCache.Default),
      Layer.provideMerge(MetricsService.Default),
      Layer.provideMerge(BatchingEnabled)
    )

    await Effect.gen(function*() {
      const svc = yield* EmbeddingService

      // Same text, different task types
      yield* svc.embed("same text", "search_document")
      yield* svc.embed("same text", "search_query")
      yield* svc.embed("same text", "clustering")

      // Repeat - should all hit cache
      yield* svc.embed("same text", "search_document")
      yield* svc.embed("same text", "search_query")
      yield* svc.embed("same text", "clustering")
    }).pipe(Effect.provide(TestLayer), Effect.runPromise)

    // 3 unique (text, taskType) combinations
    expect(callCount.value).toBe(3)
  })

  it("cosineSimilarity computes correctly", async () => {
    const MockEmbeddingProvider = Layer.succeed(
      EmbeddingProvider,
      {
        metadata: { providerId: "nomic", modelId: "test-model", dimension: 5 },
        embedBatch: (requests) => Effect.succeed(requests.map(() => mockEmbedding)),
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
      // Test with identical vectors - should be 1.0
      return svc.cosineSimilarity([1, 0, 0], [1, 0, 0])
    }).pipe(Effect.provide(TestLayer), Effect.runPromise)

    expect(result).toBe(1) // Identical vectors have similarity 1
  })
})
