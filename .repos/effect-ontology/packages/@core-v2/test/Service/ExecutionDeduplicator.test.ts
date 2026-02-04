import { describe, expect, it } from "@effect/vitest"
import { Deferred, Effect, Layer } from "effect"
import { ExecutionDeduplicator, ExecutionDeduplicatorLive } from "../../src/Service/ExecutionDeduplicator.js"

describe("Execution Deduplicator", () => {
  it.effect("deduplicates concurrent requests", () =>
    Effect.gen(function*() {
      const dedup = yield* ExecutionDeduplicator
      const key = "concurrent-key"

      // First request
      const { handle: handle1, isNew: isNew1 } = yield* dedup.getOrCreate(key)
      expect(isNew1).toBe(true)

      // Second request
      const { handle: handle2, isNew: isNew2 } = yield* dedup.getOrCreate(key)
      expect(isNew2).toBe(false)
      expect(handle1).toBe(handle2)

      // Complete execution
      const result = { entities: [], relations: [] } as any
      yield* dedup.complete(key, result)

      // Check if deferred is resolved
      const value = yield* Deferred.await(handle1.deferred)
      expect(value).toBe(result)
    }).pipe(
      Effect.provide(ExecutionDeduplicatorLive)
    ))

  it.effect("cleans up handle", () =>
    Effect.gen(function*() {
      const dedup = yield* ExecutionDeduplicator
      const key = "cleanup-key"

      yield* dedup.getOrCreate(key)
      yield* dedup.cleanup(key)

      const { isNew } = yield* dedup.getOrCreate(key)
      expect(isNew).toBe(true)
    }).pipe(
      Effect.provide(ExecutionDeduplicatorLive)
    ))
})
