/**
 * Old-versus-new parity for the repo-cli and docgen package.json readers (3-A4).
 *
 * 3-A4 retires the per-command package.json projections in repo-cli and docgen
 * and reads through `@beep/package-json` instead: repo-cli's projection readers
 * through `LenientManifest` (via the shared `manifestParser`), docgen's two
 * readers through `PackageJsonFile` (`PackageManifest` and the strict
 * `Package`), and the VersionSync updaters through
 * `PackageJsonFormat.modifyToString`. This script keeps each retired reader as
 * an oracle, transcribed from its last body on main, runs the oracle and the new
 * reader over every git-tracked `package.json` (test fixtures excluded), and
 * compares what each site reads: its verdict (read or rejected) and the values
 * it projects. The two updaters are compared byte for byte on a value-changing
 * edit of every manifest.
 *
 * A difference fails the run unless it is listed in `INTENDED` with its reason;
 * the intended differences are the behaviour changes the PR pins with tests
 * (strict JSON instead of JSONC, an object-form `workspaces` without
 * `packages`), and none of them occurs on a tracked manifest. Nothing here runs
 * in CI; the output rides in the PR body and in
 * `research/package-json-readers-parity-3a4.json`.
 *
 * Usage (from the repo root):
 *
 *   bun goals/effected-promotion/ops/package-json-readers-parity.ts [--out <report.json>]
 */
import * as NodeURL from "node:url";
import { LenientManifest } from "@beep/package-json/LenientManifest";
import { StringListField, WorkspacesField } from "@beep/package-json/ManifestFields";
import { Package } from "@beep/package-json/Package";
import { PackageJsonFormat } from "@beep/package-json/PackageJsonFormat";
import { PackageManifest } from "@beep/package-json/PackageManifest";
import { applyJsoncModification, JsoncModification, manifestParser } from "@beep/repo-cli/test/SharedInternals";
import { decodeJsoncTextAs } from "@beep/schema/Jsonc";
import { NodeRuntime, NodeServices } from "@effect/platform-node";
import * as A from "effect/Array";
import * as Console from "effect/Console";
import * as Data from "effect/Data";
import * as Effect from "effect/Effect";
import * as FileSystem from "effect/FileSystem";
import * as Layer from "effect/Layer";
import * as O from "effect/Option";
import * as Order from "effect/Order";
import * as P from "effect/Predicate";
import * as ChildProcess from "effect/process/ChildProcess";
import * as ChildProcessSpawner from "effect/process/ChildProcessSpawner";
import * as R from "effect/Record";
import * as S from "effect/Schema";
import * as Str from "effect/String";

// --- report schema ------------------------------------------------------------

const TOOL = "goals/effected-promotion/ops/package-json-readers-parity.ts";
const SCOPE = "git ls-files '*package.json' excluding **/test/fixtures/**";

const Divergence = S.Struct({ path: S.String, oracle: S.String, adopted: S.String });

const SiteRow = S.Struct({
  site: S.String,
  manifests: S.Finite,
  agree: S.Finite,
  rejectedByBoth: S.Finite,
  divergences: S.Array(Divergence),
});

const ParityReport = S.Struct({
  schemaVersion: S.Literal(1),
  tool: S.String,
  scope: S.String,
  commit: S.optionalKey(S.String),
  manifests: S.Finite,
  sites: S.Array(SiteRow),
  unclassifiedDivergences: S.Finite,
});

const encodeReport = S.encodeEffect(S.fromJsonString(ParityReport, { space: 2 }));
const encodeValue = S.encodeEffect(S.fromJsonString(S.Unknown));

class ParityFailure extends Data.TaggedError("ParityFailure")<{ readonly message: string }> {}

const repoRoot = NodeURL.fileURLToPath(new URL("../../..", import.meta.url));

const flagValue = (flag: string): O.Option<string> =>
  O.flatMap(
    A.findFirstIndex(process.argv, (arg) => arg === flag),
    (index) => A.get(process.argv, index + 1)
  );

// --- verdicts -----------------------------------------------------------------

