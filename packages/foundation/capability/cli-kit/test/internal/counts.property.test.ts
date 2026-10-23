import { Counter, CountsRow, StatusRef } from "@beep/cli-kit/Doc";
import { columnLabel, counterLabel, countsTableOf, totalOf, visibleCountersOf } from "@beep/cli-kit/internal/counts";
import { StatusDef } from "@beep/cli-kit/Status";
import { fcRuns } from "@beep/fc-runs/FastCheckRuns";
import { assert, it } from "@effect/vitest";
import * as Arbitrary from "effect/Arbitrary";
import * as A from "effect/Array";
import * as Effect from "effect/Effect";
import * as S from "effect/Schema";
import type { Inline } from "@beep/cli-kit/Doc";

const runs = { arbitrary: fcRuns(100) };
const count = S.Int.check(S.isBetween({ minimum: 0, maximum: 100000 }));
const counter = (n: number): Counter =>
  Counter.make({
    key: "repos",
    label: { one: "repo", other: "repos" },
    n,
    status: StatusRef.make({ name: "ok", def: StatusDef.make({ glyph: "+", ascii: "+", token: "success", rank: 0 }) }),
  });
it.effect.prop(
  "counts tables preserve first-seen columns and first duplicate values, labels and tokens",
  [Arbitrary.schema(count), Arbitrary.schema(count)],
  ([first, second]) =>
    Effect.sync(() => {
      const duplicate = Counter.make({
        ...counter(999999),
        label: "ignored",
        status: StatusRef.make({
          name: "bad",
          def: StatusDef.make({ glyph: "-", ascii: "-", token: "failure", rank: 1 }),
        }),
      });
      const extra = Counter.make({ ...counter(7), key: "extra", label: "extras" });
      const table = countsTableOf({
        _tag: "CountsTable",
        rows: [
          CountsRow.make({ label: [], counters: [counter(first), duplicate, extra] }),
          CountsRow.make({ label: [], counters: [Counter.make({ ...duplicate, n: second }), counter(888888)] }),
          CountsRow.make({ label: [], counters: [] }),
        ],
        totalRow: true,
      });
      assert.deepStrictEqual<unknown>(table.columns, [
        { _tag: "Column", header: [] },
        { _tag: "Column", header: [{ _tag: "Text", value: "repos" }] },
        { _tag: "Column", header: [{ _tag: "Text", value: "extras" }] },
      ]);
      assert.deepStrictEqual(table.rows, [
        [
          [],
          [{ _tag: "Text", value: String(first), token: "success" }],
          [{ _tag: "Text", value: "7", token: "success" }],
        ],
        [[], [{ _tag: "Text", value: String(second), token: "failure" }], []],
        [[], [], []],
        [
          [{ _tag: "Text", value: "Total" }],
          [{ _tag: "Text", value: String(first + second) }],
          [{ _tag: "Text", value: "7" }],
        ],
      ]);
    }),
  runs
);
it.effect("counts-table key discovery and lookup scale with the input and emitted cells", () =>
  Effect.sync(() => {
    for (const size of [10, 20, 40]) {
      let reads = 0;
      const counters = A.makeBy(
        size,
        (index): Counter => ({
          ...counter(index),
          get key() {
            reads += 1;
            return `key_${index}`;
          },
        })
      );
      const table = countsTableOf({
        _tag: "CountsTable",
        rows: [CountsRow.make({ label: [], counters })],
        totalRow: true,
      });
      assert.lengthOf(table.columns, size + 1);
      assert.lengthOf(table.rows, 2);
      assert.deepStrictEqual(table.rows[0], [
        [],
        ...A.makeBy(size, (index): ReadonlyArray<Inline> => [{ _tag: "Text", value: String(index), token: "success" }]),
      ]);
      assert.isAtMost(reads, size * 4, "key reads remain linear when the column count doubles");
    }
  })
);
it.effect.prop(
  "counter labels preserve singular/plural semantics and number cells round-trip",
  [Arbitrary.schema(count)],
  ([n]) =>
    Effect.sync(() => {
      const c = counter(n);
      assert.strictEqual(counterLabel(c), n === 1 ? "repo" : "repos");
      assert.strictEqual(counterLabel(n)(c), counterLabel(c));
      assert.strictEqual(columnLabel(c), "repos");
      const block = { _tag: "Counts" as const, layout: "inline" as const, counters: [c] };
      assert.strictEqual<unknown>(totalOf(block), n);
      const visible = A.filter(block.counters, (counter) => counter.n !== 0 || counter.showZero === true);
      assert.deepStrictEqual(visibleCountersOf(block), visible);
      assert.deepStrictEqual(visible, n === 0 ? [] : [c]);
      assert.deepStrictEqual<unknown>(visibleCountersOf({ ...block, counters: visible }), visible);
      const table = countsTableOf({ _tag: "CountsTable", rows: [CountsRow.make({ label: [], counters: [c] })] });
      assert.deepStrictEqual(table.rows, [[[], [{ _tag: "Text", value: String(n), token: "success" }]]]);
      assert.strictEqual(Number(String(n)), n);
      assert.deepStrictEqual<unknown>(
        countsTableOf({
          _tag: "CountsTable",
          rows: [CountsRow.make({ label: [], counters: [counter(Number(String(n)))] })],
        }),
        table
      );
    }),
  runs
);
