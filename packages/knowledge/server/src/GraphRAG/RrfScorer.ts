/**
 * RRF (Reciprocal Rank Fusion) Scoring
 *
 * Combines multiple ranking signals into a single relevance score.
 *
 * @module knowledge-server/GraphRAG/RrfScorer
 * @since 0.1.0
 */
import * as A from "effect/Array";
import * as Num from "effect/Number";
import * as Order from "effect/Order";

/**
 * RRF scoring constant - higher values favor lower ranks
 *
 * Standard value from the original RRF paper (Cormack et al., 2009)
 *
 * @since 0.1.0
 */
export const RRF_K = 60;

/**
 * Calculate single RRF score for a rank
 *
 * RRF(rank) = 1 / (k + rank)
 *
 * @param rank - The position in the ranked list (1-indexed)
 * @param k - Smoothing constant (default 60)
 * @returns RRF score component
 *
 * @since 0.1.0
 * @category scoring
 */
export const rrfComponent = (rank: number, k = RRF_K): number => {
  return 1 / (k + rank);
};

/**
 * Calculate combined RRF score from multiple rank positions
 *
 * RRF_combined = sum(1 / (k + rank_i)) for all rankings
 *
 * @param ranks - Array of rank positions (1-indexed)
 * @param k - Smoothing constant (default 60)
 * @returns Combined RRF score
 *
 * @since 0.1.0
 * @category scoring
 */
export const rrfScore = (ranks: ReadonlyArray<number>, k = RRF_K): number => {
  return A.reduce(ranks, 0, (acc, rank) => acc + rrfComponent(rank, k));
};

/**
 * Combine embedding similarity rank with graph distance rank
 *
 * @param embeddingRank - Position in similarity-sorted results (1-indexed)
 * @param graphRank - Position based on graph distance (1-indexed)
 * @param k - Smoothing constant (default 60)
 * @returns Combined RRF score
 *
 * @since 0.1.0
 * @category scoring
 */
export const combineEmbeddingAndGraphRanks = (embeddingRank: number, graphRank: number, k = RRF_K): number => {
  return rrfComponent(embeddingRank, k) + rrfComponent(graphRank, k);
};

/**
 * Ranked item with ID and score
 *
 * @since 0.1.0
 * @category types
 */
export interface RankedItem<T> {
  readonly id: T;
  readonly score: number;
}

/**
 * Fuse multiple ranked lists into a single ranking
 *
 * Takes multiple ranked lists and produces a single fused ranking
 * using Reciprocal Rank Fusion.
 *
 * @param rankedLists - Array of ranked lists, each containing IDs in rank order
 * @param k - Smoothing constant (default 60)
 * @returns Fused ranking sorted by descending RRF score
 *
 * @since 0.1.0
 * @category scoring
 */
export const fuseRankings = <T extends string>(
  rankedLists: ReadonlyArray<ReadonlyArray<T>>,
  k = RRF_K
): ReadonlyArray<RankedItem<T>> => {
  // Accumulate scores by ID
  const scoreMap = new Map<T, number>();

  for (const rankedList of rankedLists) {
    for (let i = 0; i < rankedList.length; i++) {
      const id = rankedList[i]!;
      const rank = i + 1; // 1-indexed
      const component = rrfComponent(rank, k);
      const currentScore = scoreMap.get(id) ?? 0;
      scoreMap.set(id, currentScore + component);
    }
  }

  // Convert to array and sort by descending score
  const items: Array<RankedItem<T>> = [];
  for (const [id, score] of scoreMap) {
    items.push({ id, score });
  }

  return A.sort(
    items,
    Order.mapInput(Num.Order, (item: RankedItem<T>) => -item.score)
  );
};

/**
 * Assign graph distance ranks to entities based on hop count
 *
 * Entities at the same hop distance receive the same rank,
 * with ranks incrementing for each hop level.
 *
 * @param entityHops - Map of entity ID to hop count from seed
 * @returns Map of entity ID to graph rank
 *
 * @since 0.1.0
 * @category scoring
 */
export const assignGraphRanks = <T extends string>(entityHops: ReadonlyMap<T, number>): ReadonlyMap<T, number> => {
  // Group entities by hop count
  const hopGroups = new Map<number, Array<T>>();

  for (const [id, hops] of entityHops) {
    const group = hopGroups.get(hops) ?? [];
    group.push(id);
    hopGroups.set(hops, group);
  }

  // Sort hop levels and assign ranks
  const hopLevels = A.sort(Array.from(hopGroups.keys()), Num.Order);
  const rankMap = new Map<T, number>();

  let currentRank = 1;
  for (const hop of hopLevels) {
    const entities = hopGroups.get(hop) ?? [];
    for (const id of entities) {
      rankMap.set(id, currentRank);
    }
    currentRank += entities.length;
  }

  return rankMap;
};
