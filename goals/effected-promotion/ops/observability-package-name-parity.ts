/**
 * `@beep/observability` `PackageName` parity (3-A9, reuse site #137).
 *
 * 3-A9 replaces the catalog's hand-rolled scoped-name pattern with
 * `@beep/package-json` `ScopedPackageName`. This script checks that the old
 * predicate and the adopted schema agree on every package name the repository
 * holds: the `name` of each git-tracked `package.json` and every package name
 * in the root `bun.lock` (parsed by `@beep/lockfiles`). The old pattern is
 * inlined below as the oracle, exactly as it stood at the cut.
 *
 * It also records the intended divergences on synthetic probes (a leading `-`
 * in the scope or the name, which npm accepts, and a name over npm's
 * 214-character limit), which the package tests pin as inverted cases.
 *
 * Exit status is non-zero when any repository name gets a different verdict.
 * Nothing here runs in CI; the output rides in the PR body.
 *
 * Usage (from the repo root):
 *
 *   bun goals/effected-promotion/ops/observability-package-name-parity.ts [--out <report.json>]
 */
import * as NodeURL from "node:url";
import { Lockfile } from "@beep/lockfiles/Lockfile";
import { PackageName } from "@beep/observability/catalog";
import { NodeRuntime, NodeServices } from "@effect/platform-node";
import * as A from "effect/Array";
import * as Console from "effect/Console";
import * as Data from "effect/Data";
import * as Effect from "effect/Effect";
import * as FileSystem from "effect/FileSystem";
import { pipe } from "effect/Function";
import * as HashSet from "effect/HashSet";
import * as O from "effect/Option";
import * as Order from "effect/Order";
import * as S from "effect/Schema";
import * as Str from "effect/String";

const TOOL = "goals/effected-promotion/ops/observability-package-name-parity.ts";
const repoRoot = NodeURL.fileURLToPath(new URL("../../..", import.meta.url));

// The pre-3-A9 `Catalog.names.ts` pattern, kept here as the oracle.
const oldPattern = /^@[a-z0-9][a-z0-9._-]*\/[a-z0-9][a-z0-9._-]*$/;
const isNew = S.is(PackageName);

const Verdict = S.Struct({ name: S.String, old: S.Boolean, new: S.Boolean });

const ParityReport = S.Struct({
  tool: S.String,
  manifestNames: S.Number,
  lockfileNames: S.Number,
  distinctNames: S.Number,
  acceptedByBoth: S.Number,
  rejectedByBoth: S.Number,
  disagreements: S.Array(Verdict),
  probes: S.Array(Verdict),
});
const encodeReport = S.encodeEffect(S.fromJsonString(ParityReport, { space: 2 }));

const ManifestName = S.fromJsonString(S.Struct({ name: S.optionalKey(S.Unknown) }));
const decodeManifestName = S.decodeUnknownOption(ManifestName);

class ParityFailed extends Data.TaggedError("ParityFailed")<{ readonly count: number }> {}

class GitFailed extends Data.TaggedError("GitFailed")<{ readonly exitCode: number }> {}

const trackedManifests = Effect.suspend(() => {
  const result = Bun.spawnSync(["git", "ls-files", "-z", "--", "package.json", "**/package.json"], {
    cwd: repoRoot,
    stdout: "pipe",
    stderr: "pipe",
  });
  return result.exitCode === 0
    ? Effect.succeed(A.filter(Str.split("\u0000")(result.stdout.toString()), Str.isNonEmpty))
    : Effect.fail(new GitFailed({ exitCode: result.exitCode }));
});

const verdict = (name: string) => ({ name, old: oldPattern.test(name), new: isNew(name) });

const probes = [
  "@beep/observability",
  "@-scope/name",
  "@scope/-name",
  `@beep/${Str.repeat(209)("a")}`,
  `@beep/${Str.repeat(208)("a")}`,
];

const program = Effect.gen(function* () {
  const fs = yield* FileSystem.FileSystem;
  const manifests = yield* trackedManifests;
  const manifestNames = yield* Effect.forEach(manifests, (path) =>
    fs.readFileString(`${repoRoot}/${path}`).pipe(
      Effect.map((text) =>
        pipe(
          decodeManifestName(text),
          O.flatMap((manifest) => O.fromNullishOr(manifest.name)),
          O.filter(S.is(S.String))
        )
      )
    )
  ).pipe(Effect.map(A.getSomes));
  const lockText = yield* fs.readFileString(`${repoRoot}/bun.lock`);
  const lockfile = yield* Lockfile.parse(lockText, { format: "bun" });
  const lockfileNames = A.map(lockfile.packages, (pkg) => pkg.name);
  const distinct = A.sort(A.fromIterable(HashSet.fromIterable([...manifestNames, ...lockfileNames])), Order.String);
  const verdicts = A.map(distinct, verdict);
  const disagreements = A.filter(verdicts, (row) => row.old !== row.new);
  const report = {
    tool: TOOL,
    manifestNames: manifestNames.length,
    lockfileNames: lockfileNames.length,
    distinctNames: distinct.length,
    acceptedByBoth: A.filter(verdicts, (row) => row.old && row.new).length,
    rejectedByBoth: A.filter(verdicts, (row) => !row.old && !row.new).length,
    disagreements,
    probes: A.map(probes, verdict),
  };
  const json = yield* encodeReport(report);
  const outIndex = process.argv.indexOf("--out");
  const out = outIndex === -1 ? O.none() : O.fromNullishOr(process.argv[outIndex + 1]);
  yield* O.match(out, {
    onNone: () => Console.log(json),
    onSome: (path) => fs.writeFileString(path, `${json}\n`),
  });
  if (A.isReadonlyArrayNonEmpty(disagreements)) {
    return yield* new ParityFailed({ count: disagreements.length });
  }
});

NodeRuntime.runMain(program.pipe(Effect.provide(NodeServices.layer)));
