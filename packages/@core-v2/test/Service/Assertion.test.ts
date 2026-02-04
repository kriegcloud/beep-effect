/**
 * Tests for AssertionService
 *
 * @since 2.0.0
 * @module Test/Service/Assertion
 */

import { it } from "@effect/vitest"
import { Effect, HashMap, Layer, Option } from "effect"
import { describe, expect } from "vitest"
import { ClaimRepository } from "../../src/Repository/Claim.js"
import type { ClaimRow } from "../../src/Repository/schema.js"
import { type AssertionRow, AssertionService, type CreateAssertionInput } from "../../src/Service/Assertion.js"
import { RdfBuilder } from "../../src/Service/Rdf.js"
import { TestConfigProviderLayer } from "../setup.js"

// =============================================================================
// Mock Factories
// =============================================================================

const makeMockClaim = (overrides: Partial<ClaimRow> = {}): ClaimRow => ({
  id: "claim-test123",
  ontologyId: "test-ontology",
  articleId: "article-001",
  subjectIri: "http://example.org/entity/1",
  predicateIri: "http://schema.org/name",
  objectValue: "Test Entity",
  objectType: "literal",
  confidenceScore: "0.9",
  rank: "normal",
  evidenceText: "Test evidence",
  evidenceStartOffset: 0,
  evidenceEndOffset: 12,
  validFrom: null,
  validTo: null,
  deprecatedAt: null,
  deprecatedBy: null,
  objectDatatype: null,
  objectLanguage: null,
  assertedAt: new Date("2024-01-01"),
  ...overrides
})

const makeMockClaimRepository = (claims: Map<string, ClaimRow> = new Map()) =>
  Layer.succeed(ClaimRepository, {
    insertClaim: (row: any) => Effect.succeed(row),
    getClaim: (id: string) => Effect.succeed(Option.fromNullable(claims.get(id))),
    getClaims: () => Effect.succeed(Array.from(claims.values())),
    deprecateClaim: () => Effect.succeed(undefined),
    promoteToPreferred: () => Effect.succeed(undefined),
    findConflictingClaims: () => Effect.succeed([]),
    getClaimHistory: () => Effect.succeed([])
  } as any)

const makeMockRdfBuilder = () =>
  Layer.succeed(RdfBuilder, {
    createStore: Effect.succeed({ _store: { addQuad: () => {} } }),
    toTurtle: () => Effect.succeed(""),
    parseQuads: () => Effect.succeed([]),
    buildIri: (ns: string, local: string) => Effect.succeed(`${ns}${local}`)
  } as any)

/**
 * Build a test layer for AssertionService with mocked dependencies.
 * We provide mocks TO AssertionService.Default to override ClaimRepository.Default
 */
const makeTestLayer = (claims: Map<string, ClaimRow> = new Map()) =>
  AssertionService.Default.pipe(
    Layer.provide(makeMockClaimRepository(claims)),
    Layer.provide(makeMockRdfBuilder())
  )

// =============================================================================
// Test Suite
// =============================================================================

