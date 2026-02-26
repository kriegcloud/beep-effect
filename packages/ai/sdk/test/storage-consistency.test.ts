import { expect, test } from "bun:test"
import { KeyValueStore } from "@effect/platform"
import * as PlatformError from "@effect/platform/Error"
import * as Effect from "effect/Effect"
import * as Layer from "effect/Layer"
import * as Option from "effect/Option"
import { Schema, Storage } from "../src/index.js"
import { makeUserMessage } from "../src/internal/messages.js"
import { runEffect } from "./effect-test.js"

const makeArtifactRecord = (id: string, sessionId: string) =>
  Schema.ArtifactRecord.make({
    id,
    sessionId,
    kind: "tool_result",
    encoding: "utf8",
    content: `content-${id}`,
    createdAt: Date.now()
  })

const makeControlledKeyValueLayer = () => {
  const map = new Map<string, string>()
  const getCalls: Array<string> = []
  let failSetFor: (key: string) => boolean = () => false
  const setFailure = (key: string) =>
    new PlatformError.SystemError({
      reason: "Unknown",
      module: "KeyValueStore",
      method: "set",
      description: `set failed for key=${key}`
    })

  const layer = Layer.succeed(
    KeyValueStore.KeyValueStore,
    KeyValueStore.makeStringOnly({
      get: (key) =>
        Effect.sync(() => {
          getCalls.push(key)
          return Option.fromNullable(map.get(key))
        }),
      set: (key, value) =>
        failSetFor(key)
          ? Effect.fail(setFailure(key))
          : Effect.sync(() => {
              map.set(key, value)
            }),
      remove: (key) =>
        Effect.sync(() => {
          map.delete(key)
        }),
      has: (key) => Effect.sync(() => map.has(key)),
      isEmpty: Effect.sync(() => map.size === 0),
      size: Effect.sync(() => map.size),
      clear: Effect.sync(() => {
        map.clear()
      })
    })
  )

  return {
    layer,
    map,
    getCalls,
    setFailPredicate: (predicate: (key: string) => boolean) => {
      failSetFor = predicate
    }
  } as const
}

test("ArtifactStore.put compensates record write when index save fails", async () => {
  const prefix = "consistency-artifacts-put"
  const sessionId = "session-1"
  const control = makeControlledKeyValueLayer()
  control.setFailPredicate((key) => key === `${prefix}/by-session/${sessionId}`)

  const layer = Storage.ArtifactStore.layerKeyValueStore({ prefix }).pipe(
    Layer.provide(control.layer)
  )

  const result = await runEffect(
    Effect.gen(function*() {
      const store = yield* Storage.ArtifactStore
      const record = makeArtifactRecord("artifact-1", sessionId)
      const putResult = yield* Effect.either(store.put(record))
      const stored = yield* store.get(record.id)
      return { putResult, stored }
    }).pipe(Effect.provide(layer))
  )

  expect(result.putResult._tag).toBe("Left")
  expect(Option.isNone(result.stored)).toBe(true)
})

test("ArtifactStore.delete restores record when index save fails", async () => {
  const prefix = "consistency-artifacts-delete"
  const sessionId = "session-1"
  const control = makeControlledKeyValueLayer()

  const layer = Storage.ArtifactStore.layerKeyValueStore({ prefix }).pipe(
    Layer.provide(control.layer)
  )

  const result = await runEffect(
    Effect.gen(function*() {
      const store = yield* Storage.ArtifactStore
      const record = makeArtifactRecord("artifact-1", sessionId)
      yield* store.put(record)

      control.setFailPredicate((key) => key === `${prefix}/by-session/${sessionId}`)
      const deleteResult = yield* Effect.either(store.delete(record.id))
      control.setFailPredicate(() => false)

      const stored = yield* store.get(record.id)
      return { deleteResult, stored }
    }).pipe(Effect.provide(layer))
  )

  expect(result.deleteResult._tag).toBe("Left")
  expect(Option.isSome(result.stored)).toBe(true)
})