// A reader's verdict on one manifest: what it projected, or that it rejected
// the document. Rendered as text so two verdicts compare by value.
const REJECTED = "rejected";
const NOT_APPLICABLE = "not applicable";
const hasCatalog = (text: string): Effect.Effect<boolean> =>
  LenientManifest.parse(text).pipe(
    Effect.map((manifest) => manifest.catalog !== undefined),
    Effect.orElseSucceed(() => false)
  );
const verdictOf = <A, E>(effect: Effect.Effect<A, E>, project: (value: A) => unknown): Effect.Effect<string> =>
  effect.pipe(
    Effect.flatMap((value) => encodeValue(project(value))),
    Effect.map((text) => `read ${text}`),
    Effect.orElseSucceed(() => REJECTED)
  );

const StringRecord = S.Record(S.String, S.String);
const DependencyBuckets = ["dependencies", "devDependencies", "peerDependencies", "optionalDependencies"] as const;

const isWorkspacePatternList = S.is(StringListField);
const decodeWorkspaces = S.decodeUnknownEffect(WorkspacesField);
const adoptedPatterns = (manifest: LenientManifest) =>
  P.isUndefined(manifest.workspaces)
    ? Effect.succeed(A.empty<string>())
    : Effect.map(decodeWorkspaces(manifest.workspaces), (workspaces) =>
        isWorkspacePatternList(workspaces) ? workspaces : (workspaces.packages ?? A.empty<string>())
      );

// --- the retired readers (oracles, transcribed from main) ---------------------

// ChangesetGraph `ChangesetGraphPackageJson` (one shape for the root and members).
const ChangesetGraphOracle = S.Struct({
  name: S.optionalKey(S.String),
  private: S.optionalKey(S.Boolean),
  workspaces: S.optionalKey(
    S.Union([S.Array(S.String), S.Struct({ packages: S.Array(S.String).pipe(S.optionalKey) })])
  ),
});
const decodeChangesetGraphOracle = S.decodeUnknownEffect(S.fromJsonString(ChangesetGraphOracle));
const changesetGraphOraclePatterns = (document: typeof ChangesetGraphOracle.Type): ReadonlyArray<string> =>
  P.isUndefined(document.workspaces)
    ? A.empty()
    : A.isArray(document.workspaces)
      ? (document.workspaces as ReadonlyArray<string>)
      : ((document.workspaces as { readonly packages?: ReadonlyArray<string> }).packages ?? A.empty());

// ChangesetStatus `ChangesetStatusPackageJson`.
const decodeChangesetStatusOracle = S.decodeUnknownEffect(
  S.fromJsonString(
    S.Struct({ name: S.optionalKey(S.String), version: S.optionalKey(S.String), private: S.optionalKey(S.Boolean) })
  )
);

// PackageVerify `PackageVerifyPackageJson`.
const decodePackageVerifyOracle = S.decodeUnknownEffect(
  S.fromJsonString(S.Struct({ name: S.String, scripts: S.optionalKey(StringRecord) }))
);

// QualityArtifactSupport `PackageJson` over its JSONC record read.
const decodeQualityArtifactOracle = decodeJsoncTextAs(
  S.Struct({
    name: S.String,
    scripts: S.optionalKey(StringRecord),
    workspaces: S.optionalKey(S.Unknown),
    exports: S.optionalKey(S.Unknown),
    dependencies: S.optionalKey(StringRecord),
    devDependencies: S.optionalKey(StringRecord),
    peerDependencies: S.optionalKey(StringRecord),
    optionalDependencies: S.optionalKey(StringRecord),
  })
);
const qualityArtifactOraclePatterns = (workspaces: unknown): ReadonlyArray<string> => {
  if (A.isArray(workspaces)) {
    return A.filter(workspaces, P.isString);
  }
  if (P.isObject(workspaces) && P.hasProperty(workspaces, "packages") && A.isArray(workspaces.packages)) {
    return A.filter(workspaces.packages, P.isString);
  }
  return [];
};

// Quality.schemas `PackageJsonDocument` (Tasks).
const decodeTasksOracle = S.decodeUnknownEffect(
  S.fromJsonString(
    S.Struct({
      name: S.optionalKey(S.String),
      scripts: S.optionalKey(StringRecord),
      workspaces: S.optionalKey(S.Union([S.Array(S.String), S.Struct({ packages: S.Array(S.String) })])),
    })
  )
);

