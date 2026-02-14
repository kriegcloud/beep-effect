import { test, expect } from "bun:test"
import { Effect, Option } from "effect"
import { layerR2, type R2Bucket } from "../src/Storage/StorageR2.js"
import { KeyValueStore } from "@effect/platform"

const makeMockR2Bucket = (data: Record<string, string> = {}): R2Bucket => ({
  put: async (key, value) => { data[key] = String(value) },
  get: async (key) => {
    const v = data[key]
    return v !== undefined ? { text: async () => v, json: async () => JSON.parse(v), arrayBuffer: async () => new TextEncoder().encode(v).buffer } : null
  },
  head: async (key) => data[key] !== undefined ? { key, size: data[key].length, etag: "test" } : null,
  delete: async (keys) => {
    for (const k of Array.isArray(keys) ? keys : [keys]) delete data[k]
  },
  list: async (options) => {
    const prefix = options?.prefix ?? ""
    const allKeys = Object.keys(data).filter(k => k.startsWith(prefix)).sort()
    const start = options?.cursor ? allKeys.indexOf(options.cursor) + 1 : 0
    const limit = options?.limit ?? 1000
    const slice = allKeys.slice(start, start + limit)
    const objects = slice.map(k => ({ key: k }))
    const truncated = start + limit < allKeys.length
    if (truncated) {
      return { objects, truncated: true as const, cursor: slice[slice.length - 1]!, delimitedPrefixes: [] as string[] }
    }
    return { objects, truncated: false as const, delimitedPrefixes: [] as string[] }
  }
})

test("R2 get/set/remove round-trip", async () => {
  const data: Record<string, string> = {}
  const bucket = makeMockR2Bucket(data)
  const program = Effect.gen(function*() {
    const kv = yield* KeyValueStore.KeyValueStore
    yield* kv.set("key1", "value1")
    const result = yield* kv.get("key1")
    expect(result).toEqual(Option.some("value1"))
    yield* kv.remove("key1")
    const after = yield* kv.get("key1")
    expect(after).toEqual(Option.none())
  })
  await Effect.runPromise(program.pipe(Effect.provide(layerR2(bucket))))
})

test("R2 has uses head (not get)", async () => {
  let headCalled = false
  let getCalled = false
  const bucket = makeMockR2Bucket({ existing: "data" })
  const origHead = bucket.head
  bucket.head = async (key) => { headCalled = true; return origHead(key) }
  const origGet = bucket.get
  bucket.get = async (key) => { getCalled = true; return origGet(key) }

  const program = Effect.gen(function*() {
    const kv = yield* KeyValueStore.KeyValueStore
    const result = yield* kv.has("existing")
    expect(result).toBe(true)
  })
  await Effect.runPromise(program.pipe(Effect.provide(layerR2(bucket))))
  expect(headCalled).toBe(true)
  expect(getCalled).toBe(false)
})

test("R2 size paginates correctly", async () => {
  const data: Record<string, string> = {}
  for (let i = 0; i < 5; i++) data[`key${i}`] = `value${i}`
  const bucket = makeMockR2Bucket(data)
  // Override list to paginate in batches of 2
  const origList = bucket.list
  bucket.list = async (options) => {
    return origList({ ...options, limit: 2 })
  }
  const program = Effect.gen(function*() {
    const kv = yield* KeyValueStore.KeyValueStore
    const size = yield* kv.size
    expect(size).toBe(5)
  })
  await Effect.runPromise(program.pipe(Effect.provide(layerR2(bucket))))
})

test("R2 clear deletes all keys", async () => {
  const data: Record<string, string> = { a: "1", b: "2", c: "3" }
  const bucket = makeMockR2Bucket(data)
  const program = Effect.gen(function*() {
    const kv = yield* KeyValueStore.KeyValueStore
    yield* kv.clear
    const empty = yield* kv.isEmpty
    expect(empty).toBe(true)
  })
  await Effect.runPromise(program.pipe(Effect.provide(layerR2(bucket))))
})