describe("AssertionService", () => {
  describe("createAssertion", () => {
    it.effect("creates assertion from a single claim with accept decision", () =>
      Effect.gen(function*() {
        const svc = yield* AssertionService

        const assertion = yield* svc.createAssertion({
          claimIds: ["claim-test123"],
          decision: "accept"
        })

        expect(assertion.subjectIri).toBe("http://example.org/entity/1")
        expect(assertion.predicateIri).toBe("http://schema.org/name")
        expect(assertion.objectValue).toBe("Test Entity")
        expect(assertion.objectType).toBe("literal")
        expect(assertion.status).toBe("accepted")
        expect(assertion.derivedFrom).toEqual(["claim-test123"])
      }).pipe(
        Effect.provide(makeTestLayer(new Map([["claim-test123", makeMockClaim()]]))),
        Effect.provide(TestConfigProviderLayer)
      ))

    it.effect("creates assertion with override values", () =>
      Effect.gen(function*() {
        const svc = yield* AssertionService

        const assertion = yield* svc.createAssertion({
          claimIds: ["claim-test123"],
          decision: "synthesize",
          override: {
            subject: "http://example.org/entity/synthesized",
            object: "Synthesized Value"
          }
        })

        expect(assertion.subjectIri).toBe("http://example.org/entity/synthesized")
        expect(assertion.objectValue).toBe("Synthesized Value")
      }).pipe(
        Effect.provide(makeTestLayer(new Map([["claim-test123", makeMockClaim()]]))),
        Effect.provide(TestConfigProviderLayer)
      ))

    it.effect("creates assertion with curator info", () =>
      Effect.gen(function*() {
        const svc = yield* AssertionService

        const assertion = yield* svc.createAssertion({
          claimIds: ["claim-test123"],
          decision: "manual",
          curatedBy: "expert@example.org"
        })

        expect(assertion.curatedBy).toBe("expert@example.org")
      }).pipe(
        Effect.provide(makeTestLayer(new Map([["claim-test123", makeMockClaim()]]))),
        Effect.provide(TestConfigProviderLayer)
      ))

    it.effect("fails when no valid claims found", () =>
      Effect.gen(function*() {
        const svc = yield* AssertionService

        const result = yield* svc.createAssertion({
          claimIds: ["nonexistent-claim"],
          decision: "accept"
        }).pipe(Effect.either)

        expect(result._tag).toBe("Left")
      }).pipe(
        Effect.provide(makeTestLayer()),
        Effect.provide(TestConfigProviderLayer)
      ))

    it.effect("calculates average confidence from multiple claims", () =>
      Effect.gen(function*() {
        const svc = yield* AssertionService

        const assertion = yield* svc.createAssertion({
          claimIds: ["claim-1", "claim-2"],
          decision: "accept"
        })

        // Average of 0.8 and 0.6 = 0.7
        expect(assertion.confidence).toBeCloseTo(0.7, 1)
      }).pipe(
        Effect.provide(makeTestLayer(
          new Map([
            ["claim-1", makeMockClaim({ id: "claim-1", confidenceScore: "0.8" })],
            ["claim-2", makeMockClaim({ id: "claim-2", confidenceScore: "0.6" })]
          ])
        )),
        Effect.provide(TestConfigProviderLayer)
      ))
  })

  describe("getAssertion", () => {
    it.effect("retrieves assertion with provenance after creation", () =>
      Effect.gen(function*() {
        const svc = yield* AssertionService

        // Create an assertion first
        const created = yield* svc.createAssertion({
          claimIds: ["claim-test123"],
          decision: "accept"
        })

        // Retrieve it
        const result = yield* svc.getAssertion(created.id)

        expect(Option.isSome(result)).toBe(true)
        if (Option.isSome(result)) {
          expect(result.value.assertion.id).toBe(created.id)
          expect(result.value.sourceClaims).toHaveLength(1)
        }
      }).pipe(
        Effect.provide(makeTestLayer(new Map([["claim-test123", makeMockClaim()]]))),
        Effect.provide(TestConfigProviderLayer)
      ))

    it.effect("returns None for non-existent assertion", () =>
      Effect.gen(function*() {
        const svc = yield* AssertionService

        const result = yield* svc.getAssertion("nonexistent-id")

        expect(Option.isNone(result)).toBe(true)
      }).pipe(
        Effect.provide(makeTestLayer()),
        Effect.provide(TestConfigProviderLayer)
      ))
  })

  describe("query", () => {
    it.effect("queries assertions by subject IRI", () =>
      Effect.gen(function*() {
        const svc = yield* AssertionService

        // Create assertions and verify they're created
        const assertion1 = yield* svc.createAssertion({ claimIds: ["claim-1"], decision: "accept" })
        const assertion2 = yield* svc.createAssertion({ claimIds: ["claim-2"], decision: "accept" })

        expect(assertion1.subjectIri).toBe("http://example.org/entity/1")
        expect(assertion2.subjectIri).toBe("http://example.org/entity/2")

        // Query all assertions first
        const allResults = yield* svc.query({})
        expect(allResults.length).toBe(2)

        // Then filter by subject
        const results = yield* svc.query({ subjectIri: "http://example.org/entity/1" })

        expect(results.length).toBe(1)
        expect(results[0].subjectIri).toBe("http://example.org/entity/1")
      }).pipe(
        Effect.provide(makeTestLayer(
          new Map([
            ["claim-1", makeMockClaim({ id: "claim-1" })],
            ["claim-2", makeMockClaim({ id: "claim-2", subjectIri: "http://example.org/entity/2" })]
          ])
        )),
        Effect.provide(TestConfigProviderLayer)
      ))

    it.effect("applies limit and offset", () =>
      Effect.gen(function*() {
        const svc = yield* AssertionService

        // Create multiple assertions
        const a1 = yield* svc.createAssertion({ claimIds: ["claim-1"], decision: "accept" })
        const a2 = yield* svc.createAssertion({ claimIds: ["claim-2"], decision: "accept" })
        const a3 = yield* svc.createAssertion({ claimIds: ["claim-3"], decision: "accept" })

        // Verify all 3 were created
        const all = yield* svc.query({})
        expect(all.length).toBe(3)

        // Now apply limit and offset
        const results = yield* svc.query({ limit: 2, offset: 1 })

        expect(results.length).toBe(2)
      }).pipe(
        Effect.provide(makeTestLayer(
          new Map([
            ["claim-1", makeMockClaim({ id: "claim-1" })],
            ["claim-2", makeMockClaim({ id: "claim-2" })],
            ["claim-3", makeMockClaim({ id: "claim-3" })]
          ])
        )),
        Effect.provide(TestConfigProviderLayer)
      ))
  })

  describe("reject", () => {
    it.effect("rejects assertion with reason", () =>
      Effect.gen(function*() {
        const svc = yield* AssertionService

        // Create an assertion first
        const created = yield* svc.createAssertion({
          claimIds: ["claim-test123"],
          decision: "accept"
        })

        // Reject it
        yield* svc.reject(created.id, "Factual error discovered")

        // Verify rejection
        const result = yield* svc.getAssertion(created.id)
        expect(Option.isSome(result)).toBe(true)
        if (Option.isSome(result)) {
          expect(result.value.assertion.status).toBe("rejected")
          expect(result.value.assertion.rejectionReason).toBe("Factual error discovered")
          expect(result.value.assertion.rejectedAt).not.toBeNull()
        }
      }).pipe(
        Effect.provide(makeTestLayer(new Map([["claim-test123", makeMockClaim()]]))),
        Effect.provide(TestConfigProviderLayer)
      ))

    it.effect("fails when rejecting non-existent assertion", () =>
      Effect.gen(function*() {
        const svc = yield* AssertionService

        const result = yield* svc.reject("nonexistent-id", "reason").pipe(Effect.either)

        expect(result._tag).toBe("Left")
      }).pipe(
        Effect.provide(makeTestLayer()),
        Effect.provide(TestConfigProviderLayer)
      ))
  })

  describe("toTriples", () => {
    it.effect("generates RDF quads for assertion", () =>
      Effect.gen(function*() {
        const svc = yield* AssertionService

        // Create an assertion
        const assertion = yield* svc.createAssertion({
          claimIds: ["claim-test123"],
          decision: "accept",
          curatedBy: "curator@example.org"
        })

        // Convert to quads
        const quads = yield* svc.toTriples(assertion)

        expect(quads.length).toBeGreaterThan(0)

        // Check for type assertion
        const typeQuad = quads.find((q) => q.predicate === "http://www.w3.org/1999/02/22-rdf-syntax-ns#type")
        expect(typeQuad).toBeDefined()
        expect(typeQuad?.object).toBe("http://effect-ontology.dev/assertions#Assertion")

        // Check for subject reification
        const subjectQuad = quads.find((q) => q.predicate === "http://www.w3.org/1999/02/22-rdf-syntax-ns#subject")
        expect(subjectQuad).toBeDefined()
        expect(subjectQuad?.object).toBe("http://example.org/entity/1")
      }).pipe(
        Effect.provide(makeTestLayer(new Map([["claim-test123", makeMockClaim()]]))),
        Effect.provide(TestConfigProviderLayer)
      ))

    it.effect("includes named graph when provided", () =>
      Effect.gen(function*() {
        const svc = yield* AssertionService

        const assertion = yield* svc.createAssertion({
          claimIds: ["claim-test123"],
          decision: "accept"
        })

        const quads = yield* svc.toTriples(assertion, "http://example.org/graph/assertions")

        const quadWithGraph = quads.find((q) => q.graph !== undefined)
        expect(quadWithGraph?.graph).toBe("http://example.org/graph/assertions")
      }).pipe(
        Effect.provide(makeTestLayer(new Map([["claim-test123", makeMockClaim()]]))),
        Effect.provide(TestConfigProviderLayer)
      ))
  })

  describe("count", () => {
    it.effect("counts assertions matching filter", () =>
      Effect.gen(function*() {
        const svc = yield* AssertionService

        // Create assertions with different subjects
        const a1 = yield* svc.createAssertion({ claimIds: ["claim-1"], decision: "accept" })
        const a2 = yield* svc.createAssertion({ claimIds: ["claim-2"], decision: "accept" })
        const a3 = yield* svc.createAssertion({ claimIds: ["claim-3"], decision: "accept" })

        // Verify subjects
        expect(a1.subjectIri).toBe("http://example.org/entity/1")
        expect(a2.subjectIri).toBe("http://example.org/entity/1")
        expect(a3.subjectIri).toBe("http://example.org/entity/2")

        const total = yield* svc.count({})
        expect(total).toBe(3)

        const filtered = yield* svc.count({ subjectIri: "http://example.org/entity/1" })
        expect(filtered).toBe(2)
      }).pipe(
        Effect.provide(makeTestLayer(
          new Map([
            ["claim-1", makeMockClaim({ id: "claim-1" })],
            ["claim-2", makeMockClaim({ id: "claim-2" })],
            ["claim-3", makeMockClaim({ id: "claim-3", subjectIri: "http://example.org/entity/2" })]
          ])
        )),
        Effect.provide(TestConfigProviderLayer)
      ))
  })
})
