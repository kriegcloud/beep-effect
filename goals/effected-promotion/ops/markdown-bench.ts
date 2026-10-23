/**
 * `@beep/markdown` benchmark gate (wave 2d, D-40).
 *
 * Measures parse and stringify cost on fixed corpora as the median of N timed
 * samples after warmup, and writes a schema-validated JSON report. With
 * `--compare <baseline.json>` it re-measures every baseline corpus with the
 * baseline's iteration counts, prints a table, and fails when a corpus is more
 * than 10% slower than the baseline or a depth series grows faster than linear
 * (t(256)/t(128) > 2.5).
 *
 * Noise control for a shared workstation: samples are taken in interleaved
 * rounds, each corpus sample is paired with a machine-speed reference sample
 * taken just before it, and the gate compares the median of sample/reference
 * (`relativeCost`). Raw medians are reported beside it. The macro run happens
 * in a child process so its heap does not change the micro measurements.
 *
 * Timing stays out of CI: the vitest growth-ratio guards are the CI proof, and
 * this script's output rides in the PR body.
 *
 * Usage (from the repo root):
 *
 *   bun goals/effected-promotion/ops/markdown-bench.ts [--out <report.json>] [--macro]
 *   bun goals/effected-promotion/ops/markdown-bench.ts --compare <baseline.json> [--out <report.json>]
 *
 * Flags: `--runs <n>` (default 31; D-40 asks for at least 15, and 31 keeps the
 * baseline-to-compare spread near 5%), `--warmup <n>` (default 3),
 * `--min-sample-ms <n>` (default 500; each timed sample repeats the corpus until
 * it reaches this duration, so small inputs are not timer noise), `--macro`
 * (also parse every git-tracked `*.md` file outside `scratchpad/` once and
 * record total ms and peak RSS; informational, never gated).
 */
import { fileURLToPath } from "node:url";
import { Markdown, MarkdownParseOptions } from "@beep/markdown/Markdown";
import { InlineCode, Paragraph, Root, Text } from "@beep/markdown/MarkdownNode";
import { NodeRuntime, NodeServices } from "@effect/platform-node";
import * as A from "effect/Array";
import * as Console from "effect/Console";
import * as Data from "effect/Data";
import * as DateTime from "effect/DateTime";
import * as Effect from "effect/Effect";
import * as FileSystem from "effect/FileSystem";
import { pipe } from "effect/Function";
import * as Layer from "effect/Layer";
import * as Num from "effect/Number";
import * as O from "effect/Option";
import * as Order from "effect/Order";
import * as Path from "effect/Path";
import * as ChildProcess from "effect/process/ChildProcess";
import * as ChildProcessSpawner from "effect/process/ChildProcessSpawner";
import * as Result from "effect/Result";
import * as S from "effect/Schema";
import * as Str from "effect/String";
import { PATHOLOGICAL_CASES } from "../../../packages/foundation/modeling/markdown/test/support/pathological/cases.ts";

// --- report schema ------------------------------------------------------------

const BenchOperation = S.Literals(["parse", "stringify"]);
const BenchOutcome = S.Literals(["ok", "refused"]);

const CorpusResult = S.Struct({
  id: S.NonEmptyString,
  group: S.Literals(["conformance", "depth", "wide", "pathological", "stringify-scalability"]),
  operation: BenchOperation,
  outcome: BenchOutcome,
  bytes: S.Finite,
  iterations: S.Int,
  runs: S.Int,
  medianMs: S.Finite,
  minMs: S.Finite,
  maxMs: S.Finite,
  spreadPct: S.Finite,
  throughputMBps: S.Finite,
  relativeCost: S.Finite,
  relativeSpreadPct: S.Finite,
});
type CorpusResult = typeof CorpusResult.Type;

const DepthRatio = S.Struct({
  series: S.NonEmptyString,
  operation: BenchOperation,
  t128Ms: S.Finite,
  t256Ms: S.Finite,
  ratio: S.Finite,
});
type DepthRatio = typeof DepthRatio.Type;

