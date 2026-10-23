// The writer builds every node through its public `make` (W3-b). That stays
// linear only because a writer tree's depth is fixed by the construct (a
// table is five levels: root, table, row, cell, passthrough) and never by the
// input, so admission costs O(nodes), not O(nodes x depth). This guard pins
// the growth: doubling the rows may at most roughly double the time.

import { GitHubMarkdown } from "@beep/github-reporting/GitHubMarkdown";
import { assert, describe, it } from "@effect/vitest";
import * as Arbitrary from "effect/Arbitrary";
import * as A from "effect/Array";
import * as Effect from "effect/Effect";
import * as Num from "effect/Number";
import * as S from "effect/Schema";

const Cell = S.String.check(S.isPattern(/^[a-z|\\` ]{1,12}$/u));
const Row = S.Tuple([Cell, Cell, Cell]);
const HEADERS = ["check", "state", "outcome"];

const timeOf = (rows: ReadonlyArray<ReadonlyArray<string>>): number => {
  const started = performance.now();
  GitHubMarkdown.table(HEADERS, rows);
  return performance.now() - started;
};

/**
 * The best time of each size over interleaved passes. Interleaving exposes
 * both sizes to the same GC and JIT phases; keeping the best damps that noise
 * without hiding an algorithmic blowup, which slows every pass.
 */
const bestTimes = (
  small: ReadonlyArray<ReadonlyArray<string>>,
  large: ReadonlyArray<ReadonlyArray<string>>
): readonly [small: number, large: number] =>
  A.reduce(
    A.makeBy(7, Num.increment),
    [Number.POSITIVE_INFINITY, Number.POSITIVE_INFINITY] as const,
    ([bestSmall, bestLarge]) => [Num.min(bestSmall, timeOf(small)), Num.min(bestLarge, timeOf(large))] as const
  );

describe("GitHubMarkdown growth", () => {
  it.effect("table time grows linearly with rows: t(10k) / t(5k) <= 2.5 on a fixed seed", () =>
    Effect.gen(function* () {
      const rows = yield* Arbitrary.sampleEffect(Arbitrary.schema(Row), { count: 10_000, seed: 31 });
      const half = A.take(rows, 5_000);
      const [small, large] = bestTimes(half, rows);
      const ratio = large / small;
      assert.isAtMost(ratio, 2.5, `t(10k)/t(5k) = ${ratio}`);
    })
  );
});
