/**
 * `@beep/github-reporting` GFM HTML differential oracle (wave 3-1, W3-b).
 *
 * Renders `GitHubMarkdown` writer output through micromark with the GFM
 * extension (the reference CommonMark + GFM implementation, independent of the
 * `@beep/markdown` engine the writer serializes through) and checks the
 * structure the writer promises, over many more generated inputs than the
 * in-package suite (`test/GitHubMarkdown.gfm.test.ts`, 100 runs a property):
 *
 * - a table keeps one row per input row and one cell per header, whatever the
 *   cells carry (pipes, backslashes, backticks, CR/LF, emphasis, angle brackets);
 * - `tableFor` over a row schema keeps the same shape;
 * - a fenced code block and inline code carry their content verbatim;
 * - every list item stays one item, multi-line items included;
 * - a heading renders as exactly one heading at its depth.
 *
 * Every property runs with a fixed seed, so the report is reproducible. The
 * script fails (non-zero exit) when any property is falsified or exhausted.
 *
 * Usage (from the repo root):
 *
 *   bun goals/effected-promotion/ops/github-reporting-gfm-differential.ts [--runs <n>] [--out <report.json>]
 *
 * Defaults: `--runs 5000`; without `--out` the report is printed.
 */
import { GitHubMarkdown } from "@beep/github-reporting/GitHubMarkdown";
import { NodeRuntime, NodeServices } from "@effect/platform-node";
import * as Arbitrary from "effect/Arbitrary";
import * as A from "effect/Array";
import * as Console from "effect/Console";
import * as Effect from "effect/Effect";
import * as FileSystem from "effect/FileSystem";
import { pipe } from "effect/Function";
import * as Layer from "effect/Layer";
import * as Num from "effect/Number";
import * as O from "effect/Option";
import * as S from "effect/Schema";
import * as Str from "effect/String";
import { micromark } from "micromark";
import micromarkPackage from "micromark/package.json" with { type: "json" };
import { gfm, gfmHtml } from "micromark-extension-gfm";
import gfmPackage from "micromark-extension-gfm/package.json" with { type: "json" };

const SEED = 31;

// --- report schema ------------------------------------------------------------

const PropertyOutcome = S.Literals(["passed", "falsified", "exhausted", "replay-mismatch"]);

const PropertyResult = S.Struct({
  id: S.NonEmptyString,
  outcome: PropertyOutcome,
  runs: S.Int,
  discards: S.Int,
  diagnostic: S.optionalKey(S.String),
});
type PropertyResult = typeof PropertyResult.Type;

const DifferentialReport = S.Struct({
  schemaVersion: S.tag(1),
  oracle: S.Struct({ micromark: S.String, "micromark-extension-gfm": S.String }),
  seed: S.Int,
  runsPerProperty: S.Int,
  properties: S.Array(PropertyResult),
  failures: S.Int,
});
type DifferentialReport = typeof DifferentialReport.Type;

const encodeReport = S.encodeEffect(S.fromJsonString(DifferentialReport, { space: 2 }));

// --- the reference renderer ---------------------------------------------------

/** GitHub renders raw HTML (`<br>`, `<details>`), so the reference does too. */
const html = (markdown: string): string =>
  micromark(markdown, { allowDangerousHtml: true, extensions: [gfm()], htmlExtensions: [gfmHtml()] });

/** The text micromark emits for literal content. */
const escapeHtml = (text: string): string =>
  pipe(
    text,
    Str.replaceAll("&", "&amp;"),
    Str.replaceAll("<", "&lt;"),
    Str.replaceAll(">", "&gt;"),
    Str.replaceAll('"', "&quot;")
  );

const occurrences = (text: string, needle: string): number => Str.split(text, needle).length - 1;

/** Cell count of every rendered table row, header row first. */
const rowShape = (rendered: string): ReadonlyArray<number> =>
  A.map(A.drop(Str.split(rendered, "<tr>"), 1), (row) => Str.split(row, /<t[hd]>/).length - 1);

const tableKeepsShape = (rendered: string, rows: number, columns: number): boolean =>
  occurrences(rendered, "<table>") === 1 &&
  A.makeEquivalence(Num.Equivalence)(
    rowShape(rendered),
    A.makeBy(rows + 1, () => columns)
  );

// --- generators -----------------------------------------------------------------

