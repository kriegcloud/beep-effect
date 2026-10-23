/**
 * `@beep/package-json` live corpus census (wave 3-4, W3-f).
 *
 * Reads every git-tracked `package.json` in the repository (test fixtures
 * excluded) and records, per manifest, what each tier of the package does with
 * it: the strict `Package`, the presence-lenient `PackageManifest`, the
 * shape-lenient `LenientManifest`, the decode-free `PackageJsonFormat`, and the
 * surgical `PackageJsonFormat.modifyToString` path that adopters use to write
 * repo manifests. It also checks each manifest's `name` against `PackageName`
 * and against npm's own `validate-npm-package-name` (`validForOldPackages`).
 *
 * The census is the evidence behind two W3-f rules:
 *
 * - writes to repo manifests go only through `modify`/`modifyToString`: a
 *   same-value edit must leave every byte in place (`modifyNoopIdentical`);
 * - the sorted formatter is never an adopter path: it rewrites almost every
 *   repo manifest (`formatterRewrites`).
 *
 * With `--compare <baseline.json>` it re-runs the census and fails when any
 * gated count regresses: fewer manifests decoding, a same-value `modify` that
 * changes bytes, or a `name` the two validators disagree on. The manifest count
 * itself may grow as packages are added; the per-manifest rows explain any
 * change. Nothing here runs in CI; the output rides in the PR body.
 *
 * Usage (from the repo root):
 *
 *   bun goals/effected-promotion/ops/package-json-corpus.ts [--out <report.json>]
 *   bun goals/effected-promotion/ops/package-json-corpus.ts --compare <baseline.json> [--out <report.json>]
 */
import { LenientManifest } from "@beep/package-json/LenientManifest";
import { Package } from "@beep/package-json/Package";
import { PackageJsonFormat } from "@beep/package-json/PackageJsonFormat";
import { PackageManifest } from "@beep/package-json/PackageManifest";
import { PackageName } from "@beep/package-json/PackageName";
import { NodeRuntime, NodeServices } from "@effect/platform-node";
import * as A from "effect/Array";
import * as Console from "effect/Console";
import * as Data from "effect/Data";
import * as Effect from "effect/Effect";
import * as FileSystem from "effect/FileSystem";
import { pipe } from "effect/Function";
import * as Layer from "effect/Layer";
import * as O from "effect/Option";
import * as Order from "effect/Order";
import * as P from "effect/Predicate";
import * as ChildProcess from "effect/process/ChildProcess";
import * as ChildProcessSpawner from "effect/process/ChildProcessSpawner";
import * as R from "effect/Record";
import * as Result from "effect/Result";
import * as S from "effect/Schema";
import * as Str from "effect/String";
import validate from "validate-npm-package-name";

// --- report schema ------------------------------------------------------------

const TOOL = "goals/effected-promotion/ops/package-json-corpus.ts";
const SCOPE = "git ls-files '*package.json' excluding **/test/fixtures/**";

const ManifestRow = S.Struct({
  path: S.NonEmptyString,
  name: S.optionalKey(S.String),
  strict: S.Boolean,
  presence: S.Boolean,
  lenientIssues: S.Int,
  formatterRewrites: S.Boolean,
  modifyNoopIdentical: S.optionalKey(S.Boolean),
  packageNameValid: S.optionalKey(S.Boolean),
  npmValidForOldPackages: S.optionalKey(S.Boolean),
});
type ManifestRow = typeof ManifestRow.Type;

const Totals = S.Struct({
  manifests: S.Int,
  strictDecodes: S.Int,
  presenceDecodes: S.Int,
  lenientClean: S.Int,
  formatterRewrites: S.Int,
  modifyNoopIdentical: S.Int,
  modifyNoopChanged: S.Int,
  named: S.Int,
  packageNameValid: S.Int,
  npmValidForOldPackages: S.Int,
  nameValidatorDisagreements: S.Int,
});
type Totals = typeof Totals.Type;

const CorpusReport = S.Struct({
  schemaVersion: S.Literal(1),
  tool: S.Literal(TOOL),
  scope: S.Literal(SCOPE),
  commit: S.optionalKey(S.String),
  totals: Totals,
  manifests: S.Array(ManifestRow),
});
type CorpusReport = typeof CorpusReport.Type;

const ReportJson = S.fromJsonString(CorpusReport, { space: 2 });
const encodeReport = S.encodeEffect(ReportJson);

class CorpusRegression extends Data.TaggedError("CorpusRegression")<{ readonly message: string }> {}

// --- configuration ------------------------------------------------------------

const repoRoot = new URL("../../..", import.meta.url).pathname;
const argv = A.drop(process.argv, 2);
const flagValue = (name: string): O.Option<string> =>
  pipe(
    A.findFirstIndex(argv, (arg) => arg === name),
    O.flatMap((index) => A.get(argv, index + 1))
  );

// --- census -------------------------------------------------------------------

const JsonObject = S.fromJsonString(S.Record(S.String, S.Unknown));

const isSuccess = <A, E, R>(effect: Effect.Effect<A, E, R>): Effect.Effect<boolean, never, R> =>
  effect.pipe(
    Effect.as(true),
    Effect.orElseSucceed(() => false)
  );