test("ArtifactStore.list repairs stale index entries", async () => {
  const prefix = "consistency-artifacts-repair"
  const sessionId = "session-1"
  const control = makeControlledKeyValueLayer()

  const layer = Storage.ArtifactStore.layerKeyValueStore({ prefix }).pipe(
    Layer.provide(control.layer)
  )

  const result = await runEffect(
    Effect.gen(function*() {
      const store = yield* Storage.ArtifactStore
      const first = makeArtifactRecord("artifact-1", sessionId)
      const second = makeArtifactRecord("artifact-2", sessionId)
      yield* store.put(first)
      yield* store.put(second)

      const staleRecordKey = `${prefix}/by-id/${second.id}`
      control.map.delete(staleRecordKey)

      const firstList = yield* store.list(sessionId)
      control.getCalls.length = 0
      const secondList = yield* store.list(sessionId)
      const secondReadTouchedStaleRecord = control.getCalls.includes(staleRecordKey)

      return { firstList, secondList, secondReadTouchedStaleRecord }
    }).pipe(Effect.provide(layer))
  )

  expect(result.firstList.map((record) => record.id)).toEqual(["artifact-1"])
  expect(result.secondList.map((record) => record.id)).toEqual(["artifact-1"])
  expect(result.secondReadTouchedStaleRecord).toBe(false)
})

test("ChatHistoryStore.appendMessage compensates event write when meta save fails", async () => {
  const prefix = "consistency-chat-append"
  const sessionId = "session-1"
  const control = makeControlledKeyValueLayer()
  control.setFailPredicate((key) => key === `${prefix}/${sessionId}/meta`)

  const layer = Storage.ChatHistoryStore.layerKeyValueStore({ prefix }).pipe(
    Layer.provide(control.layer)
  )

  const result = await runEffect(
    Effect.gen(function*() {
      const store = yield* Storage.ChatHistoryStore
      const appendResult = yield* Effect.either(
        store.appendMessage(sessionId, makeUserMessage("hello"))
      )
      control.setFailPredicate(() => false)
      const events = yield* store.list(sessionId)
      const eventKey = `${prefix}/${sessionId}/event/1`
      return { appendResult, events, hasEventKey: control.map.has(eventKey) }
    }).pipe(Effect.provide(layer))
  )

  expect(result.appendResult._tag).toBe("Left")
  expect(result.events).toEqual([])
  expect(result.hasEventKey).toBe(false)
})

test("ChatHistoryStore.cleanup repairs trailing meta gaps", async () => {
  const prefix = "consistency-chat-cleanup"
  const indexPrefix = "consistency-chat-cleanup-index"
  const sessionId = "session-1"
  const control = makeControlledKeyValueLayer()

  const chatLayer = Storage.ChatHistoryStore.layerKeyValueStore({ prefix }).pipe(
    Layer.provide(control.layer)
  )
  const sessionIndexLayer = Storage.SessionIndexStore.layerKeyValueStore({
    prefix: indexPrefix
  }).pipe(
    Layer.provide(control.layer)
  )

  const layer = Layer.mergeAll(
    chatLayer,
    sessionIndexLayer,
    Storage.StorageConfig.layer
  )

  const result = await runEffect(
    Effect.gen(function*() {
      const store = yield* Storage.ChatHistoryStore
      yield* store.appendMessage(sessionId, makeUserMessage("one"))
      yield* store.appendMessage(sessionId, makeUserMessage("two"))
      yield* store.appendMessage(sessionId, makeUserMessage("three"))

      control.map.delete(`${prefix}/${sessionId}/event/3`)

      if (store.cleanup) {
        yield* store.cleanup()
      }
      const next = yield* store.appendMessage(sessionId, makeUserMessage("after-cleanup"))
      return next.sequence
    }).pipe(Effect.provide(layer))
  )

  expect(result).toBe(3)
})
