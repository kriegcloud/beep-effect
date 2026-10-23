/**
 * `@beep/lockfiles` benchmark gate (wave 3-5, W3-g).
 *
 * Times `Lockfile.parse` and `Lockfile#withImporterNames` on fixed corpora and
 * writes a schema-validated JSON report. The headline corpus is the repo's own
 * root `bun.lock` (3,313 packages, 179 workspaces at the wave 3 cut); the
 * largest pnpm, npm and yarn fixtures ride along so every parser is covered.
 * With `--compare <baseline.json>` it re-measures every baseline corpus with
 * the baseline's iteration counts, prints a table, and fails when a corpus
 * costs more than 10% over the baseline.
 *
 * With `--ab <rev>` it runs the same gate as a paired A/B of the package
 * `src/` at `<rev>` against `HEAD` (or `--ab-head <rev>`). Both sides are
 * extracted with `git archive` under the git-ignored `.beep/lockfiles-bench-ab/`
 * so they load the same way; the current side must therefore be committed. The
 * A/B runs in two child processes, one per side going first, because within
 * one process the side a corpus meets second reads up to 18% slower on the
 * YAML fixtures even for identical code. In each child every round times both
 * sides back to back (order alternating per round) and each corpus runs two
 * passes with the sides' slots swapped. The gate is the geometric mean of the
 * two children's current/baseline ratios, which cancels both biases and the
 * machine drift between sessions. This is the W3-g gate of record: a
 * cross-session `--compare` against the committed baseline drifts by several
 * percent on unchanged code.
 *
 * Noise control for a shared workstation (the D-40 method): samples are taken
 * in interleaved rounds, each corpus sample is paired with a machine-speed
 * reference sample taken just before it, and the gate compares the median of
 * sample/reference (`relativeCost`). Raw medians are reported beside it.
 *
 * `withImporterNames` renames every workspace package (relative path to its
 * name plus a `-renamed` suffix), so the timed call rebuilds every workspace
 * row and admits the whole lockfile once.
 *
 * Timing stays out of CI; the compare output rides in the PR body.
 *
 * Usage (from the repo root):
 *
 *   bun goals/effected-promotion/ops/lockfiles-bench.ts [--out <report.json>]
 *   bun goals/effected-promotion/ops/lockfiles-bench.ts --compare <baseline.json> [--out <report.json>]
 *   bun goals/effected-promotion/ops/lockfiles-bench.ts --ab <rev> [--ab-head <rev>] [--out <ab-report.json>]
 *
 * Flags: `--runs <n>` (default 31), `--warmup <n>` (default 3),
 * `--min-sample-ms <n>` (default 300).
 */
import { Lockfile } from "@beep/lockfiles/Lockfile";
import { NodeRuntime, NodeServices } from "@effect/platform-node";
import * as A from "effect/Array";
import * as Console from "effect/Console";
import * as DateTime from "effect/DateTime";
import * as Effect from "effect/Effect";
import * as Exit from "effect/Exit";
import * as FileSystem from "effect/FileSystem";
import { pipe } from "effect/Function";
import * as HashMap from "effect/HashMap";
import * as Num from "effect/Number";
import * as O from "effect/Option";
import * as Order from "effect/Order";
import * as Path from "effect/Path";
import * as Result from "effect/Result";
import * as S from "effect/Schema";
import type { LockfileFormat } from "@beep/lockfiles/LockfileFormat";

// --- report schema ------------------------------------------------------------

const BenchOperation = S.Literals(["parse", "withImporterNames"]);

const CorpusResult = S.Struct({
  id: S.NonEmptyString,
  operation: BenchOperation,
  bytes: S.Finite,
  packages: S.Int,
  workspaces: S.Int,
  iterations: S.Int,
  runs: S.Int,
  medianMs: S.Finite,
  minMs: S.Finite,
  maxMs: S.Finite,
  relativeCost: S.Finite,
  relativeSpreadPct: S.Finite,
});
type CorpusResult = typeof CorpusResult.Type;

