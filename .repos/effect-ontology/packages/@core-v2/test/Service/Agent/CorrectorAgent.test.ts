/**
 * Tests: CorrectorAgent Service
 *
 * Tests for the SHACL violation correction agent.
 *
 * @module test/Service/Agent/CorrectorAgent
 */

import { LanguageModel } from "@effect/ai"
import { describe, expect, it } from "@effect/vitest"
import { Effect, Layer, Option, Secret } from "effect"
import * as N3 from "n3"
import { ClassDefinition, OntologyContext, PropertyDefinition } from "../../../src/Domain/Model/Ontology.js"
import type { IRI } from "../../../src/Domain/Rdf/Types.js"
import {
  BatchCorrectionResult,
  Correction,
  CorrectionResult,
  type CorrectionStrategy,
  CorrectorAgent
} from "../../../src/Service/Agent/CorrectorAgent.js"
import { ConfigService } from "../../../src/Service/Config.js"
import type { RdfStore } from "../../../src/Service/Rdf.js"
import type { ShaclValidationReport, ShaclViolation } from "../../../src/Service/Shacl.js"
import { TestConfigProviderLayer } from "../../setup.js"

// =============================================================================
// Test Fixtures
// =============================================================================

/**
 * Sample ontology for testing
 */
const createTestOntology = (): OntologyContext =>
  new OntologyContext({
    classes: [
      new ClassDefinition({
        id: "http://example.org/Person" as IRI,
        label: "Person",
        comment: "A human being",
        properties: [
          "http://example.org/name" as IRI,
          "http://example.org/email" as IRI,
          "http://example.org/age" as IRI
        ]
      })
    ],
    properties: [
      new PropertyDefinition({
        id: "http://example.org/name",
        label: "name",
        comment: "The name of a person",
        domain: ["http://example.org/Person"],
        range: ["http://www.w3.org/2001/XMLSchema#string"],
        rangeType: "datatype"
      }),
      new PropertyDefinition({
        id: "http://example.org/email",
        label: "email",
        comment: "Email address",
        domain: ["http://example.org/Person"],
        range: ["http://www.w3.org/2001/XMLSchema#string"],
        rangeType: "datatype"
      }),
      new PropertyDefinition({
        id: "http://example.org/age",
        label: "age",
        comment: "Age in years",
        domain: ["http://example.org/Person"],
        range: ["http://www.w3.org/2001/XMLSchema#integer"],
        rangeType: "datatype"
      })
    ],
    hierarchy: {},
    propertyHierarchy: {}
  })

/**
 * Create test RDF store with sample data
 */
const createTestStore = (): RdfStore => {
  const store = new N3.Store()
  const df = N3.DataFactory

  // Add a Person entity
  store.addQuad(
    df.namedNode("http://example.org/alice"),
    df.namedNode("http://www.w3.org/1999/02/22-rdf-syntax-ns#type"),
    df.namedNode("http://example.org/Person")
  )
  store.addQuad(
    df.namedNode("http://example.org/alice"),
    df.namedNode("http://example.org/name"),
    df.literal("Alice Johnson")
  )
  store.addQuad(
    df.namedNode("http://example.org/alice"),
    df.namedNode("http://example.org/age"),
    df.literal("32")
  )

  return { _tag: "RdfStore", _store: store }
}

/**
 * Sample violations for testing
 */
const createMinCountViolation = (): ShaclViolation => ({
  focusNode: "http://example.org/alice",
  path: "http://example.org/email",
  value: undefined,
  message: "Less than minimum count 1 for sh:minCount",
  severity: "Violation",
  sourceShape: "http://example.org/PersonShape"
})

const createDatatypeViolation = (): ShaclViolation => ({
  focusNode: "http://example.org/alice",
  path: "http://example.org/age",
  value: "thirty-two",
  message: "Value does not have datatype xsd:integer",
  severity: "Violation",
  sourceShape: "http://example.org/PersonShape"
})

