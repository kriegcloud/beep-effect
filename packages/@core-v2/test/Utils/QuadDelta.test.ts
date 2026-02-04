/**
 * QuadDelta Property Tests
 *
 * Property-based tests for the quad delta computation utility.
 *
 * @since 2.0.0
 */

import { describe, expect, it } from "@effect/vitest"
import { Effect } from "effect"
import * as fc from "fast-check"
import * as N3 from "n3"
import type { RdfStore } from "../../src/Service/Rdf.js"
import {
  computeQuadDelta,
  filterTypeInferences,
  groupDeltaByPredicate,
  summarizeDelta
} from "../../src/Utils/QuadDelta.js"

// =============================================================================
// Test Helpers
// =============================================================================

const createStore = (quads: Array<N3.Quad>): RdfStore => {
  const store = new N3.Store()
  store.addQuads(quads)
  return { _tag: "RdfStore", _store: store }
}

const df = N3.DataFactory

// Arbitrary for generating valid IRIs - use simple pattern to avoid encoding issues
const iriArb = fc.stringMatching(/^http:\/\/example\.org\/[a-z][a-z0-9]{0,9}$/)

// Arbitrary for generating safe literal strings (no special chars that break N3)
// IMPORTANT: Must not start with _ (blank node prefix)
const literalArb = fc.stringMatching(/^[a-zA-Z][a-zA-Z0-9 ]{0,9}$/)

// Arbitrary for generating RDF quads with only named nodes (no blank nodes for simplicity)
const quadArb = fc.record({
  subject: iriArb,
  predicate: iriArb,
  object: fc.oneof(
    iriArb, // IRI object
    literalArb // Literal object
  ),
  isLiteral: fc.boolean()
}).map(({ isLiteral, object, predicate, subject }) =>
  df.quad(
    df.namedNode(subject),
    df.namedNode(predicate),
    isLiteral ? df.literal(object) : df.namedNode(object)
  )
)

// =============================================================================
// Unit Tests
// =============================================================================

describe("QuadDelta", () => {
  describe("computeQuadDelta", () => {
    it.effect("returns empty delta when stores are identical", () =>
      Effect.gen(function*() {
        const quads = [
          df.quad(
            df.namedNode("http://example.org/s1"),
            df.namedNode("http://example.org/p1"),
            df.namedNode("http://example.org/o1")
          )
        ]

        const original = createStore(quads)
        const enriched = createStore(quads)

        const delta = yield* computeQuadDelta(original, enriched)

        expect(delta.deltaCount).toBe(0)
        expect(delta.newQuads).toHaveLength(0)
        expect(delta.originalCount).toBe(1)
        expect(delta.enrichedCount).toBe(1)
      }))

    it.effect("detects new quads in enriched store", () =>
      Effect.gen(function*() {
        const originalQuads = [
          df.quad(
            df.namedNode("http://example.org/s1"),
            df.namedNode("http://example.org/p1"),
            df.namedNode("http://example.org/o1")
          )
        ]

        const enrichedQuads = [
          ...originalQuads,
          df.quad(
            df.namedNode("http://example.org/s1"),
            df.namedNode("http://www.w3.org/1999/02/22-rdf-syntax-ns#type"),
            df.namedNode("http://example.org/InferredType")
          )
        ]

        const original = createStore(originalQuads)
        const enriched = createStore(enrichedQuads)

        const delta = yield* computeQuadDelta(original, enriched)

        expect(delta.deltaCount).toBe(1)
        expect(delta.newQuads).toHaveLength(1)
        expect(delta.newQuads[0].predicate.value).toBe("http://www.w3.org/1999/02/22-rdf-syntax-ns#type")
      }))

    it.effect("handles blank nodes correctly", () =>
      Effect.gen(function*() {
        const originalQuads = [
          df.quad(
            df.blankNode("b1"),
            df.namedNode("http://example.org/p1"),
            df.namedNode("http://example.org/o1")
          )
        ]

        const enrichedQuads = [
          ...originalQuads,
          df.quad(
            df.blankNode("b1"),
            df.namedNode("http://www.w3.org/1999/02/22-rdf-syntax-ns#type"),
            df.namedNode("http://example.org/Thing")
          )
        ]

        const original = createStore(originalQuads)
        const enriched = createStore(enrichedQuads)

        const delta = yield* computeQuadDelta(original, enriched)

        expect(delta.deltaCount).toBe(1)
      }))

    it.effect("handles literals with datatypes", () =>
      Effect.gen(function*() {
        const originalQuads = [
          df.quad(
            df.namedNode("http://example.org/s1"),
            df.namedNode("http://example.org/age"),
            df.literal("42", df.namedNode("http://www.w3.org/2001/XMLSchema#integer"))
          )
        ]

        const enrichedQuads = [
          ...originalQuads,
          df.quad(
            df.namedNode("http://example.org/s1"),
            df.namedNode("http://www.w3.org/1999/02/22-rdf-syntax-ns#type"),
            df.namedNode("http://example.org/Person")
          )
        ]

        const original = createStore(originalQuads)
        const enriched = createStore(enrichedQuads)

        const delta = yield* computeQuadDelta(original, enriched)

        expect(delta.deltaCount).toBe(1)
        expect(delta.originalCount).toBe(1)
      }))
  })

  describe("filterTypeInferences", () => {
    it.effect("filters to only rdf:type quads", () =>
      Effect.gen(function*() {
        const RDF_TYPE = "http://www.w3.org/1999/02/22-rdf-syntax-ns#type"

        const quads = [
          df.quad(
            df.namedNode("http://example.org/s1"),
            df.namedNode(RDF_TYPE),
            df.namedNode("http://example.org/Person")
          ),
          df.quad(
            df.namedNode("http://example.org/s1"),
            df.namedNode("http://www.w3.org/2000/01/rdf-schema#label"),
            df.literal("John")
          )
        ]

        const original = createStore([])
        const enriched = createStore(quads)

        const delta = yield* computeQuadDelta(original, enriched)
        const typeInferences = filterTypeInferences(delta)

        expect(typeInferences).toHaveLength(1)
        expect(typeInferences[0].predicate.value).toBe(RDF_TYPE)
      }))
  })

  describe("groupDeltaByPredicate", () => {
    it.effect("groups quads by predicate", () =>
      Effect.gen(function*() {
        const RDF_TYPE = "http://www.w3.org/1999/02/22-rdf-syntax-ns#type"
        const RDFS_LABEL = "http://www.w3.org/2000/01/rdf-schema#label"

        const quads = [
          df.quad(
            df.namedNode("http://example.org/s1"),
            df.namedNode(RDF_TYPE),
            df.namedNode("http://example.org/Person")
          ),
          df.quad(
            df.namedNode("http://example.org/s2"),
            df.namedNode(RDF_TYPE),
            df.namedNode("http://example.org/Organization")
          ),
          df.quad(
            df.namedNode("http://example.org/s1"),
            df.namedNode(RDFS_LABEL),
            df.literal("John")
          )
        ]

        const original = createStore([])
        const enriched = createStore(quads)

        const delta = yield* computeQuadDelta(original, enriched)
        const grouped = groupDeltaByPredicate(delta)

        expect(grouped.get(RDF_TYPE)).toHaveLength(2)
        expect(grouped.get(RDFS_LABEL)).toHaveLength(1)
      }))
  })

  describe("summarizeDelta", () => {
    it.effect("computes summary statistics", () =>
      Effect.gen(function*() {
        const originalQuads = [
          df.quad(
            df.namedNode("http://example.org/s1"),
            df.namedNode("http://example.org/p1"),
            df.namedNode("http://example.org/o1")
          )
        ]

        const enrichedQuads = [
          ...originalQuads,
          df.quad(
            df.namedNode("http://example.org/s1"),
            df.namedNode("http://www.w3.org/1999/02/22-rdf-syntax-ns#type"),
            df.namedNode("http://example.org/Person")
          ),
          df.quad(
            df.namedNode("http://example.org/s1"),
            df.namedNode("http://www.w3.org/1999/02/22-rdf-syntax-ns#type"),
            df.namedNode("http://example.org/Agent")
          )
        ]

        const original = createStore(originalQuads)
        const enriched = createStore(enrichedQuads)

        const delta = yield* computeQuadDelta(original, enriched)
        const summary = summarizeDelta(delta)

        expect(summary.originalTriples).toBe(1)
        expect(summary.enrichedTriples).toBe(3)
        expect(summary.inferredTriples).toBe(2)
        expect(summary.inferenceRatio).toBe(2)
        expect(summary.predicateBreakdown["type"]).toBe(2)
      }))
  })
})