const BenchReport = S.Struct({
  schemaVersion: S.tag(1),
  workloadVersion: S.Int,
  commit: S.optionalKey(S.NonEmptyString),
  tool: S.NonEmptyString,
  generatedAt: S.NonEmptyString,
  runtime: S.Struct({ bun: S.NonEmptyString, platform: S.NonEmptyString, arch: S.NonEmptyString }),
  config: S.Struct({
    runs: S.Int,
    warmup: S.Int,
    minSampleMs: S.Finite,
    thresholds: S.Struct({ maxSlowdownPct: S.Finite }),
  }),
  reference: S.Struct({ description: S.NonEmptyString, iterations: S.Int, medianMs: S.Finite }),
  corpora: S.Array(CorpusResult),
});
type BenchReport = typeof BenchReport.Type;

const BenchReportJson = S.fromJsonString(BenchReport, { space: 2 });
const decodeReport = S.decodeEffect(BenchReportJson);
const encodeReport = S.encodeEffect(BenchReportJson);

const AbSide = S.Literals(["baseline", "current"]);

// One child process's paired measurement of a corpus, `ratio` = current/baseline
// after the in-process slot swap.
const AbChildRow = S.Struct({
  id: S.NonEmptyString,
  operation: BenchOperation,
  iterations: S.Int,
  baselineMedianMs: S.Finite,
  currentMedianMs: S.Finite,
  ratio: S.Finite,
  spreadPct: S.Finite,
});
type AbChildRow = typeof AbChildRow.Type;

const AbChildRows = AbChildRow.pipe(S.Array, S.fromJsonString);
const decodeChildRows = S.decodeEffect(AbChildRows);
const encodeChildRows = S.encodeEffect(AbChildRows);

const AbCorpusResult = S.Struct({
  id: S.NonEmptyString,
  operation: BenchOperation,
  iterations: S.Int,
  runs: S.Int,
  baselineMedianMs: S.Finite,
  currentMedianMs: S.Finite,
  baselineFirstDeltaPct: S.Finite,
  currentFirstDeltaPct: S.Finite,
  pairedDeltaPct: S.Finite,
  orderBiasPct: S.Finite,
  pairedSpreadPct: S.Finite,
  verdict: S.Literals(["ok", "fail"]),
});
type AbCorpusResult = typeof AbCorpusResult.Type;

const AbReport = S.Struct({
  schemaVersion: S.tag(1),
  workloadVersion: S.Int,
  mode: S.tag("ab"),
  baselineRev: S.NonEmptyString,
  commit: S.NonEmptyString,
  tool: S.NonEmptyString,
  generatedAt: S.NonEmptyString,
  runtime: S.Struct({ bun: S.NonEmptyString, platform: S.NonEmptyString, arch: S.NonEmptyString }),
  config: S.Struct({
    runs: S.Int,
    warmup: S.Int,
    minSampleMs: S.Finite,
    thresholds: S.Struct({ maxSlowdownPct: S.Finite }),
  }),
  verdict: S.Literals(["ok", "fail"]),
  corpora: S.Array(AbCorpusResult),
});
type AbReport = typeof AbReport.Type;

const encodeAbReport = S.encodeEffect(S.fromJsonString(AbReport, { space: 2 }));

class LockfilesBenchRegression extends S.TaggedError<LockfilesBenchRegression>()("LockfilesBenchRegression", {
  failures: S.Array(S.String),
}) {
  override get message(): string {
    return `relative cost over the +${MAX_SLOWDOWN_PCT}% gate: ${A.join(this.failures, "; ")}`;
  }
}

class LockfilesBenchUsage extends S.TaggedError<LockfilesBenchUsage>()("LockfilesBenchUsage", {
  message: S.String,
}) {}

class BenchCorpusUnreadable extends S.TaggedError<BenchCorpusUnreadable>()("BenchCorpusUnreadable", { id: S.String }) {
  override get message(): string {
    return `corpus ${this.id} does not parse`;
  }
}