const MacroRun = S.Struct({
  scope: S.NonEmptyString,
  files: S.Int,
  bytes: S.Finite,
  failures: S.Int,
  totalMs: S.Finite,
  slowestFileMs: S.Finite,
  peakRssBytes: S.Finite,
  gated: S.tag(false),
});

const BenchReport = S.Struct({
  schemaVersion: S.tag(1),
  // Bumped whenever a corpus definition changes, so a compare never pairs two
  // reports that measured different trees. Reports written before version 2
  // carry no field and are refused by --compare.
  workloadVersion: S.optionalKey(S.Int),
  // `git rev-parse HEAD` of the checkout that produced the report.
  commit: S.optionalKey(S.NonEmptyString),
  tool: S.NonEmptyString,
  generatedAt: S.NonEmptyString,
  runtime: S.Struct({
    bun: S.NonEmptyString,
    effect: S.NonEmptyString,
    platform: S.NonEmptyString,
    arch: S.NonEmptyString,
  }),
  config: S.Struct({
    runs: S.Int,
    warmup: S.Int,
    minSampleMs: S.Finite,
    thresholds: S.Struct({ maxSlowdownPct: S.Finite, maxDepthRatio: S.Finite }),
  }),
  reference: S.Struct({ description: S.NonEmptyString, iterations: S.Int, medianMs: S.Finite }),
  corpora: S.Array(CorpusResult),
  depthRatios: S.Array(DepthRatio),
  macro: S.optionalKey(MacroRun),
});
type BenchReport = typeof BenchReport.Type;

const BenchReportJson = S.fromJsonString(BenchReport, { space: 2 });
const MacroRunJson = S.fromJsonString(MacroRun);
const decodeReport = S.decodeEffect(BenchReportJson);
const encodeReport = S.encodeEffect(BenchReportJson);
const EffectPackageVersion = S.Struct({ version: S.NonEmptyString }).pipe(S.fromJsonString);
const SpecExamples = S.Struct({ markdown: S.String }).pipe(S.Array, S.fromJsonString);

class MarkdownBenchRegression extends Data.TaggedError("MarkdownBenchRegression")<{
  readonly failures: ReadonlyArray<string>;
}> {}

class MarkdownBenchUsage extends Data.TaggedError("MarkdownBenchUsage")<{
  readonly message: string;
}> {}

// --- configuration ------------------------------------------------------------

const TOOL = "goals/effected-promotion/ops/markdown-bench.ts";
// 1: the move-commit baseline (table-150000-rows built from one shared
//    TableRow.make value).
// 2: table-150000-rows is parsed from generated markdown, so its tree has the
//    same shape whatever `make` does with node identity.
const WORKLOAD_VERSION = 2;
const MAX_SLOWDOWN_PCT = 10;
const MAX_DEPTH_RATIO = 2.5;
const DEPTHS = A.make(32, 64, 128, 256);
const NESTED_COPIES = 200;
const CONFORMANCE_COPIES = 50;
const WIDE_PARAGRAPHS = 5_000;
const repoRoot = fileURLToPath(new URL("../../..", import.meta.url));
const scriptPath = fileURLToPath(new URL(import.meta.url));
const packageRoot = `${repoRoot}packages/foundation/modeling/markdown`;
const commonmark = MarkdownParseOptions.make({ dialect: "commonmark" });
const gfm = MarkdownParseOptions.make({ dialect: "gfm" });
const gfmWithFrontmatter = MarkdownParseOptions.make({ dialect: "gfm", frontmatter: true });

const argv = A.drop(process.argv, 2);
const flagValue = (name: string): O.Option<string> =>
  pipe(
    A.findFirstIndex(argv, (arg) => arg === name),
    O.flatMap((index) => A.get(argv, index + 1))
  );
const hasFlag = (name: string): boolean => A.contains(argv, name);
const numericFlag = (name: string, fallback: number): number =>
  pipe(
    flagValue(name),
    O.flatMap(Num.parse),
    O.getOrElse(() => fallback)
  );

