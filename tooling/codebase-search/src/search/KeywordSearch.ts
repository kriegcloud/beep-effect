/**
 * BM25-only keyword search service for hook contexts where embedding
 * model loading is too slow. Delegates directly to the BM25 engine
 * with optional minimum score filtering.
 *
 * @since 0.0.0
 * @module
 */

import { Effect, Layer } from "effect";
import * as A from "effect/Array";
import * as ServiceMap from "effect/ServiceMap";
import type { IndexingError } from "../errors.js";
import { Bm25Writer } from "../indexer/index.js";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/**
 * Configuration for a keyword-only search query.
 *
 * @since 0.0.0
 * @category types
 */
export interface KeywordSearchConfig {
  /** The keyword search query string. */
  readonly query: string;
  /** Maximum number of results to return. */
  readonly limit: number;
  /** Optional minimum score to include a result. */
  readonly minScore?: number | undefined;
}

/**
 * A single result from keyword search.
 *
 * @since 0.0.0
 * @category types
 */
export interface KeywordSearchResult {
  /** The unique symbol identifier. */
  readonly symbolId: string;
  /** The BM25 relevance score. */
  readonly score: number;
}

// ---------------------------------------------------------------------------
// Service
// ---------------------------------------------------------------------------

/**
 * Shape of the KeywordSearch service interface.
 *
 * @since 0.0.0
 * @category models
 */
export interface KeywordSearchShape {
  /**
   * Execute a BM25 keyword search.
   *
   * @since 0.0.0
   */
  readonly search: (config: KeywordSearchConfig) => Effect.Effect<ReadonlyArray<KeywordSearchResult>, IndexingError>;
}

/**
 * Service tag for `KeywordSearch`.
 *
 * Provides BM25 keyword-only search for fast hook contexts.
 *
 * @since 0.0.0
 * @category services
 */
export class KeywordSearch extends ServiceMap.Service<KeywordSearch, KeywordSearchShape>()(
  "@beep/codebase-search/search/KeywordSearch"
) {}

// ---------------------------------------------------------------------------
// Live Layer
// ---------------------------------------------------------------------------

/**
 * Live layer for `KeywordSearch` that delegates to the `Bm25Writer`
 * service for keyword search with optional score filtering.
 *
 * @since 0.0.0
 * @category layers
 */
export const KeywordSearchLive: Layer.Layer<KeywordSearch, never, Bm25Writer> = Layer.effect(
  KeywordSearch,
  Effect.gen(function* () {
    const bm25Svc = yield* Bm25Writer;

    const search: KeywordSearchShape["search"] = Effect.fn(function* (config) {
      const results = yield* bm25Svc.search(config.query, config.limit);

      // Map to KeywordSearchResult shape
      const mapped = A.map(
        results,
        (r): KeywordSearchResult => ({
          symbolId: r.symbolId,
          score: r.score,
        })
      );

      // Filter by minScore if provided
      if (config.minScore !== undefined) {
        return A.filter(mapped, (r) => r.score >= (config.minScore ?? 0));
      }

      return mapped;
    });

    return KeywordSearch.of({ search });
  })
);
