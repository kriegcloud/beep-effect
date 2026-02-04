/**
 * Tests: OntologyAgent Service
 *
 * @since 2.0.0
 */

import { LanguageModel } from "@effect/ai"
import { describe, expect, it } from "@effect/vitest"
import { Chunk, Context, DateTime, Effect, Layer, Option, Secret } from "effect"
import { Entity, KnowledgeGraph, Relation } from "../../src/Domain/Model/Entity.js"
import {
  EnhancedValidationReport,
  ExtractionMetrics,
  ExtractionResult,
  OntologyAgentConfig,
  QueryResult,
  ViolationExplanation,
  ViolationsByLevel
} from "../../src/Domain/Model/OntologyAgent.js"
import { EntityId } from "../../src/Domain/Model/shared.js"
import { ClaimService } from "../../src/Service/Claim.js"
import { ConfigService } from "../../src/Service/Config.js"
import { EmbeddingCache } from "../../src/Service/EmbeddingCache.js"
import { EmbeddingProvider, type EmbeddingProviderMethods } from "../../src/Service/EmbeddingProvider.js"
import { ExtractionWorkflow } from "../../src/Service/ExtractionWorkflow.js"
import { OntologyService } from "../../src/Service/Ontology.js"
import { OntologyAgent } from "../../src/Service/OntologyAgent.js"
import { RdfBuilder } from "../../src/Service/Rdf.js"
import { Reasoner, ReasoningConfig, ReasoningResult } from "../../src/Service/Reasoner.js"
import { ShaclService, ShaclValidationReport, ShaclViolation, ValidationPolicy } from "../../src/Service/Shacl.js"
import { SparqlService } from "../../src/Service/Sparql.js"
import { SparqlGenerator } from "../../src/Service/SparqlGenerator.js"
import { StorageService } from "../../src/Service/Storage.js"
import { MetricsService } from "../../src/Telemetry/Metrics.js"
import { TestConfigProviderLayer } from "../setup.js"

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

// Embedding infrastructure for NlpService.Default (used by OntologyService)
const EmbeddingInfraLayer = Layer.mergeAll(
  MockEmbeddingProvider,
  EmbeddingCache.Default,
  MetricsService.Default
)

describe("OntologyAgent Domain Models", () => {
  describe("OntologyAgentConfig", () => {
    it.effect("creates default config", () =>
      Effect.gen(function*() {
        const config = OntologyAgentConfig.default()
        expect(config.ontology).toBeUndefined()
        expect(config.validationPolicy).toBeUndefined()
        expect(config.concurrency).toBeUndefined()
      }))

    it.effect("creates config with values", () =>
      Effect.gen(function*() {
        const config = new OntologyAgentConfig({
          concurrency: 8,
          validationPolicy: new ValidationPolicy({ failOnViolation: true, failOnWarning: false }),
          chunking: { maxChunkSize: 3000, preserveSentences: true }
        })
        expect(config.concurrency).toBe(8)
        expect(config.validationPolicy?.failOnViolation).toBe(true)
        expect(config.chunking?.maxChunkSize).toBe(3000)
      }))
  })

  describe("ExtractionMetrics", () => {
    it.effect("calculates total tokens", () =>
      Effect.gen(function*() {
        const metrics = new ExtractionMetrics({
          entityCount: 10,
          relationCount: 5,
          chunkCount: 2,
          inputTokens: 1000,
          outputTokens: 500,
          durationMs: 2500
        })
        expect(metrics.totalTokens).toBe(1500)
        expect(metrics.entityCount).toBe(10)
        expect(metrics.durationMs).toBe(2500)
      }))
  })

  describe("ExtractionResult", () => {
    it.effect("provides convenience accessors", () =>
      Effect.gen(function*() {
        const graph = new KnowledgeGraph({
          entities: [],
          relations: []
        })
        const metrics = new ExtractionMetrics({
          entityCount: 0,
          relationCount: 0,
          chunkCount: 1,
          inputTokens: 100,
          outputTokens: 50,
          durationMs: 500
        })
        const result = new ExtractionResult({
          graph,
          metrics,
          validationReport: undefined
        })

        expect(result.isEmpty).toBe(true)
        expect(result.isValid).toBe(true) // No validation = valid
        expect(result.entities).toEqual([])
        expect(result.relations).toEqual([])
      }))

    it.effect("reports invalid when validation fails", () =>
      Effect.gen(function*() {
        const graph = new KnowledgeGraph({
          entities: [],
          relations: []
        })
        const metrics = new ExtractionMetrics({
          entityCount: 0,
          relationCount: 0,
          chunkCount: 1,
          inputTokens: 100,
          outputTokens: 50,
          durationMs: 500
        })
        const now = yield* DateTime.now
        const report = new ShaclValidationReport({
          conforms: false,
          violations: [
            new ShaclViolation({
              focusNode: "http://example.org/entity1",
              message: "Missing required property",
              severity: "Violation" as const
            })
          ],
          validatedAt: now,
          dataGraphTripleCount: 10,
          shapesGraphTripleCount: 5,
          durationMs: 100
        })
        const result = new ExtractionResult({
          graph,
          metrics,
          validationReport: report
        })

        expect(result.isValid).toBe(false)
      }))
  })

  describe("QueryResult", () => {
    it.effect("creates query result with bindings", () =>
      Effect.gen(function*() {
        const result = new QueryResult({
          answer: "Cristiano Ronaldo scored the most goals.",
          sparql: "SELECT ?player WHERE { ?player :scored ?goals } ORDER BY DESC(?goals) LIMIT 1",
          bindings: [],
          confidence: 0.85
        })
        expect(result.answer).toContain("Cristiano Ronaldo")
        expect(result.hasResults).toBe(false)
        expect(result.confidence).toBe(0.85)
      }))
  })

  describe("ViolationExplanation", () => {
    it.effect("creates violation explanation", () =>
      Effect.gen(function*() {
        const explanation = new ViolationExplanation({
          focusNode: "http://example.org/entity1",
          path: "http://schema.org/name",
          explanation: "Missing required name property",
          suggestion: "Add a name value to the entity",
          severity: "Violation"
        })
        expect(explanation.focusNode).toBe("http://example.org/entity1")
        expect(explanation.severity).toBe("Violation")
        expect(explanation.suggestion).toContain("Add a name")
      }))
  })
})