const runs = numericFlag("--runs", 31);
const warmup = numericFlag("--warmup", 3);
const minSampleMs = numericFlag("--min-sample-ms", 500);

// --- workloads ----------------------------------------------------------------

type Workload =
  | {
      readonly _tag: "parse";
      readonly id: string;
      readonly group: CorpusResult["group"];
      readonly text: string;
      readonly options: MarkdownParseOptions;
    }
  | {
      readonly _tag: "stringify";
      readonly id: string;
      readonly group: CorpusResult["group"];
      readonly root: Root;
      readonly bytes: number;
    };

const utf8Bytes = (text: string): number => Buffer.byteLength(text, "utf8");

const repeatJoined = (text: string, copies: number, separator: string): string =>
  A.join(A.replicate(text, copies), separator);

// One container chain per copy; a column-0 paragraph closes every container,
// so the copies never merge and the depth stays exactly `levels`.
const nestedDocument = (marker: string, levels: number): string =>
  repeatJoined(`${Str.repeat(levels)(marker)}a`, NESTED_COPIES, "\n\nx\n\n");

// Five inline nodes per paragraph: emphasis, inline code, strong, link, inline code.
const wideDocument = repeatJoined("*a*`b`**c**[d](e)`f`", WIDE_PARAGRAPHS, "\n\n");

// The machine-speed reference: a fixed pure-JS scan with steady allocation
// that never touches @beep/markdown. Each corpus sample is divided by a
// reference sample taken just before it, so load from other processes on a
// shared workstation cancels out of the gated cost while a slower package
// still shows up.
const REFERENCE_DESCRIPTION = "pure-JS character hash over the wide corpus with one small object per character";
const referenceSlots = A.makeBy(1024, () => ({ index: 0, hash: 0 }));
const referenceOnce = (): number => {
  let hash = 0;
  for (let index = 0; index < wideDocument.length; index += 1) {
    hash = (hash * 31 + (wideDocument[index] === "*" ? 7 : 3)) | 0;
    referenceSlots[index & 1023] = { index, hash };
  }
  return hash;
};

const runOnce = (workload: Workload): boolean =>
  workload._tag === "parse"
    ? Result.isSuccess(Markdown.parseResult(workload.text, workload.options))
    : Result.isSuccess(Markdown.stringifyResult(workload.root));

const workloadBytes = (workload: Workload): number =>
  workload._tag === "parse" ? utf8Bytes(workload.text) : workload.bytes;

const parseWorkload = (
  id: string,
  group: CorpusResult["group"],
  text: string,
  options: MarkdownParseOptions
): Workload => ({ _tag: "parse", id, group, text, options });

// Stringify workloads reuse a parse workload's tree; the byte count is the
// serialized output, so throughput reads as output produced per second.
const stringifyOf = (workload: Workload): O.Option<Workload> =>
  workload._tag === "parse"
    ? pipe(
        Markdown.parseResult(workload.text, workload.options),
        Result.getSuccess,
        O.flatMap((root) =>
          pipe(
            Markdown.stringifyResult(root),
            Result.getSuccess,
            O.map(
              (serialized): Workload => ({
                _tag: "stringify",
                id: workload.id,
                group: workload.group,
                root,
                bytes: utf8Bytes(serialized),
              })
            )
          )
        )
      )
    : O.none();

const TABLE_ROWS = 150_000;

// The table is parsed, not built with `make`: the move commit's `make` keeps a
// shared row by reference and an S.Opaque `make` copies it, so a `make`-built
// tree with one shared row has a different shape on each side of the
// conversion. Parsing gives one distinct one-cell row per line on both sides.
// The header row counts toward the 150 000 rows. Parsing is not timed.
const tableDocument = A.join(A.appendAll(["|  |", "| --- |"], A.replicate("|  |", TABLE_ROWS - 1)), "\n");

