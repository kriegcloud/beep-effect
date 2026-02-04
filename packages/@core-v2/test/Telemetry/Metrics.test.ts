/**
 * Tests for Prometheus Metrics Service
 *
 * @module test/Telemetry/Metrics
 */

import { describe, expect, it } from "@effect/vitest"
import { Effect } from "effect"
import { MetricsService } from "../../src/Telemetry/Metrics.js"

describe("MetricsService", () => {
  it.effect("records extraction metrics", () =>
    Effect.gen(function*() {
      const metrics = yield* MetricsService

      yield* metrics.recordExtraction({
        durationMs: 1500,
        entityCount: 10,
        relationCount: 5,
        chunkCount: 3,
        success: true
      })

      const output = yield* metrics.toPrometheus()

      expect(output).toContain("extraction_duration_ms")
      expect(output).toContain("extraction_entity_count")
    }).pipe(Effect.provide(MetricsService.Default)))

  it.effect("tracks LLM calls", () =>
    Effect.gen(function*() {
      const metrics = yield* MetricsService

      yield* metrics.recordLlmCall({
        provider: "anthropic",
        model: "claude-haiku-4-5",
        durationMs: 500,
        tokensIn: 100,
        tokensOut: 50,
        success: true
      })

      const output = yield* metrics.toPrometheus()

      expect(output).toContain("llm_call_duration_ms")
      expect(output).toContain("provider=\"anthropic\"")
    }).pipe(Effect.provide(MetricsService.Default)))

  it.effect("accumulates multiple extractions", () =>
    Effect.gen(function*() {
      const metrics = yield* MetricsService

      yield* metrics.recordExtraction({
        durationMs: 100,
        entityCount: 5,
        relationCount: 2,
        chunkCount: 1,
        success: true
      })

      yield* metrics.recordExtraction({
        durationMs: 200,
        entityCount: 10,
        relationCount: 3,
        chunkCount: 2,
        success: false
      })

      const output = yield* metrics.toPrometheus()

      expect(output).toContain("extraction_total 2")
      expect(output).toContain("extraction_successful_total 1")
      expect(output).toContain("extraction_failed_total 1")
    }).pipe(Effect.provide(MetricsService.Default)))

  it.effect("reset clears all metrics", () =>
    Effect.gen(function*() {
      const metrics = yield* MetricsService

      yield* metrics.recordExtraction({
        durationMs: 100,
        entityCount: 5,
        relationCount: 2,
        chunkCount: 1,
        success: true
      })

      yield* metrics.reset()

      const output = yield* metrics.toPrometheus()

      expect(output).toContain("extraction_total 0")
    }).pipe(Effect.provide(MetricsService.Default)))
})
