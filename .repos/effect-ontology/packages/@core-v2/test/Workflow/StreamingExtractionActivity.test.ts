/**
 * Streaming Extraction Activity Tests
 *
 * Unit and integration tests for the unified 6-phase streaming extraction activity.
 *
 * @module test/Workflow/StreamingExtractionActivity
 */

import { BunContext } from "@effect/platform-bun"
import { describe, expect, it } from "@effect/vitest"
import { ConfigProvider, DateTime, Effect, Layer, Option, Schema } from "effect"
import type { BatchId, ContentHash, DocumentId, GcsUri, Namespace } from "../../src/Domain/Identity.js"
import { Entity, KnowledgeGraph, Relation } from "../../src/Domain/Model/Entity.js"
import { ChunkingConfig, LlmConfig, RunConfig } from "../../src/Domain/Model/ExtractionRun.js"
import { OntologyRef } from "../../src/Domain/Model/Ontology.js"
import { EntityId } from "../../src/Domain/Model/shared.js"
import type { ExtractionActivityInput } from "../../src/Domain/Schema/Batch.js"
import { ConfigService, ConfigServiceDefault } from "../../src/Service/Config.js"
import { ExtractionWorkflow } from "../../src/Service/ExtractionWorkflow.js"
import { RdfBuilder } from "../../src/Service/Rdf.js"
import { StorageService, StorageServiceTest } from "../../src/Service/Storage.js"
import {
  buildRunConfig,
  enrichEntityMetadata,
  makeStreamingExtractionActivity,
  StreamingExtractionOutput
} from "../../src/Workflow/StreamingExtractionActivity.js"

// -----------------------------------------------------------------------------
// Test Configuration
// -----------------------------------------------------------------------------

const TestConfigProvider = ConfigProvider.fromMap(
  new Map([
    ["ONTOLOGY_PATH", "/tmp/test-ontology.ttl"],
    ["LLM_API_KEY", "test-key-for-testing"],
    ["LLM_PROVIDER", "anthropic"],
    ["LLM_MODEL", "claude-haiku-4-5"],
    ["LLM_MAX_TOKENS", "4096"],
    ["LLM_TIMEOUT_MS", "30000"],
    ["STORAGE_TYPE", "memory"],
    ["RUNTIME_CONCURRENCY", "4"],
    ["RUNTIME_LLM_CONCURRENCY", "2"],
    ["RUNTIME_ENABLE_TRACING", "false"],
    ["RDF_BASE_NAMESPACE", "http://test.example.org/"]
  ]),
  { pathDelim: "_" }
)

// -----------------------------------------------------------------------------
// Test Fixtures
// -----------------------------------------------------------------------------

const testBatchId = "batch-abc123def456" as BatchId
const testDocId = "doc-123456789abc" as DocumentId
// Namespace must be lowercase alphanumeric + hyphens (not a full URI)
const testNamespace = "sports-football" as Namespace

const makeGcsUri = (path: string): GcsUri => `gs://test-bucket/${path}` as GcsUri

// Test ontology content hash (16 hex chars as per ContentHash type)
const testOntologyContentHash = "abcd1234ef567890" as ContentHash

const sampleExtractionInput: typeof ExtractionActivityInput.Type = {
  batchId: testBatchId,
  documentId: testDocId,
  sourceUri: makeGcsUri("documents/press-release.txt"),
  ontologyUri: makeGcsUri("ontologies/football/ontology.ttl"),
  ontologyId: "football",
  targetNamespace: testNamespace
}

const sampleEntity = new Entity({
  id: EntityId("cristiano_ronaldo"),
  mention: "Cristiano Ronaldo",
  types: ["http://schema.org/Person", "http://schema.org/Athlete"],
  attributes: {
    "http://schema.org/name": "Cristiano Ronaldo"
  }
})

const sampleEntity2 = new Entity({
  id: EntityId("al_nassr"),
  mention: "Al-Nassr FC",
  types: ["http://schema.org/SportsTeam"],
  attributes: {
    "http://schema.org/name": "Al-Nassr FC"
  }
})

