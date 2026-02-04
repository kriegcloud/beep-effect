/**
 * Tests: SparqlGenerator Service
 *
 * @since 2.0.0
 */

import { LanguageModel } from "@effect/ai"
import { describe, expect, it } from "@effect/vitest"
import { Effect, Layer, Option, Secret } from "effect"
import { ClassDefinition, OntologyContext, PropertyDefinition } from "../../src/Domain/Model/Ontology.js"
import type { IRI } from "../../src/Domain/Rdf/Types.js"
import { ConfigService } from "../../src/Service/Config.js"
import {
  SparqlCorrectionError,
  SparqlGenerationError,
  SparqlGenerator,
  SparqlSyntaxError
} from "../../src/Service/SparqlGenerator.js"

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
          "http://example.org/age" as IRI,
          "http://example.org/worksFor" as IRI
        ]
      }),
      new ClassDefinition({
        id: "http://example.org/Organization" as IRI,
        label: "Organization",
        comment: "A company or institution",
        properties: [
          "http://example.org/name" as IRI,
          "http://example.org/founder" as IRI
        ]
      })
    ],
    properties: [
      new PropertyDefinition({
        id: "http://example.org/name",
        label: "name",
        comment: "The name of an entity",
        domain: ["http://example.org/Person", "http://example.org/Organization"],
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
      }),
      new PropertyDefinition({
        id: "http://example.org/worksFor",
        label: "works for",
        comment: "The organization a person works for",
        domain: ["http://example.org/Person"],
        range: ["http://example.org/Organization"],
        rangeType: "object"
      }),
      new PropertyDefinition({
        id: "http://example.org/founder",
        label: "founder",
        comment: "The person who founded an organization",
        domain: ["http://example.org/Organization"],
        range: ["http://example.org/Person"],
        rangeType: "object"
      })
    ],
    hierarchy: {},
    propertyHierarchy: {}
  })

// =============================================================================
// Mock Layers
// =============================================================================

// Mock ConfigService with required fields for SparqlGenerator
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
 * Mock LanguageModel that returns predefined SPARQL responses
 */
const createMockLlm = (sparql: string, confidence: number = 0.9) =>
  Layer.succeed(LanguageModel.LanguageModel, {
    generateObject: () =>
      Effect.succeed({
        value: {
          sparql,
          explanation: "Generated query",
          confidence
        },
        usage: {
          inputTokens: 100,
          outputTokens: 50,
          totalTokens: 150
        }
      } as any),
    generateText: () =>
      Effect.succeed({ text: sparql, usage: { inputTokens: 0, outputTokens: 0, totalTokens: 0 } } as any),
    generateEmbeddings: () => Effect.succeed({ embeddings: [] } as any),
    stream: () => Effect.succeed({ stream: Effect.succeed([]) } as any),
    streamText: () => Effect.succeed({ stream: Effect.succeed([]) } as any)
  } as unknown as LanguageModel.Service)

// =============================================================================
// Tests
// =============================================================================

describe("SparqlGenerator Domain Models", () => {
  describe("SparqlSyntaxError", () => {
    it.effect("creates syntax error with details", () =>
      Effect.gen(function*() {
        const error = new SparqlSyntaxError({
          message: "Unbalanced braces",
          sparql: "SELECT ?s WHERE { ?s ?p ?o",
          position: 25
        })

        expect(error.message).toBe("Unbalanced braces")
        expect(error.sparql).toContain("SELECT")
        expect(error.position).toBe(25)
      }))
  })

  describe("SparqlGenerationError", () => {
    it.effect("creates generation error with question", () =>
      Effect.gen(function*() {
        const error = new SparqlGenerationError({
          message: "Failed to generate",
          question: "Who founded Acme Corp?"
        })

        expect(error.message).toBe("Failed to generate")
        expect(error.question).toBe("Who founded Acme Corp?")
      }))
  })

  describe("SparqlCorrectionError", () => {
    it.effect("creates correction error with context", () =>
      Effect.gen(function*() {
        const error = new SparqlCorrectionError({
          message: "Correction failed",
          sparql: "SELECT ?s WHERE { ?s ?p ?o }",
          originalError: "Syntax error at line 1"
        })

        expect(error.message).toBe("Correction failed")
        expect(error.originalError).toContain("Syntax error")
      }))
  })
})

