/**
 * Tests for SHACL shape caching
 *
 * Verifies that generated SHACL shapes are cached by ontology content hash.
 *
 * @since 2.0.0
 * @module test/Service/Shacl.cache
 */

import { Effect, Layer } from "effect"
import * as N3 from "n3"
import { describe, expect, it } from "vitest"
import { ConfigServiceDefault } from "../../src/Service/Config.js"
import { RdfBuilder } from "../../src/Service/Rdf.js"
import { ShaclService } from "../../src/Service/Shacl.js"
import { StorageServiceTest } from "../../src/Service/Storage.js"
import { TestConfigProvider } from "../setup.js"

describe("ShaclService shapes caching", () => {
  const TestLayer = ShaclService.Default.pipe(
    Layer.provideMerge(StorageServiceTest),
    Layer.provideMerge(RdfBuilder.Default),
    Layer.provideMerge(ConfigServiceDefault),
    Layer.provideMerge(Layer.setConfigProvider(TestConfigProvider))
  )

  // Helper to create a simple ontology store
  const createOntologyStore = (className: string): N3.Store => {
    const store = new N3.Store()
    const { namedNode, quad } = N3.DataFactory

    const RDF_TYPE = namedNode("http://www.w3.org/1999/02/22-rdf-syntax-ns#type")
    const OWL_CLASS = namedNode("http://www.w3.org/2002/07/owl#Class")

    store.addQuad(quad(namedNode(`http://example.org/${className}`), RDF_TYPE, OWL_CLASS))

    return store
  }

  describe("cache hit behavior", () => {
    it("returns cached shapes on second call with same ontology", async () => {
      const result = await Effect.gen(function*() {
        const shacl = yield* ShaclService

        // Clear any existing cache
        yield* shacl.clearShapesCache()

        const ontologyStore = createOntologyStore("Person")

        // First call - should generate and cache
        const shapes1 = yield* shacl.generateShapesFromOntology(ontologyStore)
        const stats1 = yield* shacl.getShapesCacheStats()

        // Second call - should return cached
        const shapes2 = yield* shacl.generateShapesFromOntology(ontologyStore)
        const stats2 = yield* shacl.getShapesCacheStats()

        return { shapes1, shapes2, stats1, stats2 }
      }).pipe(Effect.provide(TestLayer), Effect.runPromise)

      // Both should have generated shapes
      expect(result.shapes1.size).toBeGreaterThan(0)
      expect(result.shapes2.size).toBeGreaterThan(0)

      // Cache size should be 1 (same ontology, same hash)
      expect(result.stats1.size).toBe(1)
      expect(result.stats2.size).toBe(1)

      // Both results should have same content (same number of triples)
      expect(result.shapes1.size).toBe(result.shapes2.size)
    })

    it("returns cloned store to prevent cache mutation", async () => {
      const result = await Effect.gen(function*() {
        const shacl = yield* ShaclService

        yield* shacl.clearShapesCache()

        const ontologyStore = createOntologyStore("Team")

        // Get cached shapes
        const shapes1 = yield* shacl.generateShapesFromOntology(ontologyStore)
        const originalSize = shapes1.size

        // Mutate the returned store
        const { namedNode, quad } = N3.DataFactory
        shapes1.addQuad(quad(
          namedNode("http://test.org/MutatedShape"),
          namedNode("http://www.w3.org/1999/02/22-rdf-syntax-ns#type"),
          namedNode("http://www.w3.org/ns/shacl#NodeShape")
        ))

        // Get from cache again
        const shapes2 = yield* shacl.generateShapesFromOntology(ontologyStore)

        return { mutatedSize: shapes1.size, cachedSize: shapes2.size, originalSize }
      }).pipe(Effect.provide(TestLayer), Effect.runPromise)

      // Mutated store should have more triples
      expect(result.mutatedSize).toBe(result.originalSize + 1)

      // Cached store should still have original size
      expect(result.cachedSize).toBe(result.originalSize)
    })
  })

  describe("cache miss behavior", () => {
    it("generates new shapes for different ontologies", async () => {
      const result = await Effect.gen(function*() {
        const shacl = yield* ShaclService

        yield* shacl.clearShapesCache()

        const ontologyStore1 = createOntologyStore("Player")
        const ontologyStore2 = createOntologyStore("Coach")

        yield* shacl.generateShapesFromOntology(ontologyStore1)
        const stats1 = yield* shacl.getShapesCacheStats()

        yield* shacl.generateShapesFromOntology(ontologyStore2)
        const stats2 = yield* shacl.getShapesCacheStats()

        return { stats1, stats2 }
      }).pipe(Effect.provide(TestLayer), Effect.runPromise)

      // Cache should grow with distinct ontologies
      expect(result.stats1.size).toBe(1)
      expect(result.stats2.size).toBe(2)
    })
  })

  describe("cache management", () => {
    it("clearShapesCache empties the cache", async () => {
      const result = await Effect.gen(function*() {
        const shacl = yield* ShaclService

        // Generate some shapes
        const ontologyStore = createOntologyStore("Match")
        yield* shacl.generateShapesFromOntology(ontologyStore)

        const statsBefore = yield* shacl.getShapesCacheStats()

        // Clear cache
        yield* shacl.clearShapesCache()

        const statsAfter = yield* shacl.getShapesCacheStats()

        return { statsBefore, statsAfter }
      }).pipe(Effect.provide(TestLayer), Effect.runPromise)

      expect(result.statsBefore.size).toBeGreaterThan(0)
      expect(result.statsAfter.size).toBe(0)
      expect(result.statsAfter.keys).toEqual([])
    })

    it("getShapesCacheStats returns cache keys", async () => {
      const result = await Effect.gen(function*() {
        const shacl = yield* ShaclService

        yield* shacl.clearShapesCache()

        const ontologyStore1 = createOntologyStore("Stadium")
        const ontologyStore2 = createOntologyStore("League")

        yield* shacl.generateShapesFromOntology(ontologyStore1)
        yield* shacl.generateShapesFromOntology(ontologyStore2)

        return yield* shacl.getShapesCacheStats()
      }).pipe(Effect.provide(TestLayer), Effect.runPromise)

      expect(result.size).toBe(2)
      expect(result.keys.length).toBe(2)
      // Keys should be hex hashes (16 chars from sha256Sync)
      result.keys.forEach((key) => {
        expect(key).toMatch(/^[a-f0-9]{16}$/)
      })
    })
  })
})
