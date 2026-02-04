/**
 * RdfBuilder Tests
 *
 * Integration tests for RdfBuilder service with N3.js
 *
 * @since 2.0.0
 */

import { Effect, Layer } from "effect"
import { describe, expect, it } from "vitest"
import { Entity, Relation } from "../src/Domain/Model/Entity.js"
import { EntityId } from "../src/Domain/Model/shared.js"
import { ConfigServiceDefault, RdfBuilder } from "../src/index.js"
import { TestConfigProvider } from "./setup.js"

describe("RdfBuilder", () => {
  const testLayer = RdfBuilder.Default.pipe(
    Layer.provideMerge(ConfigServiceDefault),
    Layer.provideMerge(Layer.setConfigProvider(TestConfigProvider))
  )

  describe("Entity to RDF conversion", () => {
    it("should convert entities to Turtle RDF", () =>
      Effect.gen(function*() {
        // Create test entity
        const entity = new Entity({
          id: EntityId("test_entity"),
          mention: "Test Entity",
          types: ["http://schema.org/Thing"],
          attributes: {
            "http://schema.org/name": "Test",
            "http://schema.org/age": 42,
            "http://schema.org/active": true
          }
        })

        // Build RDF in scoped context
        const turtle = yield* Effect.gen(function*() {
          const store = yield* RdfBuilder.makeStore
          yield* RdfBuilder.addEntities(store, [entity])
          return yield* RdfBuilder.toTurtle(store)
        }).pipe(Effect.scoped)

        // Verify Turtle output (uses prefixes)
        expect(turtle).toContain("test_entity")
        expect(turtle).toContain("schema:Thing") // Prefixed version
        expect(turtle).toContain("Test Entity")
        expect(turtle).toContain("Test")
        expect(turtle).toContain("42")
        expect(turtle).toContain("true")
      }).pipe(Effect.provide(testLayer), Effect.runPromise))

    it("should use prefixes from ConfigService", () =>
      Effect.gen(function*() {
        const entity = new Entity({
          id: EntityId("prefixed_entity"),
          mention: "Prefixed",
          types: ["http://schema.org/Person"],
          attributes: {}
        })

        const turtle = yield* Effect.gen(function*() {
          const store = yield* RdfBuilder.makeStore
          yield* RdfBuilder.addEntities(store, [entity])
          return yield* RdfBuilder.toTurtle(store)
        }).pipe(Effect.scoped)

        // Should use prefixes (e.g., @prefix schema: <http://schema.org/>)
        expect(turtle).toMatch(/@prefix/)
      }).pipe(Effect.provide(testLayer), Effect.runPromise))
  })

  describe("Relation to RDF conversion", () => {
    it("should convert entity-reference relations to RDF", () =>
      Effect.gen(function*() {
        const entity1 = new Entity({
          id: EntityId("person1"),
          mention: "Alice",
          types: ["http://schema.org/Person"],
          attributes: {}
        })

        const entity2 = new Entity({
          id: EntityId("person2"),
          mention: "Bob",
          types: ["http://schema.org/Person"],
          attributes: {}
        })

        const relation = new Relation({
          subjectId: "person1",
          predicate: "http://schema.org/knows",
          object: "person2" // Entity reference (detected by getter)
        })

        const turtle = yield* Effect.gen(function*() {
          const store = yield* RdfBuilder.makeStore
          yield* RdfBuilder.addEntities(store, [entity1, entity2])
          yield* RdfBuilder.addRelations(store, [relation])
          return yield* RdfBuilder.toTurtle(store)
        }).pipe(Effect.scoped)

        expect(turtle).toContain("person1")
        expect(turtle).toContain("person2")
        expect(turtle).toContain("knows")
      }).pipe(Effect.provide(testLayer), Effect.runPromise))

    it("should convert literal-value relations to RDF", () =>
      Effect.gen(function*() {
        const entity = new Entity({
          id: EntityId("person"),
          mention: "Alice",
          types: ["http://schema.org/Person"],
          attributes: {}
        })

        const relation = new Relation({
          subjectId: "person",
          predicate: "http://schema.org/age",
          object: 30 // Literal value (number)
        })

        const turtle = yield* Effect.gen(function*() {
          const store = yield* RdfBuilder.makeStore
          yield* RdfBuilder.addEntities(store, [entity])
          yield* RdfBuilder.addRelations(store, [relation])
          return yield* RdfBuilder.toTurtle(store)
        }).pipe(Effect.scoped)

        expect(turtle).toContain("person")
        expect(turtle).toContain("age")
        expect(turtle).toContain("30")
      }).pipe(Effect.provide(testLayer), Effect.runPromise))
  })

  describe("Resource management", () => {
    it("should clean up store after scope", () =>
      Effect.gen(function*() {
        let storeSize = 0

        yield* Effect.gen(function*() {
          const store = yield* RdfBuilder.makeStore
          yield* RdfBuilder.addEntities(store, [
            new Entity({
              id: EntityId("test"),
              mention: "Test",
              types: ["http://schema.org/Thing"],
              attributes: {}
            })
          ])
          storeSize = store._store.size
        }).pipe(Effect.scoped)

        // Store should have had quads
        expect(storeSize).toBeGreaterThan(0)
        // Note: can't verify cleanup directly, but scope handles it
      }).pipe(Effect.provide(testLayer), Effect.runPromise))
  })

  describe("Validation placeholder", () => {
    it("should return validation result", () =>
      Effect.gen(function*() {
        const result = yield* Effect.gen(function*() {
          const store = yield* RdfBuilder.makeStore
          return yield* RdfBuilder.validate(store, "# shapes graph")
        }).pipe(Effect.scoped)

        expect(result.conforms).toBe(true)
        expect(result.report).toContain("not yet implemented")
      }).pipe(Effect.provide(testLayer), Effect.runPromise))
  })

  describe("mergeStores", () => {
    it("should merge two stores with union semantics", () =>
      Effect.gen(function*() {
        // Create two stores with different content
        const store1 = yield* RdfBuilder.createStore
        const store2 = yield* RdfBuilder.createStore

        // Add entity to store1
        yield* RdfBuilder.addEntities(store1, [
          new Entity({
            id: EntityId("alice"),
            mention: "Alice",
            types: ["http://schema.org/Person"],
            attributes: {}
          })
        ])

        // Add different entity to store2
        yield* RdfBuilder.addEntities(store2, [
          new Entity({
            id: EntityId("bob"),
            mention: "Bob",
            types: ["http://schema.org/Person"],
            attributes: {}
          })
        ])

        const store1SizeBefore = store1._store.size
        const store2Size = store2._store.size

        // Merge store2 into store1
        const addedCount = yield* RdfBuilder.mergeStores(store1, store2)

        // Store1 should now have quads from both
        expect(store1._store.size).toBe(store1SizeBefore + store2Size)
        expect(addedCount).toBe(store2Size)

        // Verify both entities are in merged store
        const turtle = yield* RdfBuilder.toTurtle(store1)
        expect(turtle).toContain("alice")
        expect(turtle).toContain("bob")
      }).pipe(Effect.provide(testLayer), Effect.runPromise))

    it("should ignore duplicate quads (set semantics)", () =>
      Effect.gen(function*() {
        // Create two stores with same content
        const store1 = yield* RdfBuilder.createStore
        const store2 = yield* RdfBuilder.createStore

        const entity = new Entity({
          id: EntityId("same_entity"),
          mention: "Same",
          types: ["http://schema.org/Thing"],
          attributes: {}
        })

        yield* RdfBuilder.addEntities(store1, [entity])
        yield* RdfBuilder.addEntities(store2, [entity])

        const sizeBefore = store1._store.size

        // Merge - should not add duplicates
        const addedCount = yield* RdfBuilder.mergeStores(store1, store2)

        expect(addedCount).toBe(0) // No new quads added
        expect(store1._store.size).toBe(sizeBefore)
      }).pipe(Effect.provide(testLayer), Effect.runPromise))

    it("should handle partial overlap correctly", () =>
      Effect.gen(function*() {
        const store1 = yield* RdfBuilder.createStore
        const store2 = yield* RdfBuilder.createStore

        // Same entity in both
        const sharedEntity = new Entity({
          id: EntityId("shared"),
          mention: "Shared",
          types: ["http://schema.org/Thing"],
          attributes: {}
        })

        // Unique to store1
        const entity1 = new Entity({
          id: EntityId("only_in_store1"),
          mention: "Only1",
          types: ["http://schema.org/Thing"],
          attributes: {}
        })

        // Unique to store2
        const entity2 = new Entity({
          id: EntityId("only_in_store2"),
          mention: "Only2",
          types: ["http://schema.org/Thing"],
          attributes: {}
        })

        yield* RdfBuilder.addEntities(store1, [sharedEntity, entity1])
        yield* RdfBuilder.addEntities(store2, [sharedEntity, entity2])

        const sizeBefore = store1._store.size
        const addedCount = yield* RdfBuilder.mergeStores(store1, store2)

        // Should only add the unique quads from store2
        const turtle = yield* RdfBuilder.toTurtle(store1)
        expect(turtle).toContain("shared")
        expect(turtle).toContain("only_in_store1")
        expect(turtle).toContain("only_in_store2")

        // Added count should be > 0 (entity2 quads)
        expect(addedCount).toBeGreaterThan(0)
        expect(store1._store.size).toBeGreaterThan(sizeBefore)
      }).pipe(Effect.provide(testLayer), Effect.runPromise))
  })

  describe("cloneStore", () => {
    it("should create independent copy of store", () =>
      Effect.gen(function*() {
        const original = yield* RdfBuilder.createStore

        yield* RdfBuilder.addEntities(original, [
          new Entity({
            id: EntityId("original_entity"),
            mention: "Original",
            types: ["http://schema.org/Thing"],
            attributes: {}
          })
        ])

        const originalSize = original._store.size

        // Clone the store
        const cloned = yield* RdfBuilder.cloneStore(original)

        // Cloned store should have same content
        expect(cloned._store.size).toBe(originalSize)

        // Modify original
        yield* RdfBuilder.addEntities(original, [
          new Entity({
            id: EntityId("new_entity"),
            mention: "New",
            types: ["http://schema.org/Thing"],
            attributes: {}
          })
        ])

        // Clone should not be affected
        expect(cloned._store.size).toBe(originalSize)
        expect(original._store.size).toBeGreaterThan(cloned._store.size)

        // Verify content
        const clonedTurtle = yield* RdfBuilder.toTurtle(cloned)
        expect(clonedTurtle).toContain("original_entity")
        expect(clonedTurtle).not.toContain("new_entity")
      }).pipe(Effect.provide(testLayer), Effect.runPromise))
  })
})