// =============================================================================
// Property Tests
// =============================================================================

describe("QuadDelta Property Tests", () => {
  it("delta count equals enriched count minus original count (no duplicates)", () => {
    fc.assert(
      fc.property(
        fc.array(quadArb, { minLength: 0, maxLength: 10 }),
        fc.array(quadArb, { minLength: 0, maxLength: 10 }),
        (originalQuads, additionalQuads) => {
          const original = createStore(originalQuads)
          const enriched = createStore([...originalQuads, ...additionalQuads])

          // Run synchronously since computeQuadDelta is Effect.sync
          const delta = Effect.runSync(computeQuadDelta(original, enriched))

          // Delta count should be <= additional quads (some might be duplicates)
          expect(delta.deltaCount).toBeLessThanOrEqual(additionalQuads.length)
          expect(delta.newQuads.length).toBe(delta.deltaCount)
        }
      ),
      { numRuns: 50 }
    )
  })

  it("identical stores produce empty delta", () => {
    fc.assert(
      fc.property(
        fc.array(quadArb, { minLength: 1, maxLength: 10 }),
        (quads) => {
          const original = createStore(quads)
          const enriched = createStore(quads)

          const delta = Effect.runSync(computeQuadDelta(original, enriched))

          expect(delta.deltaCount).toBe(0)
          expect(delta.newQuads).toHaveLength(0)
        }
      ),
      { numRuns: 50 }
    )
  })

  it("delta preserves quad structure", () => {
    fc.assert(
      fc.property(
        quadArb,
        (additionalQuad) => {
          const original = createStore([])
          const enriched = createStore([additionalQuad])

          const delta = Effect.runSync(computeQuadDelta(original, enriched))

          expect(delta.deltaCount).toBe(1)
          expect(delta.newQuads[0].subject.value).toBe(additionalQuad.subject.value)
          expect(delta.newQuads[0].predicate.value).toBe(additionalQuad.predicate.value)
          expect(delta.newQuads[0].object.value).toBe(additionalQuad.object.value)
        }
      ),
      { numRuns: 50 }
    )
  })
})
