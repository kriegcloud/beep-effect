/**
 * Tests: OntologyService - Production-ready with real ontology loading
 */

import { BunContext } from "@effect/platform-bun"
import { Effect, Layer, Option, Secret } from "effect"
import * as path from "node:path"
import { describe, expect, it } from "vitest"
import { ConfigService, DEFAULT_CONFIG } from "../src/Service/Config.js"
import { EmbeddingCache } from "../src/Service/EmbeddingCache.js"
import { EmbeddingProvider, type EmbeddingProviderMethods } from "../src/Service/EmbeddingProvider.js"
import { NlpService } from "../src/Service/Nlp.js"
import { OntologyService } from "../src/Service/Ontology.js"
import { RdfBuilder } from "../src/Service/Rdf.js"
import { StorageServiceLive } from "../src/Service/Storage.js"
import { MetricsService } from "../src/Telemetry/Metrics.js"
import { TestConfigProviderLayer } from "./setup.js"

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

describe("OntologyService - Football Ontology", () => {
  // Mock ConfigService
  const TestConfig = Layer.succeed(
    ConfigService,
    ConfigService.of({
      llm: {
        provider: "anthropic" as const,
        model: "claude-haiku-4-5",
        apiKey: Secret.fromString("test-key"),
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
        type: "local" as const,
        bucket: Option.none(),
        localPath: Option.some("../../"),
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
        path: "ontologies/football/ontology.ttl",
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
        timeoutMs: 30000,
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
  )

  // Chain layers to satisfy dependencies:
  // Ontology -> (Nlp, Rdf, Storage)
  // Storage, Nlp, Rdf -> Config
  const TestLayer = OntologyService.Default.pipe(
    Layer.provide(NlpService.Default),
    Layer.provide(EmbeddingInfraLayer),
    Layer.provide(RdfBuilder.Default),
    Layer.provide(StorageServiceLive),
    Layer.provide(TestConfig),
    Layer.provideMerge(BunContext.layer),
    Layer.provideMerge(TestConfigProviderLayer)
  )

  describe("Entity-First Semantic Search", () => {
    it("should load football ontology and find Player class", () =>
      Effect.gen(function*() {
        const ontology = yield* OntologyService

        const results = yield* ontology.searchClasses("soccer player athlete", 5)

        expect(results.length).toBeGreaterThan(0)
        // Should find Player class
        const hasPlayer = Array.from(results).some((c) => c.label.toLowerCase().includes("player"))
        expect(hasPlayer).toBe(true)
      }).pipe(Effect.provide(TestLayer), Effect.runPromise))

    it("should find Team class when searching for team-related terms", () =>
      Effect.gen(function*() {
        const ontology = yield* OntologyService

        const results = yield* ontology.searchClasses("football team club squad", 5)

        expect(results.length).toBeGreaterThan(0)
        const hasTeam = Array.from(results).some((c) => c.label.toLowerCase().includes("team"))
        expect(hasTeam).toBe(true)
      }).pipe(Effect.provide(TestLayer), Effect.runPromise))

    it("should find Coach class", () =>
      Effect.gen(function*() {
        const ontology = yield* OntologyService

        const results = yield* ontology.searchClasses("manager coach trainer", 3)

        expect(results.length).toBeGreaterThan(0)
        const hasCoach = Array.from(results).some((c) => c.label.toLowerCase().includes("coach"))
        expect(hasCoach).toBe(true)
      }).pipe(Effect.provide(TestLayer), Effect.runPromise))

    it("should find Stadium class", () =>
      Effect.gen(function*() {
        const ontology = yield* OntologyService

        const results = yield* ontology.searchClasses("stadium arena venue", 3)

        expect(results.length).toBeGreaterThan(0)
        const hasStadium = Array.from(results).some((c) => c.label.toLowerCase().includes("stadium"))
        expect(hasStadium).toBe(true)
      }).pipe(Effect.provide(TestLayer), Effect.runPromise))

    it("should respect limit parameter", () =>
      Effect.gen(function*() {
        const ontology = yield* OntologyService

        const results = yield* ontology.searchClasses("football", 3)

        expect(results.length).toBeLessThanOrEqual(3)
      }).pipe(Effect.provide(TestLayer), Effect.runPromise))
  })

  describe("Property Retrieval (Domain Lookup)", () => {
    it("should get properties for Player class domain", () =>
      Effect.gen(function*() {
        const ontology = yield* OntologyService

        // Find Player class first
        const classes = yield* ontology.searchClasses("player", 5)
        const playerClass = Array.from(classes).find((c) => c.label.toLowerCase() === "player")

        if (!playerClass) {
          throw new Error("Player class not found")
        }

        // Get properties for Player
        const properties = yield* ontology.getPropertiesFor([playerClass.id])

        expect(properties.length).toBeGreaterThan(0)
        // Should have properties like playsFor, hasPosition, etc.
      }).pipe(Effect.provide(TestLayer), Effect.runPromise))

    it("should filter properties by domain correctly", () =>
      Effect.gen(function*() {
        const ontology = yield* OntologyService

        // Find Team class
        const classes = yield* ontology.searchClasses("team", 5)
        const teamClass = Array.from(classes).find((c) => c.label.toLowerCase() === "team")

        if (!teamClass) {
          throw new Error("Team class not found")
        }

        // Get properties for Team
        const teamProps = yield* ontology.getPropertiesFor([teamClass.id])

        expect(teamProps.length).toBeGreaterThan(0)
      }).pipe(Effect.provide(TestLayer), Effect.runPromise))
  })
})