const sampleRelation = new Relation({
  subjectId: "cristiano_ronaldo",
  predicate: "http://schema.org/memberOf",
  object: "al_nassr"
})

const sampleKnowledgeGraph = new KnowledgeGraph({
  entities: [sampleEntity, sampleEntity2],
  relations: [sampleRelation],
  sourceText: "Cristiano Ronaldo joined Al-Nassr FC in January 2023."
})

// -----------------------------------------------------------------------------
// Helper Function Tests
// -----------------------------------------------------------------------------

describe("buildRunConfig", () => {
  const llmConfig = {
    model: "claude-haiku-4-5",
    temperature: 0.0,
    maxTokens: 4096,
    timeoutMs: 30000
  }

  it("builds RunConfig from extraction input with content hash", () => {
    const runConfig = buildRunConfig(sampleExtractionInput, llmConfig, testOntologyContentHash)

    expect(runConfig).toBeInstanceOf(RunConfig)
    expect(runConfig.chunking).toBeInstanceOf(ChunkingConfig)
    expect(runConfig.llm).toBeInstanceOf(LlmConfig)
    expect(runConfig.ontology).toBeInstanceOf(OntologyRef)
    expect(runConfig.concurrency).toBe(5)
    expect(runConfig.enableGrounding).toBe(true)
  })

  it("uses provided content hash for ontology ref", () => {
    const runConfig = buildRunConfig(sampleExtractionInput, llmConfig, testOntologyContentHash)

    // Content hash should be the one we passed in (from actual ontology content)
    expect(runConfig.ontology.contentHash).toBe(testOntologyContentHash)
  })

  it("derives ontology name from URI", () => {
    const runConfig = buildRunConfig(sampleExtractionInput, llmConfig, testOntologyContentHash)

    // From "gs://test-bucket/ontologies/football/ontology.ttl" -> "ontology"
    expect(runConfig.ontology.name).toBe("ontology")
    expect(runConfig.ontology.namespace).toBe(testNamespace)
  })

  it("sets correct chunking defaults", () => {
    const runConfig = buildRunConfig(sampleExtractionInput, llmConfig, testOntologyContentHash)

    expect(runConfig.chunking.maxChunkSize).toBe(500)
    expect(runConfig.chunking.preserveSentences).toBe(true)
    expect(runConfig.chunking.overlapTokens).toBe(50)
  })

  it("propagates LLM config", () => {
    const runConfig = buildRunConfig(sampleExtractionInput, llmConfig, testOntologyContentHash)

    expect(runConfig.llm.model).toBe("claude-haiku-4-5")
    expect(runConfig.llm.temperature).toBe(0.0)
    expect(runConfig.llm.maxTokens).toBe(4096)
    expect(runConfig.llm.timeoutMs).toBe(30000)
  })

  it("handles different ontology URI formats", () => {
    // Simple filename
    const input1: typeof ExtractionActivityInput.Type = {
      ...sampleExtractionInput,
      ontologyUri: makeGcsUri("seattle.ttl")
    }
    const config1 = buildRunConfig(input1, llmConfig, testOntologyContentHash)
    expect(config1.ontology.name).toBe("seattle")

    // Nested path with underscores
    const input2: typeof ExtractionActivityInput.Type = {
      ...sampleExtractionInput,
      ontologyUri: makeGcsUri("domains/sports_football.ttl")
    }
    const config2 = buildRunConfig(input2, llmConfig, testOntologyContentHash)
    expect(config2.ontology.name).toBe("sports_football")

    // OWL extension
    const input3: typeof ExtractionActivityInput.Type = {
      ...sampleExtractionInput,
      ontologyUri: makeGcsUri("core/schema.owl")
    }
    const config3 = buildRunConfig(input3, llmConfig, testOntologyContentHash)
    expect(config3.ontology.name).toBe("schema")
  })
})

