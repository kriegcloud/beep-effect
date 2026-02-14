import * as Console from "effect/Console"
import * as Effect from "effect/Effect"
import * as Ref from "effect/Ref"
import * as Stream from "effect/Stream"
import { AgentSdk, Storage } from "../src/index.js"

const program = Effect.scoped(
  Effect.gen(function*() {
    const sdk = yield* AgentSdk
    const store = yield* Storage.ChatHistoryStore
    const handle = yield* sdk.query("Summarize the current repository.")

    const recorded = yield* Storage.ChatHistory.withRecorder(handle, {
      recordOutput: true
    })

    const sessionIdRef = yield* Ref.make<string | null>(null)
    yield* recorded.stream.pipe(
      Stream.tap((message) =>
        Ref.update(sessionIdRef, (current) => current ?? message.session_id)
      ),
      Stream.runDrain
    )

    const sessionId = yield* Ref.get(sessionIdRef)
    if (!sessionId) return

    const events = yield* store.list(sessionId, { reverse: true, limit: 5 })
    yield* Console.log(events)
  }).pipe(
    Effect.provide([
      AgentSdk.layerDefaultFromEnv(),
      Storage.ChatHistoryStore.layerMemory
    ])
  )
)

Effect.runPromise(program)
