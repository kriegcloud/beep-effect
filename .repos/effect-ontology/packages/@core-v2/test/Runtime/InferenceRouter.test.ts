/**
 * Tests: Inference API Router
 *
 * @since 2.0.0
 */

import { describe, expect, it } from "@effect/vitest"
import { Effect, Layer } from "effect"
import { InferenceRunRequest } from "../../src/Domain/Schema/Inference.js"
import { ConfigServiceDefault } from "../../src/Service/Config.js"
import { RdfBuilder } from "../../src/Service/Rdf.js"
import { Reasoner } from "../../src/Service/Reasoner.js"
import { TestConfigProviderLayer } from "../setup.js"

// =============================================================================
// Test Fixtures
// =============================================================================

const sampleTurtle = `
@prefix ex: <http://example.org/> .
@prefix rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> .
@prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#> .

ex:Person rdfs:subClassOf ex:Agent .
ex:John rdf:type ex:Person .
`

// =============================================================================
// Tests
// =============================================================================

describe("InferenceRunRequest Schema", () => {
  it.effect("parses valid request with defaults", () =>
    Effect.gen(function*() {
      const input = {
        inputGraph: sampleTurtle
      }

      const request = yield* Effect.try(() => InferenceRunRequest.make(input))

      expect(request.inputGraph).toBe(sampleTurtle)
      expect(request.format).toBe("turtle")
      expect(request.profile).toBe("rdfs")
      expect(request.returnDeltaOnly).toBe(true)
    }))

  it.effect("parses request with custom profile", () =>
    Effect.gen(function*() {
      const input = {
        inputGraph: sampleTurtle,
        profile: "rdfs-subclass" as const,
        returnDeltaOnly: false
      }

      const request = yield* Effect.try(() => InferenceRunRequest.make(input))

      expect(request.profile).toBe("rdfs-subclass")
      expect(request.returnDeltaOnly).toBe(false)
    }))

  it.effect("parses request with custom rules", () =>
    Effect.gen(function*() {
      const input = {
        inputGraph: sampleTurtle,
        profile: "custom" as const,
        customRules: [
          `{ ?s ?p ?o } => { ?s <http://example.org/derived> true } .`
        ]
      }

      const request = yield* Effect.try(() => InferenceRunRequest.make(input))

      expect(request.profile).toBe("custom")
      expect(request.customRules).toHaveLength(1)
    }))
})

describe("Inference Integration", () => {
  // Compose layers with test config provider
  const TestLayer = Layer.mergeAll(
    Reasoner.Default,
    RdfBuilder.Default.pipe(Layer.provide(ConfigServiceDefault))
  ).pipe(Layer.provide(TestConfigProviderLayer))

  it.effect("runs RDFS inference and returns delta", () =>
    Effect.gen(function*() {
      const rdfBuilder = yield* RdfBuilder
      const reasoner = yield* Reasoner

      // Parse the sample turtle
      const store = yield* rdfBuilder.parseTurtle(sampleTurtle)
      const originalCount = store._store.size

      // Run reasoning
      const { result, store: enrichedStore } = yield* reasoner.reasonCopy(
        store,
        { profile: "rdfs", customRules: [], maxIterations: 100 }
      )

      // Should have inferred ex:John rdf:type ex:Agent
      expect(result.inferredTripleCount).toBeGreaterThan(0)
      expect(enrichedStore._store.size).toBeGreaterThan(originalCount)
    }).pipe(Effect.provide(TestLayer)))

  it.effect("handles empty graph", () =>
    Effect.gen(function*() {
      const rdfBuilder = yield* RdfBuilder
      const reasoner = yield* Reasoner

      const store = yield* rdfBuilder.parseTurtle("")
      const { result } = yield* reasoner.reasonCopy(
        store,
        { profile: "rdfs", customRules: [], maxIterations: 100 }
      )

      expect(result.inferredTripleCount).toBe(0)
    }).pipe(Effect.provide(TestLayer)))
})
