import { test, expect } from "bun:test"
import { Effect, Option } from "effect"
import { layerKV, type KVNamespace } from "../src/Storage/StorageKV.js"
import { KeyValueStore } from "@effect/platform"

const makeMockKVNamespace = (data: Record<string, string> = {}): KVNamespace => ({
  get: async (key, _type?) => data[key] ?? null,
  put: async (key, value) => { data[key] = String(value) },
  delete: async (key) => { delete data[key] },
  list: async (options) => {
    const prefix = options?.prefix ?? ""
    const allKeys = Object.keys(data).filter(k => k.startsWith(prefix)).sort()
    const start = options?.cursor ? allKeys.indexOf(options.cursor) + 1 : 0
    const limit = options?.limit ?? 1000
    const slice = allKeys.slice(start, start + limit)
    const keys = slice.map(k => ({ name: k }))
    const complete = start + limit >= allKeys.length
    if (complete) {
      return { keys, list_complete: true as const, cacheStatus: null }
    }
    return { keys, list_complete: false as const, cursor: slice[slice.length - 1]!, cacheStatus: null }
  }
})

test("KV get/set/remove round-trip", async () => {
  const ns = makeMockKVNamespace()
  const program = Effect.gen(function*() {
    const kv = yield* KeyValueStore.KeyValueStore
    yield* kv.set("key1", "value1")
    const result = yield* kv.get("key1")
    expect(result).toEqual(Option.some("value1"))
    yield* kv.remove("key1")
    const after = yield* kv.get("key1")
    expect(after).toEqual(Option.none())
  })
  await Effect.runPromise(program.pipe(Effect.provide(layerKV(ns))))
})

test("KV size paginates correctly", async () => {
  const data: Record<string, string> = {}
  for (let i = 0; i < 5; i++) data[`key${i}`] = `value${i}`
  const ns = makeMockKVNamespace(data)
  const origList = ns.list
  ns.list = async (options) => origList({ ...options, limit: 2 })
  const program = Effect.gen(function*() {
    const kv = yield* KeyValueStore.KeyValueStore
    const size = yield* kv.size
    expect(size).toBe(5)
  })
  await Effect.runPromise(program.pipe(Effect.provide(layerKV(ns))))
})

test("KV clear deletes all keys sequentially", async () => {
  const data: Record<string, string> = { a: "1", b: "2", c: "3" }
  const ns = makeMockKVNamespace(data)
  const program = Effect.gen(function*() {
    const kv = yield* KeyValueStore.KeyValueStore
    yield* kv.clear
    const empty = yield* kv.isEmpty
    expect(empty).toBe(true)
  })
  await Effect.runPromise(program.pipe(Effect.provide(layerKV(ns))))
})
