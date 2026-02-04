/**
 * Schema: Link Ingestion API
 *
 * Request/response schemas for link ingestion endpoints.
 *
 * @since 2.0.0
 * @module Domain/Schema/LinkIngestion
 */

import { Schema } from "effect"

// =============================================================================
// Ingest Link
// =============================================================================

/**
 * Request to ingest a single URL
 */
export class IngestLinkRequest extends Schema.Class<IngestLinkRequest>("IngestLinkRequest")({
  /** URL to ingest */
  url: Schema.String.pipe(Schema.pattern(/^https?:\/\/.+/)),
  /** Ontology ID for scoping (e.g., "seattle") */
  ontologyId: Schema.String,
  /** Skip AI enrichment */
  skipEnrich: Schema.optionalWith(Schema.Boolean, { default: () => false }),
  /** Override source type classification */
  sourceType: Schema.optional(
    Schema.Literal("news", "blog", "press_release", "official", "academic", "unknown")
  ),
  /** Allow duplicate content */
  allowDuplicates: Schema.optionalWith(Schema.Boolean, { default: () => false })
}) {}

/**
 * Response from ingesting a URL
 */
export class IngestLinkResponse extends Schema.Class<IngestLinkResponse>("IngestLinkResponse")({
  /** Database ID */
  id: Schema.String,
  /** Content hash (SHA-256) */
  contentHash: Schema.String,
  /** Storage URI */
  storageUri: Schema.String,
  /** Extracted headline */
  headline: Schema.NullOr(Schema.String),
  /** Word count */
  wordCount: Schema.NullOr(Schema.Number),
  /** Whether this was a duplicate */
  duplicate: Schema.Boolean
}) {}

// =============================================================================
// Batch Ingest
// =============================================================================

/**
 * Request to batch ingest URLs
 */
export class BatchIngestRequest extends Schema.Class<BatchIngestRequest>("BatchIngestRequest")({
  /** URLs to ingest */
  urls: Schema.Array(Schema.String.pipe(Schema.pattern(/^https?:\/\/.+/))),
  /** Ontology ID for scoping (e.g., "seattle") */
  ontologyId: Schema.String,
  /** Concurrency limit */
  concurrency: Schema.optionalWith(Schema.Number.pipe(Schema.int(), Schema.positive()), {
    default: () => 5
  }),
  /** Skip AI enrichment */
  skipEnrich: Schema.optionalWith(Schema.Boolean, { default: () => false }),
  /** Continue on individual failures */
  continueOnError: Schema.optionalWith(Schema.Boolean, { default: () => true })
}) {}

/**
 * Individual result from batch ingestion
 */
export class BatchIngestResult extends Schema.Class<BatchIngestResult>("BatchIngestResult")({
  /** Original URL */
  url: Schema.String,
  /** Success or error */
  status: Schema.Literal("success", "duplicate", "error"),
  /** Database ID (if successful) */
  id: Schema.NullOr(Schema.String),
  /** Content hash (if successful) */
  contentHash: Schema.NullOr(Schema.String),
  /** Error message (if failed) */
  error: Schema.NullOr(Schema.String)
}) {}

/**
 * Response from batch ingestion
 */
export class BatchIngestResponse extends Schema.Class<BatchIngestResponse>("BatchIngestResponse")({
  /** Individual results */
  results: Schema.Array(BatchIngestResult),
  /** Summary counts */
  summary: Schema.Struct({
    total: Schema.Number,
    success: Schema.Number,
    duplicate: Schema.Number,
    error: Schema.Number
  })
}) {}

// =============================================================================
// List Links
// =============================================================================

/**
 * Query params for listing ingested links
 */
export class ListLinksQuery extends Schema.Class<ListLinksQuery>("ListLinksQuery")({
  /** Filter by status */
  status: Schema.optional(Schema.Literal("pending", "enriched", "processed", "failed")),
  /** Filter by source type */
  sourceType: Schema.optional(
    Schema.Literal("news", "blog", "press_release", "official", "academic", "unknown")
  ),
  /** Filter by organization */
  organization: Schema.optional(Schema.String),
  /** Maximum results */
  limit: Schema.optionalWith(Schema.Number.pipe(Schema.int(), Schema.positive()), {
    default: () => 20
  }),
  /** Offset for pagination */
  offset: Schema.optionalWith(Schema.Number.pipe(Schema.int(), Schema.nonNegative()), {
    default: () => 0
  })
}) {}

/**
 * Summary of an ingested link
 */
export class LinkSummary extends Schema.Class<LinkSummary>("LinkSummary")({
  id: Schema.String,
  contentHash: Schema.String,
  sourceUri: Schema.NullOr(Schema.String),
  sourceType: Schema.NullOr(Schema.String),
  headline: Schema.NullOr(Schema.String),
  organization: Schema.NullOr(Schema.String),
  status: Schema.String,
  wordCount: Schema.NullOr(Schema.Number),
  fetchedAt: Schema.NullOr(Schema.DateTimeUtc),
  enrichedAt: Schema.NullOr(Schema.DateTimeUtc)
}) {}

/**
 * Response listing ingested links
 */
export class ListLinksResponse extends Schema.Class<ListLinksResponse>("ListLinksResponse")({
  links: Schema.Array(LinkSummary),
  total: Schema.Number,
  limit: Schema.Number,
  offset: Schema.Number,
  hasMore: Schema.Boolean
}) {}

// =============================================================================
// Get Link Detail
// =============================================================================

/**
 * Detailed link information
 */
export class LinkDetail extends Schema.Class<LinkDetail>("LinkDetail")({
  id: Schema.String,
  contentHash: Schema.String,
  sourceUri: Schema.NullOr(Schema.String),
  sourceType: Schema.NullOr(Schema.String),
  headline: Schema.NullOr(Schema.String),
  description: Schema.NullOr(Schema.String),
  author: Schema.NullOr(Schema.String),
  organization: Schema.NullOr(Schema.String),
  language: Schema.NullOr(Schema.String),
  topics: Schema.Array(Schema.String),
  keyEntities: Schema.Array(Schema.String),
  storageUri: Schema.String,
  status: Schema.String,
  wordCount: Schema.NullOr(Schema.Number),
  publishedAt: Schema.NullOr(Schema.DateTimeUtc),
  fetchedAt: Schema.NullOr(Schema.DateTimeUtc),
  enrichedAt: Schema.NullOr(Schema.DateTimeUtc),
  processedAt: Schema.NullOr(Schema.DateTimeUtc),
  errorMessage: Schema.NullOr(Schema.String)
}) {}
