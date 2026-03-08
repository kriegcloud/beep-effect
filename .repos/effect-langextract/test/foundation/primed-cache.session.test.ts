import * as FileSystem from "@effect/platform/FileSystem"
import * as BunFileSystem from "@effect/platform-bun/BunFileSystem"
import * as BunKeyValueStore from "@effect/platform-bun/BunKeyValueStore"
import { describe, expect, it } from "@effect/vitest"
import { Effect, Layer } from "effect"

import {
  makePrimedCacheLayer,
  PrimedCache,
  PrimedCacheKey,
  PrimedCachePolicy,
  ScoredOutput} from "../../src/index.js"

const tempRoot = (name: string): string =>
  `/tmp/effect-langextract-${name}-${Date.now()}-${Math.random()}`

const removePath = (path: string): Effect.Effect<void> =>
  Effect.gen(function* () {
    const fileSystem = yield* FileSystem.FileSystem
    yield* fileSystem.remove(path, { recursive: true, force: true })
  }).pipe(Effect.provide(BunFileSystem.layer))

const makeSessionCacheLayer = (root: string) =>
  makePrimedCacheLayer({
    keyValueStoreLayer: BunKeyValueStore.layerFileSystem(root).pipe(Layer.orDie),
    enableRequestStore: false,
    enableSessionStore: true
  })

describe("Primed cache session store", () => {
  it.effect("persists entries across cache layer instances", () =>
    Effect.gen(function* () {
      const root = tempRoot("cache-session")
      const key = new PrimedCacheKey({
        provider: "test",
        modelId: "model",
        promptFingerprint: "fingerprint",
        promptVersion: "v1",
        namespace: "session"
      })
      const policy = new PrimedCachePolicy({
        namespace: "session",
        ttlSeconds: 120
      })

      yield* removePath(root)

      yield* Effect.gen(function* () {
        const cache = yield* PrimedCache
        yield* cache.put(
          key,
          [new ScoredOutput({ provider: "test", output: "cached", score: 1 })],
          { policy, isDeterministic: true }
        )
      }).pipe(Effect.provide(makeSessionCacheLayer(root)))

      const reloaded = yield* Effect.gen(function* () {
        const cache = yield* PrimedCache
        return yield* cache.get(key, { policy, isDeterministic: true })
      }).pipe(Effect.provide(makeSessionCacheLayer(root)))

      expect(reloaded?.[0]?.output).toBe("cached")

      yield* removePath(root)
    })
  )

  it.effect("expires entries when ttl is reached", () =>
    Effect.gen(function* () {
      const key = new PrimedCacheKey({
        provider: "test",
        modelId: "model",
        promptFingerprint: "ttl",
        promptVersion: "v1",
        namespace: "ttl"
      })
      const policy = new PrimedCachePolicy({
        namespace: "ttl",
        ttlSeconds: 0
      })

      const value = yield* Effect.gen(function* () {
        const cache = yield* PrimedCache
        yield* cache.put(
          key,
          [new ScoredOutput({ provider: "test", output: "soon-expired", score: 1 })],
          { policy, isDeterministic: true }
        )
        return yield* cache.get(key, { policy, isDeterministic: true })
      }).pipe(
        Effect.provide(
          makePrimedCacheLayer({
            enableRequestStore: true,
            enableSessionStore: false
          })
        )
      )

      expect(value).toBeUndefined()
    })
  )

  it.effect("clears only the selected namespace", () =>
    Effect.gen(function* () {
      const a = new PrimedCacheKey({
        provider: "test",
        modelId: "model",
        promptFingerprint: "a",
        promptVersion: "v1",
        namespace: "ns-a"
      })
      const b = new PrimedCacheKey({
        provider: "test",
        modelId: "model",
        promptFingerprint: "b",
        promptVersion: "v1",
        namespace: "ns-b"
      })

      const [valueA, valueB] = yield* Effect.gen(function* () {
        const cache = yield* PrimedCache
        yield* cache.put(a, [new ScoredOutput({ output: "A" })])
        yield* cache.put(b, [new ScoredOutput({ output: "B" })])
        yield* cache.clearNamespace("ns-a")
        const aAfter = yield* cache.get(a)
        const bAfter = yield* cache.get(b)
        return [aAfter, bAfter] as const
      }).pipe(
        Effect.provide(
          makePrimedCacheLayer({
            enableRequestStore: true,
            enableSessionStore: false
          })
        )
      )

      expect(valueA).toBeUndefined()
      expect(valueB?.[0]?.output).toBe("B")
    })
  )
})