const censusOne = Effect.fn("PackageJsonCorpus.censusOne")(function* (path: string, text: string) {
  const raw = yield* S.decodeEffect(JsonObject)(text).pipe(Effect.option);
  const value: unknown = O.getOrUndefined(raw);
  const name = pipe(raw, O.flatMap(R.get("name")), O.filter(P.isString));
  const lenient = LenientManifest.decodeResult(value);
  const formatted = PackageJsonFormat.formatToString(text);
  const modified = yield* O.match(name, {
    onNone: () => Effect.succeed(O.none<boolean>()),
    onSome: (current) =>
      PackageJsonFormat.modifyToString(text, ["name"], current).pipe(
        Effect.map((output) => O.some(output === text)),
        Effect.orElseSucceed(() => O.some(false))
      ),
  });
  const row: ManifestRow = {
    path,
    ...O.match(name, { onNone: () => ({}), onSome: (current) => ({ name: current }) }),
    strict: yield* isSuccess(Package.decode(value)),
    presence: yield* isSuccess(PackageManifest.decode(value)),
    lenientIssues: Result.match(lenient, { onFailure: () => -1, onSuccess: (manifest) => manifest.issues.length }),
    formatterRewrites: Result.match(formatted, { onFailure: () => true, onSuccess: (output) => output !== text }),
    ...O.match(modified, { onNone: () => ({}), onSome: (identical) => ({ modifyNoopIdentical: identical }) }),
    ...O.match(name, {
      onNone: () => ({}),
      onSome: (current) => ({
        packageNameValid: PackageName.isValid(current),
        npmValidForOldPackages: validate(current).validForOldPackages,
      }),
    }),
  };
  return row;
});

const count = (rows: ReadonlyArray<ManifestRow>, predicate: (row: ManifestRow) => boolean): number =>
  A.length(A.filter(rows, predicate));

const totalsOf = (rows: ReadonlyArray<ManifestRow>): Totals => ({
  manifests: A.length(rows),
  strictDecodes: count(rows, (row) => row.strict),
  presenceDecodes: count(rows, (row) => row.presence),
  lenientClean: count(rows, (row) => row.lenientIssues === 0),
  formatterRewrites: count(rows, (row) => row.formatterRewrites),
  modifyNoopIdentical: count(rows, (row) => row.modifyNoopIdentical === true),
  modifyNoopChanged: count(rows, (row) => row.modifyNoopIdentical === false),
  named: count(rows, (row) => row.name !== undefined),
  packageNameValid: count(rows, (row) => row.packageNameValid === true),
  npmValidForOldPackages: count(rows, (row) => row.npmValidForOldPackages === true),
  nameValidatorDisagreements: count(rows, (row) => row.packageNameValid !== row.npmValidForOldPackages),
});

// --- compare ------------------------------------------------------------------

// A gated count may only stay level or move in the named direction.
const GATES: ReadonlyArray<readonly [keyof Totals, "atLeast" | "atMost"]> = [
  ["strictDecodes", "atLeast"],
  ["presenceDecodes", "atLeast"],
  ["lenientClean", "atLeast"],
  ["modifyNoopChanged", "atMost"],
  ["nameValidatorDisagreements", "atMost"],
];

const compareReports = Effect.fn("PackageJsonCorpus.compare")(function* (
  baseline: CorpusReport,
  current: CorpusReport
) {
  const regressions = A.filter(GATES, ([key, direction]) =>
    direction === "atLeast" ? current.totals[key] < baseline.totals[key] : current.totals[key] > baseline.totals[key]
  );
  for (const [key] of GATES) {
    yield* Console.log(`${Str.padEnd(28)(key)} baseline ${baseline.totals[key]}  current ${current.totals[key]}`);
  }
  if (A.isArrayNonEmpty(regressions)) {
    return yield* new CorpusRegression({
      message: `package.json corpus regressed: ${A.join(
        A.map(regressions, ([key]) => key),
        ", "
      )}`,
    });
  }
});

// --- program ------------------------------------------------------------------

const program = Effect.gen(function* () {
  const fileSystem = yield* FileSystem.FileSystem;
  const spawner = yield* ChildProcessSpawner.ChildProcessSpawner;
  const listing = yield* spawner.string(
    ChildProcess.make("git", ["ls-files", "-z", "--", "*package.json", ":(exclude)**/test/fixtures/**"], {
      cwd: repoRoot,
    })
  );
  const paths = A.sort(
    A.filter(Str.split(listing, "\u0000"), (path) => path === "package.json" || Str.endsWith("/package.json")(path)),
    Order.String
  );
  const rows = yield* Effect.forEach(paths, (path) =>
    fileSystem.readFileString(`${repoRoot}${path}`).pipe(Effect.flatMap((text) => censusOne(path, text)))
  );
  const commit = yield* spawner.string(ChildProcess.make("git", ["rev-parse", "HEAD"], { cwd: repoRoot })).pipe(
    Effect.map(Str.trim),
    Effect.map(O.liftPredicate(Str.isNonEmpty)),
    Effect.orElseSucceed(() => O.none<string>())
  );
  const report: CorpusReport = {
    schemaVersion: 1,
    tool: TOOL,
    scope: SCOPE,
    ...O.match(commit, { onNone: () => ({}), onSome: (sha) => ({ commit: sha }) }),
    totals: totalsOf(rows),
    manifests: rows,
  };
  const json = yield* encodeReport(report);
  const baselinePath = flagValue("--compare");
  yield* O.match(flagValue("--out"), {
    onNone: () => (O.isNone(baselinePath) ? Console.log(json) : Effect.void),
    onSome: (path) => fileSystem.writeFileString(path, `${json}\n`),
  });
  yield* O.match(baselinePath, {
    onNone: () => Effect.void,
    onSome: (path) =>
      fileSystem.readFileString(path).pipe(
        Effect.flatMap(S.decodeEffect(ReportJson)),
        Effect.flatMap((baseline) => compareReports(baseline, report))
      ),
  });
});

// The entry point builds the platform services once and runs the program in their context.
NodeRuntime.runMain(
  Layer.build(NodeServices.layer).pipe(
    Effect.flatMap((services) => program.pipe(Effect.provide(services))),
    Effect.scoped
  )
);
