/**
 * Schema: Timeline API Types
 *
 * Request/Response schemas for timeline-based knowledge graph queries.
 * Enables querying entity states and claims with temporal filtering.
 *
 * @since 2.0.0
 * @module Domain/Schema/Timeline
 */

import { Schema } from "effect"
import { ClaimRank } from "./KnowledgeModel.js"

// Re-export for convenience
export { ClaimRank }

// =============================================================================
// Shared Types
// =============================================================================

/**
 * Article summary for source attribution
 */
export class ArticleSummary extends Schema.Class<ArticleSummary>("ArticleSummary")({
  id: Schema.String,
  uri: Schema.String,
  headline: Schema.NullOr(Schema.String),
  sourceName: Schema.NullOr(Schema.String),
  /** Publisher timestamp (transaction time) */
  publishedAt: Schema.DateTimeUtc,
  /** System ingestion timestamp (transaction time) */
  ingestedAt: Schema.DateTimeUtc
}) {}

/**
 * Claim with rank and source information
 *
 * Includes both valid time (when fact was true) and transaction time
 * (when KB learned/recorded the fact) for bitemporal queries.
 */
export class ClaimWithRank extends Schema.Class<ClaimWithRank>("ClaimWithRank")({
  id: Schema.String,
  subjectIri: Schema.String,
  predicateIri: Schema.String,
  objectValue: Schema.String,
  objectType: Schema.optional(Schema.Literal("iri", "literal", "typed_literal")),
  rank: ClaimRank,
  source: ArticleSummary,

  // Valid time (when fact was true in the world)
  validFrom: Schema.NullOr(Schema.DateTimeUtc),
  validTo: Schema.NullOr(Schema.DateTimeUtc),

  // Transaction time (when KB learned/recorded the fact)
  /** When claim was asserted to KB (transaction time) */
  assertedAt: Schema.DateTimeUtc,
  /** When derived assertion was produced by inference (null for extracted claims) */
  derivedAt: Schema.NullOr(Schema.DateTimeUtc),
  /** When claim was deprecated (null if not deprecated) */
  deprecatedAt: Schema.NullOr(Schema.DateTimeUtc),

  confidence: Schema.NullOr(Schema.Number),
  evidenceText: Schema.NullOr(Schema.String),
  /** Character offset where evidence span starts in source document */
  evidenceStartOffset: Schema.NullOr(Schema.Number),
  /** Character offset where evidence span ends in source document */
  evidenceEndOffset: Schema.NullOr(Schema.Number)
}) {}

/**
 * Correction summary for tracking claim supersession
 */
export class CorrectionSummary extends Schema.Class<CorrectionSummary>("CorrectionSummary")({
  id: Schema.String,
  correctionType: Schema.String,
  reason: Schema.NullOr(Schema.String),
  correctionDate: Schema.DateTimeUtc,
  originalClaimId: Schema.String,
  newClaimId: Schema.NullOr(Schema.String)
}) {}

// =============================================================================
// Article Detail Response
// =============================================================================

/**
 * Response for article detail endpoint
 * GET /v1/articles/:id
 */
export class ArticleDetailResponse extends Schema.Class<ArticleDetailResponse>("ArticleDetailResponse")({
  article: ArticleSummary,
  /** All claims extracted from this article */
  claims: Schema.Array(ClaimWithRank),
  /** Number of unique entities in claims */
  entityCount: Schema.Number,
  /** Number of detected conflicts */
  conflictCount: Schema.Number
}) {}

// =============================================================================
// URL Param Helpers (for search params which are always strings)
// =============================================================================

const NumberFromString = Schema.NumberFromString
const BooleanFromString = Schema.transform(
  Schema.String,
  Schema.Boolean,
  {
    decode: (s) => s === "true" || s === "1",
    encode: (b) => b ? "true" : "false"
  }
)

// =============================================================================
// Timeline Entity Query
// =============================================================================

/**
 * Query parameters for timeline entity endpoint
 * GET /v1/timeline/entities/:iri
 *
 * Note: Uses string-based parsing for URL search params
 */
export class TimelineEntityQuery extends Schema.Class<TimelineEntityQuery>("TimelineEntityQuery")({
  /** Point-in-time view (returns state as it was believed at this time) */
  asOf: Schema.optional(Schema.String),
  /** Date range start */
  from: Schema.optional(Schema.String),
  /** Date range end */
  to: Schema.optional(Schema.String),
  /** Include deprecated claims in results */
  includeDeprecated: Schema.optional(BooleanFromString)
}) {}

/**
 * Response for timeline entity query
 */
