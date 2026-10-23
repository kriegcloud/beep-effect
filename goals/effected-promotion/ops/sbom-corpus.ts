/**
 * `@beep/sbom` live corpus (wave 4-S, W4-b).
 *
 * Reads every git-tracked `package.json` in the repository (test fixtures
 * excluded), decodes it through `@beep/package-json` `Package`, derives an SBOM
 * with `SbomMetadataSource.rootComponent` and `fromPackage` (one dependency
 * component per runtime `dependencies` entry, through `componentFor`), and
 * records per manifest:
 *
 * - the full-schema verdict against the vendored CycloneDX 1.6 schema, through
 *   an `ajv` validator built here over the package's vendored schema file
 *   (read as data, so this script imports nothing from the package's tests);
 * - the `NtiaReport` verdict and its missing elements;
 * - byte stability: two generations from the same manifest serialize to the
 *   same bytes.
 *
 * Gate: 0 schema failures and 0 unstable manifests (exit 1 otherwise). NTIA
 * verdicts are recorded, not gated: a repo manifest names no supplier and the
 * corpus passes no BOM author, so elements 1 and 6 are expected gaps. Manifests
 * `Package` rejects are counted and listed, not failed; that tier is
 * `ops/package-json-corpus.ts`'s. Nothing here runs in CI; the output rides in
 * the PR body.
 *
 * Usage (from the repo root):
 *
 *   bun goals/effected-promotion/ops/sbom-corpus.ts [--out <report.json>]
 */

import * as NodeURL from "node:url";
import { Package } from "@beep/package-json/Package";
import { NtiaElementId, NtiaReport } from "@beep/sbom/NtiaReport";
import { Sbom } from "@beep/sbom/Sbom";
import { SbomMetadataSource } from "@beep/sbom/SbomMetadataSource";
import { LiteralKit } from "@beep/schema/LiteralKit";
import { NodeRuntime, NodeServices } from "@effect/platform-node";
import { Ajv } from "ajv";
import { fullFormats } from "ajv-formats/dist/formats.js";
import * as A from "effect/Array";
import * as Console from "effect/Console";
import * as Data from "effect/Data";
import * as Effect from "effect/Effect";
import * as FileSystem from "effect/FileSystem";
import { pipe } from "effect/Function";
import * as HashMap from "effect/HashMap";
import * as Layer from "effect/Layer";
import * as O from "effect/Option";
import * as Order from "effect/Order";
import * as ChildProcess from "effect/process/ChildProcess";
import * as ChildProcessSpawner from "effect/process/ChildProcessSpawner";
import * as Result from "effect/Result";
import * as S from "effect/Schema";
import * as Str from "effect/String";

// --- report schema ------------------------------------------------------------

const TOOL = "goals/effected-promotion/ops/sbom-corpus.ts";
const SCOPE = "git ls-files '*package.json' excluding **/test/fixtures/**";
/** A fixed assembly instant, so the corpus is deterministic. */
const TIMESTAMP = "2026-10-23T00:00:00.000Z";

const Verdict = LiteralKit(["valid", "schema-invalid", "package-rejected"]);

const ManifestRow = S.Struct({
  path: S.NonEmptyString,
  verdict: Verdict,
  components: S.optionalKey(S.Int),
  violations: S.String.pipe(S.Array, S.optionalKey),
  ntiaCompliant: S.optionalKey(S.Boolean),
  ntiaMissing: NtiaElementId.pipe(S.Array, S.optionalKey),
  stable: S.optionalKey(S.Boolean),
});
type ManifestRow = typeof ManifestRow.Type;

const Totals = S.Struct({
  manifests: S.Int,
  packageRejected: S.Int,
  generated: S.Int,
  schemaFailures: S.Int,
  unstable: S.Int,
  ntiaCompliant: S.Int,
  dependencyComponents: S.Int,
});
type Totals = typeof Totals.Type;

const MissingCount = S.Struct({ element: NtiaElementId, manifests: S.Int });

const CorpusReport = S.Struct({
  schemaVersion: S.tag(1),
  tool: S.tag(TOOL),
  scope: S.tag(SCOPE),
  commit: S.optionalKey(S.String),
  timestamp: S.String,
  totals: Totals,
  ntiaMissing: S.Array(MissingCount),
  manifests: S.Array(ManifestRow),
});
type CorpusReport = typeof CorpusReport.Type;

const encodeReport = S.encodeEffect(S.fromJsonString(CorpusReport, { space: 2 }));
const decodeJson = S.decodeEffect(S.fromJsonString(S.Unknown));
const parseJson = S.decodeUnknownResult(S.fromJsonString(S.Unknown));

class CorpusGateFailed extends Data.TaggedError("CorpusGateFailed")<{ readonly message: string }> {}

// --- validator ----------------------------------------------------------------

/** The vendored CycloneDX 1.6 schema, read as data; `test/fixtures/VENDORED.md` pins its bytes by sha256. */
const VENDORED_SCHEMA = "packages/foundation/modeling/sbom/test/fixtures/bom-1.6.SNAPSHOT.schema.json";

const SchemaDocument = S.Record(S.String, S.Unknown);
const decodeSchema = S.decodeEffect(S.fromJsonString(SchemaDocument));

/** One emitted document's full-schema violations, as `<instancePath> <keyword>` lines; empty when valid. */
type Violations = (document: unknown) => ReadonlyArray<string>;

/**
 * The full-schema validator, with the same recorded stand-ins and format
 * registrations as the package's `test/support/cyclonedx.ts` (VENDORED.md
 * records why): the SPDX and JSF sibling schemas are not vendored yet, and
 * `ajv-formats` implements neither `idn-email` nor `iri-reference`.
 */
