/**
 * SingleRunner entity annotation matrix test.
 *
 * IMPORTANT: Uses `it.live` (not `it.effect`) because `it.effect` provides
 * TestClock which freezes `Effect.delay` in the Runners reply polling loop,
 * causing tests to hang. All SingleRunner entity tests must use `it.live`.
 */
import { describe, expect, it } from "@effect/vitest"
import { Effect, Layer, Schema } from "effect"
import type { Sharding } from "effect/unstable/cluster"
import { ClusterSchema, Entity, SingleRunner } from "effect/unstable/cluster"
import { Rpc } from "effect/unstable/rpc"
import { rmSync } from "node:fs"
import { tmpdir } from "node:os"
import { join } from "node:path"
import * as DomainMigrator from "../src/persistence/DomainMigrator.js"
import * as SqliteRuntime from "../src/persistence/SqliteRuntime.js"

// ---------------------------------------------------------------------------
// Entity A: Persisted + primaryKey + ClientTracingEnabled=false
// ---------------------------------------------------------------------------

const PingPersistedRpc = Rpc.make("ping", {
  payload: { id: Schema.String },
  success: Schema.Struct({ pong: Schema.Boolean }),
  primaryKey: ({ id }) => id
}).annotate(ClusterSchema.Persisted, true)

const PersistedEntity = Entity.make("PersistedPing", [PingPersistedRpc])
  .annotate(ClusterSchema.ClientTracingEnabled, false)

const persistedEntityLayer = PersistedEntity.toLayer(Effect.succeed({
  ping: ({ payload: _payload }) => Effect.succeed({ pong: true })
}))

// ---------------------------------------------------------------------------
// Entity B: Persisted + primaryKey, NO ClientTracingEnabled
// ---------------------------------------------------------------------------

const PingPersistedNoCTRpc = Rpc.make("ping", {
  payload: { id: Schema.String },
  success: Schema.Struct({ pong: Schema.Boolean }),
  primaryKey: ({ id }) => id
}).annotate(ClusterSchema.Persisted, true)

const PersistedNoCTEntity = Entity.make("PersistedNoCT", [PingPersistedNoCTRpc])

const persistedNoCTEntityLayer = PersistedNoCTEntity.toLayer(Effect.succeed({
  ping: ({ payload: _payload }) => Effect.succeed({ pong: true })
}))

// ---------------------------------------------------------------------------
// Entity C: Persisted + NO primaryKey + ClientTracingEnabled=false
// ---------------------------------------------------------------------------

const PingPersistedNoPKRpc = Rpc.make("ping", {
  payload: { id: Schema.String },
  success: Schema.Struct({ pong: Schema.Boolean })
}).annotate(ClusterSchema.Persisted, true)

const PersistedNoPKEntity = Entity.make("PersistedNoPK", [PingPersistedNoPKRpc])
  .annotate(ClusterSchema.ClientTracingEnabled, false)

const persistedNoPKEntityLayer = PersistedNoPKEntity.toLayer(Effect.succeed({
  ping: ({ payload: _payload }) => Effect.succeed({ pong: true })
}))

// ---------------------------------------------------------------------------
// Entity D: Plain (no Persisted, no primaryKey)
// ---------------------------------------------------------------------------

const PingPlainRpc = Rpc.make("ping", {
  success: Schema.Struct({ pong: Schema.Boolean })
})

const PlainEntity = Entity.make("PlainPing", [PingPlainRpc])

const plainEntityLayer = PlainEntity.toLayer(Effect.succeed({
  ping: () => Effect.succeed({ pong: true })
}))

// ---------------------------------------------------------------------------
// Layer factory
// ---------------------------------------------------------------------------

const makeTestLayer = (entityLayer: Layer.Layer<never, never, Sharding.Sharding>) => {
  const dbPath = join(tmpdir(), `pa-repro-${crypto.randomUUID()}.sqlite`)
  const sqliteLayer = SqliteRuntime.layer({ filename: dbPath })
  const migrationLayer = DomainMigrator.layer.pipe(Layer.provide(sqliteLayer), Layer.orDie)
  const sqlInfrastructureLayer = Layer.mergeAll(sqliteLayer, migrationLayer)

  const clusterLayer = SingleRunner.layer().pipe(
    Layer.provide(sqlInfrastructureLayer),
    Layer.orDie
  )

  const resolvedEntityLayer = entityLayer.pipe(
    Layer.provide(clusterLayer)
  )

  const testLayer = Layer.mergeAll(
    sqlInfrastructureLayer
  ).pipe(
    Layer.provideMerge(clusterLayer),
    Layer.provideMerge(resolvedEntityLayer)
  )

  return { dbPath, testLayer }
}

// ---------------------------------------------------------------------------
// Tests — must use it.live for SingleRunner (TestClock breaks reply polling)
// ---------------------------------------------------------------------------

describe("SingleRunner annotation matrix", () => {
  it.live("A: Persisted + primaryKey + ClientTracingEnabled=false", () => {
    const { dbPath, testLayer } = makeTestLayer(persistedEntityLayer)

    return Effect.gen(function*() {
      const makeClient = yield* PersistedEntity.client
      const client = makeClient("test-entity-1")
      const result = yield* client.ping({ id: "req-1" }).pipe(
        Effect.timeout("5 seconds")
      )
      expect(result).toEqual({ pong: true })
    }).pipe(
      Effect.provide(testLayer),
      Effect.ensuring(Effect.sync(() => rmSync(dbPath, { force: true })))
    )
  }, { timeout: 10000 })

  it.live("B: Persisted + primaryKey, NO ClientTracingEnabled", () => {
    const { dbPath, testLayer } = makeTestLayer(persistedNoCTEntityLayer)

    return Effect.gen(function*() {
      const makeClient = yield* PersistedNoCTEntity.client
      const client = makeClient("test-entity-1")
      const result = yield* client.ping({ id: "req-1" }).pipe(
        Effect.timeout("5 seconds")
      )
      expect(result).toEqual({ pong: true })
    }).pipe(
      Effect.provide(testLayer),
      Effect.ensuring(Effect.sync(() => rmSync(dbPath, { force: true })))
    )
  }, { timeout: 10000 })

  it.live("C: Persisted + NO primaryKey + ClientTracingEnabled=false", () => {
    const { dbPath, testLayer } = makeTestLayer(persistedNoPKEntityLayer)

    return Effect.gen(function*() {
      const makeClient = yield* PersistedNoPKEntity.client
      const client = makeClient("test-entity-1")
      const result = yield* client.ping({ id: "req-1" }).pipe(
        Effect.timeout("5 seconds")
      )
      expect(result).toEqual({ pong: true })
    }).pipe(
      Effect.provide(testLayer),
      Effect.ensuring(Effect.sync(() => rmSync(dbPath, { force: true })))
    )
  }, { timeout: 10000 })

  it.live("D: Plain (no Persisted, no primaryKey)", () => {
    const { dbPath, testLayer } = makeTestLayer(plainEntityLayer)

    return Effect.gen(function*() {
      const makeClient = yield* PlainEntity.client
      const client = makeClient("test-entity-1")
      const result = yield* client.ping().pipe(
        Effect.timeout("5 seconds")
      )
      expect(result).toEqual({ pong: true })
    }).pipe(
      Effect.provide(testLayer),
      Effect.ensuring(Effect.sync(() => rmSync(dbPath, { force: true })))
    )
  }, { timeout: 10000 })
})
