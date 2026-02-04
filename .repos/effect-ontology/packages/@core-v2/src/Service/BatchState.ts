import { Persistence } from "@effect/experimental"
import { KeyValueStore } from "@effect/platform"
import { Effect, Layer, Option, PubSub, Schema } from "effect"
import type { BatchId } from "../Domain/Identity.js"
import { BatchState } from "../Domain/Model/BatchWorkflow.js"
import { PathLayout } from "../Domain/PathLayout.js"
import { StorageService } from "./Storage.js"

const stateKey = (batchId: BatchId) => PathLayout.batch.status(batchId)

const encodeState = Schema.encode(BatchState)
const decodeState = Schema.decodeUnknown(Schema.parseJson(BatchState))

/**
 * Maximum number of pending state updates in the PubSub.
 * Uses sliding strategy (drops oldest) to prevent memory growth.
 *
 * Set to 1000 to accommodate ~100 concurrent batches with ~10 state updates each.
 * If subscribers fall behind, oldest state updates are dropped in favor of newer ones.
 */
const BATCH_STATE_HUB_CAPACITY = 1000

export class BatchStateHub extends Effect.Service<BatchStateHub>()("@core-v2/BatchStateHub", {
  effect: PubSub.sliding<BatchState>(BATCH_STATE_HUB_CAPACITY)
}) {}

export const BatchStateHubLayer = BatchStateHub.Default

const storageAsKeyValueStore = Effect.gen(function*() {
  const storage = yield* StorageService

  return KeyValueStore.make({
    get: (key) => storage.get(key),
    getUint8Array: (key) => storage.getUint8Array(key),
    set: (key, value) => storage.set(key, value),
    remove: (key) => storage.remove(key),
    clear: storage.clear,
    size: storage.size,
    has: (key) => storage.get(key).pipe(Effect.map(Option.isSome)),
    isEmpty: Effect.succeed(false),
    modify: (key, f) =>
      storage.get(key).pipe(
        Effect.flatMap((current) =>
          Option.match(current, {
            onNone: () => Effect.succeed(Option.none<string>()),
            onSome: (value) =>
              Effect.flatMap(
                storage.set(key, f(value)),
                () => Effect.succeed(Option.some(value))
              )
          })
        )
      )
  })
})

export const BatchStatePersistenceLayer = Persistence.layerKeyValueStore.pipe(
  Layer.provide(Layer.effect(KeyValueStore.KeyValueStore, storageAsKeyValueStore))
)

export const persistState = (state: BatchState) =>
  Effect.gen(function*() {
    const storage = yield* StorageService
    const encoded = yield* encodeState(state)
    yield* storage.set(stateKey(state.batchId), JSON.stringify(encoded))
  })

export const getBatchStateFromStore = (batchId: BatchId) =>
  Effect.gen(function*() {
    const storage = yield* StorageService
    const stored = yield* storage.get(stateKey(batchId))

    return yield* Option.match(stored, {
      onNone: () => Effect.succeed(Option.none<BatchState>()),
      // decodeState uses Schema.parseJson which handles JSON parsing directly
      // No need for explicit JSON.parse - avoids double parse overhead
      onSome: (json) =>
        decodeState(json).pipe(
          Effect.asSome,
          Effect.catchAll(() => Effect.succeed(Option.none<BatchState>()))
        )
    })
  })

export const publishState = (state: BatchState) =>
  Effect.gen(function*() {
    const hub = yield* BatchStateHub
    yield* PubSub.publish(hub, state)
    yield* persistState(state)
  })
