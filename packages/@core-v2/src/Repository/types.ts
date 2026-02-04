/**
 * Repository Domain Types
 *
 * TypeScript types matching the PostgreSQL schema for claims, articles, and corrections.
 * These types are used by repository services for typed database access.
 *
 * @since 2.0.0
 * @module Repository/types
 */

import { Schema } from "effect"

// =============================================================================
// Branded IDs
// =============================================================================

export const ArticleId = Schema.String.pipe(
  Schema.brand("ArticleId"),
  Schema.annotations({ title: "ArticleId", description: "UUID for article" })
)
export type ArticleId = typeof ArticleId.Type

export const ClaimId = Schema.String.pipe(
  Schema.brand("ClaimId"),
  Schema.annotations({ title: "ClaimId", description: "UUID for claim" })
)
export type ClaimId = typeof ClaimId.Type

export const CorrectionId = Schema.String.pipe(
  Schema.brand("CorrectionId"),
  Schema.annotations({ title: "CorrectionId", description: "UUID for correction" })
)
export type CorrectionId = typeof CorrectionId.Type

export const ConflictId = Schema.String.pipe(
  Schema.brand("ConflictId"),
  Schema.annotations({ title: "ConflictId", description: "UUID for conflict" })
)
export type ConflictId = typeof ConflictId.Type

export const BatchRunId = Schema.String.pipe(
  Schema.brand("BatchRunId"),
  Schema.annotations({ title: "BatchRunId", description: "UUID for batch run" })
)
export type BatchRunId = typeof BatchRunId.Type

// =============================================================================
// Enums
// =============================================================================

export const ClaimRank = Schema.Literal("preferred", "normal", "deprecated")
export type ClaimRank = typeof ClaimRank.Type

export const ObjectType = Schema.Literal("iri", "literal", "typed_literal")
export type ObjectType = typeof ObjectType.Type

export const CorrectionType = Schema.Literal("retraction", "clarification", "update", "amendment")
export type CorrectionType = typeof CorrectionType.Type

export const ConflictType = Schema.Literal("position", "temporal", "contradictory", "duplicate")
export type ConflictType = typeof ConflictType.Type

export const ConflictStatus = Schema.Literal("pending", "resolved", "ignored")
export type ConflictStatus = typeof ConflictStatus.Type

export const ResolutionStrategy = Schema.Literal("temporal_precedence", "source_authority", "manual")
export type ResolutionStrategy = typeof ResolutionStrategy.Type

export const BatchRunStatus = Schema.Literal("pending", "running", "completed", "failed")
export type BatchRunStatus = typeof BatchRunStatus.Type

// =============================================================================
// Article
// =============================================================================

export const Article = Schema.Struct({
  id: ArticleId,
  uri: Schema.String,
  sourceName: Schema.NullOr(Schema.String),
  headline: Schema.NullOr(Schema.String),
  publishedAt: Schema.DateTimeUtc,
  ingestedAt: Schema.DateTimeUtc,
  graphUri: Schema.NullOr(Schema.String),
  contentHash: Schema.NullOr(Schema.String),
  createdAt: Schema.DateTimeUtc,
  updatedAt: Schema.DateTimeUtc
})
export type Article = typeof Article.Type

export const ArticleInsert = Schema.Struct({
  id: Schema.optional(ArticleId),
  uri: Schema.String,
  sourceName: Schema.optional(Schema.String),
  headline: Schema.optional(Schema.String),
  publishedAt: Schema.DateTimeUtc,
  graphUri: Schema.optional(Schema.String),
  contentHash: Schema.optional(Schema.String)
})
export type ArticleInsert = typeof ArticleInsert.Type

// =============================================================================
// Claim
// =============================================================================

export const Claim = Schema.Struct({
  id: ClaimId,
  articleId: ArticleId,
  subjectIri: Schema.String,
  predicateIri: Schema.String,
  objectValue: Schema.String,
  objectType: ObjectType,
  objectDatatype: Schema.NullOr(Schema.String),
  objectLanguage: Schema.NullOr(Schema.String),
  rank: ClaimRank,
  validFrom: Schema.NullOr(Schema.DateTimeUtc),
  validTo: Schema.NullOr(Schema.DateTimeUtc),
  assertedAt: Schema.DateTimeUtc,
  deprecatedAt: Schema.NullOr(Schema.DateTimeUtc),
  deprecatedBy: Schema.NullOr(CorrectionId),
  confidenceScore: Schema.NullOr(Schema.Number),
  evidenceText: Schema.NullOr(Schema.String),
  evidenceStartOffset: Schema.NullOr(Schema.Number),
  evidenceEndOffset: Schema.NullOr(Schema.Number)
})
export type Claim = typeof Claim.Type

