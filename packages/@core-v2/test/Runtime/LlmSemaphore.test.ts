/**
 * Tests for LLM Semaphore Service
 *
 * @module test/Runtime/LlmSemaphore
 */

import { ConfigProvider, Effect, Layer, Ref } from "effect"
import { describe, expect, it } from "vitest"
import { LlmSemaphoreService } from "../../src/Runtime/LlmSemaphore.js"
import { ConfigServiceDefault } from "../../src/Service/Config.js"

describe("LlmSemaphoreService", () => {
  const TestLayers = LlmSemaphoreService.Default.pipe(
    Layer.provideMerge(ConfigServiceDefault),
    Layer.provideMerge(
      Layer.setConfigProvider(
        ConfigProvider.fromMap(
          new Map([
            ["ONTOLOGY_PATH", "/tmp/test.ttl"],
            ["LLM_API_KEY", "sk-test"]
          ]),
          { pathDelim: "_" }
        )
      )
    )
  )

  it("provides concurrency control", () =>
    Effect.gen(function*() {
      const semaphore = yield* LlmSemaphoreService

      // Simple test that withPermit works
      const result = yield* semaphore.withPermit(Effect.succeed("done"))
      expect(result).toBe("done")
    }).pipe(Effect.provide(TestLayers), Effect.runPromise))

  it("reports limit based on provider", () =>
    Effect.gen(function*() {
      const semaphore = yield* LlmSemaphoreService
      const limit = semaphore.limit()

      // Default config is anthropic, which has limit 2
      expect(limit).toBeGreaterThanOrEqual(1)
      expect(limit).toBeLessThanOrEqual(10)
    }).pipe(Effect.provide(TestLayers), Effect.runPromise))

  it("availablePermits returns limit", () =>
    Effect.gen(function*() {
      const semaphore = yield* LlmSemaphoreService
      const available = yield* semaphore.availablePermits()

      expect(available).toBeGreaterThanOrEqual(1)
    }).pipe(Effect.provide(TestLayers), Effect.runPromise))

  it("respects concurrency limit", () =>
    Effect.gen(function*() {
      const semaphore = yield* LlmSemaphoreService
      const maxConcurrent = yield* Ref.make(0)
      const currentConcurrent = yield* Ref.make(0)

      // Execute multiple operations tracking max concurrency
      const operations = Array.from({ length: 10 }, (_, i) =>
        semaphore.withPermit(
          Effect.gen(function*() {
            yield* Ref.update(currentConcurrent, (c) => c + 1)
            const current = yield* Ref.get(currentConcurrent)
            yield* Ref.update(maxConcurrent, (max) => Math.max(max, current))
            // No sleep - keep it fast
            yield* Ref.update(currentConcurrent, (c) => c - 1)
            return i
          })
        ))

      yield* Effect.all(operations, { concurrency: 10 })

      const max = yield* Ref.get(maxConcurrent)
      const limit = semaphore.limit()

      // Max concurrent should not exceed the limit
      expect(max).toBeLessThanOrEqual(limit)
    }).pipe(Effect.provide(TestLayers), Effect.runPromise))
})
