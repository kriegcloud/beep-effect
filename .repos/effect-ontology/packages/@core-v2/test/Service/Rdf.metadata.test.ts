/**
 * Tests for RdfBuilder extraction metadata functionality
 *
 * @since 2.0.0
 * @module test/Service/Rdf.metadata
 */

import { Chunk, Effect, Layer } from "effect"
import { describe, expect, it } from "vitest"
import { DCTERMS, PROV } from "../../src/Domain/Rdf/Constants.js"
import type { IRI } from "../../src/Domain/Rdf/Types.js"
import { ConfigServiceDefault } from "../../src/Service/Config.js"
import { RdfBuilder } from "../../src/Service/Rdf.js"
import { TestConfigProvider } from "../setup.js"

describe("RdfBuilder.addExtractionMetadata", () => {
  const TestLayer = RdfBuilder.Default.pipe(
    Layer.provideMerge(ConfigServiceDefault),
    Layer.provideMerge(Layer.setConfigProvider(TestConfigProvider))
  )

  const testMetadata = {
    graphUri: "urn:provenance:batch/batch-123456789012/doc/doc-abcdef123456",
    timestamp: "2024-12-16T10:30:00Z",
    sourceUri: "gs://bucket/documents/doc1.txt",
    model: "claude-haiku-4-5",
    ontologyVersion: "football/ontology@abc123"
  }

  it("adds prov:wasGeneratedBy triple", async () => {
    const result = await Effect.gen(function*() {
      const rdf = yield* RdfBuilder
      const store = yield* rdf.createStore

      yield* rdf.addExtractionMetadata(store, testMetadata)

      const quads = yield* rdf.queryStore(store, {
        predicate: PROV.wasGeneratedBy as IRI
      })
      return quads
    }).pipe(
      Effect.provide(TestLayer),
      Effect.runPromise
    )

    expect(Chunk.size(result)).toBe(1)
    const quad = Chunk.unsafeGet(result, 0)
    expect(quad.subject).toBe(testMetadata.graphUri)
    expect(quad.object).toBe(`${testMetadata.graphUri}/activity`)
  })

  it("adds prov:generatedAtTime triple with xsd:dateTime", async () => {
    const result = await Effect.gen(function*() {
      const rdf = yield* RdfBuilder
      const store = yield* rdf.createStore

      yield* rdf.addExtractionMetadata(store, testMetadata)

      const quads = yield* rdf.queryStore(store, {
        predicate: PROV.generatedAtTime as IRI
      })
      return quads
    }).pipe(
      Effect.provide(TestLayer),
      Effect.runPromise
    )

    expect(Chunk.size(result)).toBe(1)
    const quad = Chunk.unsafeGet(result, 0)
    expect(quad.subject).toBe(testMetadata.graphUri)
    // Check literal value
    expect(typeof quad.object).not.toBe("string") // Should be Literal
  })

  it("adds dcterms:source triple", async () => {
    const result = await Effect.gen(function*() {
      const rdf = yield* RdfBuilder
      const store = yield* rdf.createStore

      yield* rdf.addExtractionMetadata(store, testMetadata)

      const quads = yield* rdf.queryStore(store, {
        predicate: DCTERMS.source as IRI
      })
      return quads
    }).pipe(
      Effect.provide(TestLayer),
      Effect.runPromise
    )

    expect(Chunk.size(result)).toBe(1)
    const quad = Chunk.unsafeGet(result, 0)
    expect(quad.subject).toBe(testMetadata.graphUri)
    expect(quad.object).toBe(testMetadata.sourceUri)
  })

  it("adds :usedModel triple on activity", async () => {
    const result = await Effect.gen(function*() {
      const rdf = yield* RdfBuilder
      const store = yield* rdf.createStore

      yield* rdf.addExtractionMetadata(store, testMetadata)

      // Query for usedModel predicate (in base namespace)
      const quads = yield* rdf.queryStore(store, {
        predicate: "http://example.org/kg/usedModel" as IRI
      })
      return quads
    }).pipe(
      Effect.provide(TestLayer),
      Effect.runPromise
    )

    expect(Chunk.size(result)).toBe(1)
    const quad = Chunk.unsafeGet(result, 0)
    expect(quad.subject).toBe(`${testMetadata.graphUri}/activity`)
  })

  it("adds :ontologyVersion triple on activity", async () => {
    const result = await Effect.gen(function*() {
      const rdf = yield* RdfBuilder
      const store = yield* rdf.createStore

      yield* rdf.addExtractionMetadata(store, testMetadata)

      // Query for ontologyVersion predicate (in base namespace)
      const quads = yield* rdf.queryStore(store, {
        predicate: "http://example.org/kg/ontologyVersion" as IRI
      })
      return quads
    }).pipe(
      Effect.provide(TestLayer),
      Effect.runPromise
    )

    expect(Chunk.size(result)).toBe(1)
    const quad = Chunk.unsafeGet(result, 0)
    expect(quad.subject).toBe(`${testMetadata.graphUri}/activity`)
  })

  it("marks activity as prov:Activity type", async () => {
    const result = await Effect.gen(function*() {
      const rdf = yield* RdfBuilder
      const store = yield* rdf.createStore

      yield* rdf.addExtractionMetadata(store, testMetadata)

      // Query for rdf:type = prov:Activity
      const quads = yield* rdf.queryStore(store, {
        subject: `${testMetadata.graphUri}/activity` as IRI,
        predicate: "http://www.w3.org/1999/02/22-rdf-syntax-ns#type" as IRI
      })
      return quads
    }).pipe(
      Effect.provide(TestLayer),
      Effect.runPromise
    )

    expect(Chunk.size(result)).toBe(1)
    const quad = Chunk.unsafeGet(result, 0)
    expect(quad.object).toBe(PROV.Activity)
  })

  it("metadata is in provenance named graph", async () => {
    const result = await Effect.gen(function*() {
      const rdf = yield* RdfBuilder
      const store = yield* rdf.createStore

      yield* rdf.addExtractionMetadata(store, testMetadata)

      // Query all quads in the provenance graph
      const quads = yield* rdf.queryStore(store, {
        graph: testMetadata.graphUri as IRI
      })
      return quads
    }).pipe(
      Effect.provide(TestLayer),
      Effect.runPromise
    )

    // Should have 6 triples: wasGeneratedBy, generatedAtTime, source, usedModel, ontologyVersion, type
    expect(Chunk.size(result)).toBe(6)
    // All should be in the provenance graph
    for (const quad of result) {
      expect(quad.graph).toBe(testMetadata.graphUri)
    }
  })

  it("supports custom activity URI", async () => {
    const customActivityUri = "urn:activity:custom-extraction-123"
    const result = await Effect.gen(function*() {
      const rdf = yield* RdfBuilder
      const store = yield* rdf.createStore

      yield* rdf.addExtractionMetadata(store, {
        ...testMetadata,
        activityUri: customActivityUri
      })

      const quads = yield* rdf.queryStore(store, {
        predicate: PROV.wasGeneratedBy as IRI
      })
      return quads
    }).pipe(
      Effect.provide(TestLayer),
      Effect.runPromise
    )

    expect(Chunk.size(result)).toBe(1)
    const quad = Chunk.unsafeGet(result, 0)
    expect(quad.object).toBe(customActivityUri)
  })

  it("metadata queryable for audit purposes", async () => {
    const result = await Effect.gen(function*() {
      const rdf = yield* RdfBuilder
      const store = yield* rdf.createStore

      // Add metadata for two documents
      yield* rdf.addExtractionMetadata(store, testMetadata)
      yield* rdf.addExtractionMetadata(store, {
        ...testMetadata,
        graphUri: "urn:provenance:batch/batch-123456789012/doc/doc-999999999999",
        model: "claude-haiku-4-5"
      })

      // Query all documents generated by any activity
      const quads = yield* rdf.queryStore(store, {
        predicate: PROV.wasGeneratedBy as IRI
      })
      return quads
    }).pipe(
      Effect.provide(TestLayer),
      Effect.runPromise
    )

    // Should find both document provenance entries
    expect(Chunk.size(result)).toBe(2)
  })
})