describe("enrichEntityMetadata", () => {
  it.effect("adds document metadata to entities", () =>
    Effect.gen(function*() {
      const extractedAt = yield* DateTime.now

      const enriched = enrichEntityMetadata(
        [sampleEntity, sampleEntity2],
        sampleExtractionInput,
        extractedAt
      )

      expect(enriched).toHaveLength(2)
      for (const entity of enriched) {
        expect(entity.documentId).toBe(testDocId)
        expect(entity.sourceUri).toBe(sampleExtractionInput.sourceUri)
        expect(entity.extractedAt).toEqual(extractedAt)
      }
    }))

  it.effect("inherits eventTime from input when provided", () =>
    Effect.gen(function*() {
      const extractedAt = yield* DateTime.now
      const eventTime = DateTime.unsafeMake(new Date("2023-01-15T12:00:00Z"))

      const inputWithEventTime = {
        ...sampleExtractionInput,
        eventTime
      }

      const enriched = enrichEntityMetadata(
        [sampleEntity],
        inputWithEventTime,
        extractedAt
      )

      expect(enriched[0].eventTime).toEqual(eventTime)
    }))

  it.effect("preserves entity eventTime if input has none", () =>
    Effect.gen(function*() {
      const extractedAt = yield* DateTime.now
      const entityEventTime = DateTime.unsafeMake(new Date("2023-06-01T00:00:00Z"))

      const entityWithEventTime = new Entity({
        ...sampleEntity,
        eventTime: entityEventTime
      })

      const enriched = enrichEntityMetadata(
        [entityWithEventTime],
        sampleExtractionInput, // No eventTime in input
        extractedAt
      )

      expect(enriched[0].eventTime).toEqual(entityEventTime)
    }))
})

describe("StreamingExtractionOutput schema", () => {
  it("validates correct output", () => {
    const output = {
      documentId: testDocId,
      graphUri: makeGcsUri("graphs/doc-123.trig"),
      entityCount: 5,
      relationCount: 3,
      claimCount: 8,
      durationMs: 1500
    }

    const result = Schema.decodeUnknownSync(StreamingExtractionOutput)(output)

    expect(result.documentId).toBe(testDocId)
    expect(result.entityCount).toBe(5)
    expect(result.claimCount).toBe(8)
  })

  it("rejects missing fields", () => {
    const incomplete = {
      documentId: testDocId,
      graphUri: makeGcsUri("graphs/doc-123.trig")
      // missing entityCount, relationCount, claimCount, durationMs
    }

    expect(() => Schema.decodeUnknownSync(StreamingExtractionOutput)(incomplete)).toThrow()
  })
})

// -----------------------------------------------------------------------------
// Activity Creation Tests
// -----------------------------------------------------------------------------

describe("makeStreamingExtractionActivity", () => {
  it("creates activity with correct name", () => {
    const activity = makeStreamingExtractionActivity(sampleExtractionInput)

    expect(activity.name).toBe(`streaming-extraction-${testDocId}`)
  })

  it("creates unique activity names per document", () => {
    const activity1 = makeStreamingExtractionActivity(sampleExtractionInput)

    const input2: typeof ExtractionActivityInput.Type = {
      ...sampleExtractionInput,
      documentId: "doc-xyz789" as DocumentId
    }
    const activity2 = makeStreamingExtractionActivity(input2)

    expect(activity1.name).not.toBe(activity2.name)
    expect(activity1.name).toContain(testDocId)
    expect(activity2.name).toContain("doc-xyz789")
  })
})

// -----------------------------------------------------------------------------
// Integration Tests with Mocked Services
// -----------------------------------------------------------------------------