const createMaxCountViolation = (): ShaclViolation => ({
  focusNode: "http://example.org/bob",
  path: "http://example.org/email",
  value: undefined,
  message: "More than maximum count 1 for sh:maxCount",
  severity: "Violation",
  sourceShape: "http://example.org/PersonShape"
})

const createPatternViolation = (): ShaclViolation => ({
  focusNode: "http://example.org/alice",
  path: "http://example.org/email",
  value: "not-an-email",
  message: "Value does not match pattern for sh:pattern",
  severity: "Violation",
  sourceShape: "http://example.org/PersonShape"
})

const createTypeViolation = (): ShaclViolation => ({
  focusNode: "http://example.org/alice",
  path: undefined,
  value: undefined,
  message: "Focus node is not of class http://example.org/Employee",
  severity: "Violation",
  sourceShape: "http://example.org/EmployeeShape"
})

// =============================================================================
// Mock Layers
// =============================================================================

// Mock ConfigService with required fields for Agent
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
      "schema": "http://schema.org/",
      "rdf": "http://www.w3.org/1999/02/22-rdf-syntax-ns#",
      "rdfs": "http://www.w3.org/2000/01/rdf-schema#",
      "owl": "http://www.w3.org/2002/07/owl#",
      "xsd": "http://www.w3.org/2001/XMLSchema#"
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

/**
 * Mock LanguageModel that returns predefined correction responses
 */
const createMockLlm = (response: {
  strategy: CorrectionStrategy
  newValue?: string | number
  newType?: string
  explanation: string
  confidence: number
}) =>
  Layer.succeed(LanguageModel.LanguageModel, {
    generateObject: () =>
      Effect.succeed({
        value: response,
        usage: {
          inputTokens: 100,
          outputTokens: 50,
          totalTokens: 150
        }
      } as any),
    generateText: () => Effect.succeed({ text: "", usage: { inputTokens: 0, outputTokens: 0, totalTokens: 0 } } as any),
    generateEmbeddings: () => Effect.succeed({ embeddings: [] } as any),
    stream: () => Effect.succeed({ stream: Effect.succeed([]) } as any),
    streamText: () => Effect.succeed({ stream: Effect.succeed([]) } as any)
  } as unknown as LanguageModel.Service)

// =============================================================================
// Tests
// =============================================================================

