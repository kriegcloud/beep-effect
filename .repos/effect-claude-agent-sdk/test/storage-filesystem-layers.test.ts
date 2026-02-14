import { test, expect } from "bun:test"
import { FileSystem } from "@effect/platform"
import { BunFileSystem } from "@effect/platform-bun"
import * as Effect from "effect/Effect"
import * as Layer from "effect/Layer"
import { Schema, Storage } from "../src/index.js"
import { makeUserMessage } from "../src/internal/messages.js"

const withTempDir = <A, E, R>(
  prefix: string,
  effect: (dir: string) => Effect.Effect<A, E, R>
) =>
  Effect.scoped(
    Effect.gen(function*() {
      const fs = yield* FileSystem.FileSystem
      const dir = yield* fs.makeTempDirectoryScoped({ prefix })
      return yield* effect(dir)
    }).pipe(Effect.provide(BunFileSystem.layer))
  )

test("ChatHistoryStore layerFileSystemBun persists events", async () => {
  const program = withTempDir("chat-history-", (dir) =>
    Effect.gen(function*() {
      const layerA = Storage.ChatHistoryStore.layerFileSystemBun({ directory: dir }).pipe(
        Layer.orDie
      )
      const layerB = Storage.ChatHistoryStore.layerFileSystemBun({ directory: dir }).pipe(
        Layer.orDie
      )
      const message = makeUserMessage("hello")

      yield* Effect.gen(function*() {
        const store = yield* Storage.ChatHistoryStore
        yield* store.appendMessage("session-1", message)
      }).pipe(Effect.provide(layerA))

      const events = yield* Effect.gen(function*() {
        const store = yield* Storage.ChatHistoryStore
        return yield* store.list("session-1")
      }).pipe(Effect.provide(layerB))

      return events.length
    })
  )

  const count = await Effect.runPromise(program)
  expect(count).toBe(1)
})

test("ArtifactStore layerFileSystemBun persists records", async () => {
  const program = withTempDir("artifact-store-", (dir) =>
    Effect.gen(function*() {
      const layerA = Storage.ArtifactStore.layerFileSystemBun({ directory: dir }).pipe(
        Layer.orDie
      )
      const layerB = Storage.ArtifactStore.layerFileSystemBun({ directory: dir }).pipe(
        Layer.orDie
      )
      const record = Schema.ArtifactRecord.make({
        id: "artifact-1",
        sessionId: "session-1",
        kind: "summary",
        encoding: "utf8",
        content: "Example artifact",
        sizeBytes: "Example artifact".length,
        createdAt: Date.now()
      })

      yield* Effect.gen(function*() {
        const store = yield* Storage.ArtifactStore
        yield* store.put(record)
      }).pipe(Effect.provide(layerA))

      const list = yield* Effect.gen(function*() {
        const store = yield* Storage.ArtifactStore
        return yield* store.list("session-1")
      }).pipe(Effect.provide(layerB))

      return list.length
    })
  )

  const count = await Effect.runPromise(program)
  expect(count).toBe(1)
})

test("AuditEventStore layerFileSystemBun persists entries", async () => {
  const program = withTempDir("audit-store-", (dir) =>
    Effect.gen(function*() {
      const layerA = Storage.AuditEventStore.layerFileSystemBun({ directory: dir }).pipe(
        Layer.orDie
      )
      const layerB = Storage.AuditEventStore.layerFileSystemBun({ directory: dir }).pipe(
        Layer.orDie
      )

      yield* Effect.gen(function*() {
        const store = yield* Storage.AuditEventStore
        yield* store.write({
          event: "tool_use",
          payload: {
            sessionId: "session-1",
            toolName: "search",
            status: "start"
          }
        })
      }).pipe(Effect.provide(layerA))

      const entries = yield* Effect.gen(function*() {
        const store = yield* Storage.AuditEventStore
        return yield* store.entries
      }).pipe(Effect.provide(layerB))

      return entries.length
    })
  )

  const count = await Effect.runPromise(program)
  expect(count).toBe(1)
})
