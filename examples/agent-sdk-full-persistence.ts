import { KeyValueStore } from "@effect/platform"
import * as Effect from "effect/Effect"
import * as Layer from "effect/Layer"
import * as Stream from "effect/Stream"
import { AgentRuntime, Storage } from "../src/index.js"

const syncUrl = process.env.EVENT_LOG_WS_URL
const runtimeLayer = AgentRuntime.layerDefaultFromEnv().pipe(Layer.orDie)
const chatHistoryLayer = syncUrl
  ? Storage.ChatHistoryStore.layerJournaledWithSyncWebSocket(syncUrl).pipe(
      Layer.provide(KeyValueStore.layerMemory),
      Layer.orDie
    )
  : undefined

const program = Effect.scoped(
  Effect.gen(function*() {
    const runtime = yield* AgentRuntime
    const handle = yield* runtime.query("Summarize the current repository.")
    yield* handle.stream.pipe(Stream.runDrain)
  }).pipe(
    Effect.provide(
      AgentRuntime.layerWithPersistence({
        layers: chatHistoryLayer
          ? {
            runtime: runtimeLayer,
            chatHistory: chatHistoryLayer
          }
          : {
            runtime: runtimeLayer
          }
      })
    )
  )
)

Effect.runPromise(program)