export const ClaimInsert = Schema.Struct({
  id: Schema.optional(ClaimId),
  articleId: ArticleId,
  subjectIri: Schema.String,
  predicateIri: Schema.String,
  objectValue: Schema.String,
  objectType: Schema.optionalWith(ObjectType, { default: () => "iri" as const }),
  objectDatatype: Schema.optional(Schema.String),
  objectLanguage: Schema.optional(Schema.String),
  rank: Schema.optionalWith(ClaimRank, { default: () => "normal" as const }),
  validFrom: Schema.optional(Schema.DateTimeUtc),
  validTo: Schema.optional(Schema.DateTimeUtc),
  confidenceScore: Schema.optional(Schema.Number),
  evidenceText: Schema.optional(Schema.String),
  evidenceStartOffset: Schema.optional(Schema.Number),
  evidenceEndOffset: Schema.optional(Schema.Number)
})
export type ClaimInsert = typeof ClaimInsert.Type

// =============================================================================
// Correction
// =============================================================================

export const Correction = Schema.Struct({
  id: CorrectionId,
  correctionType: CorrectionType,
  sourceArticleId: Schema.NullOr(ArticleId),
  reason: Schema.NullOr(Schema.String),
  correctionDate: Schema.DateTimeUtc,
  createdAt: Schema.DateTimeUtc,
  processedAt: Schema.NullOr(Schema.DateTimeUtc)
})
export type Correction = typeof Correction.Type

export const CorrectionInsert = Schema.Struct({
  id: Schema.optional(CorrectionId),
  correctionType: CorrectionType,
  sourceArticleId: Schema.optional(ArticleId),
  reason: Schema.optional(Schema.String),
  correctionDate: Schema.DateTimeUtc
})
export type CorrectionInsert = typeof CorrectionInsert.Type

// =============================================================================
// Correction Claims (Junction)
// =============================================================================

export const CorrectionClaim = Schema.Struct({
  correctionId: CorrectionId,
  originalClaimId: ClaimId,
  newClaimId: Schema.NullOr(ClaimId)
})
export type CorrectionClaim = typeof CorrectionClaim.Type

// =============================================================================
// Conflict
// =============================================================================

export const Conflict = Schema.Struct({
  id: ConflictId,
  conflictType: ConflictType,
  claimAId: ClaimId,
  claimBId: ClaimId,
  status: ConflictStatus,
  resolutionStrategy: Schema.NullOr(ResolutionStrategy),
  acceptedClaimId: Schema.NullOr(ClaimId),
  resolvedBy: Schema.NullOr(Schema.String),
  resolvedAt: Schema.NullOr(Schema.DateTimeUtc),
  resolutionNotes: Schema.NullOr(Schema.String),
  detectedAt: Schema.DateTimeUtc
})
export type Conflict = typeof Conflict.Type

export const ConflictInsert = Schema.Struct({
  id: Schema.optional(ConflictId),
  conflictType: ConflictType,
  claimAId: ClaimId,
  claimBId: ClaimId
})
export type ConflictInsert = typeof ConflictInsert.Type

// =============================================================================
// Batch Run
// =============================================================================

export const BatchRun = Schema.Struct({
  id: BatchRunId,
  batchId: Schema.String,
  status: BatchRunStatus,
  documentsTotal: Schema.Number,
  documentsProcessed: Schema.Number,
  claimsExtracted: Schema.Number,
  conflictsDetected: Schema.Number,
  startedAt: Schema.NullOr(Schema.DateTimeUtc),
  completedAt: Schema.NullOr(Schema.DateTimeUtc),
  errorMessage: Schema.NullOr(Schema.String),
  errorDetails: Schema.NullOr(Schema.Unknown),
  createdAt: Schema.DateTimeUtc
})
export type BatchRun = typeof BatchRun.Type

export const BatchRunInsert = Schema.Struct({
  id: Schema.optional(BatchRunId),
  batchId: Schema.String,
  documentsTotal: Schema.optionalWith(Schema.Number, { default: () => 0 }),
  documentsProcessed: Schema.optionalWith(Schema.Number, { default: () => 0 }),
  claimsExtracted: Schema.optionalWith(Schema.Number, { default: () => 0 }),
  conflictsDetected: Schema.optionalWith(Schema.Number, { default: () => 0 })
})
export type BatchRunInsert = typeof BatchRunInsert.Type