// --- configuration ------------------------------------------------------------

const TOOL = "goals/effected-promotion/ops/lockfiles-bench.ts";
const WORKLOAD_VERSION = 1;
const MAX_SLOWDOWN_PCT = 10;
const repoRoot = new URL("../../..", import.meta.url).pathname;
const fixtureRoot = `${repoRoot}packages/foundation/modeling/lockfiles/test/fixtures`;

const argv = A.drop(process.argv, 2);
const flagValue = (name: string): O.Option<string> =>
  pipe(
    A.findFirstIndex(argv, (arg) => arg === name),
    O.flatMap((index) => A.get(argv, index + 1))
  );
const numericFlag = (name: string, fallback: number): number =>
  pipe(
    flagValue(name),
    O.flatMap(Num.parse),
    O.getOrElse(() => fallback)
  );

const runs = numericFlag("--runs", 31);
const warmup = numericFlag("--warmup", 3);
const minSampleMs = numericFlag("--min-sample-ms", 300);

// --- workloads ----------------------------------------------------------------

type Workload = {
  readonly id: string;
  readonly operation: CorpusResult["operation"];
  readonly bytes: number;
  readonly packages: number;
  readonly workspaces: number;
  readonly runOnce: () => boolean;
};

// The slice of the `Lockfile` API the bench drives; the A/B mode loads a second
// implementation of it from another revision.
type BenchLockfile = {
  readonly packages: ReadonlyArray<unknown>;
  readonly workspacePackages: ReadonlyArray<{ readonly name: string; readonly relativePath?: string | undefined }>;
  readonly withImporterNames: (names: HashMap.HashMap<string, string>) => { readonly packages: ReadonlyArray<unknown> };
};
type BenchImpl = {
  readonly parse: (
    content: string,
    options: { readonly format: LockfileFormat }
  ) => Effect.Effect<BenchLockfile, { readonly _tag: string }>;
};

const currentImpl: BenchImpl = Lockfile;

const parseOnce = (impl: BenchImpl, content: string, format: LockfileFormat): O.Option<BenchLockfile> =>
  pipe(Effect.runSyncExit(impl.parse(content, { format })), Exit.getSuccess);

// The machine-speed reference: a fixed pure-JS scan with steady allocation that
// never touches @beep/lockfiles, divided out of every paired corpus sample.
const REFERENCE_DESCRIPTION = "pure-JS character hash over the root bun.lock with one small object per character";

const makeReference = (text: string) => {
  const slots = A.makeBy(1024, () => ({ index: 0, hash: 0 }));
  return (): number => {
    let hash = 0;
    for (let index = 0; index < text.length; index += 1) {
      hash = (hash * 31 + text.charCodeAt(index)) | 0;
      slots[index & 1023] = { index, hash };
    }
    return hash;
  };
};

const parseWorkload = (
  impl: BenchImpl,
  id: string,
  content: string,
  format: LockfileFormat,
  lockfile: BenchLockfile
): Workload => ({
  id,
  operation: "parse",
  bytes: Buffer.byteLength(content, "utf8"),
  packages: lockfile.packages.length,
  workspaces: lockfile.workspacePackages.length,
  runOnce: () => O.isSome(parseOnce(impl, content, format)),
});

const renameWorkload = (id: string, content: string, lockfile: BenchLockfile): Workload => {
  const names = HashMap.fromIterable(
    A.flatMap(lockfile.workspacePackages, (pkg) =>
      pkg.relativePath === undefined ? [] : [[pkg.relativePath, `${pkg.name}-renamed`] as const]
    )
  );
  return {
    id,
    operation: "withImporterNames",
    bytes: Buffer.byteLength(content, "utf8"),
    packages: lockfile.packages.length,
    workspaces: lockfile.workspacePackages.length,
    runOnce: () => lockfile.withImporterNames(names).packages.length === lockfile.packages.length,
  };
};

