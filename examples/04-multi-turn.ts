import * as Effect from "effect/Effect"
import * as Stream from "effect/Stream"
import { SessionService } from "effect-claude-agent-sdk"

const program = Effect.scoped(
  Effect.gen(function*() {
    const session = yield* SessionService
    yield* session.send("Hello! Keep responses concise.")
    yield* session.send("What are two good uses for Event Sourcing?")
    yield* session.stream.pipe(Stream.runDrain)
  }).pipe(
    Effect.provide(
      SessionService.layerDefaultFromEnv({
        model: "claude-sonnet-4-20250514"
      })
    )
  )
)

Effect.runPromise(program)
