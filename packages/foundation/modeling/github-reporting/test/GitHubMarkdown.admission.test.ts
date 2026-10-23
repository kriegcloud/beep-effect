// The writer builds every node through its public `make` (W3-b), and a node
// `make` validates and copies its whole input subtree, so admitting a node
// costs its subtree size. That stays linear only because a writer tree's depth
// is fixed by the construct (a table is five levels: root, table, row, cell,
// passthrough) and never by the input, so admission costs O(nodes), not
// O(nodes x depth) or O(nodes^2). This guard counts that work instead of
// timing it: every table node class gets a counting `make` that adds the size
// of the subtree it is handed, then delegates to the schema's own constructor.

import { GitHubMarkdown } from "@beep/github-reporting/GitHubMarkdown";
import { Html, Root, Table, TableCell, TableRow } from "@beep/markdown/MarkdownNode";
import { assert, describe, it } from "@effect/vitest";
import * as Arbitrary from "effect/Arbitrary";
import * as A from "effect/Array";
import * as Context from "effect/Context";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import * as MutableRef from "effect/MutableRef";
import * as P from "effect/Predicate";
import * as S from "effect/Schema";
import * as SchemaParser from "effect/SchemaParser";

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

const ADMITTING = [Html, TableCell, TableRow, Table, Root] as const;

const childrenOf = (node: unknown): ReadonlyArray<unknown> =>
  P.hasProperty(node, "children") && A.isArray(node.children) ? node.children : A.empty();

const subtreeSize = (node: unknown): number =>
  A.reduce(childrenOf(node), 1, (size, child) => size + subtreeSize(child));

const counting = <Self extends S.Top>(schema: Self, tally: MutableRef.MutableRef<number>) => {
  const make = SchemaParser.make(schema);
  return (input: Self["~type.make.in"], options?: S.MakeOptions): Self["Type"] => {
    MutableRef.update(tally, (count) => count + subtreeSize(input));
    return make(input, options);
  };
};

/**
 * The admission work of one build: the summed subtree sizes every table node
 * `make` was handed while it ran.
 *
 * **Gotchas**
 *
 * A schema's `make` is a getter that memoizes itself as a non-configurable own
 * property on first access, so the layer must install the counting `make`
 * before anything in this file touches a table node's `make`; installing it
 * afterwards throws instead of silently counting nothing. Releasing the layer
 * removes the own property, which puts the memoizing getter back.
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
        A.forEach(ADMITTING, (schema) =>
          Object.defineProperty(schema, "make", { configurable: true, value: counting(schema, tally) })
        );
        return AdmissionCount.of({
          admissionsOf: Effect.fn("AdmissionCount.admissionsOf")((build: () => unknown) =>
            Effect.sync(() => {
              MutableRef.set(tally, 0);
              build();
              return MutableRef.get(tally);
            })
          ),
        });
      }),
      () => Effect.sync(() => A.forEach(ADMITTING, (schema) => Reflect.deleteProperty(schema, "make")))
    )
  );
}

/**
 * A deliberately quadratic builder: it re-admits the growing table once per
 * row, the shape a fold over `Table.make` would take.
 */
const quadraticTable = (rows: ReadonlyArray<ReadonlyArray<string>>): Table => {
  const row = (values: ReadonlyArray<string>): TableRow =>
    TableRow.make({
      children: A.map(values, (value) => TableCell.make({ children: [Html.make({ value })] })),
    });
  return A.reduce(rows, Table.make({ children: [row(HEADERS)] }), (table, values) =>
    Table.make({ children: [...table.children, row(values)] })
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