const loadWorkloads = Effect.fn("LockfilesBench.loadWorkloads")(function* (impl: BenchImpl) {
  const fileSystem = yield* FileSystem.FileSystem;
  const pathApi = yield* Path.Path;
  const corpus = Effect.fn("LockfilesBench.corpus")(function* (id: string, file: string, format: LockfileFormat) {
    const content = yield* fileSystem.readFileString(file);
    const lockfile = yield* Effect.mapError(Effect.fromOption(parseOnce(impl, content, format)), () =>
      BenchCorpusUnreadable.make({ id })
    );
    return { content, lockfile };
  });
  const root = yield* corpus("root-bun-lock", pathApi.join(repoRoot, "bun.lock"), "bun");
  const fixtures = yield* Effect.forEach(
    [
      ["fixture-pnpm-v2", "pnpm/v2/pnpm-lock.yaml.fixture", "pnpm"],
      ["fixture-npm-v2", "npm/v2/package-lock.json.fixture", "npm"],
      ["fixture-yarn-v2", "yarn/v2/yarn.lock.fixture", "yarn"],
      ["fixture-bun-v2", "bun/v2/bun.lock.fixture", "bun"],
    ] as const,
    ([id, file, format]) =>
      Effect.map(corpus(id, pathApi.join(fixtureRoot, file), format), ({ content, lockfile }) =>
        parseWorkload(impl, id, content, format, lockfile)
      )
  );
  return {
    reference: makeReference(root.content),
    workloads: A.appendAll(
      [
        parseWorkload(impl, "root-bun-lock", root.content, "bun", root.lockfile),
        renameWorkload("root-bun-lock-rename", root.content, root.lockfile),
      ],
      fixtures
    ),
  };
});

// --- timing -------------------------------------------------------------------

const timeIterations = (iterations: number, once: () => unknown): number => {
  const started = performance.now();
  for (let index = 0; index < iterations; index += 1) once();
  return (performance.now() - started) / iterations;
};

const calibrate = (once: () => unknown): number => {
  let iterations = 1;
  for (;;) {
    const started = performance.now();
    for (let index = 0; index < iterations; index += 1) once();
    if (performance.now() - started >= minSampleMs || iterations >= 1 << 20) return iterations;
    iterations *= 2;
  }
};

const quantile = (sorted: ReadonlyArray<number>, q: number): number =>
  pipe(
    A.get(sorted, Math.min(sorted.length - 1, Math.floor(q * (sorted.length - 1)))),
    O.getOrElse(() => 0)
  );

const spreadPct = (sorted: ReadonlyArray<number>): number => {
  const median = quantile(sorted, 0.5);
  return median > 0 ? ((quantile(sorted, 0.75) - quantile(sorted, 0.25)) / median) * 100 : 0;
};

const measure = (
  reference: () => number,
  workloads: ReadonlyArray<Workload>,
  iterationsFor: (workload: Workload) => number,
  referenceIterations: number
) => {
  for (let round = 0; round < warmup; round += 1) {
    timeIterations(referenceIterations, reference);
    for (const workload of workloads) timeIterations(iterationsFor(workload), workload.runOnce);
  }
  const raw = A.map(workloads, () => [] as Array<number>);
  const relative = A.map(workloads, () => [] as Array<number>);
  const references: Array<number> = [];
  for (let round = 0; round < runs; round += 1) {
    workloads.forEach((workload, index) => {
      const ref = timeIterations(referenceIterations, reference);
      references.push(ref);
      const sample = timeIterations(iterationsFor(workload), workload.runOnce);
      raw[index]?.push(sample);
      relative[index]?.push(sample / ref);
    });
  }
  const corpora = A.map(workloads, (workload, index): CorpusResult => {
    const samples = A.sort(raw[index] ?? [], Order.Number);
    const ratios = A.sort(relative[index] ?? [], Order.Number);
    return {
      id: workload.id,
      operation: workload.operation,
      bytes: workload.bytes,
      packages: workload.packages,
      workspaces: workload.workspaces,
      iterations: iterationsFor(workload),
      runs,
      medianMs: quantile(samples, 0.5),
      minMs: quantile(samples, 0),
      maxMs: quantile(samples, 1),
      relativeCost: quantile(ratios, 0.5),
      relativeSpreadPct: spreadPct(ratios),
    };
  });
  return { corpora, referenceMs: quantile(A.sort(references, Order.Number), 0.5) };
};

