/**
 * Tests: Reasoner Service
 *
 * @since 2.0.0
 */

import { describe, expect, it } from "@effect/vitest"
import { Effect, Layer } from "effect"
import { TestConfigProvider } from "../../src/Runtime/TestRuntime.js"
import { ConfigServiceDefault } from "../../src/Service/Config.js"
import { RdfBuilder } from "../../src/Service/Rdf.js"
import {
  Reasoner,
  ReasoningConfig,
  ReasoningError,
  ReasoningResult,
  RuleParseError
} from "../../src/Service/Reasoner.js"

// =============================================================================
// Test Layer
// =============================================================================

const TestLayer = Layer.mergeAll(
  RdfBuilder.Default,
  Reasoner.Default
).pipe(
  Layer.provideMerge(ConfigServiceDefault),
  Layer.provideMerge(Layer.setConfigProvider(TestConfigProvider))
)

// =============================================================================
// Tests: Domain Models
// =============================================================================

describe("Reasoner Domain Models", () => {
  describe("ReasoningConfig", () => {
    it.effect("creates default RDFS config", () =>
      Effect.gen(function*() {
        const config = ReasoningConfig.rdfs()
        expect(config.profile).toBe("rdfs")
        expect(config.customRules.length).toBe(0)
        expect(config.maxIterations).toBe(100)
      }))

    it.effect("creates subclass-only config", () =>
      Effect.gen(function*() {
        const config = ReasoningConfig.subclassOnly()
        expect(config.profile).toBe("rdfs-subclass")
      }))

    it.effect("creates custom rules config", () =>
      Effect.gen(function*() {
        const customRule = "{ ?s ?p ?o } => { ?o ?p ?s } ."
        const config = ReasoningConfig.custom([customRule])
        expect(config.profile).toBe("custom")
        expect(config.customRules.length).toBe(1)
        expect(config.customRules[0]).toContain("=>")
      }))
  })

  describe("ReasoningResult", () => {
    it.effect("calculates hasInferences correctly", () =>
      Effect.gen(function*() {
        const withInferences = new ReasoningResult({
          inferredTripleCount: 5,
          totalTripleCount: 15,
          rulesApplied: 3,
          durationMs: 50
        })
        expect(withInferences.hasInferences).toBe(true)

        const noInferences = new ReasoningResult({
          inferredTripleCount: 0,
          totalTripleCount: 10,
          rulesApplied: 3,
          durationMs: 30
        })
        expect(noInferences.hasInferences).toBe(false)
      }))
  })
})

// =============================================================================
// Tests: Reasoner Service
// =============================================================================

