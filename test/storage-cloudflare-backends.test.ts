import { expect, test } from "bun:test"
import { KeyValueStore } from "@effect/platform"
import * as Effect from "effect/Effect"
import * as Layer from "effect/Layer"
import * as Option from "effect/Option"
import type { SDKMessage } from "../src/Schema/Message.js"
import type { ArtifactRecord } from "../src/Schema/Storage.js"
import { ArtifactStore } from "../src/Storage/ArtifactStore.js"
import { ChatHistoryStore } from "../src/Storage/ChatHistoryStore.js"
import { layers as storageLayers } from "../src/Storage/StorageLayers.js"
import { layerKV, type KVNamespace } from "../src/Storage/StorageKV.js"
import { layerR2, type R2Bucket } from "../src/Storage/StorageR2.js"
import { defaultArtifactPrefix, defaultChatHistoryPrefix } from "../src/Storage/defaults.js"
import { runEffect } from "./effect-test.js"

const makeR2Harness = () => {
  const map = new Map<string, string>()
  const bucket: R2Bucket = {
    put: async (key, value) => {
      map.set(key, typeof value === "string" ? value : String(value))
      return null
    },
    get: async (key) => {
      const value = map.get(key)
      return value === undefined
        ? null
        : {
            text: async () => value,
            json: async () => JSON.parse(value),
            arrayBuffer: async () => new TextEncoder().encode(value).buffer
          }
    },
    head: async (key) => (map.has(key) ? { key, size: map.get(key)!.length, etag: "mock-etag" } : null),
    delete: async (key) => {
      if (Array.isArray(key)) {
        for (const item of key) {
          map.delete(item)
        }
      } else {
        map.delete(key)
      }
    },
    list: async (options) => {
      const keys = Array.from(map.keys())
      const start = options?.cursor ? Number(options.cursor) : 0
      const limit = options?.limit ?? keys.length
      const slice = keys.slice(start, start + limit)
      const next = start + limit
      const truncated = next < keys.length
      return truncated
        ? { objects: slice.map((key) => ({ key })), truncated: true as const, cursor: String(next), delimitedPrefixes: [] }
        : { objects: slice.map((key) => ({ key })), truncated: false as const, delimitedPrefixes: [] }
    }
  }
  return { bucket, map } as const
}

const makeR2Bucket = (): R2Bucket =>
  makeR2Harness().bucket

const makeKVHarness = () => {
  const map = new Map<string, string>()
  const namespace: KVNamespace = {
    get: async (key) => map.get(key) ?? null,
    put: async (key, value) => {
      map.set(key, typeof value === "string" ? value : String(value))
    },
    delete: async (key) => {
      map.delete(key)
    },
    list: async (options) => {
      const keys = Array.from(map.keys())
      const start = options?.cursor ? Number(options.cursor) : 0
      const limit = options?.limit ?? keys.length
      const slice = keys.slice(start, start + limit)
      const next = start + limit
      const complete = next >= keys.length
      return complete
        ? { keys: slice.map((name) => ({ name })), list_complete: true as const, cacheStatus: null }
        : { keys: slice.map((name) => ({ name })), list_complete: false as const, cursor: String(next), cacheStatus: null }
    }
  }
  return { namespace, map } as const
}

const makeKVNamespace = (): KVNamespace =>
  makeKVHarness().namespace

const sampleMessage = (sessionId: string): SDKMessage =>
  ({
    type: "user",
    session_id: sessionId,
    message: {
      role: "user",
      content: [{ type: "text", text: "hello storage" }]
    } as never,
    parent_tool_use_id: null
  }) as SDKMessage

const sampleArtifact = (sessionId: string, id: string): ArtifactRecord =>
  ({
    id,
    sessionId,
    kind: "summary",
    encoding: "utf8",
    content: "artifact payload",
    createdAt: Date.now()
  }) as ArtifactRecord

test("StorageR2 layer supports key-value operations", async () => {
  const program = Effect.gen(function*() {
    const kv = yield* KeyValueStore.KeyValueStore
    yield* kv.set("k1", "v1")
    const value = yield* kv.get("k1")
    const hasBefore = yield* kv.has("k1")
    yield* kv.remove("k1")
    const hasAfter = yield* kv.has("k1")
    return {
      value: Option.getOrUndefined(value),
      hasBefore,
      hasAfter
    }
  }).pipe(Effect.provide(layerR2(makeR2Bucket())))

  const result = await runEffect(program)
  expect(result.value).toBe("v1")
  expect(result.hasBefore).toBe(true)
  expect(result.hasAfter).toBe(false)
})

