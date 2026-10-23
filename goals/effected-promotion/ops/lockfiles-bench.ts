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
 *
 * Flags: `--runs <n>` (default 31), `--warmup <n>` (default 3),
 * `--min-sample-ms <n>` (default 300).
 */
import { Lockfile } from "@beep/lockfiles/Lockfile";
import { NodeRuntime, NodeServices } from "@effect/platform-node";
import * as A from "effect/Array";
import * as Console from "effect/Console";
import * as Data from "effect/Data";
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

class LockfilesBenchRegression extends Data.TaggedError("LockfilesBenchRegression")<{
  readonly failures: ReadonlyArray<string>;
}> {}

class LockfilesBenchUsage extends Data.TaggedError("LockfilesBenchUsage")<{
  readonly message: string;
}> {}

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

const parseOnce = (content: string, format: LockfileFormat): O.Option<Lockfile> =>
  pipe(Effect.runSyncExit(Lockfile.parse(content, { format })), Exit.getSuccess);

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

const parseWorkload = (id: string, content: string, format: LockfileFormat, lockfile: Lockfile): Workload => ({
  id,
  operation: "parse",
  bytes: Buffer.byteLength(content, "utf8"),
  packages: lockfile.packages.length,
  workspaces: lockfile.workspacePackages.length,
  runOnce: () => O.isSome(parseOnce(content, format)),
});

const renameWorkload = (id: string, content: string, lockfile: Lockfile): Workload => {
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

class BenchCorpusUnreadable extends Data.TaggedError("BenchCorpusUnreadable")<{ readonly id: string }> {}

const loadWorkloads = Effect.fn("LockfilesBench.loadWorkloads")(function* () {
  const fileSystem = yield* FileSystem.FileSystem;
  const pathApi = yield* Path.Path;
  const corpus = Effect.fn("LockfilesBench.corpus")(function* (id: string, file: string, format: LockfileFormat) {
    const content = yield* fileSystem.readFileString(file);
    const lockfile = yield* pipe(
      parseOnce(content, format),
      O.match({ onNone: () => Effect.fail(new BenchCorpusUnreadable({ id })), onSome: Effect.succeed })
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
        parseWorkload(id, content, format, lockfile)
      )
  );
  return {
    reference: makeReference(root.content),
    workloads: A.appendAll(
      [
        parseWorkload("root-bun-lock", root.content, "bun", root.lockfile),
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

// --- main ---------------------------------------------------------------------

// `git rev-parse HEAD` of the checkout that produced the report.
const gitHead = (): O.Option<string> => {
  const result = Bun.spawnSync(["git", "rev-parse", "HEAD"], { cwd: repoRoot });
  return pipe(
    O.some(result.stdout.toString().trim()),
    O.filter((text) => result.exitCode === 0 && /^[0-9a-f]{40}$/.test(text))
  );
};

const program = Effect.fn("LockfilesBench.main")(function* () {
  const fileSystem = yield* FileSystem.FileSystem;
  const comparePath = flagValue("--compare");
  const baseline = yield* pipe(
    comparePath,
    O.match({
      onNone: () => Effect.succeed(O.none<BenchReport>()),
      onSome: (path) =>
        fileSystem.readFileString(path).pipe(
          Effect.flatMap(decodeReport),
          Effect.flatMap((report) =>
            report.workloadVersion === WORKLOAD_VERSION
              ? Effect.succeed(O.some(report))
              : Effect.fail(
                  new LockfilesBenchUsage({
                    message: `baseline workloadVersion ${report.workloadVersion} != ${WORKLOAD_VERSION}`,
                  })
                )
          )
        ),
    })
  );
  const { reference, workloads } = yield* loadWorkloads();
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
    if (A.isArrayNonEmpty(failures)) return yield* Effect.fail(new LockfilesBenchRegression({ failures }));
  }
});

program().pipe(Effect.provide(NodeServices.layer), NodeRuntime.runMain);
