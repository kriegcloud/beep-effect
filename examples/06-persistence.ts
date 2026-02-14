import * as Effect from "effect/Effect"
import * as Stream from "effect/Stream"
import { AgentRuntime, Storage } from "effect-claude-agent-sdk"

const storage = Storage.layers({
  backend: "bun",
  mode: "standard",
  directory: ".agent-data"
})

const runtimeLayer = AgentRuntime.layerWithPersistence({
  layers: {
    runtime: AgentRuntime.layerDefaultFromEnv(),
    chatHistory: storage.chatHistory,
    artifacts: storage.artifacts,
    auditLog: storage.auditLog,
    sessionIndex: storage.sessionIndex
  }
})

const program = Effect.scoped(
  Effect.gen(function*() {
    const runtime = yield* AgentRuntime
    const handle = yield* runtime.query("Persist this conversation to disk.")
    yield* handle.stream.pipe(Stream.runDrain)
  }).pipe(
    Effect.provide(runtimeLayer)
  )
)

Effect.runPromise(program)
