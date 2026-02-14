import * as Effect from "effect/Effect"
import * as Stream from "effect/Stream"
import { AgentRuntime, Sync } from "effect-claude-agent-sdk"

const program = Effect.scoped(
  Effect.gen(function*() {
    const runtime = yield* AgentRuntime
    const handle = yield* runtime.query("Hello from a synced runtime.")
    yield* handle.stream.pipe(Stream.runDrain)
  }).pipe(
    Effect.provide(
      Sync.withRemoteSync("wss://your-sync-server.example.com/event-log")
    )
  )
)

Effect.runPromise(program)
