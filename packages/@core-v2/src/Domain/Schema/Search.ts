/**
 * Schema: Search API Types
 *
 * Request/Response schemas for claim and entity search endpoints.
 * Enables discovery across the knowledge graph with text and metadata filtering.
 *
 * @since 2.0.0
 * @module Domain/Schema/Search
 */

import { Schema } from "effect"
import { ArticleSummary, ClaimRank, ClaimWithRank } from "./Timeline.js"

// =============================================================================
// Claim Search
// =============================================================================

/**
 * Request body for claim search
 * POST /v1/search/claims
 */
export class ClaimSearchRequest extends Schema.Class<ClaimSearchRequest>("ClaimSearchRequest")({
  /** Text search across claim values */
  query: Schema.String.pipe(Schema.minLength(1)),
  /** Filter by predicate IRIs */
  predicates: Schema.optional(Schema.Array(Schema.String)),
  /** Filter by source names */
  sources: Schema.optional(Schema.Array(Schema.String)),
  /** Filter by date range */
  dateRange: Schema.optional(Schema.Struct({
    from: Schema.DateTimeUtc,
    to: Schema.DateTimeUtc
  })),
  /** Filter by claim rank */
  rank: Schema.optional(ClaimRank),
  /** Maximum results (default: 20) */
  limit: Schema.optional(Schema.Number.pipe(Schema.int(), Schema.positive())),
  /** Pagination offset */
  offset: Schema.optional(Schema.Number.pipe(Schema.int(), Schema.nonNegative()))
}) {}

/**
 * Response for claim search
 */
export class ClaimSearchResponse extends Schema.Class<ClaimSearchResponse>("ClaimSearchResponse")({
  query: Schema.String,
  claims: Schema.Array(ClaimWithRank),
  total: Schema.Number,
  limit: Schema.Number,
  offset: Schema.Number,
  hasMore: Schema.Boolean,
  /** Facets for filtering */
  facets: Schema.optional(Schema.Struct({
    predicates: Schema.Array(Schema.Struct({
      iri: Schema.String,
      label: Schema.NullOr(Schema.String),
      count: Schema.Number
    })),
    sources: Schema.Array(Schema.Struct({
      name: Schema.String,
      count: Schema.Number
    }))
  }))
}) {}

// =============================================================================
// Entity Search
// =============================================================================

/**
 * Request body for entity search
 * POST /v1/search/entities
 */
export class EntitySearchRequest extends Schema.Class<EntitySearchRequest>("EntitySearchRequest")({
  /** Text search on entity labels */
  query: Schema.String.pipe(Schema.minLength(1)),
  /** Filter by ontology class IRIs */
  types: Schema.optional(Schema.Array(Schema.String)),
  /** Maximum results (default: 20) */
  limit: Schema.optional(Schema.Number.pipe(Schema.int(), Schema.positive()))
}) {}

/**
 * Entity search result with summary
 */
export class EntitySearchResult extends Schema.Class<EntitySearchResult>("EntitySearchResult")({
  iri: Schema.String,
  label: Schema.NullOr(Schema.String),
  types: Schema.Array(Schema.String),
  /** Number of claims about this entity */
  claimCount: Schema.Number,
  /** Preview of top claims */
  topClaims: Schema.optional(Schema.Array(Schema.Struct({
    predicateIri: Schema.String,
    predicateLabel: Schema.NullOr(Schema.String),
    value: Schema.String
  })))
}) {}

/**
 * Response for entity search
 */
export class EntitySearchResponse extends Schema.Class<EntitySearchResponse>("EntitySearchResponse")({
  query: Schema.String,
  entities: Schema.Array(EntitySearchResult),
  total: Schema.Number
}) {}

// =============================================================================
// Suggestions (Typeahead)
// =============================================================================

// Number from string for URL params
const NumberFromString = Schema.NumberFromString

/**
 * Query parameters for suggestions endpoint
 * GET /v1/search/suggestions
 *
 * Note: Uses string-based parsing for URL search params
 */
export class SuggestionQuery extends Schema.Class<SuggestionQuery>("SuggestionQuery")({
  /** Prefix to match */
  prefix: Schema.String.pipe(Schema.minLength(1)),
  /** Maximum suggestions (default: 10) */
  limit: Schema.optional(NumberFromString)
}) {}

/**
 * Individual suggestion item
 */
export class Suggestion extends Schema.Class<Suggestion>("Suggestion")({
  /** Display text */
  label: Schema.String,
  /** IRI for the entity */
  iri: Schema.String,
  /** Entity type for icon/badge */
  type: Schema.NullOr(Schema.String),
  /** Brief description or snippet */
  description: Schema.NullOr(Schema.String)
}) {}

/**
 * Response for suggestions query
 */
export class SuggestionsResponse extends Schema.Class<SuggestionsResponse>("SuggestionsResponse")({
  prefix: Schema.String,
  suggestions: Schema.Array(Suggestion)
}) {}

// =============================================================================
// Article Search
// =============================================================================

/**
 * Request body for article search
 * POST /v1/search/articles
 */
export class ArticleSearchRequest extends Schema.Class<ArticleSearchRequest>("ArticleSearchRequest")({
  /** Text search in headlines */
  query: Schema.optional(Schema.String),
  /** Filter by source names */
  sources: Schema.optional(Schema.Array(Schema.String)),
  /** Filter by date range */
  dateRange: Schema.optional(Schema.Struct({
    from: Schema.DateTimeUtc,
    to: Schema.DateTimeUtc
  })),
  /** Maximum results (default: 20) */
  limit: Schema.optional(Schema.Number.pipe(Schema.int(), Schema.positive())),
  /** Pagination offset */
  offset: Schema.optional(Schema.Number.pipe(Schema.int(), Schema.nonNegative()))
}) {}

/**
 * Article search result
 */
export class ArticleSearchResult extends Schema.Class<ArticleSearchResult>("ArticleSearchResult")({
  article: ArticleSummary,
  /** Number of claims extracted from this article */
  claimCount: Schema.Number,
  /** Number of pending conflicts involving this article */
  conflictCount: Schema.Number
}) {}

/**
 * Response for article search
 */
export class ArticleSearchResponse extends Schema.Class<ArticleSearchResponse>("ArticleSearchResponse")({
  articles: Schema.Array(ArticleSearchResult),
  total: Schema.Number,
  limit: Schema.Number,
  offset: Schema.Number,
  hasMore: Schema.Boolean
}) {}