const stringifyScalability = (table: Root): ReadonlyArray<Workload> => {
  const textSiblings = A.map(A.make(4_000, 8_000, 16_000), (size) => ({
    size,
    root: Root.make({ children: [Paragraph.make({ children: A.makeBy(size, () => Text.make({ value: "x" })) })] }),
  }));
  const inlineCode = Root.make({
    children: [Paragraph.make({ children: A.makeBy(10_000, () => InlineCode.make({ value: "x" })) })],
  });
  const stringified = (id: string, root: Root): Workload => ({
    _tag: "stringify",
    id,
    group: "stringify-scalability",
    root,
    bytes: pipe(
      Markdown.stringifyResult(root),
      Result.map(utf8Bytes),
      Result.getOrElse(() => 0)
    ),
  });
  return A.flatten([
    [stringified("table-150000-rows", table)],
    A.map(textSiblings, ({ size, root }) => stringified(`text-siblings-${size}`, root)),
    [stringified("inline-code-siblings-10000", inlineCode)],
  ]);
};

const slug = (name: string): string =>
  pipe(Str.toLowerCase(name), Str.replaceAll(/[^a-z0-9]+/g, "-"), Str.replace(/^-+|-+$/g, ""));

const loadWorkloads = Effect.fn("MarkdownBench.loadWorkloads")(function* () {
  const fileSystem = yield* FileSystem.FileSystem;
  const pathApi = yield* Path.Path;
  const examples = Effect.fn("MarkdownBench.examples")(function* (relativePath: string) {
    const raw = yield* fileSystem.readFileString(pathApi.join(packageRoot, "data/conformance", relativePath));
    const decoded = yield* S.decodeEffect(SpecExamples)(raw);
    return repeatJoined(
      A.join(
        A.map(decoded, (example) => example.markdown),
        "\n\n"
      ),
      CONFORMANCE_COPIES,
      "\n\n"
    );
  });
  const conformance = A.make(
    parseWorkload("commonmark-spec-x50", "conformance", yield* examples("commonmark/spec.json"), commonmark),
    parseWorkload("gfm-spec-extensions-x50", "conformance", yield* examples("gfm/spec-extensions.json"), gfm),
    parseWorkload("gfm-extensions-x50", "conformance", yield* examples("gfm/extensions.json"), gfm)
  );
  // Depth is tree depth as the parse guard counts it: the root and the leaf
  // paragraph take two levels, and a list level opens two containers (list
  // and item). Depth 256 is MAX_NESTING_DEPTH, the deepest input that parses.
  const depth = A.flatMap(DEPTHS, (treeDepth) =>
    A.make(
      parseWorkload(`blockquote-depth-${treeDepth}`, "depth", nestedDocument("> ", treeDepth - 2), gfm),
      parseWorkload(`list-depth-${treeDepth}`, "depth", nestedDocument("- ", (treeDepth - 2) / 2), gfm)
    )
  );
  const wide = A.make(parseWorkload(`wide-${WIDE_PARAGRAPHS}x5`, "wide", wideDocument, gfm));
  // The case index keeps ids unique: two upstream names slug to the same text.
  const pathological = A.map(PATHOLOGICAL_CASES, (testCase, index) =>
    parseWorkload(
      `pathological-${Str.padStart(2, "0")(`${index + 1}`)}-${slug(testCase.name)}`,
      "pathological",
      testCase.input,
      testCase.dialect === "gfm" ? gfm : commonmark
    )
  );
  const parses = A.flatten([conformance, depth, wide, pathological]);
  const stringifies = A.getSomes(A.map(A.flatten([conformance, depth, wide]), stringifyOf));
  // A parse failure aborts the run instead of timing an empty tree.
  const table = yield* Effect.fromResult(Markdown.parseResult(tableDocument, gfm));
  return A.flatten([parses, stringifies, stringifyScalability(table)]);
});

// --- measurement --------------------------------------------------------------

const collectGarbage = (): void => {
  Bun.gc(true);
};

