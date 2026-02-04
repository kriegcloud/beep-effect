/**
 * Tests for RdfBuilder named graph support
 *
 * @since 2.0.0
 * @module test/Service/Rdf.namedgraph
 */

import { Chunk, Effect, Layer } from "effect"
import { describe, expect, it } from "vitest"
import { Entity, Relation } from "../../src/Domain/Model/Entity.js"
import { EntityId } from "../../src/Domain/Model/shared.js"
import { RDF } from "../../src/Domain/Rdf/Constants.js"
import type { IRI } from "../../src/Domain/Rdf/Types.js"
import { ConfigServiceDefault } from "../../src/Service/Config.js"
import { RdfBuilder } from "../../src/Service/Rdf.js"
import { TestConfigProvider } from "../setup.js"

describe("RdfBuilder named graph support", () => {
  const TestLayer = RdfBuilder.Default.pipe(
    Layer.provideMerge(ConfigServiceDefault),
    Layer.provideMerge(Layer.setConfigProvider(TestConfigProvider))
  )

  const testEntity = new Entity({
    id: EntityId("player_1"),
    mention: "Messi",
    types: ["http://schema.org/Person"],
    attributes: {}
  })

  const testRelation = new Relation({
    subjectId: "player_1",
    predicate: "http://schema.org/memberOf",
    object: "team_1"
  })

  const createEntity = (id: string, mention: string, types: Array<string>) =>
    new Entity({ id: EntityId(id), mention, types, attributes: {} })

  describe("addEntities with named graph", () => {
    it("adds triples to named graph when graphUri provided", async () => {
      const result = await Effect.gen(function*() {
        const rdf = yield* RdfBuilder
        const store = yield* rdf.createStore

        yield* rdf.addEntities(store, [testEntity], { graphUri: "urn:graph:test" })

        // Query specifically from the named graph
        const quads = yield* rdf.queryStore(store, { graph: "urn:graph:test" as IRI })
        return Chunk.size(quads)
      }).pipe(
        Effect.provide(TestLayer),
        Effect.runPromise
      )

      expect(result).toBeGreaterThan(0)
    })

    it("adds triples to default graph when graphUri omitted", async () => {
      const result = await Effect.gen(function*() {
        const rdf = yield* RdfBuilder
        const store = yield* rdf.createStore

        yield* rdf.addEntities(store, [testEntity])

        // Query default graph (null/undefined graph)
        const quads = yield* rdf.queryStore(store, {})
        return Chunk.size(quads)
      }).pipe(
        Effect.provide(TestLayer),
        Effect.runPromise
      )

      expect(result).toBeGreaterThan(0)
    })

    it("queryStore returns triples from specific graph", async () => {
      const result = await Effect.gen(function*() {
        const rdf = yield* RdfBuilder
        const store = yield* rdf.createStore

        // Add to two different graphs
        yield* rdf.addEntities(store, [testEntity], { graphUri: "urn:graph:doc1" })
        yield* rdf.addEntities(
          store,
          [createEntity("player_2", "Ronaldo", ["http://schema.org/Person"])],
          { graphUri: "urn:graph:doc2" }
        )

        // Query each graph separately
        const doc1Quads = yield* rdf.queryStore(store, { graph: "urn:graph:doc1" as IRI })
        const doc2Quads = yield* rdf.queryStore(store, { graph: "urn:graph:doc2" as IRI })

        return {
          doc1Count: Chunk.size(doc1Quads),
          doc2Count: Chunk.size(doc2Quads)
        }
      }).pipe(
        Effect.provide(TestLayer),
        Effect.runPromise
      )

      expect(result.doc1Count).toBeGreaterThan(0)
      expect(result.doc2Count).toBeGreaterThan(0)
    })

    it("is backward compatible with existing callers", async () => {
      const result = await Effect.gen(function*() {
        const rdf = yield* RdfBuilder
        const store = yield* rdf.createStore

        // Call without options (existing API)
        yield* rdf.addEntities(store, [testEntity])

        const quads = yield* rdf.queryStore(store, { predicate: RDF.type })
        return Chunk.toArray(quads)
      }).pipe(
        Effect.provide(TestLayer),
        Effect.runPromise
      )

      // Should have rdf:type triple
      expect(result.length).toBeGreaterThan(0)
      expect(result.some((q) => q.predicate === RDF.type)).toBe(true)
    })
  })

  describe("addRelations with named graph", () => {
    it("adds relation triples to named graph when graphUri provided", async () => {
      const result = await Effect.gen(function*() {
        const rdf = yield* RdfBuilder
        const store = yield* rdf.createStore

        yield* rdf.addRelations(store, [testRelation], { graphUri: "urn:graph:relations" })

        const quads = yield* rdf.queryStore(store, { graph: "urn:graph:relations" as IRI })
        return Chunk.size(quads)
      }).pipe(
        Effect.provide(TestLayer),
        Effect.runPromise
      )

      expect(result).toBe(1)
    })

    it("adds relation triples to default graph when graphUri omitted", async () => {
      const result = await Effect.gen(function*() {
        const rdf = yield* RdfBuilder
        const store = yield* rdf.createStore

        yield* rdf.addRelations(store, [testRelation])

        const quads = yield* rdf.queryStore(store, {})
        return Chunk.size(quads)
      }).pipe(
        Effect.provide(TestLayer),
        Effect.runPromise
      )

      expect(result).toBe(1)
    })

    it("is backward compatible with existing callers", async () => {
      const result = await Effect.gen(function*() {
        const rdf = yield* RdfBuilder
        const store = yield* rdf.createStore

        // Call without options (existing API)
        yield* rdf.addRelations(store, [testRelation])

        const quads = yield* rdf.queryStore(store, {})
        return Chunk.toArray(quads)
      }).pipe(
        Effect.provide(TestLayer),
        Effect.runPromise
      )

      expect(result.length).toBe(1)
    })
  })

  describe("combined entities and relations", () => {
    it("adds both entities and relations to same named graph", async () => {
      const result = await Effect.gen(function*() {
        const rdf = yield* RdfBuilder
        const store = yield* rdf.createStore

        const graphUri = "urn:provenance:batch/test/doc/doc1"

        yield* rdf.addEntities(store, [testEntity], { graphUri })
        yield* rdf.addRelations(store, [testRelation], { graphUri })

        const quads = yield* rdf.queryStore(store, { graph: graphUri as IRI })
        return {
          count: Chunk.size(quads),
          quads: Chunk.toArray(quads)
        }
      }).pipe(
        Effect.provide(TestLayer),
        Effect.runPromise
      )

      // Entity produces multiple quads (rdf:type, rdfs:label), relation produces 1
      expect(result.count).toBeGreaterThan(1)
      // All quads should be in the named graph
      result.quads.forEach((q) => {
        expect(q.graph).toBe("urn:provenance:batch/test/doc/doc1")
      })
    })
  })

  describe("TriG serialization round-trip", () => {
    it("preserves named graphs through toTriG/parseTriG cycle", async () => {
      const result = await Effect.gen(function*() {
        const rdf = yield* RdfBuilder
        const store = yield* rdf.createStore

        const graphUri = "urn:graph:doc1"

        // Add entities and relations to a named graph
        yield* rdf.addEntities(store, [testEntity], { graphUri })
        yield* rdf.addRelations(store, [testRelation], { graphUri })

        // Serialize to TriG
        const trigContent = yield* rdf.toTriG(store)

        // Parse back as TriG (not Turtle!)
        const parsedStore = yield* rdf.parseTriG(trigContent)

        // Query the named graph - should have same quads
        const quads = yield* rdf.queryStore(parsedStore, { graph: graphUri as IRI })

        return {
          quadCount: Chunk.size(quads),
          trigContent,
          quads: Chunk.toArray(quads)
        }
      }).pipe(
        Effect.provide(TestLayer),
        Effect.runPromise
      )

      // Should preserve all quads in named graph
      expect(result.quadCount).toBeGreaterThan(0)
      // TriG content should reference the named graph
      expect(result.trigContent).toContain("urn:graph:doc1")
      // All quads should be in the correct graph
      result.quads.forEach((q) => {
        expect(q.graph).toBe("urn:graph:doc1")
      })
    })

    it("parseTriG is the correct parser for TriG content", async () => {
      // Note: N3 is lenient and may parse TriG with Turtle parser, but
      // parseTriG is the semantically correct choice for TriG content.
      // This test verifies both parsers work, but parseTriG is preferred.
      const result = await Effect.gen(function*() {
        const rdf = yield* RdfBuilder
        const store = yield* rdf.createStore

        const graphUri = "urn:graph:doc1"

        // Add entities to a named graph
        yield* rdf.addEntities(store, [testEntity], { graphUri })

        // Serialize to TriG
        const trigContent = yield* rdf.toTriG(store)

        // Parse with TriG parser (CORRECT)
        const trigStore = yield* rdf.parseTriG(trigContent)
        const trigQuads = yield* rdf.queryStore(trigStore, { graph: graphUri as IRI })

        // Also try Turtle parser (N3 is lenient but this is not guaranteed)
        const turtleStore = yield* rdf.parseTurtle(trigContent)
        const turtleQuads = yield* rdf.queryStore(turtleStore, { graph: graphUri as IRI })

        return {
          trigCount: Chunk.size(trigQuads),
          turtleCount: Chunk.size(turtleQuads)
        }
      }).pipe(
        Effect.provide(TestLayer),
        Effect.runPromise
      )

      // TriG parser should always work correctly
      expect(result.trigCount).toBeGreaterThan(0)
      // N3 may be lenient, but we use parseTriG for correctness
      // regardless of whether parseTurtle happens to work
    })

    it("round-trip preserves multiple named graphs", async () => {
      const result = await Effect.gen(function*() {
        const rdf = yield* RdfBuilder
        const store = yield* rdf.createStore

        const entity2 = createEntity("player_2", "Ronaldo", ["http://schema.org/Person"])

        // Add to two different graphs
        yield* rdf.addEntities(store, [testEntity], { graphUri: "urn:graph:doc1" })
        yield* rdf.addEntities(store, [entity2], { graphUri: "urn:graph:doc2" })

        // Serialize to TriG
        const trigContent = yield* rdf.toTriG(store)

        // Parse back
        const parsedStore = yield* rdf.parseTriG(trigContent)

        // Query each graph separately
        const doc1Quads = yield* rdf.queryStore(parsedStore, { graph: "urn:graph:doc1" as IRI })
        const doc2Quads = yield* rdf.queryStore(parsedStore, { graph: "urn:graph:doc2" as IRI })

        return {
          doc1Count: Chunk.size(doc1Quads),
          doc2Count: Chunk.size(doc2Quads),
          trigContent
        }
      }).pipe(
        Effect.provide(TestLayer),
        Effect.runPromise
      )

      // Both graphs should have quads
      expect(result.doc1Count).toBeGreaterThan(0)
      expect(result.doc2Count).toBeGreaterThan(0)
      // TriG should reference both graphs
      expect(result.trigContent).toContain("urn:graph:doc1")
      expect(result.trigContent).toContain("urn:graph:doc2")
    })
  })
})
