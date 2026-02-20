/**
 * Hybrid search engine combining vector similarity and BM25 keyword search
 * with Reciprocal Rank Fusion (RRF) for result merging and scoring.
 *
 * Executes vector and keyword searches in parallel, then fuses ranked
 * results using RRF with k=60. Scores are normalized to the 0-1 range.
 *
 * @since 0.0.0
 * @module
 */

import { Effect, Layer, Order } from "effect";
import * as A from "effect/Array";
import { pipe } from "effect/Function";
import * as MutableHashMap from "effect/MutableHashMap";
import * as O from "effect/Option";
import * as ServiceMap from "effect/ServiceMap";
import { IndexingError } from "../errors.js";
import { Bm25Writer } from "../indexer/Bm25Writer.js";
import { EmbeddingService } from "../indexer/EmbeddingService.js";
import { LanceDbWriter } from "../indexer/LanceDbWriter.js";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

/**
 * The RRF smoothing constant. Higher values reduce the influence of high
 * rankings. The standard value of 60 is widely used in information retrieval.
 *
 * @since 0.0.0
 * @category constants
 */
export const RRF_K = 60;

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/**
 * Configuration for a hybrid search query.
 *
 * @since 0.0.0
 * @category types
 */
export interface HybridSearchConfig {
  /** The natural language or keyword search query. */
  readonly query: string;
  /** Maximum number of results to return. */
  readonly limit: number;
  /** Optional filter by symbol kind. */
  readonly kind?: string | undefined;
  /** Optional filter by package name. */
  readonly package?: string | undefined;
  /** Optional minimum normalized score (0-1) to include a result. */
  readonly minScore?: number | undefined;
}

/**
 * A single result from hybrid search, including per-source ranking info.
 *
 * @since 0.0.0
 * @category types
 */
export interface HybridSearchResult {
  /** The unique symbol identifier. */
  readonly symbolId: string;
  /** Normalized fused score in the 0-1 range. */
  readonly score: number;
  /** 1-based rank in the vector search results, or null if absent. */
  readonly vectorRank: number | null;
  /** 1-based rank in the keyword search results, or null if absent. */
  readonly keywordRank: number | null;
}

// ---------------------------------------------------------------------------
// RRF Accumulator
// ---------------------------------------------------------------------------

/** @internal */
interface RrfAccumulator {
  score: number;
  vectorRank: number | null;
  keywordRank: number | null;
}

// ---------------------------------------------------------------------------
// reciprocalRankFusion (pure, exported for testing)
// ---------------------------------------------------------------------------

/**
 * Applies Reciprocal Rank Fusion to merge two ranked result lists into a
 * single sorted, normalized result list.
 *
 * RRF_score(d) = sum(1 / (k + rank_i(d))) for each result list i where d appears.
 *
 * Scores are normalized to the 0-1 range by dividing by the maximum score.
 *
 * @since 0.0.0
 * @category algorithms
 */
