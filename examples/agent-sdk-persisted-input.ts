import * as Console from "effect/Console"
import * as Effect from "effect/Effect"
import * as Stream from "effect/Stream"
import { AgentSdk, Experimental, Schema } from "../src/index.js"

const program = Effect.scoped(
  Effect.gen(function*() {
    const queue = yield* Experimental.PersistedQueue.makeUserMessageQueue({
      name: "agent-input"
    })
    const handle = yield* Experimental.PersistedQueue.queryWithPersistedInput(queue)

    const message: Schema.SDKUserMessage = {
      type: "user",
      session_id: "",
      message: {
        role: "user",
        content: [{ type: "text", text: "Write a haiku about Effect." }]
      },
      parent_tool_use_id: null
    }

    yield* handle.send(message)
    yield* handle.stream.pipe(Stream.tap((message) => Console.log(message)), Stream.runDrain)
    yield* handle.interrupt
  }).pipe(
    Effect.provide([
      AgentSdk.layerDefaultFromEnv(),
      Experimental.PersistedQueue.layerMemory
    ])
  )
)

Effect.runPromise(program)