// CatalogUsage.schemas `CatalogUsageManifestDependencies` (JSONC, defaulted).
const decodeCatalogUsageOracle = decodeJsoncTextAs(
  S.Struct(R.fromEntries(A.map(DependencyBuckets, (bucket) => [bucket, S.optionalKey(StringRecord)] as const)))
);

// BunResolver `BunPackageJsonDocument` (JSONC, `packageManager` defaults to "").
const decodeBunResolverOracle = decodeJsoncTextAs(S.Struct({ packageManager: S.optionalKey(S.String) }));

// RootCatalog `RootPackageJsonDocument` (JSONC, both records default to {}).
const decodeRootCatalogOracle = decodeJsoncTextAs(
  S.Struct({ catalog: S.optionalKey(StringRecord), devDependencies: S.optionalKey(StringRecord) })
);

// PackageTestTypecheck `PackageManifestDocument` (JSONC).
const decodePackageTestTypecheckOracle = decodeJsoncTextAs(
  S.Struct({ name: S.String, scripts: S.optionalKey(StringRecord) })
);

// EffectSchemaInventoryModules `RootManifest`.
const EffectCatalog = S.Struct({ effect: S.optionalKey(S.String) });
const WorkspacesWithCatalog = S.Struct({ catalog: S.optionalKey(EffectCatalog) });
const EffectSourceConfig = S.Struct({
  effectSource: S.optionalKey(S.Struct({ version: S.String, commit: S.String })),
});
const decodeInventoryPinOracle = S.decodeUnknownEffect(
  S.fromJsonString(
    S.Struct({
      catalog: S.optionalKey(EffectCatalog),
      workspaces: S.optionalKey(S.Union([S.Array(S.String), WorkspacesWithCatalog])),
      config: S.optionalKey(EffectSourceConfig),
    })
  )
);
const decodeInventoryWorkspaces = S.decodeUnknownEffect(S.Union([S.Array(S.String), WorkspacesWithCatalog]));
const decodeInventoryConfig = S.decodeUnknownEffect(EffectSourceConfig);

// CatalogUsage.schemas `CatalogUsageRootManifest` over its JSONC root read.
const CatalogUsageRoot = S.Struct({
  catalog: S.optionalKey(StringRecord),
  catalogs: S.optionalKey(S.Record(S.String, StringRecord)),
  overrides: S.optionalKey(S.Record(S.String, S.Json)),
});
const decodeCatalogUsageRootOracle = decodeJsoncTextAs(CatalogUsageRoot);
const decodeCatalogUsageRoot = S.decodeUnknownEffect(CatalogUsageRoot);
const catalogUsageRootProjection = (root: typeof CatalogUsageRoot.Type) => [
  root.catalog ?? {},
  root.catalogs ?? {},
  root.overrides ?? {},
];

// docgen `Configuration.ts` `PackageJsonSchema` (JSONC through config-file).
const decodeDocgenConfigurationOracle = decodeJsoncTextAs(S.Struct({ homepage: S.String, name: S.String }));

// docgen `Version.ts` `PackageManifestVersion`.
const decodeDocgenVersionOracle = S.decodeUnknownEffect(S.fromJsonString(S.Struct({ version: S.String })));

const decodeJson = S.decodeUnknownEffect(S.fromJsonString(S.Unknown));

// --- the adopted readers --------------------------------------------------------

const parseChangesetGraphRoot = manifestParser(["workspaces"]);
const parseChangesetGraphMember = manifestParser(["name", "private"]);
const parseChangesetStatus = manifestParser(["name", "version", "private"]);
const parsePackageVerify = manifestParser(["name", "scripts"]);
const parseQualityArtifact = manifestParser(["name", "scripts", "workspaces", ...DependencyBuckets]);
const parseTasks = manifestParser(["name", "scripts", "workspaces"]);
const parseCatalogUsage = manifestParser(DependencyBuckets);
const parseBunResolver = manifestParser(["packageManager"]);
const parseRootCatalog = manifestParser(["catalog", "devDependencies"]);
const parsePackageTestTypecheck = manifestParser(["name", "scripts"]);
const parseInventoryPin = manifestParser(["catalog", "workspaces", "config"]);
const parseCatalogUsageRoot = manifestParser(["catalog", "overrides"]);

