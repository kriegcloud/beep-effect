import * as Console from "effect/Console"
import * as Effect from "effect/Effect"
import * as Stream from "effect/Stream"
import { AgentSdk, Experimental } from "../src/index.js"

const program = Effect.scoped(
  Effect.gen(function*() {
    const sdk = yield* AgentSdk
    const handle = yield* sdk.query("List the supported slash commands.")
    const cached = yield* Experimental.PersistedCache.makeCachedQueryHandle(handle, {
      timeToLive: "1 minute"
    })

    yield* handle.stream.pipe(Stream.tap((message) => Console.log(message)), Stream.runDrain)
    const commands = yield* cached.supportedCommands
    yield* Effect.log(commands)
    yield* handle.interrupt
  }).pipe(
    Effect.provide([
      AgentSdk.layerDefaultFromEnv(),
      Experimental.PersistedCache.Persistence.layerResultMemory
    ])
  )
)

Effect.runPromise(program)