const sampleMs = (workload: Workload, iterations: number): number => {
  collectGarbage();
  const started = performance.now();
  for (let iteration = 0; iteration < iterations; iteration += 1) {
    runOnce(workload);
  }
  return (performance.now() - started) / iterations;
};

const referenceSampleMs = (iterations: number): number => {
  const started = performance.now();
  for (let iteration = 0; iteration < iterations; iteration += 1) {
    referenceOnce();
  }
  return (performance.now() - started) / iterations;
};

const REFERENCE_SAMPLE_MS = 50;

const referenceIterations = (): number => {
  A.forEach(
    A.makeBy(warmup, () => 50),
    (count) => {
      referenceSampleMs(count);
    }
  );
  return Math.max(1, Math.ceil(REFERENCE_SAMPLE_MS / Math.max(referenceSampleMs(50), 0.001)));
};

const iterationsFor = (perIterationMs: number): number =>
  Math.max(1, Math.ceil(minSampleMs / Math.max(perIterationMs, 0.001)));

const quantile = (sorted: ReadonlyArray<number>, q: number): number => {
  const position = (A.length(sorted) - 1) * q;
  const lower = Math.floor(position);
  const upper = Math.ceil(position);
  const at = (index: number): number => O.getOrElse(A.get(sorted, index), () => 0);
  return at(lower) + (at(upper) - at(lower)) * (position - lower);
};

interface Prepared {
  readonly iterations: number;
  readonly ok: boolean;
  readonly workload: Workload;
}

const prepare = Effect.fn("MarkdownBench.prepare")(function* (workload: Workload, iterationsHint: O.Option<number>) {
  const ok = runOnce(workload);
  // A cold single run sizes the warmup and a warm sample sizes the timed
  // iteration count. Both always run, so a compare (which reuses the
  // baseline's counts) warms the engine exactly as the baseline did.
  const cold = iterationsFor(sampleMs(workload, 1));
  A.forEach(
    A.makeBy(warmup, () => cold),
    (count) => {
      sampleMs(workload, count);
    }
  );
  const calibrated = iterationsFor(sampleMs(workload, cold));
  const iterations = O.getOrElse(iterationsHint, () => calibrated);
  yield* Console.error(`warm ${workload._tag} ${workload.id}: x${iterations}`);
  const prepared: Prepared = { workload, ok, iterations };
  return prepared;
});

interface Sample {
  readonly ms: number;
  readonly relative: number;
}

const iqrPct = (sorted: ReadonlyArray<number>): number => {
  const median = quantile(sorted, 0.5);
  return median > 0 ? ((quantile(sorted, 0.75) - quantile(sorted, 0.25)) / median) * 100 : 0;
};

const summarize = (prepared: Prepared, raw: ReadonlyArray<Sample>): CorpusResult => {
  const samples = A.sort(
    A.map(raw, (sample) => sample.ms),
    Order.Number
  );
  const relative = A.sort(
    A.map(raw, (sample) => sample.relative),
    Order.Number
  );
  const medianMs = quantile(samples, 0.5);
  const bytes = workloadBytes(prepared.workload);
  return {
    id: prepared.workload.id,
    group: prepared.workload.group,
    operation: prepared.workload._tag,
    outcome: prepared.ok ? "ok" : "refused",
    bytes,
    iterations: prepared.iterations,
    runs: A.length(samples),
    medianMs,
    minMs: quantile(samples, 0),
    maxMs: quantile(samples, 1),
    spreadPct: iqrPct(samples),
    throughputMBps: medianMs > 0 ? bytes / 1_000_000 / (medianMs / 1_000) : 0,
    relativeCost: quantile(relative, 0.5),
    relativeSpreadPct: iqrPct(relative),
  };
};

