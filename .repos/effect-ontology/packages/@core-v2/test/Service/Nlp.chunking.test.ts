/**
 * NLP Chunking Strategy Tests
 *
 * Tests for adaptive chunking strategies based on document preprocessing hints.
 *
 * @module test/Service/Nlp.chunking
 */

import { Effect, Layer, Option } from "effect"
import { describe, expect, it } from "vitest"
import { ConfigService } from "../../src/Service/Config.js"
import { EmbeddingCache } from "../../src/Service/EmbeddingCache.js"
import { EmbeddingProvider, type EmbeddingProviderMethods } from "../../src/Service/EmbeddingProvider.js"
import { NlpService } from "../../src/Service/Nlp.js"
import { MetricsService } from "../../src/Telemetry/Metrics.js"

// Mock EmbeddingProvider for tests - returns zero vectors
const MockEmbeddingProvider = Layer.succeed(
  EmbeddingProvider,
  {
    metadata: {
      providerId: "nomic" as const,
      modelId: "mock-embed",
      dimension: 768
    },
    embedBatch: (_requests) => Effect.succeed(_requests.map(() => new Array(768).fill(0))),
    cosineSimilarity: (_a, _b) => 0
  } satisfies EmbeddingProviderMethods
)

// Embedding infrastructure for NlpService.Default
const EmbeddingInfraLayer = Layer.mergeAll(
  MockEmbeddingProvider,
  EmbeddingCache.Default,
  MetricsService.Default
)

// Mock ConfigService for testing
const TestConfigService = Layer.succeed(ConfigService, {
  llm: {
    provider: "anthropic" as const,
    model: "claude-haiku-4-5",
    apiKey: { _tag: "Redacted", value: "test-key" } as any,
    temperature: 0,
    maxTokens: 4096,
    timeoutMs: 30000,
    enablePromptCaching: true
  },
  runtime: {
    concurrency: 4,
    llmConcurrencyLimit: 2,
    retryMaxAttempts: 3,
    retryInitialDelayMs: 1000,
    retryMaxDelayMs: 10000,
    enableTracing: false
  },
  storage: {
    type: "memory" as const,
    bucket: Option.none(),
    localPath: Option.none(),
    prefix: ""
  },
  rdf: {
    baseNamespace: "http://example.org/",
    outputFormat: "Turtle" as const,
    prefixes: {
      schema: "http://schema.org/",
      rdf: "http://www.w3.org/1999/02/22-rdf-syntax-ns#",
      rdfs: "http://www.w3.org/2000/01/rdf-schema#",
      owl: "http://www.w3.org/2002/07/owl#",
      xsd: "http://www.w3.org/2001/XMLSchema#"
    }
  },
  ontology: {
    path: "/tmp/test.ttl",
    externalVocabsPath: "ontologies/external/merged-external.ttl",
    registryPath: Option.none(),
    cacheTtlSeconds: 300,
    strictValidation: false
  },
  grounder: {
    enabled: true,
    confidenceThreshold: 0.8,
    batchSize: 5
  },
  embedding: {
    provider: "nomic" as const,
    model: "nomic-embed-text-v1.5",
    dimension: 768,
    transformersModelId: "Xenova/nomic-embed-text-v1",
    voyageApiKey: Option.none(),
    voyageModel: "voyage-3-lite",
    timeoutMs: 30_000,
    rateLimitRpm: 100,
    maxConcurrent: 10,
    cachePath: Option.none(),
    cacheTtlHours: 24,
    cacheMaxEntries: 10000,
    entityIndexPath: Option.none()
  },
  extraction: {
    runsDir: "/tmp/test-runs",
    strictPersistence: false
  },
  entityRegistry: {
    enabled: false,
    candidateThreshold: 0.6,
    resolutionThreshold: 0.8,
    maxCandidatesPerEntity: 20,
    maxBlockingCandidates: 100,
    canonicalNamespace: "http://example.org/entities/"
  },
  inference: {
    enabled: false,
    profile: "rdfs" as const,
    persistDerived: true
  },
  validation: {
    logOnly: false,
    failOnViolation: true,
    failOnWarning: false
  },
  api: {
    keys: Option.none(),
    requireAuth: false
  },
  jina: {
    apiKey: Option.none(),
    rateLimitRpm: 20,
    timeoutMs: 30_000,
    maxConcurrent: 5,
    baseUrl: "https://r.jina.ai"
  }
})

const TestNlpLayer = NlpService.Default.pipe(
  Layer.provide(EmbeddingInfraLayer),
  Layer.provide(TestConfigService)
)

// -----------------------------------------------------------------------------
// Test Fixtures
// -----------------------------------------------------------------------------

