// The writer admits every node through `admission.admit`, its schema's public
// `make` (W3-b), and a node `make` validates and copies its whole input
// subtree, so admitting a node costs its subtree size. That stays linear only
// because a writer tree's depth is fixed by the construct (a table is five
// levels: root, table, row, cell, passthrough) and never by the input, so
// admission costs O(nodes), not O(nodes x depth) or O(nodes^2). This guard
// counts that work instead of timing it: a counting `admission.admit` adds the
// size of each subtree it is handed, then calls through.

import { GitHubMarkdown } from "@beep/github-reporting/GitHubMarkdown";
import { admission } from "@beep/github-reporting/internal/admission";
import { Html, Table, TableCell, TableRow } from "@beep/markdown/MarkdownNode";
import { assert, describe, it } from "@effect/vitest";
import * as Arbitrary from "effect/Arbitrary";
import * as A from "effect/Array";
import * as Context from "effect/Context";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import * as MutableRef from "effect/MutableRef";
import * as P from "effect/Predicate";
import * as S from "effect/Schema";

const Cell = S.String.check(S.isPattern(/^[a-z|\\` ]{1,12}$/u));
const Row = S.Tuple([Cell, Cell, Cell]);
const HEADERS = ["check", "state", "outcome"];

/**
 * Per row of three columns: three passthroughs (1 each), three cells (2
 * each), the row itself (7), and the same seven nodes walked again by the
 * table's and the root's admission. The header row costs the same, plus 1 for
 * the table and 2 for the root, which is the constant term.
 */
const PER_ROW = 3 * 1 + 3 * 2 + 7 + 7 + 7;

const childrenOf = (node: unknown): ReadonlyArray<unknown> =>
  P.hasProperty(node, "children") && A.isArray(node.children) ? node.children : A.empty();

const subtreeSize = (node: unknown): number =>
  A.reduce(childrenOf(node), 1, (size, child) => size + subtreeSize(child));

/**
 * The admission work of one build: the summed subtree sizes every node
 * admission was handed while it ran.
 *
 * **Gotchas**
 *
 * The counter replaces `admit` on the writer's own `admission` object, not on a schema's
 * `make`: `make` memoizes itself as a non-configurable own property on first
 * read, so under coverage's shared, non-isolated worker any earlier test that
 * built a table would make it impossible to wrap.
 */
class AdmissionCount extends Context.Service<
  AdmissionCount,
  { readonly admissionsOf: (build: () => unknown) => Effect.Effect<number> }
>()("@beep/github-reporting/test/GitHubMarkdown.admission.test/AdmissionCount") {
  static readonly layer = Layer.effect(
    AdmissionCount,
    Effect.acquireRelease(
      Effect.sync(() => {
        const tally = MutableRef.make(0);
        const admit = admission.admit;
        // A plain swap rather than `vi.spyOn`: a spy records every call's
        // arguments and result, which would retain each admitted tree.
        admission.admit = <Self extends S.Top>(schema: Self, input: Self["~type.make.in"]): Self["Type"] => {
          MutableRef.update(tally, (count) => count + subtreeSize(input));
          return admit(schema, input);
        };
        return {
          admit,
          service: AdmissionCount.of({
            admissionsOf: Effect.fn("AdmissionCount.admissionsOf")((build: () => unknown) =>
              Effect.sync(() => {
                MutableRef.set(tally, 0);
                build();
                return MutableRef.get(tally);
              })
            ),
          }),
        };
      }),
      ({ admit }) =>
        Effect.sync(() => {
          admission.admit = admit;
        })
    ).pipe(Effect.map(({ service }) => service))
  );
}

/**
 * A deliberately quadratic builder: it re-admits the growing table once per
 * row, the shape a fold over `Table` admission would take.
 */
const quadraticTable = (rows: ReadonlyArray<ReadonlyArray<string>>): Table => {
  const row = (values: ReadonlyArray<string>): TableRow =>
    admission.admit(TableRow, {
      children: A.map(values, (value) => admission.admit(TableCell, { children: [admission.admit(Html, { value })] })),
    });
  return A.reduce(rows, admission.admit(Table, { children: [row(HEADERS)] }), (table, values) =>
    admission.admit(Table, { children: [...table.children, row(values)] })
  );
};

describe("GitHubMarkdown admission", () => {
  it.layer(AdmissionCount.layer, { timeout: "5 seconds" })((it) => {
    it.effect("table admission work is exactly affine in rows: 30 node admissions per row on a fixed seed", () =>
      Effect.gen(function* () {
        const { admissionsOf } = yield* AdmissionCount;
        const rows = yield* Arbitrary.sampleEffect(Arbitrary.schema(Row), { count: 10_000, seed: 31 });
        const tableOf = (input: ReadonlyArray<ReadonlyArray<string>>) =>
          admissionsOf(() => GitHubMarkdown.table(HEADERS, input));
        const none = yield* tableOf(A.empty());
        const small = yield* tableOf(A.take(rows, 5_000));
        const large = yield* tableOf(rows);
        assert.strictEqual(none, PER_ROW + 3, "the header row, the table and the root");
        assert.strictEqual(small, none + PER_ROW * 5_000, `admissions(5k) = ${small}`);
        assert.strictEqual(large, none + PER_ROW * 10_000, `admissions(10k) = ${large}`);
      })
    );

    it.effect("the counter flags a builder that re-admits the growing table per row", () =>
      Effect.gen(function* () {
        const { admissionsOf } = yield* AdmissionCount;
        const rows = yield* Arbitrary.sampleEffect(Arbitrary.schema(Row), { count: 40, seed: 31 });
        const tableOf = (input: ReadonlyArray<ReadonlyArray<string>>) => admissionsOf(() => quadraticTable(input));
        const none = yield* tableOf(A.empty());
        const small = yield* tableOf(A.take(rows, 20));
        const large = yield* tableOf(rows);
        assert.isAbove(large - small, small - none, `second difference ${large - 2 * small + none}`);
      })
    );
  });
});
