import * as Effect from "effect/Effect"
import * as Layer from "effect/Layer"
import * as Stream from "effect/Stream"
import { Storage, Sync } from "../src/index.js"

const url = process.env.SYNC_URL ?? "ws://localhost:8787/event-log"
const tenant = process.env.SYNC_TENANT
const authToken = process.env.SYNC_AUTH_TOKEN

const remoteUrl =
  tenant !== undefined || authToken !== undefined
    ? Sync.buildRemoteUrl(url, {
        ...(tenant !== undefined ? { tenant } : {}),
        ...(authToken !== undefined ? { authToken } : {})
      })
    : url

const layers = Storage.layers({
  backend: "bun",
  sync: {
    url: remoteUrl,
    syncInterval: "3 seconds",
    exposeSync: true
  }
})

if (!layers.sync) {
  throw new Error("Sync layer not available. Set exposeSync: true.")
}

const syncLayer = layers.sync
const appLayer = Layer.mergeAll(
  layers.chatHistory,
  layers.artifacts,
  layers.auditLog,
  layers.sessionIndex,
  syncLayer
)

const program = Stream.runForEach(
  Sync.statusStream,
  (status) => Effect.logInfo(`sync status: ${JSON.stringify(status)}`)
).pipe(Effect.provide(appLayer))

Effect.runPromise(program)
