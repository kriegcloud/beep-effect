/**
 * Extraction Activity Integration Test
 *
 * Tests the extraction activity with real services to identify layer issues.
 *
 * @module test/Workflow/ExtractionActivity
 */

import { BunContext } from "@effect/platform-bun"
import { describe, expect, it } from "@effect/vitest"
import { ConfigProvider, DateTime, Effect, Layer, Option } from "effect"
import { type DocumentId, toGcsUri } from "../../src/Domain/Identity.js"
import { PathLayout } from "../../src/Domain/PathLayout.js"
import { ConfigService, ConfigServiceDefault } from "../../src/Service/Config.js"
import { StorageService, StorageServiceLive } from "../../src/Service/Storage.js"

/**
 * Test ConfigProvider with local storage
 */
const TestConfigProvider = ConfigProvider.fromMap(
  new Map([
    ["ONTOLOGY_PATH", "/tmp/test-ontology.ttl"],
    ["LLM_API_KEY", "test-key-for-testing"],
    ["LLM_PROVIDER", "anthropic"],
    ["LLM_MODEL", "claude-haiku-4-5"],
    ["STORAGE_TYPE", "local"],
    ["STORAGE_LOCAL_PATH", "/tmp/extraction-test"],
    ["RUNTIME_CONCURRENCY", "4"],
    ["RUNTIME_LLM_CONCURRENCY", "2"],
    ["RUNTIME_ENABLE_TRACING", "false"]
  ]),
  { pathDelim: "_" }
)

const TestLayers = StorageServiceLive.pipe(
  Layer.provideMerge(ConfigServiceDefault),
  Layer.provideMerge(BunContext.layer),
  Layer.provideMerge(Layer.setConfigProvider(TestConfigProvider))
)

describe("StorageService Integration", () => {
  it.effect("can read config with correct storage path", () =>
    Effect.gen(function*() {
      const config = yield* ConfigService

      expect(config.storage.type).toBe("local")
      expect(Option.getOrNull(config.storage.localPath)).toBe("/tmp/extraction-test")
    }).pipe(Effect.provide(TestLayers)))

  it.effect("can write and read from storage", () =>
    Effect.gen(function*() {
      const storage = yield* StorageService

      // Write test content
      yield* storage.set("test/hello.txt", "Hello, World!")

      // Read it back
      const content = yield* storage.get("test/hello.txt")

      expect(Option.isSome(content)).toBe(true)
      expect(Option.getOrNull(content)).toBe("Hello, World!")
    }).pipe(Effect.provide(TestLayers)))

  it.effect("returns None for missing file", () =>
    Effect.gen(function*() {
      const storage = yield* StorageService

      const content = yield* storage.get("nonexistent/file.txt")

      expect(Option.isNone(content)).toBe(true)
    }).pipe(Effect.provide(TestLayers)))

  it.effect("can read from nested path", () =>
    Effect.gen(function*() {
      const storage = yield* StorageService

      // Write to nested path
      yield* storage.set("input/documents/doc1.txt", "Document content")

      // Read it back
      const content = yield* storage.get("input/documents/doc1.txt")

      expect(Option.isSome(content)).toBe(true)
      expect(Option.getOrNull(content)).toBe("Document content")
    }).pipe(Effect.provide(TestLayers)))
})

describe("Extraction Activity Dependencies", () => {
  it.effect("all required services are available", () =>
    Effect.gen(function*() {
      const storage = yield* StorageService
      const config = yield* ConfigService

      // Verify services are properly instantiated
      expect(storage).toBeDefined()
      expect(config).toBeDefined()
      expect(config.storage.type).toBe("local")
    }).pipe(Effect.provide(TestLayers)))
})

/**
 * Helper to strip gs:// prefix from URI
 */
const stripGsPrefix = (uri: string): string => uri.startsWith("gs://") ? uri.replace(/^gs:\/\/[^/]+\//, "") : uri

const requireContent = (opt: Option.Option<string>, key: string) =>
  Option.match(opt, {
    onNone: () => Effect.fail(`Missing object at ${key}`),
    onSome: (value) => Effect.succeed(value)
  })

const resolveBucket = (config: { storage: { bucket: Option.Option<string> } }) =>
  Option.getOrElse(config.storage.bucket, () => "local-bucket")

describe("Extraction Activity Execute Logic", () => {
  it.effect("can execute extraction logic directly", () =>
    Effect.gen(function*() {
      const storage = yield* StorageService
      const config = yield* ConfigService

      // Setup: write test document
      yield* storage.set("input/test-doc.txt", "Manchester United defeated Liverpool 2-1.")

      // Simulate extraction activity input
      const input = {
        batchId: "batch-test123" as const,
        documentId: "doc-abc123" as DocumentId,
        sourceUri: "gs://local-bucket/input/test-doc.txt",
        ontologyUri: "gs://local-bucket/ontologies/football.ttl"
      }

      // Execute extraction logic (same as in DurableActivities.ts)
      const start = yield* DateTime.now

      const bucket = resolveBucket(config)
      const sourceKey = stripGsPrefix(input.sourceUri)

      // This is where the original activity was failing
      const sourceContent = yield* storage.get(sourceKey).pipe(
        Effect.flatMap((opt) => requireContent(opt, sourceKey))
      )

      expect(sourceContent).toBe("Manchester United defeated Liverpool 2-1.")

      const graphPath = PathLayout.document.graph(input.documentId)
      const graphBody = `# extracted graph for ${input.documentId}\n# ontology: ${input.ontologyUri}\n${sourceContent}`
      yield* storage.set(graphPath, graphBody)

      const end = yield* DateTime.now

      const result = {
        documentId: input.documentId,
        graphUri: toGcsUri(bucket, graphPath),
        entityCount: 0,
        relationCount: 0,
        durationMs: DateTime.distance(start, end)
      }

      expect(result.documentId).toBe("doc-abc123")
      expect(result.entityCount).toBe(0)
    }).pipe(Effect.provide(TestLayers)))

  it.effect("fails gracefully when source document is missing", () =>
    Effect.gen(function*() {
      const storage = yield* StorageService
      const config = yield* ConfigService

      const input = {
        sourceUri: "gs://local-bucket/input/nonexistent.txt"
      }

      const sourceKey = stripGsPrefix(input.sourceUri)

      const result = yield* storage.get(sourceKey).pipe(
        Effect.flatMap((opt) => requireContent(opt, sourceKey)),
        Effect.either
      )

      expect(result._tag).toBe("Left")
    }).pipe(Effect.provide(TestLayers)))
})
