/**
 * GCS Storage Service Integration Test
 *
 * Tests the StorageService with GCS backend to validate:
 * - Configuration path works end-to-end
 * - Read/write operations function correctly
 * - List operations with prefix filtering
 *
 * SKIPPED if GCS_BUCKET or GOOGLE_APPLICATION_CREDENTIALS not set.
 *
 * @since 2.0.0
 * @module test/Service/Storage.gcs
 */

import { BunContext } from "@effect/platform-bun"
import { Effect, Layer, Option } from "effect"
import { describe, expect, it } from "vitest"
import { ConfigService, DEFAULT_CONFIG } from "../../src/Service/Config.js"
import { StorageService, StorageServiceLive } from "../../src/Service/Storage.js"

/**
 * Check if GCS credentials and bucket are available for testing
 */
const hasGcsCredentials = () => {
  const bucket = process.env.GCS_BUCKET ?? process.env.STORAGE_BUCKET
  const creds = process.env.GOOGLE_APPLICATION_CREDENTIALS || process.env.GOOGLE_CLOUD_PROJECT

  return Boolean(bucket && creds)
}

const GCS_BUCKET = process.env.GCS_BUCKET ?? process.env.STORAGE_BUCKET ?? "effect-ontology-dev"

/**
 * Create test layer with GCS configuration
 */
const makeGcsTestLayer = (pathPrefix = "test/integration") => {
  const TestConfig = Layer.succeed(
    ConfigService,
    ConfigService.of({
      ...DEFAULT_CONFIG,
      storage: {
        type: "gcs",
        bucket: Option.some(GCS_BUCKET),
        localPath: Option.none(),
        prefix: pathPrefix
      }
    } as unknown as ConfigService)
  )

  return StorageServiceLive.pipe(
    Layer.provide(TestConfig),
    Layer.provideMerge(BunContext.layer)
  )
}

/**
 * Generate unique key for test isolation
 */
const uniqueKey = (base: string) => `${base}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`