describe("CorrectorAgent", () => {
  describe("classifyViolation", () => {
    it.effect("classifies minCount violations as generate-value", () =>
      Effect.gen(function*() {
        const corrector = yield* CorrectorAgent

        const violation = createMinCountViolation()
        const strategy = corrector.classifyViolation(violation)

        expect(strategy).toBe("generate-value")
      }).pipe(
        Effect.provide(CorrectorAgent.Default),
        Effect.provide(MockConfigService),
        Effect.provide(TestConfigProviderLayer),
        Effect.provide(createMockLlm({
          strategy: "generate-value",
          newValue: "alice@example.com",
          explanation: "Generated email",
          confidence: 0.9
        }))
      ))

    it.effect("classifies datatype violations as coerce-datatype", () =>
      Effect.gen(function*() {
        const corrector = yield* CorrectorAgent

        const violation = createDatatypeViolation()
        const strategy = corrector.classifyViolation(violation)

        expect(strategy).toBe("coerce-datatype")
      }).pipe(
        Effect.provide(CorrectorAgent.Default),
        Effect.provide(MockConfigService),
        Effect.provide(TestConfigProviderLayer),
        Effect.provide(createMockLlm({
          strategy: "coerce-datatype",
          explanation: "Type conversion",
          confidence: 0.9
        }))
      ))

    it.effect("classifies maxCount violations as remove-excess", () =>
      Effect.gen(function*() {
        const corrector = yield* CorrectorAgent

        const violation = createMaxCountViolation()
        const strategy = corrector.classifyViolation(violation)

        expect(strategy).toBe("remove-excess")
      }).pipe(
        Effect.provide(CorrectorAgent.Default),
        Effect.provide(MockConfigService),
        Effect.provide(TestConfigProviderLayer),
        Effect.provide(createMockLlm({
          strategy: "skip",
          explanation: "Cannot auto-correct",
          confidence: 0.5
        }))
      ))

    it.effect("classifies pattern violations as reformat-value", () =>
      Effect.gen(function*() {
        const corrector = yield* CorrectorAgent

        const violation = createPatternViolation()
        const strategy = corrector.classifyViolation(violation)

        expect(strategy).toBe("reformat-value")
      }).pipe(
        Effect.provide(CorrectorAgent.Default),
        Effect.provide(MockConfigService),
        Effect.provide(TestConfigProviderLayer),
        Effect.provide(createMockLlm({
          strategy: "reformat-value",
          explanation: "Reformatted",
          confidence: 0.8
        }))
      ))

    it.effect("classifies type violations as reclassify-entity", () =>
      Effect.gen(function*() {
        const corrector = yield* CorrectorAgent

        const violation = createTypeViolation()
        const strategy = corrector.classifyViolation(violation)

        expect(strategy).toBe("reclassify-entity")
      }).pipe(
        Effect.provide(CorrectorAgent.Default),
        Effect.provide(MockConfigService),
        Effect.provide(TestConfigProviderLayer),
        Effect.provide(createMockLlm({
          strategy: "reclassify-entity",
          newType: "http://example.org/Employee",
          explanation: "Reclassified",
          confidence: 0.7
        }))
      ))
  })

  describe("Correction model", () => {
    it("creates correction with all fields", () => {
      const correction = new Correction({
        strategy: "generate-value",
        focusNode: "http://example.org/alice",
        path: "http://example.org/email",
        newValue: "alice@example.com",
        explanation: "Generated plausible email",
        confidence: 0.85
      })

      expect(correction.strategy).toBe("generate-value")
      expect(correction.newValue).toBe("alice@example.com")
      expect(correction.shouldApply).toBe(true)
    })

    it("shouldApply is false for low confidence", () => {
      const correction = new Correction({
        strategy: "generate-value",
        focusNode: "http://example.org/alice",
        explanation: "Low confidence guess",
        confidence: 0.3
      })

      expect(correction.shouldApply).toBe(false)
    })

    it("shouldApply is false for skip strategy", () => {
      const correction = new Correction({
        strategy: "skip",
        focusNode: "http://example.org/alice",
        explanation: "Cannot auto-correct",
        confidence: 0.9
      })

      expect(correction.shouldApply).toBe(false)
    })
  })

  describe("generateCorrection", () => {
    it.effect("generates correction for missing property", () =>
      Effect.gen(function*() {
        const corrector = yield* CorrectorAgent
        const store = createTestStore()
        const ontology = createTestOntology()
        const violation = createMinCountViolation()

        const correction = yield* corrector.generateCorrection(violation, store, ontology)

        expect(correction.strategy).toBe("generate-value")
        expect(correction.focusNode).toBe("http://example.org/alice")
        expect(correction.newValue).toBe("alice@example.com")
        expect(correction.confidence).toBeGreaterThan(0.5)
      }).pipe(
        Effect.provide(CorrectorAgent.Default),
        Effect.provide(MockConfigService),
        Effect.provide(TestConfigProviderLayer),
        Effect.provide(createMockLlm({
          strategy: "generate-value",
          newValue: "alice@example.com",
          explanation: "Generated email based on name",
          confidence: 0.85
        }))
      ))
  })

  describe("correct", () => {
    it.effect("corrects a single violation", () =>
      Effect.gen(function*() {
        const corrector = yield* CorrectorAgent
        const store = createTestStore()
        const ontology = createTestOntology()
        const violation = createMinCountViolation()

        const result = yield* corrector.correct(violation, store, ontology)

        expect(result.applied).toBe(true)
        expect(result.correction.strategy).toBe("generate-value")
        expect(result.durationMs).toBeGreaterThanOrEqual(0)
      }).pipe(
        Effect.provide(CorrectorAgent.Default),
        Effect.provide(MockConfigService),
        Effect.provide(TestConfigProviderLayer),
        Effect.provide(createMockLlm({
          strategy: "generate-value",
          newValue: "alice@example.com",
          explanation: "Generated email",
          confidence: 0.9
        }))
      ))
  })

  describe("correctAll", () => {
    it.effect("corrects multiple violations", () =>
      Effect.gen(function*() {
        const corrector = yield* CorrectorAgent
        const store = createTestStore()
        const ontology = createTestOntology()

        const report: ShaclValidationReport = {
          conforms: false,
          violations: [createMinCountViolation(), createDatatypeViolation()],
          validatedAt: new Date().toISOString() as any,
          dataGraphTripleCount: 3,
          shapesGraphTripleCount: 10,
          durationMs: 50
        }

        const result = yield* corrector.correctAll(report, store, ontology)

        expect(result.totalViolations).toBe(2)
        expect(result.results).toHaveLength(2)
        expect(result.durationMs).toBeGreaterThanOrEqual(0)
      }).pipe(
        Effect.provide(CorrectorAgent.Default),
        Effect.provide(MockConfigService),
        Effect.provide(TestConfigProviderLayer),
        Effect.provide(createMockLlm({
          strategy: "generate-value",
          newValue: "alice@example.com",
          explanation: "Generated value",
          confidence: 0.9
        }))
      ))

    it.effect("calculates success rate correctly", () =>
      Effect.gen(function*() {
        const result = new BatchCorrectionResult({
          results: [],
          totalViolations: 4,
          correctedCount: 3,
          skippedCount: 1,
          durationMs: 100
        })

        expect(result.successRate).toBe(0.75)
        expect(result.allCorrected).toBe(false)
      }))
  })

  describe("asAgent", () => {
    it.effect("returns Agent interface for orchestration", () =>
      Effect.gen(function*() {
        const corrector = yield* CorrectorAgent

        const agent = corrector.asAgent()

        expect(agent.metadata.id).toBe("corrector")
        expect(agent.metadata.type).toBe("corrector")
        expect(agent.execute).toBeDefined()
        expect(agent.validate).toBeDefined()
      }).pipe(
        Effect.provide(CorrectorAgent.Default),
        Effect.provide(MockConfigService),
        Effect.provide(TestConfigProviderLayer),
        Effect.provide(createMockLlm({
          strategy: "skip",
          explanation: "Test",
          confidence: 0.5
        }))
      ))
  })
})

describe("CorrectionResult", () => {
  it("creates result with violation and correction", () => {
    const violation = createMinCountViolation()
    const correction = new Correction({
      strategy: "generate-value",
      focusNode: violation.focusNode,
      path: violation.path,
      newValue: "test@example.com",
      explanation: "Generated email",
      confidence: 0.9
    })

    const result = new CorrectionResult({
      violation,
      correction,
      applied: true,
      durationMs: 150
    })

    expect(result.applied).toBe(true)
    expect(result.durationMs).toBe(150)
  })
})

describe("BatchCorrectionResult", () => {
  it("calculates metrics correctly", () => {
    const result = new BatchCorrectionResult({
      results: [],
      totalViolations: 10,
      correctedCount: 8,
      skippedCount: 2,
      durationMs: 500
    })

    expect(result.successRate).toBe(0.8)
    expect(result.allCorrected).toBe(false)
  })

  it("handles zero violations", () => {
    const result = new BatchCorrectionResult({
      results: [],
      totalViolations: 0,
      correctedCount: 0,
      skippedCount: 0,
      durationMs: 10
    })

    expect(result.successRate).toBe(1)
    expect(result.allCorrected).toBe(true)
  })
})
