/**
 * RrfScorer Tests
 *
 * Tests for Reciprocal Rank Fusion scoring utilities.
 *
 * @module knowledge-server/test/GraphRAG/RrfScorer.test
 * @since 0.1.0
 */


import {
  assignGraphRanks,
  combineEmbeddingAndGraphRanks,
  fuseRankings,
  rrfComponent,
  rrfScore,
} from "@beep/knowledge-server/GraphRAG/RrfScorer";
import { assertTrue, describe, effect, strictEqual } from "@beep/testkit";
import * as Effect from "effect/Effect";
import * as MutableHashMap from "effect/MutableHashMap";
import * as O from "effect/Option";

describe("RrfScorer", () => {
  effect("calculates rrfComponent correctly", () =>
    Effect.gen(function* () {
      // RRF(rank) = 1 / (k + rank)
      const score1 = rrfComponent(1); // 1 / (60 + 1) = 1/61
      const score2 = rrfComponent(2); // 1 / (60 + 2) = 1/62

      assertTrue(score1 > score2); // Rank 1 should have higher score
      strictEqual(Math.round(score1 * 1000) / 1000, Math.round((1 / 61) * 1000) / 1000);
    })
  );

  effect("calculates rrfScore from multiple ranks", () =>
    Effect.gen(function* () {
      const ranks = [1, 2, 3];
      const score = rrfScore(ranks);

      // Should be sum of individual components
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

  effect("fuses multiple ranked lists", () =>
    Effect.gen(function* () {
      const list1 = ["a", "b", "c"];
      const list2 = ["b", "a", "d"];

      const fused = fuseRankings([list1, list2]);

      // Both 'a' and 'b' appear in both lists
      assertTrue(fused.length >= 3);

      // Find 'a' - appears at rank 1 in list1, rank 2 in list2
      const aItem = fused.find((item) => item.id === "a");
      assertTrue(aItem !== undefined);
      strictEqual(
        Math.round(aItem.score * 10000) / 10000,
        Math.round((rrfComponent(1) + rrfComponent(2)) * 10000) / 10000
      );

      // Find 'b' - appears at rank 2 in list1, rank 1 in list2
      const bItem = fused.find((item) => item.id === "b");
      assertTrue(bItem !== undefined);
      strictEqual(
        Math.round(bItem.score * 10000) / 10000,
        Math.round((rrfComponent(2) + rrfComponent(1)) * 10000) / 10000
      );

      // 'a' and 'b' should have same score
      strictEqual(Math.round(aItem.score * 10000) / 10000, Math.round(bItem.score * 10000) / 10000);
    })
  );

  effect("assigns graph ranks based on hop distance", () =>
    Effect.gen(function* () {
      const entityHops = MutableHashMap.fromIterable<string, number>([
        ["e1", 0], // seed
        ["e2", 0], // seed
        ["e3", 1], // 1-hop
        ["e4", 2], // 2-hop
      ]);

      const ranks = assignGraphRanks(entityHops);

      // Seeds at hop 0 should have rank 1
      strictEqual(O.getOrThrow(MutableHashMap.get(ranks, "e1")), 1);
      strictEqual(O.getOrThrow(MutableHashMap.get(ranks, "e2")), 1);

      // Entity at hop 1 should have rank 3 (after 2 seeds)
      strictEqual(O.getOrThrow(MutableHashMap.get(ranks, "e3")), 3);

      // Entity at hop 2 should have rank 4
      strictEqual(O.getOrThrow(MutableHashMap.get(ranks, "e4")), 4);
    })
  );

  effect("handles empty input in fuseRankings", () =>
    Effect.gen(function* () {
      const fused = fuseRankings([]);
      strictEqual(fused.length, 0);
    })
  );

  effect("handles single list in fuseRankings", () =>
    Effect.gen(function* () {
      const list = ["x", "y", "z"];
      const fused = fuseRankings([list]);

      strictEqual(fused.length, 3);
      // First item should have highest score
      strictEqual(fused[0]?.id, "x");
      assertTrue(fused[0]!.score > fused[1]!.score);
    })
  );
});