export const reciprocalRankFusion = (
  vectorResults: ReadonlyArray<{ readonly id: string }>,
  keywordResults: ReadonlyArray<{ readonly symbolId: string }>,
  k: number
): ReadonlyArray<HybridSearchResult> => {
  const accumulators = MutableHashMap.empty<string, RrfAccumulator>();

  // Process vector results (1-based ranking)
  pipe(
    vectorResults,
    A.forEach((result, index) => {
      const rank = index + 1;
      const rrfScore = 1 / (k + rank);
      const existing = MutableHashMap.get(accumulators, result.id);
      if (O.isSome(existing)) {
        existing.value.score = existing.value.score + rrfScore;
        existing.value.vectorRank = rank;
      } else {
        MutableHashMap.set(accumulators, result.id, {
          score: rrfScore,
          vectorRank: rank,
          keywordRank: null,
        });
      }
    })
  );

  // Process keyword results (1-based ranking)
  pipe(
    keywordResults,
    A.forEach((result, index) => {
      const rank = index + 1;
      const rrfScore = 1 / (k + rank);
      const existing = MutableHashMap.get(accumulators, result.symbolId);
      if (O.isSome(existing)) {
        existing.value.score = existing.value.score + rrfScore;
        existing.value.keywordRank = rank;
      } else {
        MutableHashMap.set(accumulators, result.symbolId, {
          score: rrfScore,
          vectorRank: null,
          keywordRank: rank,
        });
      }
    })
  );

  // Convert to array
  const results = A.empty<HybridSearchResult>();
  for (const [symbolId, acc] of accumulators) {
    results.push({
      symbolId,
      score: acc.score,
      vectorRank: acc.vectorRank,
      keywordRank: acc.keywordRank,
    });
  }

  // Sort by score descending
  const sorted = A.sort(
    results,
    Order.mapInput(Order.flip(Order.Number), (r: HybridSearchResult) => r.score)
  );

  // Normalize scores: divide all by max (first element after sort)
  if (A.isArrayEmpty(sorted)) {
    return sorted;
  }

  const maxScore = pipe(
    A.get(sorted, 0),
    O.map((r) => r.score),
    O.getOrElse(() => 1)
  );

  if (maxScore === 0) {
    return sorted;
  }

  return A.map(
    sorted,
    (r): HybridSearchResult => ({
      symbolId: r.symbolId,
      score: r.score / maxScore,
      vectorRank: r.vectorRank,
      keywordRank: r.keywordRank,
    })
  );
};

// ---------------------------------------------------------------------------
// Service
// ---------------------------------------------------------------------------

/**
 * Shape of the HybridSearch service interface.
 *
 * @since 0.0.0
 * @category models
 */
export interface HybridSearchShape {
  /**
   * Execute a hybrid vector + keyword search with RRF fusion.
   *
   * @since 0.0.0
   */
  readonly search: (config: HybridSearchConfig) => Effect.Effect<ReadonlyArray<HybridSearchResult>, IndexingError>;
}

/**
 * Service tag for `HybridSearch`.
 *
 * Provides hybrid vector + BM25 keyword search with Reciprocal Rank Fusion.
 *
 * @since 0.0.0
 * @category services
 */
export class HybridSearch extends ServiceMap.Service<HybridSearch, HybridSearchShape>()(
  "@beep/codebase-search/search/HybridSearch"
) {}

// ---------------------------------------------------------------------------
// Live Layer
// ---------------------------------------------------------------------------

/** @internal Number of results to fetch from each search source before fusion. */
const SOURCE_LIMIT = 20;

/**
 * Live layer for `HybridSearch` that wires together `EmbeddingService`,
 * `LanceDbWriter`, and `Bm25Writer` to perform hybrid search with RRF.
 *
 * @since 0.0.0
 * @category layers
 */
export const HybridSearchLive: Layer.Layer<HybridSearch, never, EmbeddingService | LanceDbWriter | Bm25Writer> =
  Layer.effect(
    HybridSearch,
    Effect.gen(function* () {
      const embeddingSvc = yield* EmbeddingService;
      const lanceSvc = yield* LanceDbWriter;
      const bm25Svc = yield* Bm25Writer;

      const search: HybridSearchShape["search"] = Effect.fn(function* (config) {
        // 1. Embed the query
        const queryVector = yield* pipe(
          embeddingSvc.embed(config.query),
          Effect.mapError(
            (e) =>
              new IndexingError({
                message: `Hybrid search embedding failed: ${e.message}`,
                phase: "hybrid-search",
              })
          )
        );

        // 2. Execute vector and keyword searches in parallel
        const [vectorResults, keywordResults] = yield* Effect.all(
          [
            lanceSvc.vectorSearch(queryVector, {
              limit: SOURCE_LIMIT,
              kind: config.kind,
              package: config.package,
            }),
            bm25Svc.search(config.query, SOURCE_LIMIT),
          ],
          { concurrency: 2 }
        );

        // 3. Apply Reciprocal Rank Fusion
        const fused = reciprocalRankFusion(vectorResults, keywordResults, RRF_K);

        // 4. Filter by minScore if provided
        const filtered =
          config.minScore !== undefined ? A.filter(fused, (r) => r.score >= (config.minScore ?? 0)) : fused;

        // 5. Truncate to limit
        return A.take(filtered, config.limit);
      });

      return HybridSearch.of({ search });
    })
  );
