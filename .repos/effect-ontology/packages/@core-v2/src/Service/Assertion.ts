/**
 * Service: Assertion
 *
 * High-level service for managing curated assertions derived from claims.
 * Assertions represent accepted facts in the knowledge base after curation.
 *
 * @since 2.0.0
 * @module Service/Assertion
 */

import { DateTime, Effect, HashMap, Layer, Option, Ref } from "effect"
import { CLAIMS, PROV, RDF, XSD } from "../Domain/Rdf/Constants.js"
import { type IRI, Literal, Quad } from "../Domain/Rdf/Types.js"
import { type AssertionId, type AssertionStatus } from "../Domain/Schema/KnowledgeModel.js"
import { ClaimRepository } from "../Repository/Claim.js"
import type { ClaimRow } from "../Repository/schema.js"
import { RdfBuilder } from "./Rdf.js"

// =============================================================================
// Types
// =============================================================================

/**
 * Input for creating an assertion from claims
 *
 * @since 2.0.0
 * @category Types
 */
export interface CreateAssertionInput {
  /** Claim IDs this assertion is derived from */
  readonly claimIds: ReadonlyArray<string>
  /** How the assertion was created */
  readonly decision: "accept" | "synthesize" | "manual"
  /** Who curated this assertion */
  readonly curatedBy?: string
  /** Override the triple values (for synthesize/manual) */
  readonly override?: {
    readonly subject?: string
    readonly predicate?: string
    readonly object?: string
    readonly objectType?: "iri" | "literal"
  }
  /** Confidence score (0-1), defaults to average of source claims */
  readonly confidence?: number
}

/**
 * Filter for querying assertions
 *
 * @since 2.0.0
 * @category Types
 */
export interface AssertionFilter {
  readonly subjectIri?: string
  readonly predicateIri?: string
  readonly status?: AssertionStatus
  readonly curatedBy?: string
  readonly limit?: number
  readonly offset?: number
}

/**
 * Assertion with full provenance information
 *
 * @since 2.0.0
 * @category Types
 */
export interface AssertionWithProvenance {
  readonly assertion: AssertionRow
  readonly sourceClaims: Array<ClaimRow>
}

/**
 * Internal assertion row type (matches what we store)
 *
 * @since 2.0.0
 * @category Types
 */
export interface AssertionRow {
  readonly id: string
  readonly subjectIri: string
  readonly predicateIri: string
  readonly objectValue: string
  readonly objectType: "iri" | "literal"
  readonly status: AssertionStatus
  readonly assertedAt: Date
  readonly derivedFrom: ReadonlyArray<string>
  readonly curatedBy: string | null
  readonly confidence: number
  readonly validFrom: Date | null
  readonly validTo: Date | null
  readonly rejectedAt: Date | null
  readonly rejectionReason: string | null
}

// =============================================================================
// Vocabulary Constants for Assertions
// =============================================================================

/**
 * Assertion vocabulary IRIs
 * Extends CLAIMS vocabulary with assertion-specific terms
 */
const ASSERTIONS = {
  namespace: "http://effect-ontology.dev/assertions#",
  Assertion: "http://effect-ontology.dev/assertions#Assertion" as IRI,
  assertedAt: "http://effect-ontology.dev/assertions#assertedAt" as IRI,
  curatedBy: "http://effect-ontology.dev/assertions#curatedBy" as IRI,
  derivedFromClaim: "http://effect-ontology.dev/assertions#derivedFromClaim" as IRI,
  decision: "http://effect-ontology.dev/assertions#decision" as IRI,
  Status: "http://effect-ontology.dev/assertions#Status" as IRI,
  Accepted: "http://effect-ontology.dev/assertions#Accepted" as IRI,
  Rejected: "http://effect-ontology.dev/assertions#Rejected" as IRI,
  Pending: "http://effect-ontology.dev/assertions#Pending" as IRI,
  rejectedAt: "http://effect-ontology.dev/assertions#rejectedAt" as IRI,
  rejectionReason: "http://effect-ontology.dev/assertions#rejectionReason" as IRI
} as const

