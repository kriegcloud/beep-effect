/**
 * Tests for RdfBuilder Resource Management
 *
 * These tests verify that the RdfBuilder properly manages RDF store resources
 * using Effect's scoped resource pattern. This is critical for preventing
 * memory leaks when stores contain large numbers of quads.
 *
 * @module test/Service/Rdf.resource
 */

import { Effect, Layer } from "effect"
import { describe, expect, it } from "vitest"
import { TestConfigProvider } from "../../src/Runtime/TestRuntime.js"
import { ConfigServiceDefault } from "../../src/Service/Config.js"
import { RdfBuilder } from "../../src/Service/Rdf.js"

/**
 * Test layer with proper config provider
 */
const TestLayer = RdfBuilder.Default.pipe(
  Layer.provideMerge(ConfigServiceDefault),
  Layer.provideMerge(Layer.setConfigProvider(TestConfigProvider))
)

describe("RdfBuilder Resource Management", () => {
  it("makeStore finalizer should clear store data", () =>
    Effect.gen(function*() {
      let storeSize = -1
      let storeSizeAfterScope: number | undefined

      // Create a reference to the store so we can check it after scope closes
      let storeRef: any = null

      yield* Effect.scoped(
        Effect.gen(function*() {
          const rdf = yield* RdfBuilder
          const store = yield* rdf.makeStore

          // Keep a reference to check after scope
          storeRef = store

          // Add some data by parsing Turtle
          const parsedStore = yield* rdf.parseTurtle(`
            @prefix ex: <http://example.org/> .
            ex:subject1 ex:predicate1 ex:object1 .
            ex:subject2 ex:predicate2 ex:object2 .
            ex:subject3 ex:predicate3 ex:object3 .
          `)

          // Copy quads to our scoped store
          const quads = parsedStore._store.getQuads(null, null, null, null)
          store._store.addQuads(quads)

          storeSize = store._store.size
          expect(storeSize).toBe(3) // Should have 3 triples
        })
      ).pipe(Effect.provide(TestLayer))

      // After scope closes, the finalizer should have cleared the store
      if (storeRef) {
        storeSizeAfterScope = storeRef._store.size
        expect(storeSizeAfterScope).toBe(0) // Should be cleared
      }
    }).pipe(Effect.runPromise))

  it("should handle multiple store scopes independently", () =>
    Effect.gen(function*() {
      const rdf = yield* RdfBuilder

      // First scope
      const store1Ref: { size: number } = { size: -1 }
      yield* Effect.scoped(
        Effect.gen(function*() {
          const store1 = yield* rdf.makeStore
          const parsed1 = yield* rdf.parseTurtle(`
            @prefix ex: <http://example.org/> .
            ex:subject1 ex:predicate1 ex:object1 .
          `)
          store1._store.addQuads(parsed1._store.getQuads(null, null, null, null))
          store1Ref.size = store1._store.size
          expect(store1._store.size).toBe(1)
        })
      )

      // After first scope, store should be cleared
      // We can't directly test this without keeping a reference

      // Second scope with different data
      const store2Ref: { size: number } = { size: -1 }
      yield* Effect.scoped(
        Effect.gen(function*() {
          const store2 = yield* rdf.makeStore
          const parsed2 = yield* rdf.parseTurtle(`
            @prefix ex: <http://example.org/> .
            ex:subject2 ex:predicate2 ex:object2 .
            ex:subject3 ex:predicate3 ex:object3 .
          `)
          store2._store.addQuads(parsed2._store.getQuads(null, null, null, null))
          store2Ref.size = store2._store.size
          expect(store2._store.size).toBe(2)
        })
      )

      // Both stores should have been used independently
      expect(store1Ref.size).toBe(1)
      expect(store2Ref.size).toBe(2)
    }).pipe(
      Effect.provide(TestLayer),
      Effect.runPromise
    ))

  it("should cleanup store even when operations fail", () =>
    Effect.gen(function*() {
      let storeRef: any = null

      // Run operation that fails, but catch the error
      const result = yield* Effect.scoped(
        Effect.gen(function*() {
          const rdf = yield* RdfBuilder
          const store = yield* rdf.makeStore
          storeRef = store

          // Add some data
          const parsed = yield* rdf.parseTurtle(`
            @prefix ex: <http://example.org/> .
            ex:subject ex:predicate ex:object .
          `)
          store._store.addQuads(parsed._store.getQuads(null, null, null, null))

          expect(store._store.size).toBe(1)

          // Intentionally fail
          return yield* Effect.fail(new Error("Intentional failure"))
        })
      ).pipe(
        Effect.provide(TestLayer),
        Effect.either
      )

      // Operation should have failed
      expect(result._tag).toBe("Left")

      // But cleanup should still have been called, store should be empty
      if (storeRef) {
        expect(storeRef._store.size).toBe(0)
      }
    }).pipe(Effect.runPromise))

  it("createStore (non-scoped) should not be cleared automatically", () =>
    Effect.gen(function*() {
      const rdf = yield* RdfBuilder

      // Create non-scoped store
      const store = yield* rdf.createStore

      // Add data
      const parsed = yield* rdf.parseTurtle(`
        @prefix ex: <http://example.org/> .
        ex:subject ex:predicate ex:object .
      `)
      store._store.addQuads(parsed._store.getQuads(null, null, null, null))

      expect(store._store.size).toBe(1)

      // Store persists because it's not scoped
      expect(store._store.size).toBe(1)
    }).pipe(
      Effect.provide(TestLayer),
      Effect.runPromise
    ))
})