// Samples are taken in interleaved rounds (every corpus once per round), so a
// load change on a shared machine shifts every corpus alike instead of
// skewing whichever corpora happened to run during it.
const measureAll = Effect.fn("MarkdownBench.measureAll")(function* (
  prepared: ReadonlyArray<Prepared>,
  refIterations: number
) {
  const rounds = yield* Effect.forEach(
    A.makeBy(runs, (round) => round + 1),
    (round) =>
      Effect.sync(() =>
        A.map(prepared, (entry): Sample => {
          const reference = referenceSampleMs(refIterations);
          const ms = sampleMs(entry.workload, entry.iterations);
          return { ms, relative: ms / reference };
        })
      ).pipe(Effect.tap(() => Console.error(`round ${round}/${runs} done`)))
  );
  return A.map(prepared, (entry, index) => summarize(entry, A.getSomes(A.map(rounds, (round) => A.get(round, index)))));
});

// The ratio uses the reference-normalized cost; the raw medians are kept for reading.
const depthRatios = (corpora: ReadonlyArray<CorpusResult>): ReadonlyArray<DepthRatio> =>
  A.getSomes(
    A.flatMap(A.make("blockquote", "list"), (series) =>
      A.map(A.make("parse" as const, "stringify" as const), (operation) => {
        const rowAt = (treeDepth: number) =>
          A.findFirst(corpora, (row) => row.operation === operation && row.id === `${series}-depth-${treeDepth}`);
        return O.map(O.all({ at128: rowAt(128), at256: rowAt(256) }), ({ at128, at256 }) => ({
          series,
          operation,
          t128Ms: at128.medianMs,
          t256Ms: at256.medianMs,
          ratio: at256.relativeCost / at128.relativeCost,
        }));
      })
    )
  );

const runMacro = Effect.fn("MarkdownBench.runMacro")(function* () {
  const fileSystem = yield* FileSystem.FileSystem;
  const pathApi = yield* Path.Path;
  const spawner = yield* ChildProcessSpawner.ChildProcessSpawner;
  const files = A.filter(
    yield* spawner.lines(
      ChildProcess.make("git", ["ls-files", "-z", "--", "*.md", ":(exclude)scratchpad/**"], { cwd: repoRoot })
    ),
    Str.isNonEmpty
  );
  const paths = A.filter(A.flatMap(files, Str.split("\u0000")), Str.isNonEmpty);
  const texts = yield* Effect.forEach(paths, (relativePath) =>
    fileSystem.readFileString(pathApi.join(repoRoot, relativePath)).pipe(Effect.orElseSucceed(() => ""))
  );
  collectGarbage();
  const started = performance.now();
  const timings = A.map(texts, (text) => {
    const fileStarted = performance.now();
    const ok = Result.isSuccess(Markdown.parseResult(text, gfmWithFrontmatter));
    return { ok, ms: performance.now() - fileStarted };
  });
  const totalMs = performance.now() - started;
  return {
    scope: "git ls-files '*.md' excluding scratchpad/",
    files: A.length(texts),
    bytes: A.reduce(texts, 0, (sum, text) => sum + utf8Bytes(text)),
    failures: A.length(A.filter(timings, (timing) => !timing.ok)),
    totalMs,
    slowestFileMs: A.reduce(timings, 0, (slowest, timing) => Math.max(slowest, timing.ms)),
    peakRssBytes: process.resourceUsage().maxRSS * 1024,
    gated: false as const,
  };
});

// --- comparison ---------------------------------------------------------------

const pct = (current: number, baseline: number): number => (baseline > 0 ? (current / baseline - 1) * 100 : 0);
const signed = (delta: number): string => `${delta >= 0 ? "+" : ""}${delta.toFixed(1)}%`;

