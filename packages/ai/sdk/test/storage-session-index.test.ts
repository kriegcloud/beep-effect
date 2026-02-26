import { test, expect } from "bun:test"
import * as Effect from "effect/Effect"
import * as Layer from "effect/Layer"
import { KeyValueStore } from "@effect/platform"
import { Storage } from "../src/index.js"
import { makeUserMessage } from "../src/internal/messages.js"

test("SessionIndexStore memory tracks sessions", async () => {
  const program = Effect.gen(function*() {
    const index = yield* Storage.SessionIndexStore
    yield* index.touch("session-1")
    yield* index.touch("session-2")
    return yield* index.listIds()
  }).pipe(Effect.provide(Storage.SessionIndexStore.layerMemory))

  const ids = await Effect.runPromise(program)
  expect(ids).toEqual(["session-1", "session-2"])
})

test("SessionIndexStore key value store tracks sessions", async () => {
  const layer = Storage.SessionIndexStore.layerKeyValueStore({
    prefix: "test-session-index"
  }).pipe(
    Layer.provide(KeyValueStore.layerMemory)
  )

  const program = Effect.gen(function*() {
    const index = yield* Storage.SessionIndexStore
    yield* index.touch("session-1")
    yield* index.touch("session-2")
    return yield* index.listIds()
  }).pipe(Effect.provide(layer))

  const ids = await Effect.runPromise(program)
  expect(ids).toEqual(["session-1", "session-2"])
})

test("SessionIndexStore orders and paginates by cursor", async () => {
  const program = Effect.gen(function*() {
    const index = yield* Storage.SessionIndexStore
    yield* index.touch("session-1", { createdAt: 1000, updatedAt: 1000 })
    yield* index.touch("session-2", { createdAt: 1500, updatedAt: 2000 })
    const ordered = yield* index.list({ orderBy: "updatedAt", direction: "desc" })
    const cursor = Storage.makeCursor(ordered[0]!, "updatedAt")
    const next = yield* index.list({
      orderBy: "updatedAt",
      direction: "desc",
      cursor
    })
    return { ordered, next }
  }).pipe(Effect.provide(Storage.SessionIndexStore.layerMemory))

  const result = await Effect.runPromise(program)
  expect(result.ordered[0]?.sessionId).toBe("session-2")
  expect(result.next.map((meta) => meta.sessionId)).toEqual(["session-1"])
})

test("SessionIndexStore listPage returns next cursor", async () => {
  const program = Effect.gen(function*() {
    const index = yield* Storage.SessionIndexStore
    yield* index.touch("session-1", { createdAt: 1000, updatedAt: 1000 })
    yield* index.touch("session-2", { createdAt: 1500, updatedAt: 2000 })
    const first = yield* index.listPage({ orderBy: "updatedAt", direction: "desc", limit: 1 })
    const second = yield* index.listPage(
      first.nextCursor
        ? {
            orderBy: "updatedAt",
            direction: "desc",
            cursor: first.nextCursor,
            limit: 1
          }
        : {
            orderBy: "updatedAt",
            direction: "desc",
            limit: 1
          }
    )
    return { first, second }
  }).pipe(Effect.provide(Storage.SessionIndexStore.layerMemory))

  const result = await Effect.runPromise(program)
  expect(result.first.items.map((meta) => meta.sessionId)).toEqual(["session-2"])
  expect(result.second.items.map((meta) => meta.sessionId)).toEqual(["session-1"])
})

test("SessionIndexStore listPage omits next cursor on final page", async () => {
  const program = Effect.gen(function*() {
    const index = yield* Storage.SessionIndexStore
    yield* index.touch("session-1", { createdAt: 1000, updatedAt: 1000 })
    yield* index.touch("session-2", { createdAt: 1500, updatedAt: 2000 })
    return yield* index.listPage({ orderBy: "updatedAt", direction: "desc", limit: 2 })
  }).pipe(Effect.provide(Storage.SessionIndexStore.layerMemory))

  const result = await Effect.runPromise(program)
  expect(result.items.map((meta) => meta.sessionId)).toEqual(["session-2", "session-1"])
  expect(result.nextCursor).toBeUndefined()
})

test("SessionIndexStore orders by createdAt asc", async () => {
  const program = Effect.gen(function*() {
    const index = yield* Storage.SessionIndexStore
    yield* index.touch("session-1", { createdAt: 1000, updatedAt: 2000 })
    yield* index.touch("session-2", { createdAt: 1500, updatedAt: 1500 })
    yield* index.touch("session-3", { createdAt: 2000, updatedAt: 1000 })
    const first = yield* index.listPage({ orderBy: "createdAt", direction: "asc", limit: 2 })
    const second = yield* index.listPage(
      first.nextCursor
        ? {
            orderBy: "createdAt",
            direction: "asc",
            cursor: first.nextCursor,
            limit: 2
          }
        : {
            orderBy: "createdAt",
            direction: "asc",
            limit: 2
          }
    )
    return { first, second }
  }).pipe(Effect.provide(Storage.SessionIndexStore.layerMemory))

  const result = await Effect.runPromise(program)
  expect(result.first.items.map((meta) => meta.sessionId)).toEqual(["session-1", "session-2"])
  expect(result.second.items.map((meta) => meta.sessionId)).toEqual(["session-3"])
  expect(result.second.nextCursor).toBeUndefined()
})

test("SessionIndexStore applies default limit without StorageConfig", async () => {
  const program = Effect.gen(function*() {
    const index = yield* Storage.SessionIndexStore
    const total = Storage.defaultIndexPageSize + 1
    for (let i = 0; i < total; i += 1) {
      yield* index.touch(`session-${i}`, { createdAt: i, updatedAt: i })
    }
    const first = yield* index.listPage()
    const second = first.nextCursor
      ? yield* index.listPage({ cursor: first.nextCursor })
      : { items: [] }
    return { first, second }
  }).pipe(Effect.provide(Storage.SessionIndexStore.layerMemory))

  const result = await Effect.runPromise(program)
  expect(result.first.items.length).toBe(Storage.defaultIndexPageSize)
  expect(result.first.nextCursor).toBeDefined()
  expect(result.second.items.length).toBe(1)
})

test("ChatHistoryStore updates SessionIndexStore when provided", async () => {
  const kvLayer = KeyValueStore.layerMemory
  const sessionIndexLayer = Storage.SessionIndexStore.layerKeyValueStore({
    prefix: "test-session-index"
  }).pipe(
    Layer.provide(kvLayer)
  )
  const chatLayer = Storage.ChatHistoryStore.layerKeyValueStore({
    prefix: "test-chat-history"
  }).pipe(
    Layer.provide(kvLayer)
  )

  const program = Effect.gen(function*() {
    const chat = yield* Storage.ChatHistoryStore
    yield* chat.appendMessage("session-1", makeUserMessage("hello"))
    const index = yield* Storage.SessionIndexStore
    return yield* index.listIds()
  }).pipe(
    Effect.provide(Layer.mergeAll(sessionIndexLayer, chatLayer))
  )

  const ids = await Effect.runPromise(program)
  expect(ids).toEqual(["session-1"])
})
