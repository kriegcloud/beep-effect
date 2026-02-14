import * as Effect from "effect/Effect"
import * as Stream from "effect/Stream"
import { AgentRuntime, Hooks } from "effect-claude-agent-sdk"

const program = Effect.scoped(
  Effect.gen(function*() {
    const runtime = yield* AgentRuntime
    const hooks = yield* Hooks.Presets.consoleLogger({
      events: ["PreToolUse", "PostToolUse"]
    })
    const handle = yield* runtime.query("Use any tools you need.", {
      hooks
    })
    yield* handle.stream.pipe(Stream.runDrain)
  }).pipe(Effect.provide(AgentRuntime.layerDefaultFromEnv()))
)

Effect.runPromise(program)