const compareReports = Effect.fn("MarkdownBench.compareReports")(function* (
  baseline: BenchReport,
  current: BenchReport
) {
  const header = "| corpus | op | baseline ms | current ms | raw delta | cost delta | status |";
  const rows = A.map(current.corpora, (row) => {
    const base = A.findFirst(
      baseline.corpora,
      (candidate) => candidate.id === row.id && candidate.operation === row.operation
    );
    return O.match(base, {
      onNone: () => ({
        line: `| ${row.id} | ${row.operation} | - | ${row.medianMs.toFixed(3)} | - | - | new |`,
        failure: O.none<string>(),
      }),
      onSome: (baseRow) => {
        const raw = pct(row.medianMs, baseRow.medianMs);
        const delta = pct(row.relativeCost, baseRow.relativeCost);
        const failed = delta > MAX_SLOWDOWN_PCT;
        return {
          line: `| ${row.id} | ${row.operation} | ${baseRow.medianMs.toFixed(3)} | ${row.medianMs.toFixed(3)} | ${signed(raw)} | ${signed(delta)} | ${failed ? "FAIL" : "ok"} |`,
          failure: failed ? O.some(`${row.operation} ${row.id} is ${delta.toFixed(1)}% slower`) : O.none<string>(),
        };
      },
    });
  });
  const ratioRows = A.map(current.depthRatios, (ratio) => {
    const failed = ratio.ratio > MAX_DEPTH_RATIO;
    return {
      line: `| ${ratio.series} t(256)/t(128) | ${ratio.operation} | - | ${ratio.ratio.toFixed(2)} | - | max ${MAX_DEPTH_RATIO} | ${failed ? "FAIL" : "ok"} |`,
      failure: failed
        ? O.some(`${ratio.operation} ${ratio.series} depth ratio ${ratio.ratio.toFixed(2)} > ${MAX_DEPTH_RATIO}`)
        : O.none<string>(),
    };
  });
  const all = A.appendAll(rows, ratioRows);
  const deltas = A.getSomes(
    A.map(current.corpora, (row) =>
      O.map(
        A.findFirst(baseline.corpora, (candidate) => candidate.id === row.id && candidate.operation === row.operation),
        (baseRow) => Math.abs(pct(row.relativeCost, baseRow.relativeCost))
      )
    )
  );
  yield* Console.log(
    A.join(
      A.appendAll(
        [header, "| --- | --- | ---: | ---: | ---: | ---: | --- |"],
        A.map(all, (row) => row.line)
      ),
      "\n"
    )
  );
  yield* Console.log(
    `run-to-run spread: max |cost delta| ${A.reduce(deltas, 0, (widest, delta) => Math.max(widest, delta)).toFixed(1)}% across ${A.length(deltas)} corpora`
  );
  const failures = A.getSomes(A.map(all, (row) => row.failure));
  yield* A.match(failures, {
    onEmpty: () => Console.log("markdown bench gate: PASS"),
    onNonEmpty: (list) =>
      Console.error(A.join(A.prepend(list, "markdown bench gate: FAIL"), "\n  ")).pipe(
        Effect.andThen(Effect.fail(new MarkdownBenchRegression({ failures: list })))
      ),
  });
});

// --- program ------------------------------------------------------------------

const readText = Effect.fn("MarkdownBench.readText")(function* (path: string) {
  const fileSystem = yield* FileSystem.FileSystem;
  return yield* fileSystem.readFileString(path);
});

const runMacroChild = Effect.fn("MarkdownBench.runMacroChild")(function* () {
  const spawner = yield* ChildProcessSpawner.ChildProcessSpawner;
  const output = yield* spawner.string(
    ChildProcess.make(process.execPath, [scriptPath, "--macro-only"], { cwd: repoRoot })
  );
  return yield* S.decodeEffect(MacroRunJson)(output);
});

const macroOnly = Effect.fn("MarkdownBench.macroOnly")(function* () {
  const run = yield* runMacro();
  yield* Console.log(yield* S.encodeEffect(MacroRunJson)(run));
});