test("StorageKV layer supports key-value operations", async () => {
  const program = Effect.gen(function*() {
    const kv = yield* KeyValueStore.KeyValueStore
    yield* kv.set("k1", "v1")
    const value = yield* kv.get("k1")
    const hasBefore = yield* kv.has("k1")
    yield* kv.remove("k1")
    const hasAfter = yield* kv.has("k1")
    return {
      value: Option.getOrUndefined(value),
      hasBefore,
      hasAfter
    }
  }).pipe(Effect.provide(layerKV(makeKVNamespace())))

  const result = await runEffect(program)
  expect(result.value).toBe("v1")
  expect(result.hasBefore).toBe(true)
  expect(result.hasAfter).toBe(false)
})

test("StorageLayers backend r2 wires chat and artifact stores through R2", async () => {
  const r2 = makeR2Harness()
  const layers = storageLayers({
    backend: "r2",
    bindings: { r2Bucket: r2.bucket }
  })
  const storageLayer = Layer.mergeAll(
    layers.chatHistory,
    layers.artifacts,
    layers.auditLog,
    layers.sessionIndex
  )

  const sessionId = "storage-r2-session"

  const program = Effect.gen(function*() {
    const chat = yield* ChatHistoryStore
    const artifacts = yield* ArtifactStore
    yield* chat.appendMessage(sessionId, sampleMessage(sessionId))
    yield* artifacts.put(sampleArtifact(sessionId, "artifact-r2-1"))
    const events = yield* chat.list(sessionId)
    const records = yield* artifacts.list(sessionId)
    return { events, records }
  }).pipe(Effect.provide(storageLayer))

  const result = await runEffect(program)
  expect(result.events.length).toBe(1)
  expect(result.records.length).toBe(1)

  const keys = Array.from(r2.map.keys())
  expect(keys.some((key) => key.startsWith(defaultChatHistoryPrefix))).toBe(true)
  expect(keys.some((key) => key.startsWith(defaultArtifactPrefix))).toBe(true)
})

test("StorageLayers backend kv wires chat and artifact stores through KV", async () => {
  const kv = makeKVHarness()
  const layers = storageLayers({
    backend: "kv",
    bindings: { kvNamespace: kv.namespace }
  })
  const storageLayer = Layer.mergeAll(
    layers.chatHistory,
    layers.artifacts,
    layers.auditLog,
    layers.sessionIndex
  )

  const sessionId = "storage-kv-session"

  const program = Effect.gen(function*() {
    const chat = yield* ChatHistoryStore
    const artifacts = yield* ArtifactStore
    yield* chat.appendMessage(sessionId, sampleMessage(sessionId))
    yield* artifacts.put(sampleArtifact(sessionId, "artifact-kv-1"))
    const events = yield* chat.list(sessionId)
    const records = yield* artifacts.list(sessionId)
    return { events, records }
  }).pipe(Effect.provide(storageLayer))

  const result = await runEffect(program)
  expect(result.events.length).toBe(1)
  expect(result.records.length).toBe(1)

  const keys = Array.from(kv.map.keys())
  expect(keys.some((key) => key.startsWith(defaultChatHistoryPrefix))).toBe(true)
  expect(keys.some((key) => key.startsWith(defaultArtifactPrefix))).toBe(true)
})

test("StorageLayers rejects KV backend with journaled mode", () => {
  expect(() =>
    storageLayers({
      backend: "kv",
      mode: "journaled",
      bindings: { kvNamespace: makeKVNamespace() }
    })
  ).toThrow("backend 'kv' cannot be used with mode 'journaled'")
})

test("StorageLayers rejects sync when backend is r2", () => {
  expect(() =>
    storageLayers({
      backend: "r2",
      bindings: { r2Bucket: makeR2Bucket() },
      sync: { url: "ws://localhost:8787" }
    })
  ).toThrow("'sync' is not yet supported with backend 'r2'")
})

test("StorageLayers rejects sync when backend is kv", () => {
  expect(() =>
    storageLayers({
      backend: "kv",
      bindings: { kvNamespace: makeKVNamespace() },
      sync: { url: "ws://localhost:8787" }
    })
  ).toThrow("'sync' is not yet supported with backend 'kv'")
})
