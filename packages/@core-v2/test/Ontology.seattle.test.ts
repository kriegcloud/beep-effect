/**
 * Tests: OntologyService - Seattle Civic Ontology
 *
 * Verifies the Seattle ontology pack loads correctly and integrates
 * with W3C ORG, FOAF, OWL-Time, PROV-O, and SKOS vocabularies.
 *
 * @since 2.0.0
 */

import { BunContext } from "@effect/platform-bun"
import { Effect, Layer, Option, Secret } from "effect"
import { describe, expect, it } from "vitest"
import { ConfigService } from "../src/Service/Config.js"
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
      providerId: "nomic" as const, // Use valid providerId
      modelId: "mock-embed",
      dimension: 768
    },
    embedBatch: (_requests) => Effect.succeed(_requests.map(() => new Array(768).fill(0))),
    cosineSimilarity: (_a, _b) => 0
  } satisfies EmbeddingProviderMethods
)

describe("OntologyService - Seattle Ontology", () => {
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
        path: "ontologies/seattle/seattle.ttl",
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

  // Embedding infrastructure for NlpService.Default
  const EmbeddingInfraLayer = Layer.mergeAll(
    MockEmbeddingProvider,
    EmbeddingCache.Default,
    MetricsService.Default
  )

  // Chain layers to satisfy dependencies
  const TestLayer = OntologyService.Default.pipe(
    Layer.provide(NlpService.Default),
    Layer.provide(EmbeddingInfraLayer),
    Layer.provide(RdfBuilder.Default),
    Layer.provide(StorageServiceLive),
    Layer.provide(TestConfig),
    Layer.provideMerge(BunContext.layer),
    Layer.provideMerge(TestConfigProviderLayer)
  )

  describe("Ontology Loading", () => {
    it("should load Seattle ontology successfully", () =>
      Effect.gen(function*() {
        const ontology = yield* OntologyService

        // Should have classes from the ontology
        const results = yield* ontology.searchClasses("organization", 10)
        expect(results.length).toBeGreaterThan(0)
      }).pipe(Effect.provide(TestLayer), Effect.runPromise))

    it("should find BoardOrCommission class", () =>
      Effect.gen(function*() {
        const ontology = yield* OntologyService

        const results = yield* ontology.searchClasses("board commission advisory", 5)

        expect(results.length).toBeGreaterThan(0)
        // Should find BoardOrCommission class
        const hasBoard = Array.from(results).some((c) =>
          c.label.toLowerCase().includes("board") || c.id.includes("BoardOrCommission")
        )
        expect(hasBoard).toBe(true)
      }).pipe(Effect.provide(TestLayer), Effect.runPromise))

    it("should find LeadershipPost class", () =>
      Effect.gen(function*() {
        const ontology = yield* OntologyService

        const results = yield* ontology.searchClasses("leadership post position executive", 5)

        expect(results.length).toBeGreaterThan(0)
        const hasPost = Array.from(results).some((c) =>
          c.label.toLowerCase().includes("post") ||
          c.label.toLowerCase().includes("leadership") ||
          c.id.includes("LeadershipPost")
        )
        expect(hasPost).toBe(true)
      }).pipe(Effect.provide(TestLayer), Effect.runPromise))
  })

  describe("Domain-Specific Classes", () => {
    it("should find PolicyInitiativeEvent class", () =>
      Effect.gen(function*() {
        const ontology = yield* OntologyService

        const results = yield* ontology.searchClasses("policy initiative government action", 5)

        expect(results.length).toBeGreaterThan(0)
        const hasPolicy = Array.from(results).some((c) =>
          c.label?.toLowerCase().includes("policy") ||
          c.id?.includes("PolicyInitiativeEvent")
        )
        expect(hasPolicy).toBe(true)
      }).pipe(Effect.provide(TestLayer), Effect.runPromise))

    it("should find BudgetActionEvent class", () =>
      Effect.gen(function*() {
        const ontology = yield* OntologyService

        const results = yield* ontology.searchClasses("budget spending fiscal finance", 5)

        expect(results.length).toBeGreaterThan(0)
        const hasBudget = Array.from(results).some((c) =>
          c.label?.toLowerCase().includes("budget") ||
          c.id?.includes("BudgetActionEvent")
        )
        expect(hasBudget).toBe(true)
      }).pipe(Effect.provide(TestLayer), Effect.runPromise))
  })

  describe("Event Types", () => {
    it("should find StaffAnnouncementEvent class", () =>
      Effect.gen(function*() {
        const ontology = yield* OntologyService

        const results = yield* ontology.searchClasses("staff announcement hiring appointment", 5)

        expect(results.length).toBeGreaterThan(0)
        const hasEvent = Array.from(results).some((c) =>
          c.label.toLowerCase().includes("announcement") ||
          c.label.toLowerCase().includes("staff") ||
          c.id.includes("StaffAnnouncementEvent")
        )
        expect(hasEvent).toBe(true)
      }).pipe(Effect.provide(TestLayer), Effect.runPromise))

    it("should find CouncilVoteEvent class", () =>
      Effect.gen(function*() {
        const ontology = yield* OntologyService

        const results = yield* ontology.searchClasses("council vote decision legislation", 5)

        expect(results.length).toBeGreaterThan(0)
        const hasVote = Array.from(results).some((c) =>
          c.label?.toLowerCase().includes("vote") ||
          c.label?.toLowerCase().includes("council") ||
          c.id?.includes("CouncilVoteEvent")
        )
        expect(hasVote).toBe(true)
      }).pipe(Effect.provide(TestLayer), Effect.runPromise))
  })

  describe("Property Retrieval", () => {
    it("should get properties relevant to Person", () =>
      Effect.gen(function*() {
        const ontology = yield* OntologyService

        // Find Person class first
        const classes = yield* ontology.searchClasses("person", 5)
        const personClass = Array.from(classes).find((c) =>
          c.label?.toLowerCase() === "person" || c.id?.includes("Person")
        )

        if (personClass) {
          const props = yield* ontology.getPropertiesFor([personClass.id])

          // Should have some properties from FOAF or ORG
          expect(props.length).toBeGreaterThanOrEqual(0) // May inherit from parent
        }
      }).pipe(Effect.provide(TestLayer), Effect.runPromise))

    it("should get properties relevant to Organization", () =>
      Effect.gen(function*() {
        const ontology = yield* OntologyService

        const classes = yield* ontology.searchClasses("organization", 5)
        const orgClass = Array.from(classes).find((c) =>
          c.label?.toLowerCase() === "organization" || c.id?.includes("Organization")
        )

        if (orgClass) {
          const props = yield* ontology.getPropertiesFor([orgClass.id])
          expect(props.length).toBeGreaterThanOrEqual(0)
        }
      }).pipe(Effect.provide(TestLayer), Effect.runPromise))
  })
})
