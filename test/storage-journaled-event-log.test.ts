import { expect, test } from "bun:test"
import * as EventJournal from "@effect/experimental/EventJournal"
import { KeyValueStore, MsgPack } from "@effect/platform"
import * as Context from "effect/Context"
import * as Effect from "effect/Effect"
import * as Layer from "effect/Layer"
import * as Option from "effect/Option"
import * as Schema from "effect/Schema"
import { runEffect } from "./effect-test.js"
import { Schema as SdkSchema, Storage } from "../src/index.js"
import { makeUserMessage } from "../src/internal/messages.js"

const EntryArray = Schema.Array(EventJournal.Entry)
const EntryArrayMsgPack = MsgPack.schema(EntryArray)
const decodeEntries = Schema.decode(EntryArrayMsgPack)
const decodeChatEvent = Schema.decode(MsgPack.schema(SdkSchema.ChatEvent))
const decodeArtifactDelete = Schema.decode(MsgPack.schema(Storage.ArtifactDelete))

const loadJournalEntries = (kv: KeyValueStore.KeyValueStore, key: string) =>
  Effect.gen(function*() {
    const maybe = yield* kv.getUint8Array(key)
    if (Option.isNone(maybe)) return []
    return yield* decodeEntries(maybe.value)
  })

const withKeyValueStore = <A, E>(
  f: (kv: KeyValueStore.KeyValueStore) => Effect.Effect<A, E>
) =>
  Effect.scoped(
    Effect.gen(function*() {
      const context = yield* Layer.build(KeyValueStore.layerMemory)
      const kv = Context.get(context, KeyValueStore.KeyValueStore)
      return yield* f(kv)
    })
  )

const makeChatLayer = (
  kv: KeyValueStore.KeyValueStore,
  options: { journalKey: string; identityKey: string; prefix: string }
) =>
  Storage.ChatHistoryStore.layerJournaled(options).pipe(
    Layer.provide(Layer.succeed(KeyValueStore.KeyValueStore, kv))
  )

const makeArtifactLayer = (
  kv: KeyValueStore.KeyValueStore,
  options: { journalKey: string; identityKey: string; prefix: string }
) =>
  Storage.ArtifactStore.layerJournaled(options).pipe(
    Layer.provide(Layer.succeed(KeyValueStore.KeyValueStore, kv))
  )

const makeArtifactRecord = (id: string, sessionId: string) =>
  SdkSchema.ArtifactRecord.make({
    id,
    sessionId,
    kind: "tool_result",
    encoding: "utf8",
    content: `content-${id}`,
    createdAt: 0
  })

test("ChatHistoryStore journaled writes chat events to the event journal", async () => {
  const message = makeUserMessage("hello")
  const journalKey = "test-chat-journal"
  const program = withKeyValueStore((kv) =>
    Effect.gen(function*() {
      const store = yield* Storage.ChatHistoryStore
      yield* store.appendMessage("session-1", message)
      yield* store.appendMessage("session-1", message)
      const entries = yield* loadJournalEntries(kv, journalKey)
      const decoded = yield* Effect.forEach(entries, (entry) => decodeChatEvent(entry.payload), {
        discard: false
      })
      return { entries, decoded }
    }).pipe(
      Effect.provide(
        makeChatLayer(kv, {
          journalKey,
          identityKey: "test-chat-identity",
          prefix: "test-chat-history"
        })
      )
    )
  )

  const result = await runEffect(program)
  expect(result.entries).toHaveLength(2)
  expect(result.entries.every((entry) => entry.event === Storage.ChatEventTag)).toBe(true)
  expect(result.decoded.map((event) => event.sequence)).toEqual([1, 2])
  expect(result.decoded[0]?.message).toEqual(message)
})

test("ArtifactStore journaled writes delete tombstones", async () => {
  const journalKey = "test-artifact-journal"
  const program = withKeyValueStore((kv) =>
    Effect.gen(function*() {
      const store = yield* Storage.ArtifactStore
      const first = makeArtifactRecord("artifact-1", "session-1")
      const second = makeArtifactRecord("artifact-2", "session-1")
      yield* store.put(first)
      yield* store.put(second)
      yield* store.delete(first.id)
      const list = yield* store.list("session-1")
      const entries = yield* loadJournalEntries(kv, journalKey)
      const deletes = entries.filter((entry) => entry.event === Storage.ArtifactDeleteTag)
      const decodedDeletes = yield* Effect.forEach(
        deletes,
        (entry) => decodeArtifactDelete(entry.payload),
        { discard: false }
      )
      return { entries, deletes, decodedDeletes, list }
    }).pipe(
      Effect.provide(
        makeArtifactLayer(kv, {
          journalKey,
          identityKey: "test-artifact-identity",
          prefix: "test-artifacts"
        })
      )
    )
  )

  const result = await runEffect(program)
  expect(result.list.length).toBe(1)
  expect(result.entries.length).toBe(3)
  expect(result.deletes).toHaveLength(1)
  expect(result.decodedDeletes[0]?.id).toBe("artifact-1")
})

test("ArtifactStore journaled purgeSession writes tombstones for all records", async () => {
  const journalKey = "test-artifact-journal-purge"
  const program = withKeyValueStore((kv) =>
    Effect.gen(function*() {
      const store = yield* Storage.ArtifactStore
      const first = makeArtifactRecord("artifact-a", "session-2")
      const second = makeArtifactRecord("artifact-b", "session-2")
      yield* store.put(first)
      yield* store.put(second)
      yield* store.purgeSession("session-2")
      const list = yield* store.list("session-2")
      const entries = yield* loadJournalEntries(kv, journalKey)
      const deletes = entries.filter((entry) => entry.event === Storage.ArtifactDeleteTag)
      const decodedDeletes = yield* Effect.forEach(
        deletes,
        (entry) => decodeArtifactDelete(entry.payload),
        { discard: false }
      )
      return { list, deletes, decodedDeletes }
    }).pipe(
      Effect.provide(
        makeArtifactLayer(kv, {
          journalKey,
          identityKey: "test-artifact-identity-purge",
          prefix: "test-artifacts-purge"
        })
      )
    )
  )

  const result = await runEffect(program)
  expect(result.list.length).toBe(0)
  expect(result.deletes).toHaveLength(2)
  expect(result.decodedDeletes.map((entry) => entry.id).sort()).toEqual([
    "artifact-a",
    "artifact-b"
  ])
})