describe("SparqlGenerator Service", () => {
  describe("validate", () => {
    it.effect("returns undefined for valid SPARQL", () =>
      Effect.gen(function*() {
        const generator = yield* SparqlGenerator

        const validQuery = `
          PREFIX ex: <http://example.org/>
          SELECT ?person ?name
          WHERE {
            ?person a ex:Person ;
                    ex:name ?name .
          }
        `

        const result = generator.validate(validQuery)
        expect(result).toBeUndefined()
      }).pipe(
        Effect.provide(SparqlGenerator.Default),
        Effect.provide(MockConfigService),
        Effect.provide(createMockLlm(""))
      ))

    it.effect("detects missing WHERE clause", () =>
      Effect.gen(function*() {
        const generator = yield* SparqlGenerator

        const invalidQuery = "SELECT ?s ?p ?o"

        const result = generator.validate(invalidQuery)
        expect(result).toBeDefined()
        expect(result?.message).toContain("WHERE")
      }).pipe(
        Effect.provide(SparqlGenerator.Default),
        Effect.provide(MockConfigService),
        Effect.provide(createMockLlm(""))
      ))

    it.effect("detects unbalanced braces", () =>
      Effect.gen(function*() {
        const generator = yield* SparqlGenerator

        const invalidQuery = "SELECT ?s WHERE { ?s ?p ?o"

        const result = generator.validate(invalidQuery)
        expect(result).toBeDefined()
        expect(result?.message).toContain("braces")
      }).pipe(
        Effect.provide(SparqlGenerator.Default),
        Effect.provide(MockConfigService),
        Effect.provide(createMockLlm(""))
      ))

    it.effect("detects unclosed strings", () =>
      Effect.gen(function*() {
        const generator = yield* SparqlGenerator

        const invalidQuery = `SELECT ?s WHERE { ?s ?p "unclosed }`

        const result = generator.validate(invalidQuery)
        expect(result).toBeDefined()
        expect(result?.message).toContain("string")
      }).pipe(
        Effect.provide(SparqlGenerator.Default),
        Effect.provide(MockConfigService),
        Effect.provide(createMockLlm(""))
      ))

    it.effect("accepts ASK queries without SELECT", () =>
      Effect.gen(function*() {
        const generator = yield* SparqlGenerator

        const askQuery = "ASK WHERE { ?s ?p ?o }"

        const result = generator.validate(askQuery)
        expect(result).toBeUndefined()
      }).pipe(
        Effect.provide(SparqlGenerator.Default),
        Effect.provide(MockConfigService),
        Effect.provide(createMockLlm(""))
      ))
  })

  describe("formatSchema", () => {
    it.effect("formats ontology schema for LLM context", () =>
      Effect.gen(function*() {
        const generator = yield* SparqlGenerator
        const ontology = createTestOntology()

        const schema = generator.formatSchema(ontology)

        // Check classes section
        expect(schema).toContain("## Classes")
        expect(schema).toContain("Person")
        expect(schema).toContain("Organization")

        // Check object properties section
        expect(schema).toContain("## Object Properties")
        expect(schema).toContain("worksFor")
        expect(schema).toContain("founder")

        // Check datatype properties section
        expect(schema).toContain("## Datatype Properties")
        expect(schema).toContain("name")
        expect(schema).toContain("age")
      }).pipe(
        Effect.provide(SparqlGenerator.Default),
        Effect.provide(MockConfigService),
        Effect.provide(createMockLlm(""))
      ))
  })

  describe("generate", () => {
    const validSparql = `
      PREFIX ex: <http://example.org/>
      SELECT ?founder
      WHERE {
        ?org a ex:Organization ;
             ex:name "Acme Corp" ;
             ex:founder ?founder .
      }
    `

    it.effect("generates SPARQL from natural language question", () =>
      Effect.gen(function*() {
        const generator = yield* SparqlGenerator
        const ontology = createTestOntology()

        const result = yield* generator.generate(
          "Who founded Acme Corp?",
          ontology
        )

        expect(result.sparql).toBeDefined()
        expect(result.sparql.length).toBeGreaterThan(0)
        expect(result.confidence).toBeGreaterThan(0)
      }).pipe(
        Effect.provide(SparqlGenerator.Default),
        Effect.provide(MockConfigService),
        Effect.provide(createMockLlm(validSparql, 0.85))
      ))

    it.effect("includes confidence score in response", () =>
      Effect.gen(function*() {
        const generator = yield* SparqlGenerator
        const ontology = createTestOntology()

        const result = yield* generator.generate(
          "List all people",
          ontology
        )

        expect(result.confidence).toBeGreaterThanOrEqual(0)
        expect(result.confidence).toBeLessThanOrEqual(1)
      }).pipe(
        Effect.provide(SparqlGenerator.Default),
        Effect.provide(MockConfigService),
        Effect.provide(createMockLlm("SELECT ?p WHERE { ?p a ex:Person }", 0.95))
      ))
  })

  describe("correct", () => {
    it.effect("corrects SPARQL with syntax errors", () =>
      Effect.gen(function*() {
        const generator = yield* SparqlGenerator
        const ontology = createTestOntology()

        const invalidSparql = "SELECT ?s WHERE { ?s ?p ?o"
        const correctedSparql = "SELECT ?s WHERE { ?s ?p ?o }"

        const result = yield* generator.correct(
          invalidSparql,
          "Unbalanced braces",
          ontology
        )

        expect(result).toBeDefined()
        expect(result.length).toBeGreaterThan(0)
      }).pipe(
        Effect.provide(SparqlGenerator.Default),
        Effect.provide(MockConfigService),
        Effect.provide(createMockLlm("SELECT ?s WHERE { ?s ?p ?o }", 0.9))
      ))
  })
})

describe("OntologyContext for SPARQL", () => {
  it.effect("provides class and property information", () =>
    Effect.gen(function*() {
      const ontology = createTestOntology()

      expect(ontology.classes.length).toBe(2)
      expect(ontology.properties.length).toBe(4)

      // Check class lookup
      const personClass = ontology.getClass("http://example.org/Person")
      expect(personClass).toBeDefined()
      expect(personClass?.label).toBe("Person")

      // Check property lookup
      const nameProperty = ontology.getProperty("http://example.org/name")
      expect(nameProperty).toBeDefined()
      expect(nameProperty?.rangeType).toBe("datatype")
    }))

  it.effect("distinguishes object and datatype properties", () =>
    Effect.gen(function*() {
      const ontology = createTestOntology()

      const objectProps = ontology.properties.filter((p) => p.rangeType === "object")
      const datatypeProps = ontology.properties.filter((p) => p.rangeType === "datatype")

      expect(objectProps.length).toBe(2) // worksFor, founder
      expect(datatypeProps.length).toBe(2) // name, age
    }))
})
