/**
 * Tests for OntologyLoader.loadOntologyWithEmbeddings
 *
 * @since 2.0.0
 * @module test/Service/OntologyLoader.embeddings
 */

import { DateTime, Effect, Layer, Schema } from "effect"
import { describe, expect, it } from "vitest"
import { EmbeddingsNotFound, EmbeddingsVersionMismatch, OntologyFileNotFound } from "../../src/Domain/Error/Ontology.js"
import {
  computeOntologyVersion,
  embeddingsPathFromOntology,
  OntologyEmbeddingsJson
} from "../../src/Domain/Model/OntologyEmbeddings.js"
import type { OntologyEmbeddings } from "../../src/Domain/Model/OntologyEmbeddings.js"
import { ConfigServiceDefault } from "../../src/Service/Config.js"
import { EmbeddingService, EmbeddingServiceLive } from "../../src/Service/Embedding.js"
import { EmbeddingCache } from "../../src/Service/EmbeddingCache.js"
import { EmbeddingProvider, type EmbeddingProviderMethods } from "../../src/Service/EmbeddingProvider.js"
import { NlpService } from "../../src/Service/Nlp.js"
import { OntologyLoader } from "../../src/Service/OntologyLoader.js"
import { RdfBuilder } from "../../src/Service/Rdf.js"
import { StorageService, StorageServiceTest } from "../../src/Service/Storage.js"
import { MetricsService } from "../../src/Telemetry/Metrics.js"
import { TestConfigProvider } from "../setup.js"

const mockEmbedding = [0.1, 0.2, 0.3, 0.4, 0.5]
const MockEmbeddingProvider = Layer.succeed(
  EmbeddingProvider,
  {
    metadata: { providerId: "nomic", modelId: "test-model", dimension: 5 },
    embedBatch: (requests) => Effect.succeed(requests.map(() => mockEmbedding)),
    cosineSimilarity: (_a, _b) => 0.95
  } as EmbeddingProviderMethods
)

const EmbeddingServiceTest = EmbeddingServiceLive.pipe(
  Layer.provideMerge(MockEmbeddingProvider),
  Layer.provideMerge(EmbeddingCache.Default),
  Layer.provideMerge(MetricsService.Default)
)

// Minimal test ontology
const TEST_ONTOLOGY = `
@prefix owl: <http://www.w3.org/2002/07/owl#> .
@prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#> .
@prefix : <http://example.org/test#> .

:Person a owl:Class ;
  rdfs:label "Person" ;
  rdfs:comment "A human being" .

:name a owl:DatatypeProperty ;
  rdfs:label "name" ;
  rdfs:comment "The name of an entity" ;
  rdfs:domain :Person .
`