// --- compare ------------------------------------------------------------------

const pct = (current: number, baseline: number): number => (baseline > 0 ? (current / baseline - 1) * 100 : 0);
const signed = (value: number): string => `${value >= 0 ? "+" : ""}${value.toFixed(1)}%`;

const compareTable = (baseline: BenchReport, current: ReadonlyArray<CorpusResult>) => {
  const failures: Array<string> = [];
  const lines = [
    "| corpus | operation | baseline ms | current ms | raw | relative cost | verdict |",
    "| --- | --- | --- | --- | --- | --- | --- |",
  ];
  for (const row of current) {
    const base = A.findFirst(baseline.corpora, (candidate) => candidate.id === row.id);
    if (O.isNone(base)) {
      lines.push(`| ${row.id} | ${row.operation} | - | ${row.medianMs.toFixed(3)} | - | - | new |`);
      continue;
    }
    const delta = pct(row.relativeCost, base.value.relativeCost);
    const failed = delta > MAX_SLOWDOWN_PCT;
    if (failed) failures.push(`${row.id}: relative cost ${signed(delta)} (limit +${MAX_SLOWDOWN_PCT}%)`);
    lines.push(
      `| ${row.id} | ${row.operation} | ${base.value.medianMs.toFixed(3)} | ${row.medianMs.toFixed(3)} | ${signed(pct(row.medianMs, base.value.medianMs))} | ${signed(delta)} | ${failed ? "FAIL" : "ok"} |`
    );
  }
  return { lines, failures };
};

// --- paired A/B ---------------------------------------------------------------

const PACKAGE_SRC = "packages/foundation/modeling/lockfiles/src";

const spawnOk = (cmd: ReadonlyArray<string>): O.Option<string> => {
  const result = Bun.spawnSync([...cmd], { cwd: repoRoot });
  return result.exitCode === 0 ? O.some(result.stdout.toString().trim()) : O.none();
};

const resolveCommit = (rev: string) =>
  Effect.mapError(Effect.fromOption(spawnOk(["git", "rev-parse", "--verify", `${rev}^{commit}`])), () =>
    LockfilesBenchUsage.make({ message: `--ab: ${rev} is not a commit` })
  );

// Extract one commit's package `src/` with `git archive` under the git-ignored
// `.beep/` directory, so its `@beep/*` and `effect` imports resolve through the
// repo's node_modules. The scope removes the copy again. Both sides load this
// way, so neither is favoured by where its modules live.
const materializeCommit = Effect.fn("LockfilesBench.materializeCommit")(function* (
  sha: string,
  side: typeof AbSide.Type
) {
  const fileSystem = yield* FileSystem.FileSystem;
  const dir = `${repoRoot}.beep/lockfiles-bench-ab/${side}-${sha}`;
  yield* Effect.acquireRelease(fileSystem.makeDirectory(dir, { recursive: true }), () =>
    Effect.ignore(fileSystem.remove(dir, { recursive: true }))
  );
  const tarball = `${dir}/src.tar`;
  const extracted = pipe(
    spawnOk(["git", "archive", "--format=tar", "-o", tarball, sha, PACKAGE_SRC]),
    O.flatMap(() => spawnOk(["tar", "-xf", tarball, "-C", dir]))
  );
  if (O.isNone(extracted)) {
    return yield* LockfilesBenchUsage.make({ message: `--ab: cannot extract ${PACKAGE_SRC} at ${sha}` });
  }
  return `${dir}/${PACKAGE_SRC}/Lockfile.ts`;
});

const loadImpl = Effect.fn("LockfilesBench.loadImpl")(function* (entry: string) {
  const module: { readonly Lockfile: BenchImpl } = yield* Effect.promise(() => import(entry));
  return module.Lockfile;
});