const program = Effect.gen(function* () {
  if (hasFlag("--macro-only")) {
    return yield* macroOnly();
  }
  const fileSystem = yield* FileSystem.FileSystem;
  const comparePath = flagValue("--compare");
  const outPath = flagValue("--out");
  if (hasFlag("--compare") && O.isNone(comparePath)) {
    return yield* new MarkdownBenchUsage({ message: "--compare needs a baseline path" });
  }
  const baseline = yield* O.match(comparePath, {
    onNone: () => Effect.succeed(O.none<BenchReport>()),
    onSome: (path) => readText(path).pipe(Effect.flatMap(decodeReport), Effect.asSome),
  });
  const baselineWorkload = O.map(baseline, (report) => report.workloadVersion);
  if (O.isSome(baselineWorkload) && baselineWorkload.value !== WORKLOAD_VERSION) {
    return yield* new MarkdownBenchUsage({
      message: `baseline workloadVersion ${baselineWorkload.value ?? "missing"} does not match ${WORKLOAD_VERSION}; re-baseline`,
    });
  }
  const spawner = yield* ChildProcessSpawner.ChildProcessSpawner;
  const commit = yield* spawner.string(ChildProcess.make("git", ["rev-parse", "HEAD"], { cwd: repoRoot })).pipe(
    Effect.map(Str.trim),
    Effect.map(O.liftPredicate(Str.isNonEmpty)),
    Effect.orElseSucceed(() => O.none<string>())
  );
  // The macro run happens in a child process: its peak RSS is then its own, and
  // its 700 MB heap does not change GC behaviour for the micro corpora, so a
  // baseline taken with --macro stays comparable with a compare run without it.
  const macro = hasFlag("--macro") ? O.some(yield* runMacroChild()) : O.none();
  const effectVersion = yield* readText(`${repoRoot}node_modules/effect/package.json`).pipe(
    Effect.flatMap(S.decodeEffect(EffectPackageVersion))
  );
  const workloads = yield* loadWorkloads();
  const prepared = yield* Effect.forEach(workloads, (workload) =>
    prepare(
      workload,
      pipe(
        baseline,
        O.flatMap((report) =>
          A.findFirst(report.corpora, (row) => row.id === workload.id && row.operation === workload._tag)
        ),
        O.map((row) => row.iterations)
      )
    )
  );
  const refIterations = O.getOrElse(
    O.map(baseline, (report) => report.reference.iterations),
    referenceIterations
  );
  const corpora = yield* measureAll(prepared, refIterations);
  const referenceMs = quantile(
    A.sort(
      A.makeBy(runs, () => referenceSampleMs(refIterations)),
      Order.Number
    ),
    0.5
  );
  const report: BenchReport = {
    schemaVersion: 1,
    workloadVersion: WORKLOAD_VERSION,
    ...O.match(commit, { onNone: () => ({}), onSome: (sha) => ({ commit: sha }) }),
    tool: TOOL,
    generatedAt: DateTime.formatIso(yield* DateTime.now),
    runtime: {
      bun: process.versions.bun ?? "unknown",
      effect: effectVersion.version,
      platform: process.platform,
      arch: process.arch,
    },
    config: {
      runs,
      warmup,
      minSampleMs,
      thresholds: { maxSlowdownPct: MAX_SLOWDOWN_PCT, maxDepthRatio: MAX_DEPTH_RATIO },
    },
    reference: { description: REFERENCE_DESCRIPTION, iterations: refIterations, medianMs: referenceMs },
    corpora,
    depthRatios: depthRatios(corpora),
    ...O.match(macro, { onNone: () => ({}), onSome: (run) => ({ macro: run }) }),
  };
  const json = yield* encodeReport(report);
  yield* O.match(outPath, {
    onNone: () => (O.isNone(baseline) ? Console.log(json) : Effect.void),
    onSome: (path) => fileSystem.writeFileString(path, `${json}\n`),
  });
  yield* O.match(baseline, {
    onNone: () => Effect.void,
    onSome: (base) => compareReports(base, report),
  });
});

// The entry point builds the platform services once and runs the program in their context.
NodeRuntime.runMain(
  Layer.build(NodeServices.layer).pipe(
    Effect.flatMap((services) => program.pipe(Effect.provide(services))),
    Effect.scoped
  )
);