export class TimelineEntityResponse extends Schema.Class<TimelineEntityResponse>("TimelineEntityResponse")({
  iri: Schema.String,
  /** The as-of timestamp used for the query (as ISO string) */
  asOf: Schema.NullOr(Schema.String),
  claims: Schema.Array(ClaimWithRank),
  corrections: Schema.Array(CorrectionSummary)
}) {}

// =============================================================================
// Timeline Claims Query
// =============================================================================

/**
 * Query parameters for timeline claims endpoint
 * GET /v1/timeline/claims
 *
 * Note: Uses string-based parsing for URL search params
 */
export class TimelineClaimsQuery extends Schema.Class<TimelineClaimsQuery>("TimelineClaimsQuery")({
  /** Filter by subject IRI */
  subject: Schema.optional(Schema.String),
  /** Filter by predicate IRI */
  predicate: Schema.optional(Schema.String),
  /** Point-in-time view */
  asOf: Schema.optional(Schema.String),
  /** Filter by source name */
  source: Schema.optional(Schema.String),
  /** Filter by claim rank */
  rank: Schema.optional(ClaimRank),
  /** Maximum results */
  limit: Schema.optional(NumberFromString),
  /** Pagination offset */
  offset: Schema.optional(NumberFromString)
}) {}

/**
 * Response for timeline claims query
 */
export class TimelineClaimsResponse extends Schema.Class<TimelineClaimsResponse>("TimelineClaimsResponse")({
  claims: Schema.Array(ClaimWithRank),
  total: Schema.Number,
  limit: Schema.Number,
  offset: Schema.Number,
  hasMore: Schema.Boolean
}) {}

// =============================================================================
// Correction History Query
// =============================================================================

/**
 * Query parameters for correction history endpoint
 * GET /v1/timeline/corrections/:articleId
 */
export class CorrectionHistoryQuery extends Schema.Class<CorrectionHistoryQuery>("CorrectionHistoryQuery")({
  /** Include original claims that were corrected */
  includeOriginalClaims: Schema.optional(Schema.Boolean)
}) {}

/**
 * Correction with affected claims
 */
export class CorrectionWithClaims extends Schema.Class<CorrectionWithClaims>("CorrectionWithClaims")({
  id: Schema.String,
  correctionType: Schema.String,
  reason: Schema.NullOr(Schema.String),
  correctionDate: Schema.DateTimeUtc,
  sourceArticle: Schema.NullOr(ArticleSummary),
  affectedClaims: Schema.Array(Schema.Struct({
    originalClaim: ClaimWithRank,
    newClaim: Schema.NullOr(ClaimWithRank)
  }))
}) {}

/**
 * Response for correction history query
 */
export class CorrectionHistoryResponse extends Schema.Class<CorrectionHistoryResponse>("CorrectionHistoryResponse")({
  articleId: Schema.String,
  corrections: Schema.Array(CorrectionWithClaims)
}) {}

// =============================================================================
// Conflict Detection Query
// =============================================================================

/**
 * Query parameters for conflicts endpoint
 * GET /v1/timeline/conflicts
 *
 * Note: Uses string-based parsing for URL search params
 */
export class ConflictsQuery extends Schema.Class<ConflictsQuery>("ConflictsQuery")({
  /** Filter by conflict status */
  status: Schema.optional(Schema.Literal("pending", "resolved", "ignored")),
  /** Filter by subject IRI */
  subject: Schema.optional(Schema.String),
  /** Maximum results */
  limit: Schema.optional(NumberFromString),
  /** Pagination offset */
  offset: Schema.optional(NumberFromString)
}) {}

/**
 * Conflict between two claims
 */
export class ClaimConflict extends Schema.Class<ClaimConflict>("ClaimConflict")({
  id: Schema.String,
  conflictType: Schema.Literal("position", "temporal", "contradictory", "duplicate"),
  status: Schema.Literal("pending", "resolved", "ignored"),
  claimA: ClaimWithRank,
  claimB: ClaimWithRank,
  resolutionStrategy: Schema.NullOr(Schema.String),
  acceptedClaimId: Schema.NullOr(Schema.String),
  resolvedAt: Schema.NullOr(Schema.DateTimeUtc),
  resolutionNotes: Schema.NullOr(Schema.String)
}) {}

/**
 * Response for conflicts query
 */
export class ConflictsResponse extends Schema.Class<ConflictsResponse>("ConflictsResponse")({
  conflicts: Schema.Array(ClaimConflict),
  total: Schema.Number,
  pendingCount: Schema.Number
}) {}
