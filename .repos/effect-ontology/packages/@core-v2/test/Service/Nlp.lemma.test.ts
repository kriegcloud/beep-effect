/**
 * Tests for BM25 lemmatization
 *
 * Verifies that lemmatization improves recall for morphological variants.
 *
 * @since 2.0.0
 * @module test/Service/Nlp.lemma
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

describe("NlpService BM25 lemmatization", () => {
  const TestLayer = NlpService.Default.pipe(
    Layer.provide(EmbeddingInfraLayer),
    Layer.provide(TestConfigService)
  )

  describe("morphological variant matching", () => {
    it("matches 'running' when searching for 'run'", async () => {
      const result = await Effect.gen(function*() {
        const nlp = yield* NlpService
        const docs = [
          "The player is running fast",
          "Basketball is exciting",
          "She jumped high"
        ]

        // Search for "run" - should match "running" due to lemmatization
        return yield* nlp.searchSimilar("run", docs, 5)
      }).pipe(
        Effect.provide(TestLayer),
        Effect.runPromise
      )

      // With lemmatization, "running" lemmatizes to "run" and should match
      expect(result.length).toBeGreaterThan(0)
      expect(result[0].doc).toContain("running")
    })

    it("matches 'players' when searching for 'player'", async () => {
      const result = await Effect.gen(function*() {
        const nlp = yield* NlpService
        const docs = [
          "The team has many players",
          "Music is enjoyable",
          "Weather is nice"
        ]

        // Search for "player" - should match "players" due to lemmatization
        return yield* nlp.searchSimilar("player", docs, 5)
      }).pipe(
        Effect.provide(TestLayer),
        Effect.runPromise
      )

      expect(result.length).toBeGreaterThan(0)
      expect(result[0].doc).toContain("players")
    })

    it("matches 'plays' when searching for 'play'", async () => {
      const result = await Effect.gen(function*() {
        const nlp = yield* NlpService
        const docs = [
          "The team plays on Sunday",
          "Books are interesting",
          "Water is cold"
        ]

        return yield* nlp.searchSimilar("play", docs, 5)
      }).pipe(
        Effect.provide(TestLayer),
        Effect.runPromise
      )

      expect(result.length).toBeGreaterThan(0)
      expect(result[0].doc).toContain("plays")
    })

    it("matches 'scored' when searching for 'score'", async () => {
      const result = await Effect.gen(function*() {
        const nlp = yield* NlpService
        const docs = [
          "He scored three goals",
          "The movie was boring",
          "Trees are green"
        ]

        return yield* nlp.searchSimilar("score", docs, 5)
      }).pipe(
        Effect.provide(TestLayer),
        Effect.runPromise
      )

      expect(result.length).toBeGreaterThan(0)
      expect(result[0].doc).toContain("scored")
    })

    it("matches past tense 'ran' when searching for 'run'", async () => {
      const result = await Effect.gen(function*() {
        const nlp = yield* NlpService
        const docs = [
          "She ran fast yesterday",
          "Music is loud",
          "Sky is blue"
        ]

        return yield* nlp.searchSimilar("run", docs, 5)
      }).pipe(
        Effect.provide(TestLayer),
        Effect.runPromise
      )

      expect(result.length).toBeGreaterThan(0)
      expect(result[0].doc).toContain("ran")
    })
  })

  describe("edge cases", () => {
    it("handles empty query with sufficient docs", async () => {
      const result = await Effect.gen(function*() {
        const nlp = yield* NlpService
        // Need at least 3 docs for wink-bm25
        const docs = [
          "First document content",
          "Second document content",
          "Third document content"
        ]
        return yield* nlp.searchSimilar("", docs, 5)
      }).pipe(
        Effect.provide(TestLayer),
        Effect.runPromise
      )

      expect(result).toEqual([])
    })

    it("handles documents with no word overlap", async () => {
      const result = await Effect.gen(function*() {
        const nlp = yield* NlpService
        // Need at least 3 docs for wink-bm25
        const docs = [
          "Apples oranges bananas fruits",
          "Mathematics physics chemistry science",
          "Mountains rivers lakes nature"
        ]
        return yield* nlp.searchSimilar("football soccer sports", docs, 5)
      }).pipe(
        Effect.provide(TestLayer),
        Effect.runPromise
      )

      // No matching terms, should return empty
      expect(result).toEqual([])
    })
  })
})
