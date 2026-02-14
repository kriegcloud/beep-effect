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

const debugEnabled =
  Bun.env.SYNC_TEST_DEBUG === "1" || Bun.env.SYNC_TEST_DEBUG === "true"
const debug = (...args: Array<unknown>) => {
  if (debugEnabled) console.log("[sync-test]", ...args)
}
const debugEffect = (...args: Array<unknown>) =>
  debugEnabled ? Effect.sync(() => debug(...args)) : Effect.void

const canListen = async () => {
  const maxAttempts = 5
  const minPort = 20000
  const maxPort = 45000

  for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
    const port = minPort + Math.floor(Math.random() * (maxPort - minPort))
    try {
      const server = Bun.serve({ port, fetch: () => new Response("ok") })
      server.stop(true)
      return true
    } catch (error) {
      if (typeof error === "object" && error !== null && "code" in error) {
        const code = (error as { code?: string }).code
        if (code === "EADDRINUSE") continue
        if (code === "EPERM") return false
      }
      return false
    }
  }

  return false
}

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
      yield* debugEffect(`waitFor ${label} attempt ${attempt + 1}`, value)
      yield* Effect.sleep(interval)
    }
    yield* debugEffect(`waitFor ${label} timed out`, lastValue)
    return yield* Effect.die(new Error(`Timed out waiting for ${label}.`))
  })

const sharedIdentityKey = "sync-test-identity"

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
    Layer.provide(Layer.succeed(KeyValueStore.KeyValueStore, kv))
  )
}

maybeTest(
  "Remote sync converges and resumes after reconnect",
  async () => {
  if (!(await canListen())) return
  const program = Effect.scoped(
    Effect.gen(function*() {
      const server = yield* Sync.EventLogRemoteServer
      const kvContext = yield* Layer.build(KeyValueStore.layerMemory)
      const kv = Context.get(kvContext, KeyValueStore.KeyValueStore)
      yield* debugEffect("server", {
        url: server.url,
        address: server.address
      })
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
      yield* debugEffect("status after connect A", yield* syncA.status())

      yield* waitFor(
        "replica B to connect",
        syncB.status(),
        (statuses) => statuses.some((status) => status.key === server.url && status.connected)
      )
      yield* debugEffect("status after connect B", yield* syncB.status())

      const firstMessage = makeUserMessage("hello")
      yield* storeA.appendMessage("session-1", firstMessage)

      const listB = yield* waitFor(
        "replica B to receive first message",
        storeB.list("session-1"),
        (list) => list.length === 1
      )
      yield* debugEffect("replica B list after first", listB)

      yield* syncA.disconnectWebSocket(server.url)
      yield* debugEffect("status after disconnect A", yield* syncA.status())

      const secondMessage = makeUserMessage("hello again")
      yield* storeB.appendMessage("session-1", secondMessage)

      yield* syncA.connectWebSocket(server.url, { disablePing: true })

      const listA = yield* waitFor(
        "replica A to receive second message",
        storeA.list("session-1"),
        (list) => list.length === 2
      )
      yield* debugEffect("replica A list after second", listA)

      yield* syncA.disconnectWebSocket(server.url)
      yield* syncB.disconnectWebSocket(server.url)
      yield* Effect.sleep(Duration.millis(25))

      return { listA, listB }
    }).pipe(
      Effect.provide(Sync.layerBunWebSocketTest())
    )
  )

  const result = await runEffectLive(program)
  expect(result.listB).toHaveLength(1)
  expect(result.listA.map((event) => event.sequence)).toEqual([1, 2])
  },
  { timeout: 15000 }
)