// =============================================================================
// Service
// =============================================================================

/**
 * AssertionService - Curated fact management
 *
 * Provides assertion lifecycle operations for curating claims into accepted facts.
 * Assertions are the canonical facts in the knowledge base after human or automated curation.
 *
 * **Capabilities**:
 * - `createAssertion`: Create assertion from one or more claims
 * - `getAssertion`: Get assertion by ID with provenance
 * - `query`: Query assertions with filters
 * - `getSupportingClaims`: Get claims that support an assertion
 * - `reject`: Soft-delete an assertion with reason
 * - `toTriples`: Convert assertion to RDF quads
 *
 * @example
 * ```typescript
 * Effect.gen(function*() {
 *   // Accept a claim as fact
 *   const assertion = yield* AssertionService.createAssertion({
 *     claimIds: ["claim-abc123def456"],
 *     decision: "accept"
 *   })
 *
 *   // Convert to RDF
 *   const quads = yield* AssertionService.toTriples(assertion)
 * }).pipe(Effect.provide(AssertionService.Default))
 * ```
 *
 * @since 2.0.0
 * @category Services
 */
export class AssertionService extends Effect.Service<AssertionService>()("AssertionService", {
  effect: Effect.gen(function*() {
    const claimRepo = yield* ClaimRepository

    // In-memory store for assertions (can be replaced with DB repository later)
    const assertionsRef = yield* Ref.make(HashMap.empty<AssertionId, AssertionRow>())

    // -------------------------------------------------------------------------
    // Assertion Creation
    // -------------------------------------------------------------------------

    /**
     * Create an assertion from one or more claims
     *
     * For "accept" decision: Uses the first claim's triple values
     * For "synthesize"/"manual": Uses override values or first claim's values
     */
    const createAssertion = (input: CreateAssertionInput) =>
      Effect.gen(function*() {
        const now = yield* DateTime.now

        // Fetch source claims
        const sourceClaims: Array<ClaimRow> = []
        for (const claimId of input.claimIds) {
          const claim = yield* claimRepo.getClaim(claimId)
          if (Option.isSome(claim)) {
            sourceClaims.push(claim.value)
          }
        }

        if (sourceClaims.length === 0) {
          return yield* Effect.fail(new Error("No valid claims found for assertion"))
        }

        // Use first claim as base, or override values
        const baseClaim = sourceClaims[0]
        const subjectIri = input.override?.subject ?? baseClaim.subjectIri
        const predicateIri = input.override?.predicate ?? baseClaim.predicateIri
        const objectValue = input.override?.object ?? baseClaim.objectValue
        const objectType = input.override?.objectType ?? (baseClaim.objectType as "iri" | "literal") ?? "literal"

        // Calculate confidence (average of source claims or override)
        const avgConfidence = input.confidence ??
          sourceClaims.reduce((sum, c) => sum + (parseFloat(c.confidenceScore ?? "0.5")), 0) / sourceClaims.length

        // Generate assertion ID from timestamp + random to ensure uniqueness
        const uniqueSuffix = `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`
        const id = `assertion-${uniqueSuffix}` as AssertionId

        const assertionRow: AssertionRow = {
          id,
          subjectIri,
          predicateIri,
          objectValue,
          objectType,
          status: "accepted",
          assertedAt: DateTime.toDate(now),
          derivedFrom: input.claimIds,
          curatedBy: input.curatedBy ?? null,
          confidence: avgConfidence,
          validFrom: baseClaim.validFrom ?? null,
          validTo: baseClaim.validTo ?? null,
          rejectedAt: null,
          rejectionReason: null
        }

        // Store assertion
        yield* Ref.update(assertionsRef, HashMap.set(id, assertionRow))

        return assertionRow
      })

    /**
     * Get an assertion by ID with full provenance
     */
    const getAssertion = (id: string) =>
      Effect.gen(function*() {
        const assertions = yield* Ref.get(assertionsRef)
        const assertion = HashMap.get(assertions, id as AssertionId)

        if (Option.isNone(assertion)) {
          return Option.none<AssertionWithProvenance>()
        }

        // Fetch supporting claims
        const sourceClaims: Array<ClaimRow> = []
        for (const claimId of assertion.value.derivedFrom) {
          const claim = yield* claimRepo.getClaim(claimId)
          if (Option.isSome(claim)) {
            sourceClaims.push(claim.value)
          }
        }

        return Option.some({
          assertion: assertion.value,
          sourceClaims
        })
      })

    /**
     * Query assertions with filters
     */
    const query = (filter: AssertionFilter) =>
      Effect.gen(function*() {
        const assertions = yield* Ref.get(assertionsRef)
        let results = Array.from(HashMap.values(assertions))

        if (filter.subjectIri) {
          results = results.filter((a) => a.subjectIri === filter.subjectIri)
        }
        if (filter.predicateIri) {
          results = results.filter((a) => a.predicateIri === filter.predicateIri)
        }
        if (filter.status) {
          results = results.filter((a) => a.status === filter.status)
        }
        if (filter.curatedBy) {
          results = results.filter((a) => a.curatedBy === filter.curatedBy)
        }

        // Sort by assertedAt descending
        results.sort((a, b) => b.assertedAt.getTime() - a.assertedAt.getTime())

        // Apply pagination
        if (filter.offset) {
          results = results.slice(filter.offset)
        }
        if (filter.limit) {
          results = results.slice(0, filter.limit)
        }

        return results
      })

    /**
     * Get claims that support an assertion
     */
    const getSupportingClaims = (assertionId: string) =>
      Effect.gen(function*() {
        const assertions = yield* Ref.get(assertionsRef)
        const assertion = HashMap.get(assertions, assertionId as AssertionId)

        if (Option.isNone(assertion)) {
          return []
        }

        const claims: Array<ClaimRow> = []
        for (const claimId of assertion.value.derivedFrom) {
          const claim = yield* claimRepo.getClaim(claimId)
          if (Option.isSome(claim)) {
            claims.push(claim.value)
          }
        }

        return claims
      })

    /**
     * Reject an assertion with reason
     *
     * Soft-deletes the assertion by marking it as rejected.
     */
    const reject = (assertionId: string, reason: string) =>
      Effect.gen(function*() {
        const now = yield* DateTime.now
        const assertions = yield* Ref.get(assertionsRef)
        const assertion = HashMap.get(assertions, assertionId as AssertionId)

        if (Option.isNone(assertion)) {
          return yield* Effect.fail(new Error(`Assertion not found: ${assertionId}`))
        }

        const updated: AssertionRow = {
          ...assertion.value,
          status: "rejected",
          rejectedAt: DateTime.toDate(now),
          rejectionReason: reason
        }

        yield* Ref.update(assertionsRef, HashMap.set(assertionId as AssertionId, updated))
      })

    // -------------------------------------------------------------------------
    // RDF Serialization
    // -------------------------------------------------------------------------

    /**
     * Convert an assertion to RDF quads
     *
     * Generates quads for:
     * - The assertion itself as a reified statement
     * - Provenance links to source claims
     * - Status, confidence, and curation metadata
     */
    const toTriples = (assertion: AssertionRow, graphUri?: string) =>
      Effect.sync(() => {
        const quads: Array<Quad> = []
        const assertionIri = `${ASSERTIONS.namespace}${assertion.id}` as IRI
        const graph = graphUri as IRI | undefined

        // Type assertion
        quads.push(
          new Quad({
            subject: assertionIri,
            predicate: RDF.type,
            object: ASSERTIONS.Assertion,
            graph
          })
        )

        // RDF reification (the actual triple being asserted)
        quads.push(
          new Quad({
            subject: assertionIri,
            predicate: RDF.subject,
            object: assertion.subjectIri as IRI,
            graph
          })
        )

        quads.push(
          new Quad({
            subject: assertionIri,
            predicate: RDF.predicate,
            object: assertion.predicateIri as IRI,
            graph
          })
        )

        const objectTerm = assertion.objectType === "iri"
          ? assertion.objectValue as IRI
          : new Literal({ value: assertion.objectValue })

        quads.push(
          new Quad({
            subject: assertionIri,
            predicate: RDF.object,
            object: objectTerm,
            graph
          })
        )

        // Status
        const statusIri = assertion.status === "accepted"
          ? ASSERTIONS.Accepted
          : assertion.status === "rejected"
          ? ASSERTIONS.Rejected
          : ASSERTIONS.Pending

        quads.push(
          new Quad({
            subject: assertionIri,
            predicate: CLAIMS.claimStatus,
            object: statusIri,
            graph
          })
        )

        // Confidence
        quads.push(
          new Quad({
            subject: assertionIri,
            predicate: CLAIMS.confidence,
            object: new Literal({
              value: assertion.confidence.toString(),
              datatype: XSD.double
            }),
            graph
          })
        )

        // Asserted at
        quads.push(
          new Quad({
            subject: assertionIri,
            predicate: ASSERTIONS.assertedAt,
            object: new Literal({
              value: assertion.assertedAt.toISOString(),
              datatype: XSD.dateTime
            }),
            graph
          })
        )

        // Curated by
        if (assertion.curatedBy) {
          quads.push(
            new Quad({
              subject: assertionIri,
              predicate: ASSERTIONS.curatedBy,
              object: new Literal({ value: assertion.curatedBy }),
              graph
            })
          )
        }

        // Derived from claims (provenance)
        for (const claimId of assertion.derivedFrom) {
          quads.push(
            new Quad({
              subject: assertionIri,
              predicate: ASSERTIONS.derivedFromClaim,
              object: `${CLAIMS.namespace}${claimId}` as IRI,
              graph
            })
          )
        }

        // PROV-O provenance
        quads.push(
          new Quad({
            subject: assertionIri,
            predicate: PROV.generatedAtTime,
            object: new Literal({
              value: assertion.assertedAt.toISOString(),
              datatype: XSD.dateTime
            }),
            graph
          })
        )

        // Temporal validity
        if (assertion.validFrom) {
          quads.push(
            new Quad({
              subject: assertionIri,
              predicate: CLAIMS.validFrom,
              object: new Literal({
                value: assertion.validFrom.toISOString(),
                datatype: XSD.dateTime
              }),
              graph
            })
          )
        }

        if (assertion.validTo) {
          quads.push(
            new Quad({
              subject: assertionIri,
              predicate: CLAIMS.validUntil,
              object: new Literal({
                value: assertion.validTo.toISOString(),
                datatype: XSD.dateTime
              }),
              graph
            })
          )
        }

        // Rejection info
        if (assertion.rejectedAt) {
          quads.push(
            new Quad({
              subject: assertionIri,
              predicate: ASSERTIONS.rejectedAt,
              object: new Literal({
                value: assertion.rejectedAt.toISOString(),
                datatype: XSD.dateTime
              }),
              graph
            })
          )
        }

        if (assertion.rejectionReason) {
          quads.push(
            new Quad({
              subject: assertionIri,
              predicate: ASSERTIONS.rejectionReason,
              object: new Literal({ value: assertion.rejectionReason }),
              graph
            })
          )
        }

        return quads
      })

    /**
     * Get count of assertions matching filter
     */
    const count = (filter: AssertionFilter) =>
      Effect.gen(function*() {
        const results = yield* query({ ...filter, limit: undefined, offset: undefined })
        return results.length
      })

    return {
      createAssertion,
      getAssertion,
      query,
      getSupportingClaims,
      reject,
      toTriples,
      count
    }
  }),
  accessors: true
}) {}

/**
 * Default layer for production use.
 * Includes ClaimRepository and RdfBuilder dependencies.
 */
export const AssertionServiceLive = AssertionService.Default.pipe(
  Layer.provide(ClaimRepository.Default),
  Layer.provide(RdfBuilder.Default)
)