// Cell text drawn from the characters that threaten GFM table structure.
const HostileCell = S.String.check(S.isPattern(/^[a-z|\\` \n\r*_<>[\]()!#-]{0,24}$/u));
const FenceContent = S.String.check(S.isPattern(/^[a-z`~ ]{1,12}(?:\n[a-z`~ ]{1,12}){0,5}$/u));
const BacktickText = S.String.check(S.isPattern(/^[a-z` ]{0,15}[a-z`]$/u));
const ItemText = S.String.check(S.isPattern(/^[a-z]{1,8}(?:\r?\n[a-z]{1,8}){0,3}$/u));
const HeadingText = S.String.check(S.isPattern(/^[a-z*_`]{1,8}(?:(?:\r\n|\r|\n)[a-z]{1,8}){0,2}$/u));
const HostileRows = S.Tuple([HostileCell, HostileCell, HostileCell]).pipe(S.Array);
const Items = ItemText.pipe(S.NonEmptyArray);
const Row = S.Struct({ check: HostileCell, detail: HostileCell });
const Depth = S.Literals([1, 2, 3, 4, 5, 6]);

// --- properties -----------------------------------------------------------------

const checkProperty = Effect.fnUntraced(function* <A>(
  id: string,
  arbitrary: Arbitrary.Arbitrary<A>,
  property: (value: A) => boolean,
  runs: number
) {
  const result = yield* Arbitrary.checkEffect(arbitrary, property, { runs, seed: SEED });
  const diagnostic = O.fromNullishOr(Arbitrary.formatCheckFailure(result));
  const base = O.match(diagnostic, { onNone: () => ({}), onSome: (text) => ({ diagnostic: text }) });
  switch (result._tag) {
    case "Passed":
      return { id, outcome: "passed", runs: result.runs, discards: result.discards, ...base } satisfies PropertyResult;
    case "Falsified":
      return {
        id,
        outcome: "falsified",
        runs: result.runs,
        discards: result.discards,
        ...base,
      } satisfies PropertyResult;
    case "Exhausted":
      return {
        id,
        outcome: "exhausted",
        runs: result.runs,
        discards: result.discards,
        ...base,
      } satisfies PropertyResult;
    case "ReplayMismatch":
      return { id, outcome: "replay-mismatch", runs: 0, discards: 0, ...base } satisfies PropertyResult;
  }
});

const properties = (runs: number) =>
  Effect.all(
    [
      checkProperty(
        "table: one row per input row, one cell per header",
        Arbitrary.schema(HostileRows),
        (rows) => tableKeepsShape(html(GitHubMarkdown.table(["a", "b", "c"], rows)), rows.length, 3),
        runs
      ),
      checkProperty(
        "tableFor: one row per input row, one cell per field",
        Arbitrary.schema(S.Array(Row)),
        (rows) => tableKeepsShape(html(GitHubMarkdown.tableFor(Row).render(rows)), rows.length, 2),
        runs
      ),
      checkProperty(
        "codeBlock: content verbatim, fences inside included",
        Arbitrary.schema(FenceContent),
        (content) =>
          html(GitHubMarkdown.codeBlock(content, "text")) ===
          `<pre><code class="language-text">${escapeHtml(content)}\n</code></pre>`,
        runs
      ),
      checkProperty(
        "code: inline content verbatim, backticks inside included",
        Arbitrary.schema(BacktickText),
        (text) => html(GitHubMarkdown.code(text)) === `<p><code>${escapeHtml(text)}</code></p>`,
        runs
      ),
      checkProperty(
        "list: every item stays one item",
        Arbitrary.schema(S.Tuple([Items, S.Boolean])),
        ([items, ordered]) => {
          const rendered = html(GitHubMarkdown.list(items, { ordered }));
          return (
            occurrences(rendered, "<li>") === items.length && occurrences(rendered, ordered ? "<ol>" : "<ul>") === 1
          );
        },
        runs
      ),
      checkProperty(
        "heading: exactly one heading at its depth",
        Arbitrary.schema(S.Tuple([HeadingText, Depth])),
        ([text, depth]) => {
          const rendered = html(GitHubMarkdown.heading(text, depth));
          return occurrences(rendered, `<h${depth}>`) === 1 && occurrences(rendered, "<h") === 1;
        },
        runs
      ),
    ],
    { concurrency: 1 }
  );

// --- entry point ------------------------------------------------------------------

const argv = A.drop(process.argv, 2);
const flag = (name: string): O.Option<string> =>
  pipe(
    A.findFirstIndex(argv, (arg) => arg === name),
    O.flatMap((index) => A.get(argv, index + 1))
  );

const program = Effect.gen(function* () {
  const fileSystem = yield* FileSystem.FileSystem;
  const runs = pipe(
    flag("--runs"),
    O.flatMap(Num.parse),
    O.getOrElse(() => 5000)
  );
  const results = yield* properties(runs);
  const failures = A.filter(results, (result) => result.outcome !== "passed").length;
  const report: DifferentialReport = {
    schemaVersion: 1,
    oracle: { micromark: micromarkPackage.version, "micromark-extension-gfm": gfmPackage.version },
    seed: SEED,
    runsPerProperty: runs,
    properties: results,
    failures,
  };
  const json = yield* encodeReport(report);
  yield* O.match(flag("--out"), {
    onNone: () => Console.log(json),
    onSome: (path) => fileSystem.writeFileString(path, `${json}\n`),
  });
  for (const result of results) {
    yield* Console.log(`${result.outcome === "passed" ? "ok  " : "FAIL"} ${result.id} (${result.runs} runs)`);
  }
  if (failures > 0) {
    return yield* Effect.fail(`${failures} differential properties failed`);
  }
});

// The entry point builds the platform services once and runs the program in their context.
NodeRuntime.runMain(
  Layer.build(NodeServices.layer).pipe(
    Effect.flatMap((services) => program.pipe(Effect.provide(services))),
    Effect.scoped
  )
);
