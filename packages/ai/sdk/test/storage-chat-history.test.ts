import { test, expect } from "bun:test"
import * as Layer from "effect/Layer"
import * as Effect from "effect/Effect"
import { KeyValueStore } from "@effect/platform"
import { Storage } from "../src/index.js"
import { makeUserMessage } from "../src/internal/messages.js"

const makeProgram = (layer: Layer.Layer<Storage.ChatHistoryStore>) =>
  Effect.gen(function*() {
    const store = yield* Storage.ChatHistoryStore
    const message = makeUserMessage("hello")
    const first = yield* store.appendMessage("session-1", message)
    const second = yield* store.appendMessage("session-1", message)
    const list = yield* store.list("session-1")
    return { first, second, list }
  }).pipe(Effect.provide(layer))

test("ChatHistoryStore memory appends sequences", async () => {
  const program = makeProgram(Storage.ChatHistoryStore.layerMemory)
  const result = await Effect.runPromise(program)

  expect(result.first.sequence).toBe(1)
  expect(result.second.sequence).toBe(2)
  expect(result.list.length).toBe(2)
})

test("ChatHistoryStore key value store persists events", async () => {
  const layer = Storage.ChatHistoryStore.layerKeyValueStore({ prefix: "test-chat-history" }).pipe(
    Layer.provide(KeyValueStore.layerMemory)
  )
  const program = makeProgram(layer)
  const result = await Effect.runPromise(program)

  expect(result.list.length).toBe(2)
})