const violationsAgainst = (schema: typeof SchemaDocument.Type): Violations => {
  const validator = new Ajv({
    allErrors: true,
    strict: false,
    formats: { ...fullFormats, "iri-reference": true, "idn-email": true },
  })
    .addSchema({ $id: "http://cyclonedx.org/schema/jsf-0.82.SNAPSHOT.schema.json", definitions: { signature: {} } })
    .addSchema({ $id: "http://cyclonedx.org/schema/spdx.SNAPSHOT.schema.json", type: "string" })
    .compile(schema);
  return (document) =>
    validator(document)
      ? A.empty()
      : A.map(validator.errors ?? [], ({ instancePath, keyword }) => `${instancePath} ${keyword}`);
};

// --- census -------------------------------------------------------------------

const repoRoot = NodeURL.fileURLToPath(new URL("../../..", import.meta.url));
const argv = A.drop(process.argv, 2);
const flagValue = (name: string): O.Option<string> =>
  pipe(
    A.findFirstIndex(argv, (arg) => arg === name),
    O.flatMap((index) => A.get(argv, index + 1))
  );

/** One SBOM for a decoded manifest: the root, its runtime dependencies as components, and explicit-only metadata. */
const sbomOf = (pkg: Package) =>
  Sbom.generate({
    root: SbomMetadataSource.rootComponent(pkg),
    components: pipe(
      HashMap.keys(pkg.dependencies),
      A.fromIterable,
      A.map((name) => SbomMetadataSource.componentFor({ name }))
    ),
    metadata: SbomMetadataSource.fromPackage(pkg, { timestamp: TIMESTAMP }),
  });

const censusOne = Effect.fn("SbomCorpus.censusOne")(function* (
  cycloneDxViolations: Violations,
  path: string,
  text: string
) {
  const decoded = yield* decodeJson(text).pipe(Effect.flatMap(Package.decode), Effect.option);
  if (O.isNone(decoded)) {
    const rejected: ManifestRow = { path, verdict: "package-rejected" };
    return rejected;
  }
  const document = sbomOf(decoded.value);
  const json = Sbom.toJson(document);
  const violations = pipe(json, parseJson, Result.getOrThrow, cycloneDxViolations);
  const report = NtiaReport.of(document);
  const row: ManifestRow = {
    path,
    verdict: A.isReadonlyArrayNonEmpty(violations) ? "schema-invalid" : "valid",
    components: A.length(document.components),
    ...(A.isReadonlyArrayNonEmpty(violations) && { violations }),
    ntiaCompliant: report.compliant,
    ntiaMissing: report.missing,
    stable: Sbom.toJson(sbomOf(decoded.value)) === json,
  };
  return row;
});

const count = (rows: ReadonlyArray<ManifestRow>, predicate: (row: ManifestRow) => boolean): number =>
  A.length(A.filter(rows, predicate));

const totalsOf = (rows: ReadonlyArray<ManifestRow>): Totals => ({
  manifests: A.length(rows),
  packageRejected: count(rows, (row) => row.verdict === "package-rejected"),
  generated: count(rows, (row) => row.verdict !== "package-rejected"),
  schemaFailures: count(rows, (row) => row.verdict === "schema-invalid"),
  unstable: count(rows, (row) => row.stable === false),
  ntiaCompliant: count(rows, (row) => row.ntiaCompliant === true),
  dependencyComponents: A.reduce(rows, 0, (sum, row) => sum + (row.components ?? 0)),
});

const missingOf = (rows: ReadonlyArray<ManifestRow>) =>
  A.map(NtiaElementId.literals, (element) => ({
    element,
    manifests: count(rows, (row) => A.contains(row.ntiaMissing ?? [], element)),
  }));

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
  const violations = violationsAgainst(
    yield* fileSystem.readFileString(`${repoRoot}${VENDORED_SCHEMA}`).pipe(Effect.flatMap(decodeSchema))
  );
  const rows = yield* Effect.forEach(paths, (path) =>
    fileSystem.readFileString(`${repoRoot}${path}`).pipe(Effect.flatMap((text) => censusOne(violations, path, text)))
  );
  const commit = yield* spawner.string(ChildProcess.make("git", ["rev-parse", "HEAD"], { cwd: repoRoot })).pipe(
    Effect.map(Str.trim),
    Effect.map(O.liftPredicate(Str.isNonEmpty)),
    Effect.orElseSucceed(() => O.none<string>())
  );
  const totals = totalsOf(rows);
  const report: CorpusReport = {
    schemaVersion: 1,
    tool: TOOL,
    scope: SCOPE,
    ...O.match(commit, { onNone: () => ({}), onSome: (sha) => ({ commit: sha }) }),
    timestamp: TIMESTAMP,
    totals,
    ntiaMissing: missingOf(rows),
    manifests: rows,
  };
  const json = yield* encodeReport(report);
  yield* O.match(flagValue("--out"), {
    onNone: () => Console.log(json),
    onSome: (path) => fileSystem.writeFileString(path, `${json}\n`),
  });
  yield* Console.log(
    `manifests ${totals.manifests}  generated ${totals.generated}  package-rejected ${totals.packageRejected}  schema failures ${totals.schemaFailures}  unstable ${totals.unstable}  NTIA compliant ${totals.ntiaCompliant}`
  );
  if (totals.schemaFailures > 0 || totals.unstable > 0) {
    return yield* new CorpusGateFailed({
      message: `sbom corpus gate failed: ${totals.schemaFailures} schema failures, ${totals.unstable} unstable`,
    });
  }
});

NodeRuntime.runMain(
  Layer.build(NodeServices.layer).pipe(
    Effect.flatMap((services) => program.pipe(Effect.provide(services))),
    Effect.scoped
  )
);
