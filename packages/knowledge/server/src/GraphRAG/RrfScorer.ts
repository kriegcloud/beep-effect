/**
 * RRF (Reciprocal Rank Fusion) Scoring
 *
 * Combines multiple ranking signals into a single relevance score.
 *
 * @module knowledge-server/GraphRAG/RrfScorer
 * @since 0.1.0
 */

import { thunkZero } from "@beep/utils";
import * as A from "effect/Array";
import * as MutableHashMap from "effect/MutableHashMap";
import * as Num from "effect/Number";
import * as O from "effect/Option";
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
  const scoreMap = MutableHashMap.empty<T, number>();

  for (const rankedList of rankedLists) {
    A.forEach(rankedList, (id, i) => {
      const rank = i + 1; // 1-indexed
      const component = rrfComponent(rank, k);
      const currentScore = O.getOrElse(MutableHashMap.get(scoreMap, id), thunkZero);
      MutableHashMap.set(scoreMap, id, currentScore + component);
    });
  }

  // Convert to array and sort by descending score
  const items = A.empty<RankedItem<T>>();
  MutableHashMap.forEach(scoreMap, (score, id) => {
    items.push({ id, score });
  });

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
export const assignGraphRanks = <T extends string>(
  entityHops: MutableHashMap.MutableHashMap<T, number>
): MutableHashMap.MutableHashMap<T, number> => {
  // Group entities by hop count
  const hopGroups = MutableHashMap.empty<number, Array<T>>();

  MutableHashMap.forEach(entityHops, (hops, id) => {
    const groupOpt = MutableHashMap.get(hopGroups, hops);
    const group = O.getOrElse(groupOpt, A.empty<T>);
    group.push(id);
    MutableHashMap.set(hopGroups, hops, group);
  });

  // Sort hop levels and assign ranks
  const hopLevels = A.empty<number>();
  MutableHashMap.forEach(hopGroups, (_, hop) => {
    hopLevels.push(hop);
  });
  const sortedHopLevels = A.sort(hopLevels, Num.Order);
  const rankMap = MutableHashMap.empty<T, number>();

  let currentRank = 1;
  for (const hop of sortedHopLevels) {
    const entitiesOpt = MutableHashMap.get(hopGroups, hop);
    const entities = O.getOrElse(entitiesOpt, A.empty<T>);
    for (const id of entities) {
      MutableHashMap.set(rankMap, id, currentRank);
    }
    currentRank += entities.length;
  }

  return rankMap;
};
