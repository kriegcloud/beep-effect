import { expect, test } from "bun:test"
import { KeyValueStore } from "@effect/platform"
import * as Context from "effect/Context"
import * as Duration from "effect/Duration"
import * as Effect from "effect/Effect"
import * as Layer from "effect/Layer"
import { runEffectLive } from "./effect-test.js"
import { Storage, Sync } from "../src/index.js"
import { makeUserMessage } from "../src/internal/messages.js"

const allowServe =
  Bun.env.SYNC_TEST_ALLOW_SERVE === "1" || Bun.env.SYNC_TEST_ALLOW_SERVE === "true"
const maybeTest = allowServe ? test : test.skip

const waitFor = <A, E>(
  label: string,
  effect: Effect.Effect<A, E>,
  predicate: (value: A) => boolean,
  options?: {
    readonly retries?: number
    readonly interval?: Duration.DurationInput
  }
) =>
  Effect.gen(function*() {
    const retries = options?.retries ?? 40
    const interval = options?.interval ?? Duration.millis(25)
    let lastValue: A | undefined = undefined
    for (let attempt = 0; attempt < retries; attempt += 1) {
      const value = yield* effect
      lastValue = value
      if (predicate(value)) return value
      yield* Effect.sleep(interval)
    }
    return yield* Effect.die(new Error(`Timed out waiting for ${label}.`))
  })

const sharedIdentityKey = "sync-test-compaction-identity"

const storageConfigLayer = Layer.succeed(
  Storage.StorageConfig,
  Storage.StorageConfig.make({
    settings: {
      enabled: {
        chatHistory: true,
        artifacts: true,
        auditLog: false
      },
    retention: {
      chat: {
        maxEvents: 2,
        maxAge: Duration.days(1)
      },
      artifacts: {
        maxArtifacts: 5000,
        maxArtifactBytes: 500_000_000,
        maxAge: Duration.days(90)
      },
      audit: {
        maxEntries: 100_000,
        maxAge: Duration.days(180)
      }
    },
    pagination: {
      chatPageSize: 100,
      artifactPageSize: 100
    },
    kv: {
      indexPageSize: 500
    },
    cleanup: {
      enabled: false,
      interval: Duration.hours(1),
      runOnStart: false
    },
    sync: {
      interval: Duration.millis(0)
    }
    }
  })
)

const makeReplicaLayer = (
  url: string,
  kv: KeyValueStore.KeyValueStore,
  options: { readonly prefix: string }
) => {
  const baseLayer = Storage.ChatHistoryStore.layerJournaledWithEventLog({
    prefix: options.prefix,
    identityKey: sharedIdentityKey
  })
  const syncLayer = Sync.SyncService.layerWebSocket(url, { disablePing: true }).pipe(
    Layer.provide(baseLayer)
  )
  return Layer.merge(baseLayer, syncLayer).pipe(
    Layer.provide(storageConfigLayer),
    Layer.provide(Layer.succeed(KeyValueStore.KeyValueStore, kv))
  )
}

maybeTest(
  "ChatHistoryStore compaction retains last N events after remote sync",
  async () => {
    const program = Effect.scoped(
      Effect.gen(function*() {
        const server = yield* Sync.EventLogRemoteServer
        const kvContext = yield* Layer.build(KeyValueStore.layerMemory)
        const kv = Context.get(kvContext, KeyValueStore.KeyValueStore)
        const replicaAContext = yield* Layer.build(
          makeReplicaLayer(server.url, kv, { prefix: "replica-a" })
        )
        const replicaBContext = yield* Layer.build(
          makeReplicaLayer(server.url, kv, { prefix: "replica-b" })
        )

        const storeA = Context.get(replicaAContext, Storage.ChatHistoryStore)
        const storeB = Context.get(replicaBContext, Storage.ChatHistoryStore)
        const syncA = Context.get(replicaAContext, Sync.SyncService)
        const syncB = Context.get(replicaBContext, Sync.SyncService)

        yield* waitFor(
          "replica A to connect",
          syncA.status(),
          (statuses) => statuses.some((status) => status.key === server.url && status.connected)
        )
        yield* waitFor(
          "replica B to connect",
          syncB.status(),
          (statuses) => statuses.some((status) => status.key === server.url && status.connected)
        )

        yield* storeA.appendMessage("session-1", makeUserMessage("one"))
        yield* storeA.appendMessage("session-1", makeUserMessage("two"))
        yield* storeA.appendMessage("session-1", makeUserMessage("three"))

        const listB = yield* waitFor(
          "replica B to compact messages",
          storeB.list("session-1"),
          (list) => list.length === 2
        )

        yield* syncA.disconnectWebSocket(server.url)
        yield* syncB.disconnectWebSocket(server.url)
        yield* Effect.sleep(Duration.millis(25))

        return listB
      }).pipe(
        Effect.provide(Sync.layerBunWebSocketTest())
      )
    )

    const listB = await runEffectLive(program)
    expect(listB).toHaveLength(2)
    expect(listB.map((event) => event.sequence)).toEqual([2, 3])
  },
  { timeout: 15000 }
)
