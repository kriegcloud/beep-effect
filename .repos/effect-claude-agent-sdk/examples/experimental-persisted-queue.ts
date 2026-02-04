import * as Effect from "effect/Effect"
import * as PersistedQueue from "../src/experimental/PersistedQueue.js"
import { Schema } from "../src/index.js"

const program = Effect.gen(function*() {
  const queue = yield* PersistedQueue.makeUserMessageQueue({ name: "demo-queue" })
  const adapter = yield* PersistedQueue.makeInputAdapter(queue)

  const message: Schema.SDKUserMessage = {
    type: "user",
    session_id: "",
    message: {
      role: "user",
      content: [{ type: "text", text: "hello" }]
    },
    parent_tool_use_id: null
  }
  yield* adapter.send(message)

  const iterator = adapter.input[Symbol.asyncIterator]()
  const next = yield* Effect.promise(() => iterator.next())
  yield* Effect.log(next.value)
}).pipe(Effect.provide(PersistedQueue.layerMemory))

Effect.runPromise(program)