// One paired pass: `first` and `second` are timed back to back every round, in
// alternating order. Returns both medians and the median second/first ratio.
const measurePair = (first: Workload, second: Workload, iterations: number) => {
  for (let round = 0; round < warmup; round += 1) {
    timeIterations(iterations, first.runOnce);
    timeIterations(iterations, second.runOnce);
  }
  const firstSamples: Array<number> = [];
  const secondSamples: Array<number> = [];
  const ratios: Array<number> = [];
  for (let round = 0; round < runs; round += 1) {
    const flip = round % 2 === 1;
    const leadMs = timeIterations(iterations, flip ? second.runOnce : first.runOnce);
    const trailMs = timeIterations(iterations, flip ? first.runOnce : second.runOnce);
    const [firstMs, secondMs] = flip ? [trailMs, leadMs] : [leadMs, trailMs];
    firstSamples.push(firstMs);
    secondSamples.push(secondMs);
    ratios.push(secondMs / firstMs);
  }
  const sortedRatios = A.sort(ratios, Order.Number);
  return {
    firstMs: quantile(A.sort(firstSamples, Order.Number), 0.5),
    secondMs: quantile(A.sort(secondSamples, Order.Number), 0.5),
    ratio: quantile(sortedRatios, 0.5),
    spreadPct: spreadPct(sortedRatios),
  };
};

// One child process: the `lead` side is imported, parsed and calibrated first,
// then each corpus runs two paired passes with the sides' slots swapped, so
// the in-process slot factor cancels in `sqrt(r1 / r2)`.
const runAbChild = Effect.fn("LockfilesBench.runAbChild")(function* (
  baselineSha: string,
  currentSha: string,
  lead: typeof AbSide.Type
) {
  const baselineEntry = yield* materializeCommit(baselineSha, "baseline");
  const currentEntry = yield* materializeCommit(currentSha, "current");
  const [leadEntry, trailEntry] = lead === "baseline" ? [baselineEntry, currentEntry] : [currentEntry, baselineEntry];
  const leadWorkloads = yield* loadWorkloads(yield* loadImpl(leadEntry));
  const trailWorkloads = yield* loadWorkloads(yield* loadImpl(trailEntry));
  const rows = A.map(A.zip(leadWorkloads.workloads, trailWorkloads.workloads), ([leader, trailer]): AbChildRow => {
    const iterations = Math.max(calibrate(leader.runOnce), calibrate(trailer.runOnce));
    const forward = measurePair(leader, trailer, iterations);
    const reverse = measurePair(trailer, leader, iterations);
    // trail/lead with the slot factor cancelled.
    const trailOverLead = Math.sqrt(forward.ratio / reverse.ratio);
    const leadMs = (forward.firstMs + reverse.secondMs) / 2;
    const trailMs = (forward.secondMs + reverse.firstMs) / 2;
    return {
      id: leader.id,
      operation: leader.operation,
      iterations,
      baselineMedianMs: lead === "baseline" ? leadMs : trailMs,
      currentMedianMs: lead === "baseline" ? trailMs : leadMs,
      ratio: lead === "baseline" ? trailOverLead : 1 / trailOverLead,
      spreadPct: Math.max(forward.spreadPct, reverse.spreadPct),
    };
  });
  yield* Console.log(yield* encodeChildRows(rows));
});

// Run one child in a fresh process, so each side gets one process in which it
// is exercised first: within a process the side a corpus meets second reads up
// to 18% slower on the YAML fixtures even for identical code.
const spawnChild = Effect.fn("LockfilesBench.spawnChild")(function* (
  baselineSha: string,
  currentSha: string,
  lead: typeof AbSide.Type
) {
  const result = Bun.spawnSync(
    [
      process.execPath,
      `${repoRoot}${TOOL}`,
      "--ab-child",
      lead,
      "--ab",
      baselineSha,
      "--ab-head",
      currentSha,
      "--runs",
      `${runs}`,
      "--warmup",
      `${warmup}`,
      "--min-sample-ms",
      `${minSampleMs}`,
    ],
    { cwd: repoRoot, stderr: "inherit" }
  );
  if (result.exitCode !== 0) {
    return yield* LockfilesBenchUsage.make({ message: `--ab: the ${lead}-first child exited ${result.exitCode}` });
  }
  return yield* decodeChildRows(result.stdout.toString().trim());
});

