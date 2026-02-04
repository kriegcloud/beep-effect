/**
 * Workflow Persistence Layer
 *
 * Bridges our existing GCS-backed StorageService to @effect/experimental Persistence.
 * This reuses our existing infrastructure for workflow state durability.
 *
 * @since 2.0.0
 */

import { Persistence } from "@effect/experimental"
import { KeyValueStore } from "@effect/platform"
import { Effect, Layer, Option } from "effect"
import { StorageService, StorageServiceLive, StorageServiceTest } from "./Storage.js"

// -----------------------------------------------------------------------------
// KeyValueStore adapter for StorageService
// -----------------------------------------------------------------------------

/**
 * Adapts our StorageService (which extends KeyValueStore) to the standard
 * KeyValueStore.KeyValueStore tag that Persistence.layerKeyValueStore expects.
 *
 * The prefix "workflow-state/" isolates workflow persistence from other storage.
 */
const StorageKeyValueStoreLive = Layer.effect(
  KeyValueStore.KeyValueStore,
  Effect.gen(function*() {
    const storage = yield* StorageService
    const prefix = "workflow-state/"

    const prefixKey = (key: string) => `${prefix}${key}`

    return KeyValueStore.make({
      get: (key) =>
        storage.get(prefixKey(key)).pipe(
          Effect.catchAll(() => Effect.succeed(Option.none()))
        ),

      getUint8Array: (key) =>
        storage.getUint8Array(prefixKey(key)).pipe(
          Effect.catchAll(() => Effect.succeed(Option.none()))
        ),

      set: (key, value) =>
        storage.set(prefixKey(key), value).pipe(
          Effect.asVoid
        ),

      remove: (key) =>
        storage.remove(prefixKey(key)).pipe(
          Effect.asVoid
        ),

      clear: storage.clear,

      size: storage.size
    })
  })
)

// -----------------------------------------------------------------------------
// Workflow Persistence Layers
// -----------------------------------------------------------------------------

/**
 * Production persistence layer backed by GCS.
 *
 * Layer composition:
 *   BackingPersistence <- KeyValueStore <- StorageService <- ConfigService
 *
 * Usage:
 *   ```ts
 *   import { WorkflowPersistenceLive } from "./WorkflowPersistence.js"
 *
 *   const program = Effect.gen(function*() {
 *     // Activities and workflows will automatically use GCS for durability
 *   }).pipe(
 *     Effect.provide(WorkflowPersistenceLive)
 *   )
 *   ```
 */
export const WorkflowPersistenceLive = Persistence.layerKeyValueStore.pipe(
  Layer.provide(StorageKeyValueStoreLive),
  Layer.provide(StorageServiceLive)
)

/**
 * Test persistence layer (in-memory).
 *
 * Uses memory-backed storage - no GCS credentials required.
 * Fast and deterministic for unit tests.
 */
export const WorkflowPersistenceTest = Persistence.layerKeyValueStore.pipe(
  Layer.provide(StorageKeyValueStoreLive),
  Layer.provide(StorageServiceTest)
)

/**
 * Pure in-memory persistence (no StorageService dependency).
 *
 * The simplest option for isolated unit tests.
 */
export const WorkflowPersistenceMemory = Persistence.layerMemory

// -----------------------------------------------------------------------------
// Re-exports for convenience
// -----------------------------------------------------------------------------

export { Persistence } from "@effect/experimental"