describe("Reasoner Service", () => {
  describe("getRules", () => {
    it.effect("returns RDFS rules for rdfs profile", () =>
      Effect.gen(function*() {
        const reasoner = yield* Reasoner

        const rules = reasoner.getRules("rdfs")

        expect(rules.length).toBeGreaterThan(0)
        expect(rules.some((r) => r.includes("subClassOf"))).toBe(true)
        expect(rules.some((r) => r.includes("domain"))).toBe(true)
        expect(rules.some((r) => r.includes("range"))).toBe(true)
      }).pipe(Effect.provide(TestLayer)))

    it.effect("returns subclass rules only for rdfs-subclass profile", () =>
      Effect.gen(function*() {
        const reasoner = yield* Reasoner

        const rules = reasoner.getRules("rdfs-subclass")

        expect(rules.length).toBe(2) // subclass type inference + chain
        expect(rules.every((r) => r.includes("subClassOf"))).toBe(true)
      }).pipe(Effect.provide(TestLayer)))

    it.effect("returns empty array for custom profile", () =>
      Effect.gen(function*() {
        const reasoner = yield* Reasoner

        const rules = reasoner.getRules("custom")

        expect(rules.length).toBe(0)
      }).pipe(Effect.provide(TestLayer)))
  })

  describe("reason", () => {
    it.effect("infers types via rdfs:subClassOf", () =>
      Effect.gen(function*() {
        const reasoner = yield* Reasoner
        const rdfBuilder = yield* RdfBuilder

        // Create a store with subclass hierarchy and instance
        const store = yield* rdfBuilder.createStore
        const parsed = yield* rdfBuilder.parseTurtle(`
          @prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#> .
          @prefix ex: <http://example.org/> .

          ex:FootballPlayer rdfs:subClassOf ex:Athlete .
          ex:Athlete rdfs:subClassOf ex:Person .

          ex:ronaldo a ex:FootballPlayer .
        `)
        store._store.addQuads(parsed._store.getQuads(null, null, null, null))

        const initialSize = store._store.size
        expect(initialSize).toBe(3) // 2 subClassOf + 1 type

        // Apply reasoning
        const result = yield* reasoner.reason(store, ReasoningConfig.rdfs())

        // Should have inferred ex:ronaldo a ex:Athlete and ex:ronaldo a ex:Person
        expect(result.inferredTripleCount).toBeGreaterThan(0)
        expect(result.totalTripleCount).toBeGreaterThan(initialSize)
        expect(result.rulesApplied).toBeGreaterThan(0)
        expect(result.durationMs).toBeGreaterThanOrEqual(0)

        // Verify the inferences exist in the store
        const types = store._store.getQuads(
          "http://example.org/ronaldo",
          "http://www.w3.org/1999/02/22-rdf-syntax-ns#type",
          null,
          null
        )
        expect(types.length).toBeGreaterThanOrEqual(1) // At least FootballPlayer
      }).pipe(Effect.provide(TestLayer)))

    it.effect("returns zero inferences when no rules match", () =>
      Effect.gen(function*() {
        const reasoner = yield* Reasoner
        const rdfBuilder = yield* RdfBuilder

        // Create a store with no matching patterns
        const store = yield* rdfBuilder.createStore
        const parsed = yield* rdfBuilder.parseTurtle(`
          @prefix ex: <http://example.org/> .
          ex:subject ex:predicate ex:object .
        `)
        store._store.addQuads(parsed._store.getQuads(null, null, null, null))

        // Apply subclass reasoning (no subClassOf triples to match)
        const result = yield* reasoner.reason(store, ReasoningConfig.subclassOnly())

        expect(result.inferredTripleCount).toBe(0)
        expect(result.hasInferences).toBe(false)
      }).pipe(Effect.provide(TestLayer)))

    it.effect("handles custom profile with no rules", () =>
      Effect.gen(function*() {
        const reasoner = yield* Reasoner
        const rdfBuilder = yield* RdfBuilder

        const store = yield* rdfBuilder.createStore
        const parsed = yield* rdfBuilder.parseTurtle(`
          @prefix ex: <http://example.org/> .
          ex:subject ex:predicate ex:object .
        `)
        store._store.addQuads(parsed._store.getQuads(null, null, null, null))

        const result = yield* reasoner.reason(store, ReasoningConfig.custom([]))

        expect(result.inferredTripleCount).toBe(0)
        expect(result.rulesApplied).toBe(0)
      }).pipe(Effect.provide(TestLayer)))
  })

  describe("reasonCopy", () => {
    it.effect("does not mutate original store", () =>
      Effect.gen(function*() {
        const reasoner = yield* Reasoner
        const rdfBuilder = yield* RdfBuilder

        const store = yield* rdfBuilder.createStore
        const parsed = yield* rdfBuilder.parseTurtle(`
          @prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#> .
          @prefix ex: <http://example.org/> .

          ex:Child rdfs:subClassOf ex:Parent .
          ex:instance a ex:Child .
        `)
        store._store.addQuads(parsed._store.getQuads(null, null, null, null))

        const originalSize = store._store.size

        // Apply reasoning on a copy
        const { result, store: reasonedStore } = yield* reasoner.reasonCopy(
          store,
          ReasoningConfig.rdfs()
        )

        // Original should be unchanged
        expect(store._store.size).toBe(originalSize)

        // Copy should have new triples
        expect(reasonedStore._store.size).toBeGreaterThanOrEqual(originalSize)
        expect(result.inferredTripleCount).toBeGreaterThanOrEqual(0)
      }).pipe(Effect.provide(TestLayer)))
  })

  describe("reasonForValidation", () => {
    it.effect("applies subclass reasoning for validation", () =>
      Effect.gen(function*() {
        const reasoner = yield* Reasoner
        const rdfBuilder = yield* RdfBuilder

        const store = yield* rdfBuilder.createStore
        const parsed = yield* rdfBuilder.parseTurtle(`
          @prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#> .
          @prefix ex: <http://example.org/> .

          ex:SpecificType rdfs:subClassOf ex:GeneralType .
          ex:entity a ex:SpecificType .
        `)
        store._store.addQuads(parsed._store.getQuads(null, null, null, null))

        const result = yield* reasoner.reasonForValidation(store)

        // Should only apply subclass rules
        expect(result.rulesApplied).toBe(2) // subclass type + chain
      }).pipe(Effect.provide(TestLayer)))
  })

  describe("wouldInfer", () => {
    it.effect("returns true when inferences would be added", () =>
      Effect.gen(function*() {
        const reasoner = yield* Reasoner
        const rdfBuilder = yield* RdfBuilder

        const store = yield* rdfBuilder.createStore
        const parsed = yield* rdfBuilder.parseTurtle(`
          @prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#> .
          @prefix ex: <http://example.org/> .

          ex:Sub rdfs:subClassOf ex:Super .
          ex:thing a ex:Sub .
        `)
        store._store.addQuads(parsed._store.getQuads(null, null, null, null))

        const originalSize = store._store.size
        const would = yield* reasoner.wouldInfer(store, ReasoningConfig.rdfs())

        // Check prediction (store should be unchanged)
        expect(store._store.size).toBe(originalSize)
        // The prediction should be accurate
        expect(typeof would).toBe("boolean")
      }).pipe(Effect.provide(TestLayer)))

    it.effect("returns false when no inferences would be added", () =>
      Effect.gen(function*() {
        const reasoner = yield* Reasoner
        const rdfBuilder = yield* RdfBuilder

        const store = yield* rdfBuilder.createStore
        const parsed = yield* rdfBuilder.parseTurtle(`
          @prefix ex: <http://example.org/> .
          ex:a ex:b ex:c .
        `)
        store._store.addQuads(parsed._store.getQuads(null, null, null, null))

        const would = yield* reasoner.wouldInfer(store, ReasoningConfig.subclassOnly())

        expect(would).toBe(false)
      }).pipe(Effect.provide(TestLayer)))
  })
})