const combineAb = (
  baselineFirst: ReadonlyArray<AbChildRow>,
  currentFirst: ReadonlyArray<AbChildRow>
): ReadonlyArray<AbCorpusResult> =>
  A.map(A.zip(baselineFirst, currentFirst), ([b, c]) => {
    // Each process favours its lead side by the same order factor, so the
    // geometric mean cancels it and the quotient measures it.
    const pairedDeltaPct = (Math.sqrt(b.ratio * c.ratio) - 1) * 100;
    return {
      id: b.id,
      operation: b.operation,
      iterations: b.iterations,
      runs,
      baselineMedianMs: (b.baselineMedianMs + c.baselineMedianMs) / 2,
      currentMedianMs: (b.currentMedianMs + c.currentMedianMs) / 2,
      baselineFirstDeltaPct: (b.ratio - 1) * 100,
      currentFirstDeltaPct: (c.ratio - 1) * 100,
      pairedDeltaPct,
      orderBiasPct: (Math.sqrt(b.ratio / c.ratio) - 1) * 100,
      pairedSpreadPct: Math.max(b.spreadPct, c.spreadPct),
      verdict: pairedDeltaPct > MAX_SLOWDOWN_PCT ? "fail" : "ok",
    };
  });

const abTable = (rows: ReadonlyArray<AbCorpusResult>): string =>
  A.join(
    [
      "| corpus | operation | baseline ms | current ms | baseline first | current first | paired delta | order bias | verdict |",
      "| --- | --- | --- | --- | --- | --- | --- | --- | --- |",
      ...A.map(
        rows,
        (row) =>
          `| ${row.id} | ${row.operation} | ${row.baselineMedianMs.toFixed(3)} | ${row.currentMedianMs.toFixed(3)} | ${signed(row.baselineFirstDeltaPct)} | ${signed(row.currentFirstDeltaPct)} | ${signed(row.pairedDeltaPct)} | ${signed(row.orderBiasPct)} | ${row.verdict} |`
      ),
    ],
    "\n"
  );

const runAb = Effect.fn("LockfilesBench.runAb")(function* (rev: string) {
  const fileSystem = yield* FileSystem.FileSystem;
  const baselineSha = yield* resolveCommit(rev);
  const currentSha = yield* resolveCommit(O.getOrElse(flagValue("--ab-head"), () => "HEAD"));
  const childLead = flagValue("--ab-child");
  if (O.isSome(childLead)) {
    const lead = yield* S.decodeUnknownEffect(AbSide)(childLead.value);
    return yield* runAbChild(baselineSha, currentSha, lead);
  }
  const corpora = combineAb(
    yield* spawnChild(baselineSha, currentSha, "baseline"),
    yield* spawnChild(baselineSha, currentSha, "current")
  );
  const failures = A.filterMap(corpora, (row) =>
    row.verdict === "fail" ? Result.succeed(`${row.id}: ${signed(row.pairedDeltaPct)}`) : Result.failVoid
  );
  const report: AbReport = {
    schemaVersion: 1,
    workloadVersion: WORKLOAD_VERSION,
    mode: "ab",
    baselineRev: baselineSha,
    commit: currentSha,
    tool: TOOL,
    generatedAt: DateTime.formatIso(yield* DateTime.now),
    runtime: { bun: Bun.version, platform: process.platform, arch: process.arch },
    config: { runs, warmup, minSampleMs, thresholds: { maxSlowdownPct: MAX_SLOWDOWN_PCT } },
    verdict: A.isArrayNonEmpty(failures) ? "fail" : "ok",
    corpora,
  };
  const encoded = yield* encodeAbReport(report);
  yield* O.match(flagValue("--out"), {
    onNone: () => Console.log(encoded),
    onSome: (out) => fileSystem.writeFileString(out, `${encoded}\n`),
  });
  yield* Console.log(abTable(corpora));
  if (A.isArrayNonEmpty(failures)) return yield* LockfilesBenchRegression.make({ failures });
});