const ARTICLE_TEXT =
  `This is the first paragraph of an article. It contains multiple sentences. The topic is very interesting.

This is the second paragraph. It continues the discussion from before. More details are provided here.

The final paragraph wraps things up. It summarizes the key points. Thank you for reading.`

const TRANSCRIPT_TEXT = `HOST: Welcome to the show everyone! Today we have a special guest.

GUEST: Thank you for having me. I'm excited to be here.

HOST: Let's dive right in. Can you tell us about your work?

GUEST: Of course! I've been working on this project for years. It started as a small idea and grew into something much bigger.

HOST: That's fascinating. What challenges did you face?`

const REPORT_TEXT = `## Executive Summary

This report analyzes market trends and provides recommendations.

## 1. Introduction

The market has seen significant changes this quarter. Several factors contributed to this shift.

### 1.1 Background

Historical context is important for understanding current trends.

### 1.2 Scope

This analysis covers Q4 2024 data across all regions.

## 2. Findings

Our research reveals three key insights.`

// -----------------------------------------------------------------------------
// Standard Strategy Tests
// -----------------------------------------------------------------------------

describe("NlpService Chunking - Standard Strategy", () => {
  it("uses default parameters when no strategy specified", async () => {
    const result = await Effect.gen(function*() {
      const nlp = yield* NlpService
      return yield* nlp.chunkText("Hello world. This is a test. Another sentence here.")
    }).pipe(Effect.provide(TestNlpLayer), Effect.runPromise)

    expect(result.length).toBeGreaterThan(0)
    expect(result[0].text).toContain("Hello")
  })

  it("applies standard strategy defaults", async () => {
    const result = await Effect.gen(function*() {
      const nlp = yield* NlpService
      return yield* nlp.chunkText(
        "A".repeat(400) + ". " + "B".repeat(400) + ".",
        { strategy: "standard" }
      )
    }).pipe(Effect.provide(TestNlpLayer), Effect.runPromise)

    // Standard strategy: 500 char max, should split large text
    expect(result.length).toBeGreaterThan(1)
  })

  it("applies fine_grained strategy with smaller chunks", async () => {
    const result = await Effect.gen(function*() {
      const nlp = yield* NlpService
      return yield* nlp.chunkText(
        "A".repeat(250) + ". " + "B".repeat(250) + ". " + "C".repeat(250) + ".",
        { strategy: "fine_grained" }
      )
    }).pipe(Effect.provide(TestNlpLayer), Effect.runPromise)

    // Fine-grained: 300 char max, should split into more chunks
    expect(result.length).toBeGreaterThan(1)
  })
})

// -----------------------------------------------------------------------------
// Paragraph-Based Strategy Tests
// -----------------------------------------------------------------------------

describe("NlpService Chunking - Paragraph Strategy", () => {
  it("splits text on paragraph boundaries", async () => {
    const result = await Effect.gen(function*() {
      const nlp = yield* NlpService
      return yield* nlp.chunkText(ARTICLE_TEXT, { strategy: "paragraph_based" })
    }).pipe(Effect.provide(TestNlpLayer), Effect.runPromise)

    // Should have 3 chunks (one per paragraph)
    expect(result.length).toBe(3)
    expect(result[0].text).toContain("first paragraph")
    expect(result[1].text).toContain("second paragraph")
    expect(result[2].text).toContain("final paragraph")
  })

  it("handles single paragraph text", async () => {
    const result = await Effect.gen(function*() {
      const nlp = yield* NlpService
      return yield* nlp.chunkText(
        "This is a single paragraph with no breaks.",
        { strategy: "paragraph_based" }
      )
    }).pipe(Effect.provide(TestNlpLayer), Effect.runPromise)

    expect(result.length).toBe(1)
    expect(result[0].text).toBe("This is a single paragraph with no breaks.")
  })

  it("splits large paragraphs by sentences", async () => {
    const largeParagraph = "Sentence one. ".repeat(100)
    const result = await Effect.gen(function*() {
      const nlp = yield* NlpService
      return yield* nlp.chunkText(largeParagraph, { strategy: "paragraph_based" })
    }).pipe(Effect.provide(TestNlpLayer), Effect.runPromise)

    // Large paragraph should be split into multiple chunks
    expect(result.length).toBeGreaterThan(1)
  })
})

// -----------------------------------------------------------------------------
// Speaker-Aware Strategy Tests
// -----------------------------------------------------------------------------

