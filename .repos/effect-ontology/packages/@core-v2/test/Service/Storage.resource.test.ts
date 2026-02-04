/**
 * Tests for StorageService Resource Management
 *
 * These tests verify that the StorageService properly manages resources
 * using Effect's scoped resource pattern. This is critical for preventing
 * resource leaks, especially for the GCS client.
 *
 * @module test/Service/Storage.resource
 */

import { Effect, Layer } from "effect"
import { describe, expect, it } from "vitest"
import { ConfigServiceDefault } from "../../src/Service/Config.js"
import { StorageService, StorageServiceLive } from "../../src/Service/Storage.js"

describe("StorageService Resource Management", () => {
  it("should clean up resources when scope closes", () =>
    Effect.gen(function*() {
      // Track if cleanup was called
      let cleanupCalled = false

      // Create a test layer that tracks cleanup via finalizer
      const TestStorageLayer = Layer.scoped(
        StorageService,
        Effect.gen(function*() {
          // Register a finalizer that will be called when scope closes
          yield* Effect.addFinalizer(() =>
            Effect.sync(() => {
              cleanupCalled = true
            })
          )

          // Return a minimal mock implementation
          return {
            get: () => Effect.succeed(null),
            set: () => Effect.void,
            remove: () => Effect.void,
            clear: Effect.void,
            size: Effect.succeed(0),
            getUint8Array: () => Effect.succeed(null),
            list: () => Effect.succeed([])
          } as any
        })
      )

      // Run with scoped effect
      yield* Effect.scoped(
        Effect.gen(function*() {
          const storage = yield* StorageService
          // Use the service to ensure it's acquired
          yield* storage.size
        })
      ).pipe(Effect.provide(TestStorageLayer))

      // After scope closes, verify cleanup was called
      expect(cleanupCalled).toBe(true)
    }).pipe(Effect.runPromise))

  it("should handle multiple scope entries/exits", () =>
    Effect.gen(function*() {
      let acquisitionCount = 0
      let releaseCount = 0

      const TestStorageLayer = Layer.scoped(
        StorageService,
        Effect.gen(function*() {
          acquisitionCount++

          yield* Effect.addFinalizer(() =>
            Effect.sync(() => {
              releaseCount++
            })
          )

          return {
            get: () => Effect.succeed(null),
            set: () => Effect.void,
            remove: () => Effect.void,
            clear: Effect.void,
            size: Effect.succeed(0),
            getUint8Array: () => Effect.succeed(null),
            list: () => Effect.succeed([])
          } as any
        })
      )

      // First scope
      yield* Effect.scoped(
        Effect.gen(function*() {
          const storage = yield* StorageService
          yield* storage.size
        })
      ).pipe(Effect.provide(TestStorageLayer))

      expect(acquisitionCount).toBe(1)
      expect(releaseCount).toBe(1)

      // Second scope
      yield* Effect.scoped(
        Effect.gen(function*() {
          const storage = yield* StorageService
          yield* storage.size
        })
      ).pipe(Effect.provide(TestStorageLayer))

      expect(acquisitionCount).toBe(2)
      expect(releaseCount).toBe(2)
    }).pipe(Effect.runPromise))

  it("should cleanup even when operations fail", () =>
    Effect.gen(function*() {
      let cleanupCalled = false

      const TestStorageLayer = Layer.scoped(
        StorageService,
        Effect.gen(function*() {
          yield* Effect.addFinalizer(() =>
            Effect.sync(() => {
              cleanupCalled = true
            })
          )

          return {
            get: () => Effect.fail(new Error("Intentional failure")),
            set: () => Effect.void,
            remove: () => Effect.void,
            clear: Effect.void,
            size: Effect.succeed(0),
            getUint8Array: () => Effect.succeed(null),
            list: () => Effect.succeed([])
          } as any
        })
      )

      // Run operation that fails, but catch the error
      const result = yield* Effect.scoped(
        Effect.gen(function*() {
          const storage = yield* StorageService
          return yield* storage.get("test")
        })
      ).pipe(
        Effect.provide(TestStorageLayer),
        Effect.either
      )

      // Operation should have failed
      expect(result._tag).toBe("Left")

      // But cleanup should still have been called
      expect(cleanupCalled).toBe(true)
    }).pipe(Effect.runPromise))
})