// --- main ---------------------------------------------------------------------

// `git rev-parse HEAD` of the checkout that produced the report.
const gitHead = (): O.Option<string> => {
  const result = Bun.spawnSync(["git", "rev-parse", "HEAD"], { cwd: repoRoot });
  return pipe(
    O.some(result.stdout.toString().trim()),
    O.filter((text) => result.exitCode === 0 && /^[0-9a-f]{40}$/.test(text))
  );
};

const runCompare = Effect.fn("LockfilesBench.runCompare")(function* () {
  const fileSystem = yield* FileSystem.FileSystem;
  const comparePath = flagValue("--compare");
  const baseline = yield* pipe(
    comparePath,
    O.match({
      onNone: () => Effect.succeedNone,
      onSome: (path) =>
        fileSystem.readFileString(path).pipe(
          Effect.flatMap(decodeReport),
          Effect.flatMap((report) =>
            report.workloadVersion === WORKLOAD_VERSION
              ? Effect.succeedSome(report)
              : Effect.fail(
                  LockfilesBenchUsage.make({
                    message: `baseline workloadVersion ${report.workloadVersion} != ${WORKLOAD_VERSION}`,
                  })
                )
          )
        ),
    })
  );
  const { reference, workloads } = yield* loadWorkloads(currentImpl);
  const iterationsById = HashMap.fromIterable(
    O.match(baseline, {
      onNone: () => A.map(workloads, (workload) => [workload.id, calibrate(workload.runOnce)] as const),
      onSome: (report) => A.map(report.corpora, (row) => [row.id, row.iterations] as const),
    })
  );
  const iterationsFor = (workload: Workload): number =>
    pipe(
      HashMap.get(iterationsById, workload.id),
      O.getOrElse(() => calibrate(workload.runOnce))
    );
  const referenceIterations = O.match(baseline, {
    onNone: () => calibrate(reference),
    onSome: (report) => report.reference.iterations,
  });
  const { corpora, referenceMs } = measure(reference, workloads, iterationsFor, referenceIterations);
  const commit = gitHead();
  const report: BenchReport = {
    schemaVersion: 1,
    workloadVersion: WORKLOAD_VERSION,
    ...O.match(commit, { onNone: () => ({}), onSome: (sha) => ({ commit: sha }) }),
    tool: TOOL,
    generatedAt: DateTime.formatIso(yield* DateTime.now),
    runtime: { bun: Bun.version, platform: process.platform, arch: process.arch },
    config: { runs, warmup, minSampleMs, thresholds: { maxSlowdownPct: MAX_SLOWDOWN_PCT } },
    reference: { description: REFERENCE_DESCRIPTION, iterations: referenceIterations, medianMs: referenceMs },
    corpora,
  };
  const encoded = yield* encodeReport(report);
  yield* O.match(flagValue("--out"), {
    onNone: () => Console.log(encoded),
    onSome: (out) => fileSystem.writeFileString(out, `${encoded}\n`),
  });
  if (O.isSome(baseline)) {
    const { lines, failures } = compareTable(baseline.value, corpora);
    yield* Console.log(A.join(lines, "\n"));
    if (A.isArrayNonEmpty(failures)) return yield* LockfilesBenchRegression.make({ failures });
  }
});

const program = Effect.fn("LockfilesBench.main")(function* () {
  return yield* O.match(flagValue("--ab"), { onNone: runCompare, onSome: (rev) => Effect.scoped(runAb(rev)) });
});

program().pipe(Effect.provide(NodeServices.layer), NodeRuntime.runMain);