describe("NlpService Chunking - Speaker Strategy", () => {
  it("splits transcript by speaker turns", async () => {
    const result = await Effect.gen(function*() {
      const nlp = yield* NlpService
      return yield* nlp.chunkText(TRANSCRIPT_TEXT, { strategy: "speaker_aware" })
    }).pipe(Effect.provide(TestNlpLayer), Effect.runPromise)

    // Should split on speaker turns (HOST:, GUEST:)
    expect(result.length).toBeGreaterThanOrEqual(4)
    expect(result[0].text).toContain("HOST:")
  })

  it("handles various speaker formats", async () => {
    const transcript = `INTERVIEWER: First question.

[Speaker]: Response here.

JOHN DOE: Another response.`

    const result = await Effect.gen(function*() {
      const nlp = yield* NlpService
      return yield* nlp.chunkText(transcript, { strategy: "speaker_aware" })
    }).pipe(Effect.provide(TestNlpLayer), Effect.runPromise)

    expect(result.length).toBeGreaterThanOrEqual(2)
  })

  it("falls back to size-based chunking when no speakers found", async () => {
    const result = await Effect.gen(function*() {
      const nlp = yield* NlpService
      return yield* nlp.chunkText(
        "No speaker patterns here. Just regular text. More sentences follow.",
        { strategy: "speaker_aware" }
      )
    }).pipe(Effect.provide(TestNlpLayer), Effect.runPromise)

    expect(result.length).toBeGreaterThan(0)
  })
})

// -----------------------------------------------------------------------------
// Section-Aware Strategy Tests
// -----------------------------------------------------------------------------

describe("NlpService Chunking - Section Strategy", () => {
  it("splits report by section headers", async () => {
    const result = await Effect.gen(function*() {
      const nlp = yield* NlpService
      return yield* nlp.chunkText(REPORT_TEXT, { strategy: "section_aware" })
    }).pipe(Effect.provide(TestNlpLayer), Effect.runPromise)

    // Should split on ## headers
    expect(result.length).toBeGreaterThanOrEqual(3)
    expect(result.some((c) => c.text.includes("Executive Summary"))).toBe(true)
    expect(result.some((c) => c.text.includes("Introduction"))).toBe(true)
    expect(result.some((c) => c.text.includes("Findings"))).toBe(true)
  })

  it("handles numbered sections", async () => {
    const numberedDoc = `1. First Section
Content of first section.

2. Second Section
Content of second section.

3. Third Section
Content of third section.`

    const result = await Effect.gen(function*() {
      const nlp = yield* NlpService
      return yield* nlp.chunkText(numberedDoc, { strategy: "section_aware" })
    }).pipe(Effect.provide(TestNlpLayer), Effect.runPromise)

    expect(result.length).toBeGreaterThanOrEqual(3)
  })

  it("falls back when no sections found", async () => {
    const result = await Effect.gen(function*() {
      const nlp = yield* NlpService
      return yield* nlp.chunkText(
        "Plain text without any section headers or markdown formatting.",
        { strategy: "section_aware" }
      )
    }).pipe(Effect.provide(TestNlpLayer), Effect.runPromise)

    expect(result.length).toBeGreaterThan(0)
  })
})

// -----------------------------------------------------------------------------
// Option Override Tests
// -----------------------------------------------------------------------------

describe("NlpService Chunking - Option Overrides", () => {
  it("explicit options override strategy defaults", async () => {
    const result = await Effect.gen(function*() {
      const nlp = yield* NlpService
      // Strategy is fine_grained (300 char default) but override to 100
      return yield* nlp.chunkText(
        "A".repeat(80) + ". " + "B".repeat(80) + ". " + "C".repeat(80) + ".",
        { strategy: "fine_grained", maxChunkSize: 100 }
      )
    }).pipe(Effect.provide(TestNlpLayer), Effect.runPromise)

    // With 100 char limit, should have more chunks than default 300
    expect(result.length).toBeGreaterThan(2)
  })
})

// -----------------------------------------------------------------------------
// Offset Tracking Tests
// -----------------------------------------------------------------------------

describe("NlpService Chunking - Offset Tracking", () => {
  it("tracks correct offsets for paragraph chunks", async () => {
    const result = await Effect.gen(function*() {
      const nlp = yield* NlpService
      return yield* nlp.chunkText(ARTICLE_TEXT, { strategy: "paragraph_based" })
    }).pipe(Effect.provide(TestNlpLayer), Effect.runPromise)

    // Verify offsets are sequential and non-overlapping
    for (let i = 0; i < result.length - 1; i++) {
      expect(result[i].endOffset).toBeLessThanOrEqual(result[i + 1].startOffset)
    }
  })

  it("tracks correct offsets for section chunks", async () => {
    const result = await Effect.gen(function*() {
      const nlp = yield* NlpService
      return yield* nlp.chunkText(REPORT_TEXT, { strategy: "section_aware" })
    }).pipe(Effect.provide(TestNlpLayer), Effect.runPromise)

    // First chunk should start near 0
    expect(result[0].startOffset).toBeLessThan(10)

    // Last chunk should end near text length
    const lastChunk = result[result.length - 1]
    expect(lastChunk.endOffset).toBeLessThanOrEqual(REPORT_TEXT.length + 10)
  })
})
