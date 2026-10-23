/**
 * `@beep/cli-kit` operation-count bench (wave 4, 4-C, W4-d).
 *
 * Counts work, never wall-clock time. Each workload renders a document (or
 * measures a string) at four doubling sizes and records two operation counts
 * per size: grapheme-segmenter calls (`Intl.Segmenter#segment`) and graphemes
 * the renderer iterates, which is where the width, truncation and wrapping
 * passes spend their work. Both counters wrap the segmenter prototype before
 * the package is imported, so the package code is unchanged.
 *
 * The report records each size's counts and the growth ratio of every
 * doubling. A workload whose ratio exceeds 2.25 is super-linear and fails the
 * run. With `--compare <baseline.json>` every count must also be at most the
 * baseline's: a refactor may remove work, never add it.
 *
 * Usage (from the repo root):
 *
 *   bun goals/effected-promotion/ops/cli-kit-bench.ts [--out <report.json>] [--compare <baseline.json>]
 */

import { NodeRuntime, NodeServices } from "@effect/platform-node";
import * as A from "effect/Array";
import * as Console from "effect/Console";
import * as Data from "effect/Data";
import * as Effect from "effect/Effect";
import * as FileSystem from "effect/FileSystem";
import * as O from "effect/Option";
import * as S from "effect/Schema";

// --- counters (installed before the package loads) ---------------------------

const counts = { segmentCalls: 0, graphemes: 0 };
const segment = Intl.Segmenter.prototype.segment;
Intl.Segmenter.prototype.segment = function (this: Intl.Segmenter, input: string): Intl.Segments {
  counts.segmentCalls += 1;
  const segments = segment.call(this, input);
  const iterate = segments[Symbol.iterator].bind(segments);
  return Object.assign(Object.create(segments) as Intl.Segments, {
    [Symbol.iterator]: function* () {
      for (const value of iterate()) {
        counts.graphemes += 1;
        yield value;
      }
    },
  });
};

const { Doc, Fmt, Render } = await import("@beep/cli-kit");

// --- report schema ------------------------------------------------------------

const SizeCount = S.Struct({ size: S.Int, segmentCalls: S.Int, graphemes: S.Int, outputChars: S.Int });
const WorkloadResult = S.Struct({
  id: S.NonEmptyString,
  sizes: S.Array(SizeCount),
  maxGrowth: S.Finite,
  linear: S.Boolean,
});
const BenchReport = S.Struct({
  schemaVersion: S.tag("cli-kit-bench/v1"),
  growthLimit: S.Finite,
  workloads: S.Array(WorkloadResult),
});
type BenchReport = typeof BenchReport.Type;

class BenchFailed extends Data.TaggedError("BenchFailed")<{ readonly problems: ReadonlyArray<string> }> {}

// --- workloads -------------------------------------------------------------------

const SIZES = [100, 200, 400, 800] as const;
const GROWTH_LIMIT = 2.25;
const WORDS = ["alpha", "βeta", "界面", "emoji🙂", "plain", "wide全角", "x"];
const word = (i: number): string => WORDS[i % WORDS.length] ?? "x";
const plainContext = Render.contextOf({ audience: "human", width: 80 });
const ansiContext = Render.contextOf({ audience: "human", width: 80, color: "basic" });

const tableDoc = (rows: number) => [
  Doc.table(
    [{ header: "Name" }, { header: "Kind" }, { header: "Files", align: "right" }, { header: "Note" }],
    A.makeBy(rows, (i) => [
      word(i),
      word(i + 1),
      `${i}`,
      A.join(
        A.makeBy(6, (j) => word(i + j)),
        " "
      ),
    ])
  ),
];
const paragraphDoc = (words: number) => [Doc.paragraph(A.join(A.makeBy(words, word), " "))];
const listDoc = (items: number) => [Doc.list(A.makeBy(items, (i) => Doc.paragraph(`${word(i)} item ${i}`)))];

