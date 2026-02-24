import {
  assignGraphRanks,
  combineEmbeddingAndGraphRanks,
  fuseRankings,
  rrfComponent,
  rrfScore,
} from "@beep/knowledge-server/GraphRAG/RrfScorer";
import { assertTrue, describe, effect, strictEqual } from "@beep/testkit";
import * as A from "effect/Array";
import * as Effect from "effect/Effect";
import * as MutableHashMap from "effect/MutableHashMap";
import * as O from "effect/Option";

describe("RrfScorer", () => {
  effect(
    "calculates rrfComponent correctly",
    Effect.fn(function* () {
      const score1 = rrfComponent(1);
      const score2 = rrfComponent(2);

      assertTrue(score1 > score2);
      strictEqual(Math.round(score1 * 1000) / 1000, Math.round((1 / 61) * 1000) / 1000);
    })
  );

  effect(
    "calculates rrfScore from multiple ranks",
    Effect.fn(function* () {
      const ranks = [1, 2, 3];
      const score = rrfScore(ranks);

      const expected = rrfComponent(1) + rrfComponent(2) + rrfComponent(3);
      strictEqual(Math.round(score * 10000) / 10000, Math.round(expected * 10000) / 10000);
    })
  );

  effect("combines embedding and graph ranks", () =>
    Effect.gen(function* () {
      const embeddingRank = 1;
      const graphRank = 3;

      const combined = combineEmbeddingAndGraphRanks(embeddingRank, graphRank);
      const expected = rrfComponent(1) + rrfComponent(3);

      strictEqual(Math.round(combined * 10000) / 10000, Math.round(expected * 10000) / 10000);
    })
  );

  effect(
    "fuses multiple ranked lists",
    Effect.fn(function* () {
      const list1 = ["a", "b", "c"];
      const list2 = ["b", "a", "d"];

      const fused = fuseRankings([list1, list2]);

      assertTrue(A.length(fused) >= 3);

      const aItem = A.findFirst(fused, (item: { id: string; score: number }) => item.id === "a");
      assertTrue(O.isSome(aItem));
      strictEqual(
        Math.round(O.getOrThrow(aItem).score * 10000) / 10000,
        Math.round((rrfComponent(1) + rrfComponent(2)) * 10000) / 10000
      );

      const bItem = A.findFirst(fused, (item: { id: string; score: number }) => item.id === "b");
      assertTrue(O.isSome(bItem));
      strictEqual(
        Math.round(O.getOrThrow(bItem).score * 10000) / 10000,
        Math.round((rrfComponent(2) + rrfComponent(1)) * 10000) / 10000
      );

      strictEqual(
        Math.round(O.getOrThrow(aItem).score * 10000) / 10000,
        Math.round(O.getOrThrow(bItem).score * 10000) / 10000
      );
    })
  );

  effect(
    "assigns graph ranks based on hop distance",
    Effect.fn(function* () {
      const entityHops = MutableHashMap.fromIterable<string, number>([
        ["e1", 0],
        ["e2", 0],
        ["e3", 1],
        ["e4", 2],
      ]);

      const ranks = assignGraphRanks(entityHops);

      strictEqual(O.getOrThrow(MutableHashMap.get(ranks, "e1")), 1);
      strictEqual(O.getOrThrow(MutableHashMap.get(ranks, "e2")), 1);

      strictEqual(O.getOrThrow(MutableHashMap.get(ranks, "e3")), 3);

      strictEqual(O.getOrThrow(MutableHashMap.get(ranks, "e4")), 4);
    })
  );

  effect(
    "handles empty input in fuseRankings",
    Effect.fn(function* () {
      const fused = fuseRankings([]);
      strictEqual(A.length(fused), 0);
    })
  );

  effect(
    "handles single list in fuseRankings",
    Effect.fn(function* () {
      const list = ["x", "y", "z"];
      const fused = fuseRankings([list]);

      strictEqual(A.length(fused), 3);

      const first = A.head(fused);
      const second = A.get(fused, 1);
      assertTrue(O.isSome(first));
      assertTrue(O.isSome(second));
      strictEqual(O.getOrThrow(first).id, "x");
      assertTrue(O.getOrThrow(first).score > O.getOrThrow(second).score);
    })
  );
});