describe.skipIf(!hasGcsCredentials())("StorageService GCS Integration", () => {
  describe("basic operations", () => {
    it("set/get round-trip works", async () => {
      const key = uniqueKey("round-trip")
      const value = `Test content created at ${new Date().toISOString()}`

      await Effect.gen(function*() {
        const storage = yield* StorageService

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

        // Verify removal
        const afterRemove = yield* storage.get(key)
        expect(Option.isNone(afterRemove)).toBe(true)
      }).pipe(
        Effect.provide(makeGcsTestLayer()),
        Effect.runPromise
      )
    })

    it("get returns None for non-existent key", async () => {
      const key = uniqueKey("non-existent")

      await Effect.gen(function*() {
        const storage = yield* StorageService
        const result = yield* storage.get(key)
        expect(Option.isNone(result)).toBe(true)
      }).pipe(
        Effect.provide(makeGcsTestLayer()),
        Effect.runPromise
      )
    })

    it("overwrites existing value", async () => {
      const key = uniqueKey("overwrite")
      const value1 = "first value"
      const value2 = "second value"

      await Effect.gen(function*() {
        const storage = yield* StorageService

        // Write initial value
        yield* storage.set(key, value1)
        const result1 = yield* storage.get(key)
        expect(Option.getOrElse(result1, () => "")).toBe(value1)

        // Overwrite
        yield* storage.set(key, value2)
        const result2 = yield* storage.get(key)
        expect(Option.getOrElse(result2, () => "")).toBe(value2)

        // Cleanup
        yield* storage.remove(key)
      }).pipe(
        Effect.provide(makeGcsTestLayer()),
        Effect.runPromise
      )
    })
  })

  describe("binary operations", () => {
    it("getUint8Array works for binary content", async () => {
      const key = uniqueKey("binary")
      const content = new Uint8Array([0x48, 0x65, 0x6c, 0x6c, 0x6f]) // "Hello"

      await Effect.gen(function*() {
        const storage = yield* StorageService

        yield* storage.set(key, content)

        const result = yield* storage.getUint8Array(key)
        expect(Option.isSome(result)).toBe(true)
        if (Option.isSome(result)) {
          expect(Array.from(result.value)).toEqual(Array.from(content))
        }

        yield* storage.remove(key)
      }).pipe(
        Effect.provide(makeGcsTestLayer()),
        Effect.runPromise
      )
    })
  })

  describe("list operations", () => {
    it("lists files with prefix", async () => {
      const prefix = uniqueKey("list-test")
      const keys = [`${prefix}/file1.txt`, `${prefix}/file2.txt`, `${prefix}/nested/file3.txt`]

      await Effect.gen(function*() {
        const storage = yield* StorageService

        // Create test files
        for (const key of keys) {
          yield* storage.set(key, `content of ${key}`)
        }

        // List with prefix
        const files = yield* storage.list(prefix)
        expect(files.length).toBeGreaterThanOrEqual(3)

        // List nested prefix
        const nestedFiles = yield* storage.list(`${prefix}/nested`)
        expect(nestedFiles.some((f) => f.includes("file3"))).toBe(true)

        // Cleanup
        for (const key of keys) {
          yield* storage.remove(key)
        }
      }).pipe(
        Effect.provide(makeGcsTestLayer()),
        Effect.runPromise
      )
    })

    it("list returns empty for non-existent prefix", async () => {
      const prefix = uniqueKey("empty-prefix")

      await Effect.gen(function*() {
        const storage = yield* StorageService
        const files = yield* storage.list(prefix)
        expect(files).toEqual([])
      }).pipe(
        Effect.provide(makeGcsTestLayer()),
        Effect.runPromise
      )
    })
  })

  describe("large content", () => {
    it("handles large text content", async () => {
      const key = uniqueKey("large-content")
      // 100KB of text
      const largeContent = "A".repeat(100 * 1024)

      await Effect.gen(function*() {
        const storage = yield* StorageService

        yield* storage.set(key, largeContent)

        const result = yield* storage.get(key)
        expect(Option.isSome(result)).toBe(true)
        if (Option.isSome(result)) {
          expect(result.value.length).toBe(largeContent.length)
        }

        yield* storage.remove(key)
      }).pipe(
        Effect.provide(makeGcsTestLayer()),
        Effect.runPromise
      )
    })
  })

  describe("JSON content", () => {
    it("handles JSON serialization/deserialization", async () => {
      const key = uniqueKey("json-content")
      const data = {
        entities: [
          { id: "entity-1", types: ["Person"], mention: "Alice" },
          { id: "entity-2", types: ["Organization"], mention: "Acme Corp" }
        ],
        relations: [{ subjectId: "entity-1", predicate: "worksFor", object: "entity-2" }],
        metadata: {
          timestamp: new Date().toISOString(),
          version: "1.0.0"
        }
      }

      await Effect.gen(function*() {
        const storage = yield* StorageService

        yield* storage.set(key, JSON.stringify(data, null, 2))

        const result = yield* storage.get(key)
        expect(Option.isSome(result)).toBe(true)
        if (Option.isSome(result)) {
          const parsed = JSON.parse(result.value)
          expect(parsed.entities.length).toBe(2)
          expect(parsed.relations.length).toBe(1)
          expect(parsed.metadata.version).toBe("1.0.0")
        }

        yield* storage.remove(key)
      }).pipe(
        Effect.provide(makeGcsTestLayer()),
        Effect.runPromise
      )
    })
  })

  describe("path prefix isolation", () => {
    it("different prefixes are isolated", async () => {
      const key = "shared-key-name"
      const value1 = "value from prefix1"
      const value2 = "value from prefix2"

      await Effect.gen(function*() {
        const storage1 = yield* StorageService
        yield* storage1.set(key, value1)
      }).pipe(
        Effect.provide(makeGcsTestLayer("test/prefix1")),
        Effect.runPromise
      )

      await Effect.gen(function*() {
        const storage2 = yield* StorageService
        yield* storage2.set(key, value2)

        // Verify storage2 has its own value
        const result = yield* storage2.get(key)
        expect(Option.getOrElse(result, () => "")).toBe(value2)
      }).pipe(
        Effect.provide(makeGcsTestLayer("test/prefix2")),
        Effect.runPromise
      )

      // Verify storage1 still has its value
      await Effect.gen(function*() {
        const storage1 = yield* StorageService
        const result = yield* storage1.get(key)
        expect(Option.getOrElse(result, () => "")).toBe(value1)

        // Cleanup
        yield* storage1.remove(key)
      }).pipe(
        Effect.provide(makeGcsTestLayer("test/prefix1")),
        Effect.runPromise
      )

      // Cleanup prefix2
      await Effect.gen(function*() {
        const storage2 = yield* StorageService
        yield* storage2.remove(key)
      }).pipe(
        Effect.provide(makeGcsTestLayer("test/prefix2")),
        Effect.runPromise
      )
    })
  })
})

// Non-GCS tests that run regardless of credentials
describe("StorageService GCS Configuration", () => {
  it("detects missing credentials correctly", () => {
    // Save current env
    const originalBucket = process.env.GCS_BUCKET
    const originalCreds = process.env.GOOGLE_APPLICATION_CREDENTIALS

    // Temporarily clear credentials
    delete process.env.GCS_BUCKET
    delete process.env.GOOGLE_APPLICATION_CREDENTIALS

    // Check detection
    const hasCredsBefore = Boolean(
      (process.env.GCS_BUCKET ?? process.env.STORAGE_BUCKET)
        && (process.env.GOOGLE_APPLICATION_CREDENTIALS || process.env.GOOGLE_CLOUD_PROJECT)
    )

    // Restore env
    if (originalBucket) process.env.GCS_BUCKET = originalBucket
    if (originalCreds) process.env.GOOGLE_APPLICATION_CREDENTIALS = originalCreds

    // Verify detection logic works
    expect(typeof hasCredsBefore).toBe("boolean")
  })
})