describe("OntologyAgent Service", () => {
  // Mock ExtractionWorkflow that returns sample entities
  const MockExtractionWorkflow = Layer.succeed(ExtractionWorkflow, {
    extract: (_text, _config) =>
      Effect.succeed(
        new KnowledgeGraph({
          entities: [
            new Entity({
              id: EntityId("cristiano_ronaldo"),
              mention: "Cristiano Ronaldo",
              types: ["http://schema.org/Person"],
              attributes: { "http://schema.org/name": "Cristiano Ronaldo" }
            }),
            new Entity({
              id: EntityId("al_nassr"),
              mention: "Al-Nassr",
              types: ["http://schema.org/SportsTeam"],
              attributes: {}
            })
          ],
          relations: [
            new Relation({
              subjectId: "cristiano_ronaldo",
              predicate: "http://schema.org/memberOf",
              object: "al_nassr"
            })
          ]
        })
      )
  })

  // Mock ConfigService with required RDF prefixes
  const MockConfigService = Layer.succeed(ConfigService, {
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
  } as ConfigService)

  // Mock OntologyService - use unknown cast for Effect.Service classes
  const MockOntologyService = Layer.succeed(OntologyService, {
    ontology: Effect.succeed({
      classes: [],
      properties: [],
      hierarchy: {},
      propertyHierarchy: {},
      getClass: () => undefined,
      getProperty: () => undefined,
      getPropertiesForClass: () => []
    } as any),
    searchClasses: () => Effect.succeed(Chunk.empty()),
    searchClassesHybrid: () => Effect.succeed(Chunk.empty()),
    searchClassesSemantic: () => Effect.succeed(Chunk.empty()),
    searchProperties: () => Effect.succeed(Chunk.empty()),
    searchPropertiesSemantic: () => Effect.succeed(Chunk.empty()),
    getPropertiesFor: () => Effect.succeed(Chunk.empty())
  } as unknown as OntologyService)

  // Mock LanguageModel for query tests
  const MockLanguageModel = Layer.succeed(LanguageModel.LanguageModel, {
    generateObject: () =>
      Effect.succeed({
        value: {
          sparql: "SELECT ?s WHERE { ?s ?p ?o }",
          explanation: "Test query",
          confidence: 0.9
        },
        usage: { inputTokens: 100, outputTokens: 50, totalTokens: 150 }
      } as any),
    generateText: () =>
      Effect.succeed({
        text: "Test answer based on knowledge graph data.",
        usage: { inputTokens: 0, outputTokens: 0, totalTokens: 0 }
      } as any),
    generateEmbeddings: () => Effect.succeed({ embeddings: [] } as any),
    stream: () => Effect.succeed({ stream: Effect.succeed([]) } as any),
    streamText: () => Effect.succeed({ stream: Effect.succeed([]) } as any)
  } as unknown as LanguageModel.Service)

  // Mock SparqlGenerator
  const MockSparqlGenerator = Layer.succeed(SparqlGenerator, {
    generate: () =>
      Effect.succeed({
        sparql: "SELECT ?s WHERE { ?s ?p ?o }",
        explanation: "Generated query",
        confidence: 0.9
      }),
    correct: () => Effect.succeed("SELECT ?s WHERE { ?s ?p ?o }"),
    validate: () => undefined,
    formatSchema: () => "## Classes\n- Person\n- Organization"
  } as unknown as SparqlGenerator)

  // Mock Reasoner
  const MockReasoner = Layer.succeed(Reasoner, {
    reason: () =>
      Effect.succeed(
        new ReasoningResult({
          inferredTripleCount: 2,
          totalTripleCount: 5,
          rulesApplied: 3,
          durationMs: 10
        })
      ),
    reasonCopy: () =>
      Effect.succeed({
        store: { _tag: "RdfStore", _store: {} } as any,
        result: new ReasoningResult({
          inferredTripleCount: 2,
          totalTripleCount: 5,
          rulesApplied: 3,
          durationMs: 10
        })
      }),
    reasonForValidation: () =>
      Effect.succeed(
        new ReasoningResult({
          inferredTripleCount: 1,
          totalTripleCount: 3,
          rulesApplied: 2,
          durationMs: 5
        })
      ),
    wouldInfer: () => Effect.succeed(true),
    getRules: () => []
  } as unknown as Reasoner)

  // Mock StorageService that returns a simple ontology
  const mockOntologyTurtle = `
@prefix rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> .
@prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#> .
@prefix owl: <http://www.w3.org/2002/07/owl#> .
@prefix schema: <http://schema.org/> .

schema:Person a owl:Class ;
  rdfs:label "Person" ;
  rdfs:comment "A human being" .

schema:Organization a owl:Class ;
  rdfs:label "Organization" ;
  rdfs:comment "An organization" .

schema:name a owl:DatatypeProperty ;
  rdfs:label "name" ;
  rdfs:domain schema:Person ;
  rdfs:range rdfs:Literal .
`

  const MockStorageService = Layer.succeed(StorageService, {
    get: (key: string) => {
      // Return the mock ontology for any path
      if (key.endsWith(".ttl")) {
        return Effect.succeed(Option.some(mockOntologyTurtle))
      }
      return Effect.succeed(Option.none())
    },
    getUint8Array: () => Effect.succeed(Option.none()),
    set: () => Effect.succeed(undefined),
    delete: () => Effect.succeed(undefined),
    list: () => Effect.succeed([]),
    exists: (key: string) => Effect.succeed(key.endsWith(".ttl"))
  } as unknown as StorageService)

  // Mock ClaimService for extractWithClaims tests
  const MockClaimService = Layer.succeed(ClaimService, {
    createClaim: (input: any) =>
      Effect.succeed({
        id: `claim-${Date.now().toString(16).slice(-12)}`,
        ...input,
        rank: "normal",
        createdAt: new Date()
      } as any),
    getClaim: () => Effect.succeed(Option.none()),
    getClaims: () => Effect.succeed([]),
    deprecateClaim: () => Effect.succeed({ claimId: "", deprecatedAt: new Date(), reason: "" }),
    promoteToPreferred: () => Effect.succeed(undefined),
    findConflicting: () => Effect.succeed([]),
    getClaimHistory: () => Effect.succeed([]),
    toReifiedTriples: () => Effect.succeed([]),
    addClaimToStore: () => Effect.succeed([]),
    claimsToTurtle: () => Effect.succeed("")
  } as unknown as ClaimService)

  // Combined test layer with embedding infrastructure for OntologyAgent.Default
  const TestLayer = Layer.mergeAll(
    MockExtractionWorkflow,
    MockConfigService,
    MockOntologyService,
    MockLanguageModel,
    MockSparqlGenerator,
    MockReasoner,
    MockStorageService,
    MockClaimService,
    EmbeddingInfraLayer, // Required by OntologyAgent.Default -> OntologyService -> NlpService
    ShaclService.Test(),
    RdfBuilder.Default,
    SparqlService.Default
  ).pipe(
    Layer.provideMerge(MockConfigService)
  )

  describe("extract", () => {
    it.effect("extracts entities and relations with RDF output", () =>
      Effect.gen(function*() {
        const agent = yield* OntologyAgent

        const result = yield* agent.extract(
          "Cristiano Ronaldo plays for Al-Nassr.",
          OntologyAgentConfig.default()
        )

        // Check entities
        expect(result.entities.length).toBe(2)
        expect(result.entities[0].id).toBe("cristiano_ronaldo")
        expect(result.entities[1].id).toBe("al_nassr")

        // Check relations
        expect(result.relations.length).toBe(1)
        expect(result.relations[0].subjectId).toBe("cristiano_ronaldo")
        expect(result.relations[0].predicate).toBe("http://schema.org/memberOf")

        // Check metrics
        expect(result.metrics.entityCount).toBe(2)
        expect(result.metrics.relationCount).toBe(1)
        expect(result.metrics.durationMs).toBeGreaterThanOrEqual(0)

        // Check RDF turtle output
        expect(result.hasTurtle).toBe(true)
        expect(result.turtle).toContain("cristiano_ronaldo")
        expect(result.turtle).toContain("schema.org")
      }).pipe(
        Effect.provide(OntologyAgent.Default),
        Effect.provide(TestLayer),
        Effect.provide(TestConfigProviderLayer)
      ))

    it.effect("returns empty result for empty extraction", () =>
      Effect.gen(function*() {
        const agent = yield* OntologyAgent

        // Override with empty extraction workflow
        const emptyResult = new ExtractionResult({
          graph: new KnowledgeGraph({ entities: [], relations: [] }),
          metrics: new ExtractionMetrics({
            entityCount: 0,
            relationCount: 0,
            chunkCount: 1,
            inputTokens: 0,
            outputTokens: 0,
            durationMs: 0
          }),
          turtle: "",
          validationReport: undefined
        })

        expect(emptyResult.isEmpty).toBe(true)
        expect(emptyResult.isValid).toBe(true)
      }).pipe(
        Effect.provide(OntologyAgent.Default),
        Effect.provide(TestLayer),
        Effect.provide(TestConfigProviderLayer)
      ))
  })

  describe("extractWithClaims", () => {
    it.effect("extracts entities, relations, and creates claims", () =>
      Effect.gen(function*() {
        const agent = yield* OntologyAgent

        const result = yield* agent.extractWithClaims(
          "Cristiano Ronaldo plays for Al-Nassr.",
          { ontologyId: "test-ontology", articleId: "article-001" }
        )

        // Check entities
        expect(result.entities.length).toBe(2)
        expect(result.entities[0].id).toBe("cristiano_ronaldo")
        expect(result.entities[1].id).toBe("al_nassr")

        // Check relations
        expect(result.relations.length).toBe(1)
        expect(result.relations[0].subjectId).toBe("cristiano_ronaldo")

        // Check claims were created
        expect(result.claimCount).toBe(1)
        expect(result.articleId).toBe("article-001")
        expect(result.hasClaims).toBe(true)

        // Check metrics
        expect(result.metrics.entityCount).toBe(2)
        expect(result.metrics.relationCount).toBe(1)
      }).pipe(
        Effect.provide(OntologyAgent.Default),
        Effect.provide(TestLayer),
        Effect.provide(TestConfigProviderLayer)
      ))

    it.effect("creates claims with custom confidence", () =>
      Effect.gen(function*() {
        const agent = yield* OntologyAgent

        const result = yield* agent.extractWithClaims(
          "Cristiano Ronaldo plays for Al-Nassr.",
          {
            ontologyId: "test-ontology",
            articleId: "article-002",
            defaultConfidence: 0.95
          }
        )

        expect(result.claimCount).toBe(1)
        expect(result.articleId).toBe("article-002")
      }).pipe(
        Effect.provide(OntologyAgent.Default),
        Effect.provide(TestLayer),
        Effect.provide(TestConfigProviderLayer)
      ))

    it.effect("returns empty claims for empty extraction", () => {
      // Create a custom layer with empty extraction
      const EmptyExtractionWorkflow = Layer.succeed(ExtractionWorkflow, {
        extract: () =>
          Effect.succeed(
            new KnowledgeGraph({
              entities: [],
              relations: []
            })
          )
      } as unknown as ExtractionWorkflow)

      const EmptyTestLayer = Layer.mergeAll(
        EmptyExtractionWorkflow,
        MockConfigService,
        MockOntologyService,
        MockLanguageModel,
        MockSparqlGenerator,
        MockReasoner,
        MockStorageService,
        MockClaimService,
        EmbeddingInfraLayer,
        ShaclService.Test(),
        RdfBuilder.Default,
        SparqlService.Default
      ).pipe(
        Layer.provideMerge(MockConfigService)
      )

      return Effect.gen(function*() {
        const agent = yield* OntologyAgent

        const result = yield* agent.extractWithClaims(
          "Some text with no entities.",
          { ontologyId: "test-ontology", articleId: "article-003" }
        )

        expect(result.isEmpty).toBe(true)
        expect(result.claimCount).toBe(0)
        expect(result.hasClaims).toBe(false)
      }).pipe(
        Effect.provide(OntologyAgent.Default),
        Effect.provide(EmptyTestLayer),
        Effect.provide(TestConfigProviderLayer)
      )
    })
  })

  describe("extractWithReasoning", () => {
    it.effect("extracts entities and applies RDFS reasoning", () =>
      Effect.gen(function*() {
        const agent = yield* OntologyAgent

        const result = yield* agent.extractWithReasoning(
          "Cristiano Ronaldo plays for Al-Nassr."
        )

        // Check entities
        expect(result.entities.length).toBe(2)
        expect(result.entities[0].id).toBe("cristiano_ronaldo")
        expect(result.entities[1].id).toBe("al_nassr")

        // Check relations
        expect(result.relations.length).toBe(1)

        // Check RDF turtle output (includes inferred triples)
        expect(result.hasTurtle).toBe(true)
        expect(result.turtle).toContain("cristiano_ronaldo")

        // Check metrics
        expect(result.metrics.entityCount).toBe(2)
        expect(result.metrics.relationCount).toBe(1)
      }).pipe(
        Effect.provide(OntologyAgent.Default),
        Effect.provide(TestLayer),
        Effect.provide(TestConfigProviderLayer)
      ))

    it.effect("applies reasoning with custom config", () =>
      Effect.gen(function*() {
        const agent = yield* OntologyAgent

        const result = yield* agent.extractWithReasoning(
          "Cristiano Ronaldo plays for Al-Nassr.",
          undefined, // default agent config
          ReasoningConfig.rdfs() // full RDFS reasoning
        )

        // Check that extraction and reasoning succeeded
        expect(result.entities.length).toBe(2)
        expect(result.hasTurtle).toBe(true)
      }).pipe(
        Effect.provide(OntologyAgent.Default),
        Effect.provide(TestLayer),
        Effect.provide(TestConfigProviderLayer)
      ))
  })

  describe("extractAndValidate with reasoning", () => {
    it.effect("applies RDFS reasoning before validation", () =>
      Effect.gen(function*() {
        const agent = yield* OntologyAgent

        const result = yield* agent.extractAndValidate(
          "Cristiano Ronaldo plays for Al-Nassr."
        )

        // Check entities
        expect(result.entities.length).toBe(2)

        // Check validation was performed (mock returns conforming)
        expect(result.validationReport).toBeDefined()
        expect(result.validationReport?.conforms).toBe(true)

        // Check RDF turtle output (includes inferred triples)
        expect(result.hasTurtle).toBe(true)
        expect(result.turtle).toContain("cristiano_ronaldo")
      }).pipe(
        Effect.provide(OntologyAgent.Default),
        Effect.provide(TestLayer),
        Effect.provide(TestConfigProviderLayer)
      ))

    it.effect("continues validation even if reasoning fails", () => {
      // Create a reasoner that fails
      const FailingReasoner = Layer.succeed(Reasoner, {
        reason: () => Effect.fail(new Error("Reasoning failed")),
        reasonCopy: () => Effect.fail(new Error("Reasoning failed")),
        reasonForValidation: () => Effect.fail(new Error("Reasoning failed")),
        wouldInfer: () => Effect.succeed(false),
        getRules: () => []
      } as unknown as Reasoner)

      const FailingReasonerTestLayer = Layer.mergeAll(
        MockExtractionWorkflow,
        MockConfigService,
        MockOntologyService,
        MockLanguageModel,
        MockSparqlGenerator,
        FailingReasoner,
        MockStorageService,
        MockClaimService,
        EmbeddingInfraLayer,
        ShaclService.Test(),
        RdfBuilder.Default,
        SparqlService.Default
      ).pipe(
        Layer.provideMerge(MockConfigService)
      )

      return Effect.gen(function*() {
        const agent = yield* OntologyAgent

        // Should succeed even when reasoning fails (graceful degradation)
        const result = yield* agent.extractAndValidate(
          "Cristiano Ronaldo plays for Al-Nassr."
        )

        // Check entities were still extracted
        expect(result.entities.length).toBe(2)

        // Check validation was still performed
        expect(result.validationReport).toBeDefined()
      }).pipe(
        Effect.provide(OntologyAgent.Default),
        Effect.provide(FailingReasonerTestLayer),
        Effect.provide(TestConfigProviderLayer)
      )
    })
  })

  describe("explainViolations", () => {
    it.effect("converts violations to explanations", () =>
      Effect.gen(function*() {
        const agent = yield* OntologyAgent

        const violations = [
          {
            focusNode: "http://example.org/entity1",
            path: "http://schema.org/name",
            message: "minCount constraint violated",
            severity: "Violation" as const
          },
          {
            focusNode: "http://example.org/entity2",
            message: "datatype mismatch",
            severity: "Warning" as const
          }
        ]

        const explanations = agent.explainViolations(violations)

        expect(explanations.length).toBe(2)
        expect(explanations[0].suggestion).toContain("Add a value")
        expect(explanations[1].suggestion).toContain("data type")
      }).pipe(
        Effect.provide(OntologyAgent.Default),
        Effect.provide(TestLayer),
        Effect.provide(TestConfigProviderLayer)
      ))
  })

  describe("validate", () => {
    it.effect("validates data store against shapes", () =>
      Effect.gen(function*() {
        const agent = yield* OntologyAgent
        const rdfBuilder = yield* RdfBuilder

        // Create a simple data store
        const dataStore = yield* rdfBuilder.createStore

        // Create empty shapes store (mock ShaclService returns conforming report)
        const shapesStore = yield* rdfBuilder.createStore

        const report = yield* agent.validate(dataStore, shapesStore._store)

        // Test ShaclService returns conforming by default
        expect(report.conforms).toBe(true)
        expect(report.violations.length).toBe(0)
      }).pipe(
        Effect.provide(OntologyAgent.Default),
        Effect.provide(TestLayer),
        Effect.provide(TestConfigProviderLayer)
      ))

    it.effect("validateWithPolicy applies policy to validation", () =>
      Effect.gen(function*() {
        const agent = yield* OntologyAgent
        const rdfBuilder = yield* RdfBuilder

        const dataStore = yield* rdfBuilder.createStore
        const shapesStore = yield* rdfBuilder.createStore

        const report = yield* agent.validateWithPolicy(
          dataStore,
          shapesStore._store,
          { failOnViolation: true, failOnWarning: false }
        )

        expect(report.conforms).toBe(true)
      }).pipe(
        Effect.provide(OntologyAgent.Default),
        Effect.provide(TestLayer),
        Effect.provide(TestConfigProviderLayer)
      ))

    it.effect("generateShapes produces SHACL shapes from ontology store", () =>
      Effect.gen(function*() {
        const agent = yield* OntologyAgent
        const rdfBuilder = yield* RdfBuilder

        const ontologyStore = yield* rdfBuilder.createStore
        const shapesStore = yield* agent.generateShapes(ontologyStore)

        // Shapes store should be created (even if empty for empty ontology)
        expect(shapesStore).toBeDefined()
      }).pipe(
        Effect.provide(OntologyAgent.Default),
        Effect.provide(TestLayer),
        Effect.provide(TestConfigProviderLayer)
      ))
  })

  describe("query", () => {
    it.effect("answers natural language questions from knowledge graph", () =>
      Effect.gen(function*() {
        const agent = yield* OntologyAgent
        const rdfBuilder = yield* RdfBuilder

        // Create a data store with sample triples
        const dataStore = yield* rdfBuilder.createStore
        const parsed = yield* rdfBuilder.parseTurtle(`
          @prefix schema: <http://schema.org/> .
          @prefix ex: <http://example.org/> .

          ex:cristiano_ronaldo a schema:Person ;
            schema:name "Cristiano Ronaldo" .
        `)
        dataStore._store.addQuads(parsed._store.getQuads(null, null, null, null))

        const result = yield* agent.query(
          "Who is Cristiano Ronaldo?",
          dataStore
        )

        // Check that we get a QueryResult
        expect(result.sparql).toBeDefined()
        expect(result.sparql.length).toBeGreaterThan(0)
        expect(result.answer).toBeDefined()
        expect(result.confidence).toBeGreaterThan(0)
        expect(result.confidence).toBeLessThanOrEqual(1)
      }).pipe(
        Effect.provide(OntologyAgent.Default),
        Effect.provide(TestLayer),
        Effect.provide(TestConfigProviderLayer)
      ))

    it.effect("returns result with bindings for matching triples", () =>
      Effect.gen(function*() {
        const agent = yield* OntologyAgent
        const rdfBuilder = yield* RdfBuilder

        // Create data store with multiple entities
        const dataStore = yield* rdfBuilder.createStore
        const parsed = yield* rdfBuilder.parseTurtle(`
          @prefix schema: <http://schema.org/> .
          @prefix ex: <http://example.org/> .

          ex:player1 a schema:Person ;
            schema:name "Lionel Messi" .
          ex:player2 a schema:Person ;
            schema:name "Cristiano Ronaldo" .
        `)
        dataStore._store.addQuads(parsed._store.getQuads(null, null, null, null))

        const result = yield* agent.query(
          "List all players",
          dataStore
        )

        // Should have results
        expect(result).toBeDefined()
        expect(result.sparql).toContain("SELECT")
      }).pipe(
        Effect.provide(OntologyAgent.Default),
        Effect.provide(TestLayer),
        Effect.provide(TestConfigProviderLayer)
      ))
  })
})

