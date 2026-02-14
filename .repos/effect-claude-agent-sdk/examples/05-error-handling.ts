import * as Effect from "effect/Effect"
import * as Stream from "effect/Stream"
import { AgentRuntime } from "effect-claude-agent-sdk"

const program = Effect.scoped(
  Effect.gen(function*() {
    const runtime = yield* AgentRuntime
    const handle = yield* runtime.query("Say hello from an invalid model.", {
      model: "invalid-model-name"
    })
    yield* handle.stream.pipe(Stream.runDrain)
  }).pipe(
    Effect.catchAll((error) =>
      Effect.logError(`Query failed: ${String((error as Error).message ?? error)}`)
    ),
    Effect.provide(AgentRuntime.layerDefaultFromEnv())
  )
)

Effect.runPromise(program)