describe("Streaming Extraction Activity Integration", () => {
  // Mock ExtractionWorkflow that returns sample graph
  const MockExtractionWorkflow = Layer.succeed(ExtractionWorkflow, {
    extract: (_text: string, _config: RunConfig) => Effect.succeed(sampleKnowledgeGraph)
  } as unknown as ExtractionWorkflow)

  // Create test layers with memory storage
  const TestLayers = Layer.mergeAll(
    StorageServiceTest,
    MockExtractionWorkflow,
    RdfBuilder.Default
  ).pipe(
    Layer.provideMerge(ConfigServiceDefault),
    Layer.provideMerge(BunContext.layer),
    Layer.provideMerge(Layer.setConfigProvider(TestConfigProvider))
  )

  it.effect("all required services are available", () =>
    Effect.gen(function*() {
      const storage = yield* StorageService
      const config = yield* ConfigService
      const extraction = yield* ExtractionWorkflow
      const rdf = yield* RdfBuilder

      expect(storage).toBeDefined()
      expect(config).toBeDefined()
      expect(extraction).toBeDefined()
      expect(rdf).toBeDefined()
    }).pipe(Effect.provide(TestLayers)))

  it.effect("can write and read from memory storage", () =>
    Effect.gen(function*() {
      const storage = yield* StorageService

      yield* storage.set("test/sample.txt", "Hello from streaming extraction test!")

      const content = yield* storage.get("test/sample.txt")

      expect(Option.isSome(content)).toBe(true)
      expect(Option.getOrNull(content)).toBe("Hello from streaming extraction test!")
    }).pipe(Effect.provide(TestLayers)))

  it.effect("mock extraction workflow returns sample graph", () =>
    Effect.gen(function*() {
      const extraction = yield* ExtractionWorkflow
      const config = yield* ConfigService

      // Build a minimal RunConfig for the mock
      const runConfig = buildRunConfig(sampleExtractionInput, {
        model: config.llm.model,
        temperature: 0.0,
        maxTokens: config.llm.maxTokens,
        timeoutMs: config.llm.timeoutMs
      }, testOntologyContentHash)

      const graph = yield* extraction.extract("Test document content", runConfig)

      expect(graph.entities).toHaveLength(2)
      expect(graph.relations).toHaveLength(1)
      expect(graph.entities[0].id).toBe("cristiano_ronaldo")
    }).pipe(Effect.provide(TestLayers)))

  it.effect("RdfBuilder can serialize entities", () =>
    Effect.gen(function*() {
      const rdf = yield* RdfBuilder

      const store = yield* rdf.createStore
      // RdfBuilder needs a proper URI namespace (not a short namespace name)
      yield* rdf.addEntities(store, sampleKnowledgeGraph.entities, {
        graphUri: "http://example.org/test-graph",
        targetNamespace: "http://sports.example.org/entities/"
      })

      const turtle = yield* rdf.toTurtle(store)

      // Should contain entity type assertions
      expect(turtle).toContain("Person")
      expect(turtle).toContain("Athlete")
    }).pipe(Effect.provide(TestLayers)))
})

// -----------------------------------------------------------------------------
// Edge Case Tests
// -----------------------------------------------------------------------------

describe("Edge Cases", () => {
  it("handles empty entity arrays", () => {
    const result = enrichEntityMetadata(
      [],
      sampleExtractionInput,
      DateTime.unsafeMake(new Date())
    )

    expect(result).toEqual([])
  })

  it("buildRunConfig handles URI without extension", () => {
    const input: typeof ExtractionActivityInput.Type = {
      ...sampleExtractionInput,
      ontologyUri: makeGcsUri("ontologies/football")
    }

    const llmConfig = {
      model: "test",
      temperature: 0.0,
      maxTokens: 1000,
      timeoutMs: 10000
    }

    const config = buildRunConfig(input, llmConfig, testOntologyContentHash)

    // Should still extract name even without extension
    expect(config.ontology.name).toBe("football")
  })

  it("buildRunConfig uses content hash for cache invalidation", () => {
    const llmConfig = {
      model: "test",
      temperature: 0.0,
      maxTokens: 1000,
      timeoutMs: 10000
    }

    // Same URI but different content hashes (simulating ontology content change)
    const contentHashV1 = "1111111111111111" as ContentHash
    const contentHashV2 = "2222222222222222" as ContentHash

    const config1 = buildRunConfig(sampleExtractionInput, llmConfig, contentHashV1)
    const config2 = buildRunConfig(sampleExtractionInput, llmConfig, contentHashV2)

    // Different content hashes should produce different ontology refs
    // This ensures cache invalidation when ontology content changes
    expect(config1.ontology.contentHash).toBe(contentHashV1)
    expect(config2.ontology.contentHash).toBe(contentHashV2)
    expect(config1.ontology.contentHash).not.toBe(config2.ontology.contentHash)
  })
})
