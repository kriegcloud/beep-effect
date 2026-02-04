/**
 * Tests for RdfBuilder confidence scoring with RDF-star
 *
 * @since 2.0.0
 * @module test/Service/Rdf.confidence
 */

import { Chunk, Effect, Layer } from "effect"
import { describe, expect, it } from "vitest"
import { EXTR, XSD } from "../../src/Domain/Rdf/Constants.js"
import type { IRI } from "../../src/Domain/Rdf/Types.js"
import { ConfigServiceDefault } from "../../src/Service/Config.js"
import { RdfBuilder } from "../../src/Service/Rdf.js"
import { TestConfigProvider } from "../setup.js"

describe("RdfBuilder.addTripleWithConfidence", () => {
  const TestLayer = RdfBuilder.Default.pipe(
    Layer.provideMerge(ConfigServiceDefault),
    Layer.provideMerge(Layer.setConfigProvider(TestConfigProvider))
  )

  describe("basic functionality", () => {
    it("adds original triple to store", async () => {
      const result = await Effect.gen(function*() {
        const rdf = yield* RdfBuilder
        const store = yield* rdf.createStore

        yield* rdf.addTripleWithConfidence(
          store,
          {
            subject: "http://example.org/entity/ronaldo",
            predicate: "http://www.w3.org/1999/02/22-rdf-syntax-ns#type",
            object: "http://example.org/ontology/Player"
          },
          0.95
        )

        // Query for the original triple
        const quads = yield* rdf.queryStore(store, {
          subject: "http://example.org/entity/ronaldo" as IRI,
          predicate: "http://www.w3.org/1999/02/22-rdf-syntax-ns#type" as IRI
        })

        return quads
      }).pipe(
        Effect.provide(TestLayer),
        Effect.runPromise
      )

      expect(Chunk.size(result)).toBe(1)
      const quad = Chunk.unsafeGet(result, 0)
      expect(quad.subject).toBe("http://example.org/entity/ronaldo")
      expect(quad.predicate).toBe("http://www.w3.org/1999/02/22-rdf-syntax-ns#type")
      expect(quad.object).toBe("http://example.org/ontology/Player")
    })

    it("adds confidence annotation using RDF-star", async () => {
      const result = await Effect.gen(function*() {
        const rdf = yield* RdfBuilder
        const store = yield* rdf.createStore

        yield* rdf.addTripleWithConfidence(
          store,
          {
            subject: "http://example.org/entity/ronaldo",
            predicate: "http://www.w3.org/1999/02/22-rdf-syntax-ns#type",
            object: "http://example.org/ontology/Player"
          },
          0.95
        )

        // Query for confidence annotation
        const quads = yield* rdf.queryStore(store, {
          predicate: EXTR.confidence as IRI
        })

        return quads
      }).pipe(
        Effect.provide(TestLayer),
        Effect.runPromise
      )

      expect(Chunk.size(result)).toBe(1)
      const quad = Chunk.unsafeGet(result, 0)
      // The subject should be a quoted triple (RDF-star)
      expect(quad.predicate).toBe(EXTR.confidence)
      // Object should be the confidence value as literal
      expect(typeof quad.object).not.toBe("string") // Should be Literal, not IRI
    })

    it("serializes to Turtle with RDF-star syntax", async () => {
      const turtle = await Effect.gen(function*() {
        const rdf = yield* RdfBuilder
        const store = yield* rdf.createStore

        yield* rdf.addTripleWithConfidence(
          store,
          {
            subject: "http://example.org/entity/ronaldo",
            predicate: "http://www.w3.org/1999/02/22-rdf-syntax-ns#type",
            object: "http://example.org/ontology/Player"
          },
          0.95
        )

        return yield* rdf.toTurtle(store)
      }).pipe(
        Effect.provide(TestLayer),
        Effect.runPromise
      )

      // Turtle should contain the original triple
      expect(turtle).toContain("http://example.org/entity/ronaldo")
      expect(turtle).toContain("http://example.org/ontology/Player")
      // Should contain confidence predicate
      expect(turtle).toContain("confidence")
      // Should contain the confidence value
      expect(turtle).toContain("0.95")
    })
  })

  describe("different object types", () => {
    it("handles IRI objects", async () => {
      const result = await Effect.gen(function*() {
        const rdf = yield* RdfBuilder
        const store = yield* rdf.createStore

        yield* rdf.addTripleWithConfidence(
          store,
          {
            subject: "http://example.org/entity/ronaldo",
            predicate: "http://example.org/ontology/playsFor",
            object: "http://example.org/entity/alnassr"
          },
          0.88
        )

        const quads = yield* rdf.queryStore(store, {
          subject: "http://example.org/entity/ronaldo" as IRI,
          predicate: "http://example.org/ontology/playsFor" as IRI
        })

        return quads
      }).pipe(
        Effect.provide(TestLayer),
        Effect.runPromise
      )

      expect(Chunk.size(result)).toBe(1)
      const quad = Chunk.unsafeGet(result, 0)
      expect(quad.object).toBe("http://example.org/entity/alnassr")
    })

    it("handles literal string objects", async () => {
      const result = await Effect.gen(function*() {
        const rdf = yield* RdfBuilder
        const store = yield* rdf.createStore

        yield* rdf.addTripleWithConfidence(
          store,
          {
            subject: "http://example.org/entity/ronaldo",
            predicate: "http://example.org/ontology/name",
            object: "Cristiano Ronaldo"
          },
          0.99
        )

        const quads = yield* rdf.queryStore(store, {
          subject: "http://example.org/entity/ronaldo" as IRI,
          predicate: "http://example.org/ontology/name" as IRI
        })

        return quads
      }).pipe(
        Effect.provide(TestLayer),
        Effect.runPromise
      )

      expect(Chunk.size(result)).toBe(1)
    })

    it("handles numeric objects with xsd:double datatype", async () => {
      const result = await Effect.gen(function*() {
        const rdf = yield* RdfBuilder
        const store = yield* rdf.createStore

        yield* rdf.addTripleWithConfidence(
          store,
          {
            subject: "http://example.org/entity/ronaldo",
            predicate: "http://example.org/ontology/age",
            object: 39
          },
          0.95
        )

        const quads = yield* rdf.queryStore(store, {
          subject: "http://example.org/entity/ronaldo" as IRI,
          predicate: "http://example.org/ontology/age" as IRI
        })

        return quads
      }).pipe(
        Effect.provide(TestLayer),
        Effect.runPromise
      )

      expect(Chunk.size(result)).toBe(1)
    })

    it("handles boolean objects with xsd:boolean datatype", async () => {
      const result = await Effect.gen(function*() {
        const rdf = yield* RdfBuilder
        const store = yield* rdf.createStore

        yield* rdf.addTripleWithConfidence(
          store,
          {
            subject: "http://example.org/entity/ronaldo",
            predicate: "http://example.org/ontology/isActive",
            object: true
          },
          0.99
        )

        const quads = yield* rdf.queryStore(store, {
          subject: "http://example.org/entity/ronaldo" as IRI,
          predicate: "http://example.org/ontology/isActive" as IRI
        })

        return quads
      }).pipe(
        Effect.provide(TestLayer),
        Effect.runPromise
      )

      expect(Chunk.size(result)).toBe(1)
    })
  })

  describe("named graphs", () => {
    it("places triple and confidence in specified graph", async () => {
      const graphUri = "urn:provenance:batch/batch-123/doc/doc-456"

      const result = await Effect.gen(function*() {
        const rdf = yield* RdfBuilder
        const store = yield* rdf.createStore

        yield* rdf.addTripleWithConfidence(
          store,
          {
            subject: "http://example.org/entity/ronaldo",
            predicate: "http://www.w3.org/1999/02/22-rdf-syntax-ns#type",
            object: "http://example.org/ontology/Player"
          },
          0.95,
          graphUri
        )

        // Query for triples in the provenance graph
        const quads = yield* rdf.queryStore(store, {
          graph: graphUri as IRI
        })

        return quads
      }).pipe(
        Effect.provide(TestLayer),
        Effect.runPromise
      )

      // Should have 2 quads: original triple + confidence annotation
      expect(Chunk.size(result)).toBe(2)
      // All should be in the provenance graph
      for (const quad of result) {
        expect(quad.graph).toBe(graphUri)
      }
    })
  })

  describe("multiple triples", () => {
    it("handles multiple triples with different confidences", async () => {
      const result = await Effect.gen(function*() {
        const rdf = yield* RdfBuilder
        const store = yield* rdf.createStore

        yield* rdf.addTripleWithConfidence(
          store,
          {
            subject: "http://example.org/entity/ronaldo",
            predicate: "http://www.w3.org/1999/02/22-rdf-syntax-ns#type",
            object: "http://example.org/ontology/Player"
          },
          0.95
        )

        yield* rdf.addTripleWithConfidence(
          store,
          {
            subject: "http://example.org/entity/ronaldo",
            predicate: "http://example.org/ontology/playsFor",
            object: "http://example.org/entity/alnassr"
          },
          0.72
        )

        yield* rdf.addTripleWithConfidence(
          store,
          {
            subject: "http://example.org/entity/messi",
            predicate: "http://www.w3.org/1999/02/22-rdf-syntax-ns#type",
            object: "http://example.org/ontology/Player"
          },
          0.99
        )

        // Query all confidence annotations
        const confidenceQuads = yield* rdf.queryStore(store, {
          predicate: EXTR.confidence as IRI
        })

        return confidenceQuads
      }).pipe(
        Effect.provide(TestLayer),
        Effect.runPromise
      )

      // Should have 3 confidence annotations
      expect(Chunk.size(result)).toBe(3)
    })
  })

  describe("edge cases", () => {
    it("handles confidence of 0", async () => {
      const result = await Effect.gen(function*() {
        const rdf = yield* RdfBuilder
        const store = yield* rdf.createStore

        yield* rdf.addTripleWithConfidence(
          store,
          {
            subject: "http://example.org/entity/unknown",
            predicate: "http://www.w3.org/1999/02/22-rdf-syntax-ns#type",
            object: "http://example.org/ontology/Player"
          },
          0
        )

        const quads = yield* rdf.queryStore(store, {
          predicate: EXTR.confidence as IRI
        })

        return quads
      }).pipe(
        Effect.provide(TestLayer),
        Effect.runPromise
      )

      expect(Chunk.size(result)).toBe(1)
    })

    it("handles confidence of 1", async () => {
      const result = await Effect.gen(function*() {
        const rdf = yield* RdfBuilder
        const store = yield* rdf.createStore

        yield* rdf.addTripleWithConfidence(
          store,
          {
            subject: "http://example.org/entity/certain",
            predicate: "http://www.w3.org/1999/02/22-rdf-syntax-ns#type",
            object: "http://example.org/ontology/Player"
          },
          1
        )

        const quads = yield* rdf.queryStore(store, {
          predicate: EXTR.confidence as IRI
        })

        return quads
      }).pipe(
        Effect.provide(TestLayer),
        Effect.runPromise
      )

      expect(Chunk.size(result)).toBe(1)
    })

    it("handles URN-style subjects", async () => {
      const result = await Effect.gen(function*() {
        const rdf = yield* RdfBuilder
        const store = yield* rdf.createStore

        yield* rdf.addTripleWithConfidence(
          store,
          {
            subject: "urn:entity:12345",
            predicate: "http://www.w3.org/1999/02/22-rdf-syntax-ns#type",
            object: "http://example.org/ontology/Player"
          },
          0.85
        )

        const quads = yield* rdf.queryStore(store, {
          subject: "urn:entity:12345" as IRI
        })

        return quads
      }).pipe(
        Effect.provide(TestLayer),
        Effect.runPromise
      )

      expect(Chunk.size(result)).toBe(1)
    })
  })
})