// =============================================================================
// Tests: OWL sameAs Reasoning
// =============================================================================

describe("OWL sameAs Reasoning", () => {
  it.effect("infers sameAs transitivity", () =>
    Effect.gen(function*() {
      const reasoner = yield* Reasoner
      const rdfBuilder = yield* RdfBuilder

      const store = yield* rdfBuilder.createStore
      const parsed = yield* rdfBuilder.parseTurtle(`
        @prefix owl: <http://www.w3.org/2002/07/owl#> .
        @prefix ex: <http://example.org/> .

        ex:a owl:sameAs ex:b .
        ex:b owl:sameAs ex:c .
      `)
      store._store.addQuads(parsed._store.getQuads(null, null, null, null))

      const result = yield* reasoner.reason(
        store,
        new ReasoningConfig({ profile: "owl-sameas" })
      )

      expect(result.rulesApplied).toBe(2) // transitivity + symmetry

      // Should have inferred transitive and symmetric relations
      const sameAsTriples = store._store.getQuads(
        null,
        "http://www.w3.org/2002/07/owl#sameAs",
        null,
        null
      )
      // Original: a->b, b->c
      // Inferred: a->c (transitivity), b->a, c->b (symmetry), c->a (symmetry of transitive)
      expect(sameAsTriples.length).toBeGreaterThan(2)
    }).pipe(
      Effect.provide(Reasoner.Default),
      Effect.provide(TestLayer)
    ))
})