describe("OntologyLoader.loadOntologyWithEmbeddings", () => {
  const createTestEmbeddings = (ontologyContent: string): OntologyEmbeddings => ({
    ontologyUri: "test/ontology.ttl",
    version: computeOntologyVersion(ontologyContent),
    model: "nomic-embed-text-v1.5",
    dimension: 768,
    createdAt: DateTime.unsafeMake(new Date()),
    classes: [
      { iri: "http://example.org/test#Person", text: "Person", embedding: [0.1, 0.2, 0.3] }
    ],
    properties: [
      { iri: "http://example.org/test#name", text: "name", embedding: [0.4, 0.5, 0.6] }
    ]
  })

  // Common test layer
  const TestLayer = OntologyLoader.Default.pipe(
    Layer.provideMerge(StorageServiceTest),
    Layer.provideMerge(RdfBuilder.Default),
    Layer.provideMerge(NlpService.Default),
    Layer.provideMerge(EmbeddingServiceTest),
    Layer.provideMerge(ConfigServiceDefault),
    Layer.provideMerge(Layer.setConfigProvider(TestConfigProvider))
  )

  it("loads ontology and embeddings when both exist and versions match", async () => {
    const ontologyUri = "test/ontology.ttl"
    const embeddingsPath = embeddingsPathFromOntology(ontologyUri)
    const embeddings = createTestEmbeddings(TEST_ONTOLOGY)

    const result = await Effect.gen(function*() {
      // Set up storage with test data
      const storage = yield* StorageService
      yield* storage.set(ontologyUri, TEST_ONTOLOGY)
      const embeddingsJson = yield* Schema.encode(OntologyEmbeddingsJson)(embeddings)
      yield* storage.set(embeddingsPath, embeddingsJson)

      // Now test loading
      const loader = yield* OntologyLoader
      return yield* loader.loadOntologyWithEmbeddings(ontologyUri)
    }).pipe(
      Effect.scoped,
      Effect.provide(TestLayer),
      Effect.runPromise
    )

    expect(result.context.classes).toHaveLength(1)
    expect(result.context.classes[0].label).toBe("Person")
    expect(result.embeddings.classes).toHaveLength(1)
    expect(result.embeddings.properties).toHaveLength(1)
  })

  it("fails with EmbeddingsNotFound when embeddings blob is missing", async () => {
    const ontologyUri = "test/ontology-no-emb.ttl"

    const result = await Effect.gen(function*() {
      // Set up storage with only ontology
      const storage = yield* StorageService
      yield* storage.set(ontologyUri, TEST_ONTOLOGY)
      // Note: No embeddings stored

      const loader = yield* OntologyLoader
      return yield* loader.loadOntologyWithEmbeddings(ontologyUri)
    }).pipe(
      Effect.scoped,
      Effect.provide(TestLayer),
      Effect.either,
      Effect.runPromise
    )

    expect(result._tag).toBe("Left")
    if (result._tag === "Left") {
      expect(result.left._tag).toBe("EmbeddingsNotFound")
    }
  })

  it("fails with EmbeddingsVersionMismatch when versions don't match", async () => {
    const ontologyUri = "test/ontology-mismatch.ttl"
    const embeddingsPath = embeddingsPathFromOntology(ontologyUri)

    // Create embeddings with wrong version
    const embeddings: OntologyEmbeddings = {
      ontologyUri,
      version: "wrong-version-hash",
      model: "nomic-embed-text-v1.5",
      dimension: 768,
      createdAt: DateTime.unsafeMake(new Date()),
      classes: [],
      properties: []
    }

    const result = await Effect.gen(function*() {
      const storage = yield* StorageService
      yield* storage.set(ontologyUri, TEST_ONTOLOGY)
      const embeddingsJson = yield* Schema.encode(OntologyEmbeddingsJson)(embeddings)
      yield* storage.set(embeddingsPath, embeddingsJson)

      const loader = yield* OntologyLoader
      return yield* loader.loadOntologyWithEmbeddings(ontologyUri)
    }).pipe(
      Effect.scoped,
      Effect.provide(TestLayer),
      Effect.either,
      Effect.runPromise
    )

    expect(result._tag).toBe("Left")
    if (result._tag === "Left") {
      expect(result.left._tag).toBe("EmbeddingsVersionMismatch")
    }
  })

  it("fails with OntologyFileNotFound when ontology is missing", async () => {
    const ontologyUri = "test/nonexistent.ttl"

    const result = await Effect.gen(function*() {
      // Empty storage - nothing set up
      const loader = yield* OntologyLoader
      return yield* loader.loadOntologyWithEmbeddings(ontologyUri)
    }).pipe(
      Effect.scoped,
      Effect.provide(TestLayer),
      Effect.either,
      Effect.runPromise
    )

    expect(result._tag).toBe("Left")
    if (result._tag === "Left") {
      expect(result.left._tag).toBe("OntologyFileNotFound")
    }
  })

  // Note: searchClassesWithEmbeddings requires full integration test setup
  // because it internally uses getBm25Index which depends on getOntology from config path.
  // The core functionality is:
  // 1. Embed query once (search_query task type)
  // 2. Compute cosine similarity against pre-loaded embeddings
  // 3. Combine with BM25 results via RRF fusion
  // Full integration test should be done in workflow context where proper
  // layer setup is available with matching config path and storage paths.
})
