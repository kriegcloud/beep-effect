/**
 * Tests: Core Ontology V2 - Standalone validation
 *
 * Tests for the core ontology (core.ttl) to verify:
 * - Ontology parses correctly with OntologyService
 * - TrackedEntity/TrackedEvent/Mention classes are recognized
 * - Core properties are correctly parsed
 * - SKOS metadata is exposed in prompts
 * - Class hierarchy is correct (subClassOf DUL classes)
 *
 * This is a gate for Seattle integration (CORE-009).
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

// Core ontology namespace
const CORE_NS = "http://effect-ontology.dev/core#"

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

describe("OntologyService - Core Ontology V2", () => {
  // Test configuration pointing to core ontology
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
        path: "ontologies/core/core.ttl",
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
        runsDir: "./output/runs",
        strictPersistence: true
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
        timeoutMs: 30000,
        maxConcurrent: 5,
        baseUrl: "https://r.jina.ai"
      }
    })
  )

  // Full layer stack for ontology tests
  const TestLayer = Layer.mergeAll(
    OntologyService.Default,
    RdfBuilder.Default
  ).pipe(
    Layer.provide(NlpService.Default),
    Layer.provide(EmbeddingInfraLayer),
    Layer.provide(StorageServiceLive),
    Layer.provide(TestConfig),
    Layer.provide(BunContext.layer),
    Layer.provide(TestConfigProviderLayer)
  )

  describe("Ontology Loading", () => {
    it("should load core ontology successfully", () =>
      Effect.gen(function*() {
        const ontology = yield* OntologyService
        const context = yield* ontology.ontology

        expect(context.classes.length).toBeGreaterThan(0)
        expect(context.properties.length).toBeGreaterThan(0)
      }).pipe(Effect.provide(TestLayer), Effect.runPromise))

    it("should find TrackedEntity class", () =>
      Effect.gen(function*() {
        const ontology = yield* OntologyService
        const context = yield* ontology.ontology

        const trackedEntity = context.classes.find(
          (c) => c.id === `${CORE_NS}TrackedEntity`
        )

        expect(trackedEntity).toBeDefined()
        expect(trackedEntity!.label).toBe("Tracked Entity")
        // Should have SKOS metadata
        expect(trackedEntity!.prefLabels).toContain("Entity")
        expect(trackedEntity!.altLabels).toContain("Domain Entity")
        expect(trackedEntity!.definition).toBeDefined()
      }).pipe(Effect.provide(TestLayer), Effect.runPromise))

    it("should find TrackedEvent class", () =>
      Effect.gen(function*() {
        const ontology = yield* OntologyService
        const context = yield* ontology.ontology

        const trackedEvent = context.classes.find(
          (c) => c.id === `${CORE_NS}TrackedEvent`
        )

        expect(trackedEvent).toBeDefined()
        expect(trackedEvent!.label).toBe("Tracked Event")
        expect(trackedEvent!.prefLabels).toContain("Event")
        expect(trackedEvent!.altLabels).toContain("Occurrence")
      }).pipe(Effect.provide(TestLayer), Effect.runPromise))

    it("should find Mention class", () =>
      Effect.gen(function*() {
        const ontology = yield* OntologyService
        const context = yield* ontology.ontology

        const mention = context.classes.find(
          (c) => c.id === `${CORE_NS}Mention`
        )

        expect(mention).toBeDefined()
        expect(mention!.label).toBe("Text Mention")
        expect(mention!.prefLabels).toContain("Mention")
        expect(mention!.altLabels).toContain("Text Span")
      }).pipe(Effect.provide(TestLayer), Effect.runPromise))
  })

  describe("Core Properties", () => {
    it("should find hasEvidentialMention property", () =>
      Effect.gen(function*() {
        const ontology = yield* OntologyService
        const context = yield* ontology.ontology

        const prop = context.properties.find(
          (p) => p.id === `${CORE_NS}hasEvidentialMention`
        )

        expect(prop).toBeDefined()
        expect(prop!.label).toBe("has evidential mention")
        expect(prop!.rangeType).toBe("object") // Object property
      }).pipe(Effect.provide(TestLayer), Effect.runPromise))

    it("should find hasParticipant property", () =>
      Effect.gen(function*() {
        const ontology = yield* OntologyService
        const context = yield* ontology.ontology

        const prop = context.properties.find(
          (p) => p.id === `${CORE_NS}hasParticipant`
        )

        expect(prop).toBeDefined()
        expect(prop!.label).toBe("has participant")
      }).pipe(Effect.provide(TestLayer), Effect.runPromise))

    it("should find name datatype property", () =>
      Effect.gen(function*() {
        const ontology = yield* OntologyService
        const context = yield* ontology.ontology

        const prop = context.properties.find(
          (p) => p.id === `${CORE_NS}name`
        )

        expect(prop).toBeDefined()
        expect(prop!.label).toBe("name")
        expect(prop!.rangeType).toBe("datatype")
      }).pipe(Effect.provide(TestLayer), Effect.runPromise))

    it("should find groundingConfidence property", () =>
      Effect.gen(function*() {
        const ontology = yield* OntologyService
        const context = yield* ontology.ontology

        const prop = context.properties.find(
          (p) => p.id === `${CORE_NS}groundingConfidence`
        )

        expect(prop).toBeDefined()
        expect(prop!.label).toBe("grounding confidence")
        expect(prop!.rangeType).toBe("datatype")
      }).pipe(Effect.provide(TestLayer), Effect.runPromise))
  })

  describe("Class Hierarchy", () => {
    it("should have TrackedEntity as subclass of dul:Object", () =>
      Effect.gen(function*() {
        const ontology = yield* OntologyService
        const context = yield* ontology.ontology

        const trackedEntityIri = `${CORE_NS}TrackedEntity`
        const parents = context.hierarchy[trackedEntityIri] || []

        // Should have dul:Object as parent (via rdfs:subClassOf)
        const hasDulObject = parents.some(
          (p) => p.includes("Object")
        )
        expect(hasDulObject).toBe(true)
      }).pipe(Effect.provide(TestLayer), Effect.runPromise))

    it("should have TrackedEvent as subclass of dul:Event", () =>
      Effect.gen(function*() {
        const ontology = yield* OntologyService
        const context = yield* ontology.ontology

        const trackedEventIri = `${CORE_NS}TrackedEvent`
        const parents = context.hierarchy[trackedEventIri] || []

        // Should have dul:Event as parent (via rdfs:subClassOf)
        const hasDulEvent = parents.some(
          (p) => p.includes("Event")
        )
        expect(hasDulEvent).toBe(true)
      }).pipe(Effect.provide(TestLayer), Effect.runPromise))

    it("should have Mention as subclass of claims:Evidence", () =>
      Effect.gen(function*() {
        const ontology = yield* OntologyService
        const context = yield* ontology.ontology

        const mentionIri = `${CORE_NS}Mention`
        const parents = context.hierarchy[mentionIri] || []

        // Should have claims:Evidence as parent (via rdfs:subClassOf)
        const hasEvidence = parents.some(
          (p) => p.includes("Evidence")
        )
        expect(hasEvidence).toBe(true)
      }).pipe(Effect.provide(TestLayer), Effect.runPromise))
  })

  describe("BM25 Search", () => {
    it("should find TrackedEntity when searching for 'entity'", () =>
      Effect.gen(function*() {
        const ontology = yield* OntologyService
        const results = yield* ontology.searchClasses("entity", 5)

        const hasTrackedEntity = Array.from(results).some(
          (c) => c.id === `${CORE_NS}TrackedEntity`
        )
        expect(hasTrackedEntity).toBe(true)
      }).pipe(Effect.provide(TestLayer), Effect.runPromise))

    it("should find TrackedEvent when searching for 'event occurrence'", () =>
      Effect.gen(function*() {
        const ontology = yield* OntologyService
        const results = yield* ontology.searchClasses("event occurrence", 5)

        const hasTrackedEvent = Array.from(results).some(
          (c) => c.id === `${CORE_NS}TrackedEvent`
        )
        expect(hasTrackedEvent).toBe(true)
      }).pipe(Effect.provide(TestLayer), Effect.runPromise))

    it("should find Mention when searching for 'text span evidence'", () =>
      Effect.gen(function*() {
        const ontology = yield* OntologyService
        const results = yield* ontology.searchClasses("text span evidence", 5)

        const hasMention = Array.from(results).some(
          (c) => c.id === `${CORE_NS}Mention`
        )
        expect(hasMention).toBe(true)
      }).pipe(Effect.provide(TestLayer), Effect.runPromise))
  })

  describe("SKOS Metadata in Prompts", () => {
    it("should expose altLabels as aliases", () =>
      Effect.gen(function*() {
        const ontology = yield* OntologyService
        const context = yield* ontology.ontology

        const trackedEntity = context.classes.find(
          (c) => c.id === `${CORE_NS}TrackedEntity`
        )

        expect(trackedEntity).toBeDefined()
        // altLabels should be populated from SKOS
        expect(trackedEntity!.altLabels.length).toBeGreaterThan(0)
        expect(trackedEntity!.altLabels).toContain("Domain Entity")
        expect(trackedEntity!.altLabels).toContain("Extracted Entity")
      }).pipe(Effect.provide(TestLayer), Effect.runPromise))

    it("should have skos:definition for core classes", () =>
      Effect.gen(function*() {
        const ontology = yield* OntologyService
        const context = yield* ontology.ontology

        const coreClasses = context.classes.filter(
          (c) => c.id.startsWith(CORE_NS)
        )

        // All core classes should have definitions
        for (const cls of coreClasses) {
          expect(cls.definition).toBeDefined()
          expect(cls.definition!.length).toBeGreaterThan(0)
        }
      }).pipe(Effect.provide(TestLayer), Effect.runPromise))

    it("should have skos:scopeNote for inverse property pairs", () =>
      Effect.gen(function*() {
        const ontology = yield* OntologyService
        const context = yield* ontology.ontology

        // Check hasLocation and isLocationOf have scopeNotes
        const hasLocation = context.properties.find(
          (p) => p.id === `${CORE_NS}hasLocation`
        )
        const isLocationOf = context.properties.find(
          (p) => p.id === `${CORE_NS}isLocationOf`
        )

        expect(hasLocation).toBeDefined()
        expect(hasLocation!.scopeNote).toBeDefined()
        expect(hasLocation!.scopeNote).toContain("ALWAYS prefer this")

        expect(isLocationOf).toBeDefined()
        expect(isLocationOf!.scopeNote).toBeDefined()
        expect(isLocationOf!.scopeNote).toContain("DO NOT use directly")
      }).pipe(Effect.provide(TestLayer), Effect.runPromise))

    it("should resolve owl:unionOf blank node domains to actual classes", () =>
      Effect.gen(function*() {
        const ontology = yield* OntologyService
        const context = yield* ontology.ontology

        // hasLocation has domain owl:unionOf(TrackedEntity, TrackedEvent)
        const hasLocation = context.properties.find(
          (p) => p.id === `${CORE_NS}hasLocation`
        )

        expect(hasLocation).toBeDefined()
        // Domain should resolve to the actual classes, not blank nodes
        expect(hasLocation!.domain.length).toBeGreaterThan(0)
        expect(hasLocation!.domain).not.toContain("_:") // No blank nodes
        expect(hasLocation!.domain.some((d) => d.includes("TrackedEntity"))).toBe(true)
        expect(hasLocation!.domain.some((d) => d.includes("TrackedEvent"))).toBe(true)
      }).pipe(Effect.provide(TestLayer), Effect.runPromise))
  })
})
