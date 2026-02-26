import { test, expect } from "bun:test"
import * as Effect from "effect/Effect"
import * as PersistedQueue from "../src/experimental/PersistedQueue.js"
import { makeUserMessage } from "../src/internal/messages.js"

test("PersistedQueue input adapter yields offered messages", async () => {
  const message = makeUserMessage("hello")
  const queue = await Effect.runPromise(
    PersistedQueue.makeUserMessageQueue({ name: "test-queue" }).pipe(
      Effect.provide(PersistedQueue.layerMemory)
    )
  )
  const adapter = await Effect.runPromise(PersistedQueue.makeInputAdapter(queue))

  await Effect.runPromise(adapter.send(message))

  const iterator = adapter.input[Symbol.asyncIterator]()
  const result = await iterator.next()
  await iterator.return?.()

  expect(result.value).toEqual(message)
})