const WORKLOADS: ReadonlyArray<{ readonly id: string; readonly run: (size: number) => string }> = [
  { id: "table/plain", run: (n) => Render.plain(tableDoc(n), plainContext) },
  { id: "table/ansi", run: (n) => Render.ansi(tableDoc(n), ansiContext) },
  { id: "table/markdown", run: (n) => Render.markdown(tableDoc(n), plainContext) },
  { id: "paragraph/plain-wrap", run: (n) => Render.plain(paragraphDoc(n), plainContext) },
  { id: "list/plain", run: (n) => Render.plain(listDoc(n), plainContext) },
  { id: "fmt/width", run: (n) => `${Fmt.width(A.join(A.makeBy(n, word), " "))}` },
  { id: "fmt/truncate", run: (n) => Fmt.truncate(A.join(A.makeBy(n, word), " "), n) },
  {
    id: "fmt/sanitize",
    run: (n) =>
      Fmt.sanitize(
        A.join(
          A.makeBy(n, (i) => `${word(i)}\t\u001b[31m`),
          ""
        )
      ),
  },
];

const measure = (workload: (typeof WORKLOADS)[number]) => {
  const sizes = A.map(SIZES, (size) => {
    counts.segmentCalls = 0;
    counts.graphemes = 0;
    const output = workload.run(size);
    return { size, segmentCalls: counts.segmentCalls, graphemes: counts.graphemes, outputChars: output.length };
  });
  const ratios = A.flatMap(A.zip(sizes, A.drop(sizes, 1)), ([small, large]) =>
    A.map([small.segmentCalls, small.graphemes] as const, (before, index) => {
      const after = index === 0 ? large.segmentCalls : large.graphemes;
      return before === 0 ? (after === 0 ? 1 : Number.POSITIVE_INFINITY) : after / before;
    })
  );
  const maxGrowth = A.reduce(ratios, 0, (largest, ratio) => Math.max(largest, ratio));
  return { id: workload.id, sizes, maxGrowth, linear: maxGrowth <= GROWTH_LIMIT };
};

const flag = (name: string): O.Option<string> => {
  const index = process.argv.indexOf(name);
  return index < 0 ? O.none() : O.fromUndefinedOr(process.argv[index + 1]);
};

const program = Effect.gen(function* () {
  const fs = yield* FileSystem.FileSystem;
  const report: BenchReport = {
    schemaVersion: "cli-kit-bench/v1",
    growthLimit: GROWTH_LIMIT,
    workloads: A.map(WORKLOADS, measure),
  };
  const problems = A.map(
    A.filter(report.workloads, (workload) => !workload.linear),
    (workload) => `${workload.id}: growth ${workload.maxGrowth.toFixed(2)} per doubling exceeds ${GROWTH_LIMIT}`
  );
  const baseline = flag("--compare");
  if (O.isSome(baseline)) {
    const previous = yield* S.decodeUnknownEffect(S.fromJsonString(BenchReport))(
      yield* fs.readFileString(baseline.value)
    );
    for (const workload of report.workloads) {
      const before = A.findFirst(previous.workloads, (row) => row.id === workload.id);
      if (O.isNone(before)) continue;
      for (const [now, then] of A.zip(workload.sizes, before.value.sizes)) {
        if (now.segmentCalls > then.segmentCalls || now.graphemes > then.graphemes)
          problems.push(
            `${workload.id} @${now.size}: ${now.segmentCalls}/${now.graphemes} ops > baseline ${then.segmentCalls}/${then.graphemes}`
          );
      }
    }
  }
  for (const workload of report.workloads) {
    const last = A.lastNonEmpty(workload.sizes as A.NonEmptyReadonlyArray<typeof SizeCount.Type>);
    yield* Console.log(
      `${workload.id.padEnd(22)} @${last.size}: ${last.segmentCalls} segment calls, ${last.graphemes} graphemes; max growth ${workload.maxGrowth.toFixed(2)}`
    );
  }
  const out = flag("--out");
  if (O.isSome(out))
    yield* fs.writeFileString(out.value, `${yield* S.encodeEffect(S.fromJsonString(BenchReport))(report)}\n`);
  if (A.isReadonlyArrayNonEmpty(problems)) return yield* new BenchFailed({ problems });
  yield* Console.log(`cli-kit bench: every workload is linear${O.isSome(baseline) ? " and within the baseline" : ""}`);
});

NodeRuntime.runMain(program.pipe(Effect.provide(NodeServices.layer)));
