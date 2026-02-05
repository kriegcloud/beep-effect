import { thunkZero } from "@beep/utils";
import * as A from "effect/Array";
import * as MutableHashMap from "effect/MutableHashMap";
import * as Num from "effect/Number";
import * as O from "effect/Option";
import * as Order from "effect/Order";

export const RRF_K = 60;

export const rrfComponent = (rank: number, k = RRF_K): number => {
  return 1 / (k + rank);
};

export const rrfScore = (ranks: ReadonlyArray<number>, k = RRF_K): number => {
  return A.reduce(ranks, 0, (acc, rank) => acc + rrfComponent(rank, k));
};

export const combineEmbeddingAndGraphRanks = (embeddingRank: number, graphRank: number, k = RRF_K): number => {
  return rrfComponent(embeddingRank, k) + rrfComponent(graphRank, k);
};

export interface RankedItem<T> {
  readonly id: T;
  readonly score: number;
}

export const fuseRankings = <T extends string>(
  rankedLists: ReadonlyArray<ReadonlyArray<T>>,
  k = RRF_K
): ReadonlyArray<RankedItem<T>> => {
  const scoreMap = MutableHashMap.empty<T, number>();

  A.forEach(rankedLists, (rankedList) => {
    A.forEach(rankedList, (id, i) => {
      const rank = i + 1;
      const component = rrfComponent(rank, k);
      const currentScore = O.getOrElse(MutableHashMap.get(scoreMap, id), thunkZero);
      MutableHashMap.set(scoreMap, id, currentScore + component);
    });
  });

  const items: Array<RankedItem<T>> = [];
  MutableHashMap.forEach(scoreMap, (score, id) => {
    items.push({ id, score });
  });

  return A.sort(
    items,
    Order.mapInput(Num.Order, (item: RankedItem<T>) => -item.score)
  );
};

export const assignGraphRanks = <T extends string>(
  entityHops: MutableHashMap.MutableHashMap<T, number>
): MutableHashMap.MutableHashMap<T, number> => {
  const hopGroups = MutableHashMap.empty<number, Array<T>>();

  MutableHashMap.forEach(entityHops, (hops, id) => {
    const groupOpt = MutableHashMap.get(hopGroups, hops);
    const group = O.getOrElse(groupOpt, A.empty<T>);
    group.push(id);
    MutableHashMap.set(hopGroups, hops, group);
  });

  const hopLevels: Array<number> = [];
  MutableHashMap.forEach(hopGroups, (_, hop) => {
    hopLevels.push(hop);
  });
  const sortedHopLevels = A.sort(hopLevels, Num.Order);
  const rankMap = MutableHashMap.empty<T, number>();

  A.reduce(sortedHopLevels, 1, (currentRank, hop) => {
    const entitiesOpt = MutableHashMap.get(hopGroups, hop);
    const entities = O.getOrElse(entitiesOpt, A.empty<T>);
    A.forEach(entities, (id) => {
      MutableHashMap.set(rankMap, id, currentRank);
    });
    return currentRank + A.length(entities);
  });

  return rankMap;
};