const requireName = (manifest: LenientManifest) =>
  P.isUndefined(manifest.name) ? Effect.fail("unnamed" as const) : Effect.succeed(manifest);

const dependencies = (document: Partial<Record<(typeof DependencyBuckets)[number], Record<string, string>>>) =>
  R.fromEntries(A.map(DependencyBuckets, (bucket) => [bucket, document[bucket] ?? {}] as const));

// --- sites ----------------------------------------------------------------------

interface Site {
  readonly adopted: (text: string) => Effect.Effect<string>;
  readonly oracle: (text: string) => Effect.Effect<string>;
  readonly site: string;
}

const SITES: ReadonlyArray<Site> = [
  {
    site: "repo-cli Quality/ChangesetGraph.ts root (workspace patterns)",
    oracle: (text) => verdictOf(decodeChangesetGraphOracle(text), changesetGraphOraclePatterns),
    adopted: (text) =>
      verdictOf(Effect.flatMap(parseChangesetGraphRoot(text), adoptedPatterns), (patterns) => patterns),
  },
  {
    site: "repo-cli Quality/ChangesetGraph.ts member (name, private)",
    oracle: (text) => verdictOf(decodeChangesetGraphOracle(text), (d) => [d.name ?? null, d.private === true]),
    adopted: (text) => verdictOf(parseChangesetGraphMember(text), (m) => [m.name ?? null, m.private === true]),
  },
  {
    site: "repo-cli Quality/ChangesetStatus.ts (name, version, private)",
    oracle: (text) =>
      verdictOf(decodeChangesetStatusOracle(text), (d) => [d.name ?? null, d.version ?? null, d.private !== true]),
    adopted: (text) =>
      verdictOf(parseChangesetStatus(text), (m) => [m.name ?? null, m.version ?? null, m.private !== true]),
  },
  {
    site: "repo-cli Quality/internal/PackageVerify.ts (scripts of a named manifest)",
    oracle: (text) => verdictOf(decodePackageVerifyOracle(text), (d) => d.scripts ?? {}),
    adopted: (text) => verdictOf(Effect.flatMap(parsePackageVerify(text), requireName), (m) => m.scripts ?? {}),
  },
  {
    site: "repo-cli Quality/internal/QualityArtifactSupport.ts (name, scripts, dependencies, patterns)",
    oracle: (text) =>
      verdictOf(decodeQualityArtifactOracle(text), (d) => [
        d.name,
        d.scripts ?? null,
        dependencies(d),
        qualityArtifactOraclePatterns(d.workspaces),
      ]),
    adopted: (text) =>
      verdictOf(Effect.flatMap(parseQualityArtifact(text), requireName), (m) => [
        m.name,
        m.scripts ?? null,
        dependencies(m),
        qualityArtifactOraclePatterns(m.workspaces),
      ]),
  },
  {
    site: "repo-cli Quality/Tasks.ts (name, scripts, workspace patterns)",
    oracle: (text) =>
      verdictOf(decodeTasksOracle(text), (d) => [
        d.name ?? null,
        d.scripts ?? {},
        P.isUndefined(d.workspaces)
          ? []
          : A.isArray(d.workspaces)
            ? d.workspaces
            : (d.workspaces as { readonly packages: ReadonlyArray<string> }).packages,
      ]),
    adopted: (text) =>
      verdictOf(
        Effect.flatMap(parseTasks(text), (m) => Effect.map(adoptedPatterns(m), (patterns) => [m, patterns] as const)),
        ([m, patterns]) => [m.name ?? null, m.scripts ?? {}, patterns]
      ),
  },
  {
    site: "repo-cli Quality/CatalogUsage.ts root (catalog, catalogs, overrides)",
    oracle: (text) => verdictOf(decodeCatalogUsageRootOracle(text), catalogUsageRootProjection),
    adopted: (text) =>
      verdictOf(
        Effect.flatMap(parseCatalogUsageRoot(text), (root) =>
          decodeCatalogUsageRoot(
            R.getSomes({
              catalog: O.fromUndefinedOr(root.catalog),
              catalogs: O.flatMap(O.fromUndefinedOr(root.rest), R.get("catalogs")),
              overrides: O.fromUndefinedOr(root.overrides),
            })
          )
        ),
        catalogUsageRootProjection
      ),
  },
  {
    site: "repo-cli Quality/CatalogUsage.ts (four dependency buckets)",
    oracle: (text) => verdictOf(decodeCatalogUsageOracle(text), dependencies),
    adopted: (text) => verdictOf(parseCatalogUsage(text), dependencies),
  },
  {
    site: "repo-cli VersionSync BunResolver.ts (packageManager)",
    oracle: (text) => verdictOf(decodeBunResolverOracle(text), (d) => d.packageManager ?? ""),
    adopted: (text) => verdictOf(parseBunResolver(text), (m) => m.packageManager ?? ""),
  },
  {
    site: "repo-cli VersionSync RootCatalog.ts (catalog, devDependencies)",
    oracle: (text) => verdictOf(decodeRootCatalogOracle(text), (d) => [d.catalog ?? {}, d.devDependencies ?? {}]),
    adopted: (text) => verdictOf(parseRootCatalog(text), (m) => [m.catalog ?? {}, m.devDependencies ?? {}]),
  },
  {
    site: "repo-cli Lint/PackageTestTypecheck.ts (name, scripts)",
    oracle: (text) => verdictOf(decodePackageTestTypecheckOracle(text), (d) => [d.name, d.scripts ?? {}]),
    adopted: (text) =>
      verdictOf(Effect.flatMap(parsePackageTestTypecheck(text), requireName), (m) => [m.name, m.scripts ?? {}]),
  },
  {
    site: "repo-cli Lint/internal/EffectSchemaInventoryModules.ts (effect catalog specifier, effectSource)",
    oracle: (text) =>
      verdictOf(decodeInventoryPinOracle(text), (d) => [
        d.catalog?.effect ??
          (P.isUndefined(d.workspaces) || A.isArray(d.workspaces)
            ? null
            : ((d.workspaces as typeof WorkspacesWithCatalog.Type).catalog?.effect ?? null)),
        d.config?.effectSource ?? null,
      ]),
    adopted: (text) =>
      verdictOf(
        Effect.gen(function* () {
          const manifest = yield* parseInventoryPin(text);
          const workspaces = P.isUndefined(manifest.workspaces)
            ? O.none()
            : O.some(yield* decodeInventoryWorkspaces(manifest.workspaces));
          const config = P.isUndefined(manifest.config)
            ? O.none()
            : O.some(yield* decodeInventoryConfig(manifest.config));
          return { manifest, workspaces, config };
        }),
        ({ manifest, workspaces, config }) => [
          O.getOrNull(O.flatMap(O.fromUndefinedOr(manifest.catalog), R.get("effect"))) ??
            O.getOrNull(
              O.flatMap(workspaces, (value) =>
                isWorkspacePatternList(value) ? O.none() : O.fromUndefinedOr(value.catalog?.effect)
              )
            ),
          O.getOrNull(O.flatMap(config, (value) => O.fromUndefinedOr(value.effectSource))),
        ]
      ),
  },
  {
    site: "docgen Configuration.ts (name, homepage)",
    oracle: (text) => verdictOf(decodeDocgenConfigurationOracle(text), (d) => [d.name, d.homepage]),
    adopted: (text) =>
      verdictOf(
        Effect.flatMap(decodeJson(text), PackageManifest.decode).pipe(
          Effect.filterOrFail(
            (m) => !P.isUndefined(m.name) && !P.isUndefined(m.homepage),
            () => "incomplete" as const
          )
        ),
        (m) => [m.name, m.homepage]
      ),
  },
  {
    site: "docgen Version.ts (version)",
    oracle: (text) => verdictOf(decodeDocgenVersionOracle(text), (d) => d.version),
    adopted: (text) => verdictOf(Effect.flatMap(decodeJson(text), Package.decode), (p) => p.version.toString()),
  },
  {
    site: "repo-cli VersionSync PackageJsonUpdater.ts (packageManager edit bytes)",
    oracle: (text) =>
      Effect.succeed(
        applyJsoncModification(JsoncModification.make({ content: text, path: ["packageManager"], value: "bun@9.9.9" }))
      ),
    adopted: (text) =>
      PackageJsonFormat.modifyToString(text, ["packageManager"], "bun@9.9.9").pipe(
        Effect.orElseSucceed(() => REJECTED)
      ),
  },
  {
    // The updater only rewrites an entry of an existing root `catalog` (the
    // drift items come from that catalog), so manifests without one are out
    // of its domain.
    site: "repo-cli VersionSync PackageJsonUpdater.ts (catalog entry edit bytes, manifests with a catalog)",
    oracle: (text) =>
      Effect.map(hasCatalog(text), (applies) =>
        applies
          ? applyJsoncModification(
              JsoncModification.make({ content: text, path: ["catalog", "effect"], value: "9.9.9" })
            )
          : NOT_APPLICABLE
      ),
    adopted: (text) =>
      Effect.flatMap(hasCatalog(text), (applies) =>
        applies
          ? PackageJsonFormat.modifyToString(text, ["catalog", "effect"], "9.9.9").pipe(
              Effect.orElseSucceed(() => REJECTED)
            )
          : Effect.succeed(NOT_APPLICABLE)
      ),
  },
];

