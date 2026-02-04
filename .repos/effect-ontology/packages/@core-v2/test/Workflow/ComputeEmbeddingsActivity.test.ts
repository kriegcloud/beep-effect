/**
 * Tests for ComputeEmbeddingsActivity
 *
 * @since 2.0.0
 * @module test/Workflow/ComputeEmbeddingsActivity
 */

import { DateTime, Effect, Layer, Option, Request, Schema } from "effect"
import { describe, expect, it } from "vitest"
import type { OntologyEmbeddings } from "../../src/Domain/Model/OntologyEmbeddings.js"
import { OntologyEmbeddingsJson } from "../../src/Domain/Model/OntologyEmbeddings.js"
import { ConfigServiceDefault } from "../../src/Service/Config.js"
import { EmbeddingService, EmbeddingServiceLive } from "../../src/Service/Embedding.js"
import { EmbeddingCache } from "../../src/Service/EmbeddingCache.js"
import { EmbeddingProvider, type EmbeddingProviderMethods } from "../../src/Service/EmbeddingProvider.js"
import { parseOntologyFromStore } from "../../src/Service/Ontology.js"
import { RdfBuilder } from "../../src/Service/Rdf.js"
import { MetricsService } from "../../src/Telemetry/Metrics.js"
import { TestConfigProvider } from "../setup.js"

// Minimal football ontology for testing
const MINIMAL_ONTOLOGY = `
@prefix owl: <http://www.w3.org/2002/07/owl#> .
@prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#> .
@prefix xsd: <http://www.w3.org/2001/XMLSchema#> .
@prefix : <http://example.org/football#> .

# Classes
:Player a owl:Class ;
  rdfs:label "Player" ;
  rdfs:comment "A football player" .

:Team a owl:Class ;
  rdfs:label "Team" ;
  rdfs:comment "A football team or club" .

# Properties
:playsFor a owl:ObjectProperty ;
  rdfs:label "plays for" ;
  rdfs:comment "The team a player plays for" ;
  rdfs:domain :Player ;
  rdfs:range :Team .

:name a owl:DatatypeProperty ;
  rdfs:label "name" ;
  rdfs:comment "The name of an entity" ;
  rdfs:range xsd:string .
`

const mockEmbedding = [0.1, 0.2, 0.3, 0.4, 0.5]

// Enable request batching for tests
const BatchingEnabled = Layer.mergeAll(
  Layer.setRequestBatching(true),
  Layer.setRequestCaching(true)
)

describe("ComputeEmbeddingsActivity", () => {
  const RdfTestLayer = RdfBuilder.Default.pipe(
    Layer.provideMerge(ConfigServiceDefault),
    Layer.provideMerge(Layer.setConfigProvider(TestConfigProvider))
  )

  it("parses ontology and extracts classes and properties", async () => {
    // Use RdfBuilder to parse the ontology directly (same approach as activity)
    const result = await Effect.gen(function*() {
      const rdf = yield* RdfBuilder
      const store = yield* rdf.parseTurtle(MINIMAL_ONTOLOGY)
      const { classes, properties } = yield* parseOntologyFromStore(rdf, store, "test.ttl")

      return {
        classCount: classes.length,
        propertyCount: properties.length,
        classLabels: [...classes].map((c) => c.label),
        propertyLabels: [...properties].map((p) => p.label)
      }
    }).pipe(
      Effect.scoped,
      Effect.provide(RdfTestLayer),
      Effect.runPromise
    )

    expect(result.classCount).toBe(2)
    expect(result.propertyCount).toBe(2)
    expect(result.classLabels).toContain("Player")
    expect(result.classLabels).toContain("Team")
    expect(result.propertyLabels).toContain("plays for")
    expect(result.propertyLabels).toContain("name")
  })

  it("generates embeddings for classes and properties", async () => {
    const embeddedTexts: Array<string> = []

    const MockEmbeddingProvider = Layer.succeed(
      EmbeddingProvider,
      {
        metadata: { providerId: "nomic", modelId: "test-model", dimension: 5 },
        embedBatch: (requests) => {
          requests.forEach((r) => embeddedTexts.push(r.text))
          return Effect.succeed(requests.map(() => mockEmbedding))
        },
        cosineSimilarity: (_a, _b) => 0.95
      } as EmbeddingProviderMethods
    )

    const TestLayer = EmbeddingServiceLive.pipe(
      Layer.provideMerge(MockEmbeddingProvider),
      Layer.provideMerge(EmbeddingCache.Default),
      Layer.provideMerge(MetricsService.Default),
      Layer.provideMerge(RdfTestLayer),
      Layer.provideMerge(BatchingEnabled)
    )

    const result = await Effect.gen(function*() {
      const rdf = yield* RdfBuilder
      const embedding = yield* EmbeddingService

      const store = yield* rdf.parseTurtle(MINIMAL_ONTOLOGY)
      const { classes, properties } = yield* parseOntologyFromStore(rdf, store, "test.ttl")

      // Embed classes
      for (const cls of classes) {
        yield* embedding.embed(`${cls.label}. ${cls.comment}`, "search_document")
      }

      // Embed properties
      for (const prop of properties) {
        yield* embedding.embed(`${prop.label}. ${prop.comment}`, "search_document")
      }

      return { classCount: classes.length, propertyCount: properties.length }
    }).pipe(
      Effect.scoped,
      Effect.provide(TestLayer),
      Effect.runPromise
    )

    // Should have embedded 2 classes + 2 properties = 4 texts
    expect(embeddedTexts.length).toBe(4)
    expect(result.classCount).toBe(2)
    expect(result.propertyCount).toBe(2)
  })

  it("OntologyEmbeddingsJson codec round-trips correctly", async () => {
    const result = await Effect.gen(function*() {
      const createdAt = yield* DateTime.now

      const embeddings: OntologyEmbeddings = {
        ontologyUri: "gs://bucket/test.ttl",
        version: "abc123",
        model: "nomic-embed-text-v1.5",
        dimension: 768,
        createdAt,
        classes: [
          { iri: "http://example.org/Player", text: "Player", embedding: [0.1, 0.2] }
        ],
        properties: [
          { iri: "http://example.org/playsFor", text: "plays for", embedding: [0.3, 0.4] }
        ]
      }

      // Encode to JSON string
      const json = yield* Schema.encode(OntologyEmbeddingsJson)(embeddings)
      expect(typeof json).toBe("string")

      // Decode back
      const decoded = yield* Schema.decode(OntologyEmbeddingsJson)(json)

      return { embeddings, decoded }
    }).pipe(Effect.runPromise)

    expect(result.decoded.ontologyUri).toBe(result.embeddings.ontologyUri)
    expect(result.decoded.version).toBe(result.embeddings.version)
    expect(result.decoded.model).toBe(result.embeddings.model)
    expect(result.decoded.dimension).toBe(result.embeddings.dimension)
    expect(result.decoded.classes).toHaveLength(1)
    expect(result.decoded.properties).toHaveLength(1)
    expect(result.decoded.classes[0].iri).toBe("http://example.org/Player")
  })
})
