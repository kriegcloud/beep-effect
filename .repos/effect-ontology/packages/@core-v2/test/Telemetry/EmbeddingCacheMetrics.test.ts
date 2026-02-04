/**
 * Tests for Embedding Cache Metrics
 *
 * Verifies cache hit/miss counters, hit rate gauge, and latency metrics.
 *
 * @since 2.0.0
 * @module test/Telemetry/EmbeddingCacheMetrics
 */

import { Effect, Layer } from "effect"
import { describe, expect, it } from "vitest"
import { MetricsService } from "../../src/Telemetry/Metrics.js"

const TestLayer = MetricsService.Default

describe("Embedding Cache Metrics", () => {
  describe("recordCacheHit", () => {
    it("increments hit counter", async () => {
      await Effect.gen(function*() {
        const metrics = yield* MetricsService

        yield* metrics.reset()
        yield* metrics.recordCacheHit(10)
        yield* metrics.recordCacheHit(15)

        const snapshot = yield* metrics.getCacheMetrics()
        expect(snapshot.hits).toBe(2)
        expect(snapshot.misses).toBe(0)
      }).pipe(Effect.provide(TestLayer), Effect.runPromise)
    })

    it("tracks latency for hits", async () => {
      await Effect.gen(function*() {
        const metrics = yield* MetricsService

        yield* metrics.reset()
        yield* metrics.recordCacheHit(5)
        yield* metrics.recordCacheHit(15)

        const snapshot = yield* metrics.getCacheMetrics()
        expect(snapshot.avgLatencyMs).toBe(10) // (5 + 15) / 2
      }).pipe(Effect.provide(TestLayer), Effect.runPromise)
    })
  })

  describe("recordCacheMiss", () => {
    it("increments miss counter", async () => {
      await Effect.gen(function*() {
        const metrics = yield* MetricsService

        yield* metrics.reset()
        yield* metrics.recordCacheMiss(20)
        yield* metrics.recordCacheMiss(25)
        yield* metrics.recordCacheMiss(30)

        const snapshot = yield* metrics.getCacheMetrics()
        expect(snapshot.misses).toBe(3)
        expect(snapshot.hits).toBe(0)
      }).pipe(Effect.provide(TestLayer), Effect.runPromise)
    })

    it("tracks latency for misses", async () => {
      await Effect.gen(function*() {
        const metrics = yield* MetricsService

        yield* metrics.reset()
        yield* metrics.recordCacheMiss(30)

        const snapshot = yield* metrics.getCacheMetrics()
        expect(snapshot.avgLatencyMs).toBe(30)
      }).pipe(Effect.provide(TestLayer), Effect.runPromise)
    })
  })

  describe("getCacheMetrics", () => {
    it("calculates hit rate correctly", async () => {
      await Effect.gen(function*() {
        const metrics = yield* MetricsService

        yield* metrics.reset()

        // 3 hits, 1 miss = 75% hit rate
        yield* metrics.recordCacheHit(1)
        yield* metrics.recordCacheHit(1)
        yield* metrics.recordCacheHit(1)
        yield* metrics.recordCacheMiss(1)

        const snapshot = yield* metrics.getCacheMetrics()
        expect(snapshot.hitRate).toBe(0.75)
      }).pipe(Effect.provide(TestLayer), Effect.runPromise)
    })

    it("returns 0 hit rate when no operations", async () => {
      await Effect.gen(function*() {
        const metrics = yield* MetricsService

        yield* metrics.reset()

        const snapshot = yield* metrics.getCacheMetrics()
        expect(snapshot.hitRate).toBe(0)
        expect(snapshot.avgLatencyMs).toBe(0)
      }).pipe(Effect.provide(TestLayer), Effect.runPromise)
    })

    it("combines hit and miss latencies for average", async () => {
      await Effect.gen(function*() {
        const metrics = yield* MetricsService

        yield* metrics.reset()

        yield* metrics.recordCacheHit(10) // Fast hit
        yield* metrics.recordCacheMiss(50) // Slow miss (had to fetch)

        const snapshot = yield* metrics.getCacheMetrics()
        expect(snapshot.avgLatencyMs).toBe(30) // (10 + 50) / 2
      }).pipe(Effect.provide(TestLayer), Effect.runPromise)
    })
  })

  describe("toPrometheus", () => {
    it("exports cache metrics in Prometheus format", async () => {
      await Effect.gen(function*() {
        const metrics = yield* MetricsService

        yield* metrics.reset()

        // Record some metrics
        yield* metrics.recordCacheHit(5)
        yield* metrics.recordCacheHit(5)
        yield* metrics.recordCacheMiss(10)

        const output = yield* metrics.toPrometheus()

        // Verify counters
        expect(output).toContain("embedding_cache_hits_total 2")
        expect(output).toContain("embedding_cache_misses_total 1")

        // Verify gauge (2 hits / 3 total = 0.6667)
        expect(output).toContain("embedding_cache_hit_rate 0.6667")

        // Verify latency (avg = (5+5+10)/3 = 6.67)
        expect(output).toContain("embedding_cache_latency_ms_avg 6.67")
        expect(output).toContain("embedding_cache_latency_ms_sum 20")
      }).pipe(Effect.provide(TestLayer), Effect.runPromise)
    })

    it("includes HELP and TYPE annotations", async () => {
      await Effect.gen(function*() {
        const metrics = yield* MetricsService

        yield* metrics.reset()

        const output = yield* metrics.toPrometheus()

        // Verify metric metadata
        expect(output).toContain("# HELP embedding_cache_hits_total")
        expect(output).toContain("# TYPE embedding_cache_hits_total counter")

        expect(output).toContain("# HELP embedding_cache_misses_total")
        expect(output).toContain("# TYPE embedding_cache_misses_total counter")

        expect(output).toContain("# HELP embedding_cache_hit_rate")
        expect(output).toContain("# TYPE embedding_cache_hit_rate gauge")

        expect(output).toContain("# HELP embedding_cache_latency_ms_avg")
        expect(output).toContain("# TYPE embedding_cache_latency_ms_avg gauge")
      }).pipe(Effect.provide(TestLayer), Effect.runPromise)
    })

    it("handles zero metrics gracefully", async () => {
      await Effect.gen(function*() {
        const metrics = yield* MetricsService

        yield* metrics.reset()

        const output = yield* metrics.toPrometheus()

        expect(output).toContain("embedding_cache_hits_total 0")
        expect(output).toContain("embedding_cache_misses_total 0")
        expect(output).toContain("embedding_cache_hit_rate 0.0000")
        expect(output).toContain("embedding_cache_latency_ms_avg 0.00")
      }).pipe(Effect.provide(TestLayer), Effect.runPromise)
    })
  })

  describe("reset", () => {
    it("clears cache metrics", async () => {
      await Effect.gen(function*() {
        const metrics = yield* MetricsService

        // Accumulate some metrics
        yield* metrics.recordCacheHit(10)
        yield* metrics.recordCacheMiss(20)

        // Reset
        yield* metrics.reset()

        const snapshot = yield* metrics.getCacheMetrics()
        expect(snapshot.hits).toBe(0)
        expect(snapshot.misses).toBe(0)
        expect(snapshot.hitRate).toBe(0)
        expect(snapshot.avgLatencyMs).toBe(0)
      }).pipe(Effect.provide(TestLayer), Effect.runPromise)
    })
  })
})
