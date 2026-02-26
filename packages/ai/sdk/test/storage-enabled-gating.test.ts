import { test, expect } from "bun:test"
import * as ConfigProvider from "effect/ConfigProvider"
import * as Effect from "effect/Effect"
import * as Layer from "effect/Layer"
import { Storage } from "../src/index.js"
import { ArtifactRecord } from "../src/Schema/Storage.js"
import type { SDKUserMessage } from "../src/Schema/Message.js"
import { runEffect } from "./effect-test.js"

const configLayer = (entries: Record<string, string>) =>
  Layer.setConfigProvider(
    ConfigProvider.fromMap(new Map(Object.entries(entries)))
  )

const makeUserMessage = (sessionId: string, text: string): SDKUserMessage => ({
  type: "user",
  session_id: sessionId,
  message: {
    role: "user",
    content: [{ type: "text", text }]
  },
  parent_tool_use_id: null
})

test("ChatHistoryStore skips writes when disabled", async () => {
  const layer = Layer.mergeAll(
    Storage.ChatHistoryStore.layerMemory,
    Storage.StorageConfig.layer.pipe(
      Layer.provide(
        configLayer({
          STORAGE_CHAT_ENABLED: "false"
        })
      )
    )
  )

  const program = Effect.gen(function*() {
    const store = yield* Storage.ChatHistoryStore
    yield* store.appendMessage("session-1", makeUserMessage("session-1", "hello"))
    return yield* store.list("session-1")
  }).pipe(Effect.provide(layer))

  const events = await runEffect(program)
  expect(events.length).toBe(0)
})

test("ArtifactStore skips writes when disabled", async () => {
  const layer = Layer.mergeAll(
    Storage.ArtifactStore.layerMemory,
    Storage.StorageConfig.layer.pipe(
      Layer.provide(
        configLayer({
          STORAGE_ARTIFACTS_ENABLED: "false"
        })
      )
    )
  )

  const program = Effect.gen(function*() {
    const store = yield* Storage.ArtifactStore
    yield* store.put(ArtifactRecord.make({
      id: "artifact-1",
      sessionId: "session-1",
      kind: "tool_result",
      contentType: "text/plain",
      encoding: "utf8",
      content: "ok",
      sizeBytes: 2,
      createdAt: Date.now()
    }))
    return yield* store.list("session-1")
  }).pipe(Effect.provide(layer))

  const records = await runEffect(program)
  expect(records.length).toBe(0)
})

test("AuditEventStore skips writes when disabled", async () => {
  const layer = Layer.mergeAll(
    Storage.AuditEventStore.layerMemory,
    Storage.StorageConfig.layer.pipe(
      Layer.provide(
        configLayer({
          STORAGE_AUDIT_ENABLED: "false"
        })
      )
    )
  )

  const program = Effect.gen(function*() {
    const store = yield* Storage.AuditEventStore
    yield* store.write({
      event: "hook_event",
      payload: {
        sessionId: "session-1",
        hook: "SessionStart",
        outcome: "success"
      }
    })
    return yield* store.entries
  }).pipe(Effect.provide(layer))

  const entries = await runEffect(program)
  expect(entries.length).toBe(0)
})
