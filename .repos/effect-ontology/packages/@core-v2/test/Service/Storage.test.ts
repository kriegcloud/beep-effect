import { BunContext } from "@effect/platform-bun"
import { Effect, Layer, Option } from "effect"
import { describe, expect, it } from "vitest"
import { ConfigService, DEFAULT_CONFIG } from "../../src/Service/Config.js"
import { StorageService, StorageServiceLive } from "../../src/Service/Storage.js"

const makeTestLayer = (storageConfig: Partial<typeof DEFAULT_CONFIG.storage>) => {
  const TestConfig = Layer.succeed(
    ConfigService,
    ConfigService.of({
      ...DEFAULT_CONFIG,
      storage: {
        ...DEFAULT_CONFIG.storage,
        ...storageConfig
      }
    } as unknown as ConfigService)
  ) // Cast for mock

  return StorageServiceLive.pipe(
    Layer.provide(TestConfig),
    Layer.provideMerge(BunContext.layer)
  )
}

describe("StorageService", () => {
  it("local storage writes and reads", () =>
    Effect.gen(function*() {
      const storage = yield* StorageService
      const key = "test-key"
      const value = "test-value"

      // Write
      yield* storage.set(key, value)

      // Read
      const result = yield* storage.get(key)
      expect(Option.isSome(result)).toBe(true)
      if (Option.isSome(result)) {
        expect(result.value).toBe(value)
      }

      // Cleanup
      yield* storage.remove(key)
      const afterRemove = yield* storage.get(key)
      expect(Option.isNone(afterRemove)).toBe(true)
    }).pipe(
      Effect.provide(makeTestLayer({
        type: "local",
        localPath: Option.some("./test-output"),
        prefix: "unit-test"
      })),
      Effect.runPromise
    ))

  it("memory storage works", () =>
    Effect.gen(function*() {
      const storage = yield* StorageService
      yield* storage.set("foo", "bar")
      const res = yield* storage.get("foo")
      expect(Option.isSome(res)).toBe(true)
      if (Option.isSome(res)) {
        expect(res.value).toBe("bar")
      }
    }).pipe(
      Effect.provide(makeTestLayer({
        type: "memory"
      })),
      Effect.runPromise
    ))
})