// Differences the PR intends, by site and path; each is pinned by a test. The
// other intended changes (JSONC text, a mixed-type `workspaces` array, an
// object-form `workspaces` without `packages`) occur on no tracked manifest.
const INTENDED: ReadonlyArray<{ readonly site: string; readonly path: string; readonly reason: string }> = [
  {
    site: "repo-cli VersionSync PackageJsonUpdater.ts (packageManager edit bytes)",
    path: "scratchpad/effected/sbom/package.json",
    reason:
      "The kit edit keeps the file's own indentation (tabs here); the retired jsonc edit always inserted 2-space lines into a tab-indented file.",
  },
];

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
  const texts = yield* Effect.forEach(paths, (path) =>
    Effect.map(fileSystem.readFileString(`${repoRoot}${path}`), (text) => [path, text] as const)
  );
  const sites = yield* Effect.forEach(SITES, (site) =>
    Effect.gen(function* () {
      const verdicts = yield* Effect.forEach(texts, ([path, text]) =>
        Effect.map(Effect.all([site.oracle(text), site.adopted(text)]), ([oracle, adopted]) => ({
          path,
          oracle,
          adopted,
        }))
      );
      const divergences = A.filter(verdicts, (row) => row.oracle !== row.adopted);
      return {
        site: site.site,
        manifests: A.length(verdicts),
        agree: A.length(verdicts) - A.length(divergences),
        rejectedByBoth: A.length(A.filter(verdicts, (row) => row.oracle === REJECTED && row.adopted === REJECTED)),
        divergences,
      };
    })
  );
  const unclassified = A.flatMap(sites, (row) =>
    A.filter(
      row.divergences,
      (divergence) => !A.some(INTENDED, (entry) => entry.site === row.site && entry.path === divergence.path)
    )
  );
  const commit = yield* spawner.string(ChildProcess.make("git", ["rev-parse", "HEAD"], { cwd: repoRoot })).pipe(
    Effect.map(Str.trim),
    Effect.map(O.liftPredicate(Str.isNonEmpty)),
    Effect.orElseSucceed(() => O.none<string>())
  );
  const json = yield* encodeReport({
    schemaVersion: 1,
    tool: TOOL,
    scope: SCOPE,
    ...O.match(commit, { onNone: () => ({}), onSome: (sha) => ({ commit: sha }) }),
    manifests: A.length(paths),
    sites,
    unclassifiedDivergences: A.length(unclassified),
  });
  yield* O.match(flagValue("--out"), {
    onNone: () => Console.log(json),
    onSome: (path) => fileSystem.writeFileString(path, `${json}\n`),
  });
  for (const row of sites) {
    yield* Console.log(`${row.agree}/${row.manifests} agree  ${row.site}`);
  }
  if (A.isReadonlyArrayNonEmpty(unclassified)) {
    return yield* new ParityFailure({
      message: `${A.length(unclassified)} unclassified reader divergence(s); see the report.`,
    });
  }
});

// The entry point builds the platform services once and runs the program in their context.
NodeRuntime.runMain(
  Layer.build(NodeServices.layer).pipe(
    Effect.flatMap((services) => program.pipe(Effect.provide(services))),
    Effect.scoped
  )
);