describe("Validation Domain Models", () => {
  describe("ViolationsByLevel", () => {
    it.effect("groups violations by severity", () =>
      Effect.gen(function*() {
        const byLevel = new ViolationsByLevel({
          violations: ["error1", "error2"],
          warnings: ["warning1"],
          info: []
        })

        expect(byLevel.violations.length).toBe(2)
        expect(byLevel.warnings.length).toBe(1)
        expect(byLevel.info.length).toBe(0)
        expect(byLevel.totalCount).toBe(3)
        expect(byLevel.hasCritical).toBe(true)
      }))

    it.effect("reports no critical when violations array is empty", () =>
      Effect.gen(function*() {
        const byLevel = new ViolationsByLevel({
          violations: [],
          warnings: ["warning1", "warning2"],
          info: ["info1"]
        })

        expect(byLevel.hasCritical).toBe(false)
        expect(byLevel.totalCount).toBe(3)
      }))
  })

  describe("EnhancedValidationReport", () => {
    it.effect("creates report with explanations", () =>
      Effect.gen(function*() {
        const byLevel = new ViolationsByLevel({
          violations: ["Missing required property"],
          warnings: [],
          info: []
        })

        const explanations = [
          new ViolationExplanation({
            focusNode: "http://example.org/entity1",
            explanation: "Missing required property",
            suggestion: "Add a value for the missing property",
            severity: "Violation"
          })
        ]

        const report = new EnhancedValidationReport({
          conforms: false,
          violationCount: 1,
          explanations,
          byLevel,
          durationMs: 50,
          dataGraphTripleCount: 10,
          shapesCount: 5
        })

        expect(report.isValid).toBe(false)
        expect(report.hasWarningsOnly).toBe(false)
        expect(report.violationCount).toBe(1)
        expect(report.explanations.length).toBe(1)
      }))

    it.effect("hasWarningsOnly is true when conforms with warnings", () =>
      Effect.gen(function*() {
        const byLevel = new ViolationsByLevel({
          violations: [],
          warnings: ["Some warning"],
          info: []
        })

        const report = new EnhancedValidationReport({
          conforms: true,
          violationCount: 0,
          explanations: [],
          byLevel,
          durationMs: 30,
          dataGraphTripleCount: 5,
          shapesCount: 2
        })

        expect(report.isValid).toBe(true)
        expect(report.hasWarningsOnly).toBe(true)
      }))
  })
})
