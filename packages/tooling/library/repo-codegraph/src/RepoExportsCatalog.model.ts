/**
 * Schema-first models for the generated repo export catalog.
 *
 * @packageDocumentation
 * @since 0.0.0
 */

import { $RepoCodegraphId } from "@beep/identity/packages";
import { LiteralKit } from "@beep/schema";
import { Effect } from "effect";
import * as S from "effect/Schema";

const $I = $RepoCodegraphId.create("RepoExportsCatalog.model");

/**
 * Generated export catalog standard identifier.
 *
 * @example
 * ```ts
 * import { RepoExportsCatalogStandard } from "@beep/repo-codegraph"
 * console.log(RepoExportsCatalogStandard.Enum["repo-exports-catalog"])
 * ```
 * @category models
 * @since 0.0.0
 */
export const RepoExportsCatalogStandard = LiteralKit(["repo-exports-catalog"] as const).annotate(
  $I.annote("RepoExportsCatalogStandard", {
    description: "Standard identifier for the generated repo export catalog.",
  })
);

/**
 * Runtime type for {@link RepoExportsCatalogStandard}.
 *
 * @example
 * ```ts
 * import type { RepoExportsCatalogStandard } from "@beep/repo-codegraph"
 * const standard: RepoExportsCatalogStandard = "repo-exports-catalog"
 * console.log(standard)
 * ```
 * @category models
 * @since 0.0.0
 */
export type RepoExportsCatalogStandard = typeof RepoExportsCatalogStandard.Type;

/**
 * Generated export catalog schema version.
 *
 * @example
 * ```ts
 * import { RepoExportsCatalogSchemaVersion } from "@beep/repo-codegraph"
 * console.log(RepoExportsCatalogSchemaVersion.Enum["repo-exports-catalog/v1"])
 * ```
 * @category models
 * @since 0.0.0
 */
export const RepoExportsCatalogSchemaVersion = LiteralKit(["repo-exports-catalog/v1"] as const).annotate(
  $I.annote("RepoExportsCatalogSchemaVersion", {
    description: "Schema version for the generated repo export catalog consumed by lookup.",
  })
);

/**
 * Runtime type for {@link RepoExportsCatalogSchemaVersion}.
 *
 * @example
 * ```ts
 * import type { RepoExportsCatalogSchemaVersion } from "@beep/repo-codegraph"
 * const version: RepoExportsCatalogSchemaVersion = "repo-exports-catalog/v1"
 * console.log(version)
 * ```
 * @category models
 * @since 0.0.0
 */
export type RepoExportsCatalogSchemaVersion = typeof RepoExportsCatalogSchemaVersion.Type;

/**
 * Current authority posture recorded by the export catalog.
 *
 * @example
 * ```ts
 * import { RepoExportsCatalogAuthority } from "@beep/repo-codegraph"
 * const authority = new RepoExportsCatalogAuthority({
 *   boundaryDoctrine: ["standards/ARCHITECTURE.md"],
 *   canonicalStatus: "not-evaluated",
 *   note: "Descriptive export metadata.",
 *   posture: "descriptive-current-state"
 * })
 * console.log(authority.posture)
 * ```
 * @category models
 * @since 0.0.0
 */
export class RepoExportsCatalogAuthority extends S.Class<RepoExportsCatalogAuthority>($I`RepoExportsCatalogAuthority`)(
  {
    posture: S.String,
    canonicalStatus: S.String,
    boundaryDoctrine: S.Array(S.String),
    note: S.String,
  },
  $I.annote("RepoExportsCatalogAuthority", {
    description: "Authority metadata proving the export catalog is descriptive, not architecture doctrine.",
  })
) {}

/**
 * Source metadata for the generated export catalog.
 *
 * @example
 * ```ts
 * import { RepoExportsCatalogSource } from "@beep/repo-codegraph"
 * const source = new RepoExportsCatalogSource({
 *   generator: "bun run beep quality repo-exports-catalog",
 *   inputs: ["package.json exports"],
 *   packageUniverseCommand: "bun run topo-sort"
 * })
 * console.log(source.generator)
 * ```
 * @category models
 * @since 0.0.0
 */
export class RepoExportsCatalogSource extends S.Class<RepoExportsCatalogSource>($I`RepoExportsCatalogSource`)(
  {
    packageUniverseCommand: S.String,
    generator: S.String,
    inputs: S.Array(S.String),
  },
  $I.annote("RepoExportsCatalogSource", {
    description: "Source-of-truth metadata for the generated repo export catalog.",
  })
) {}

/**
 * Count metadata recorded in the generated export catalog.
 *
 * @example
 * ```ts
 * import { RepoExportsCatalogTotals } from "@beep/repo-codegraph"
 * const totals = new RepoExportsCatalogTotals({
 *   importSpecifiers: 1,
 *   missingWorkspaceMetadata: 0,
 *   packages: 1,
 *   packagesWithPublicExports: 1,
 *   packagesWithoutPublicExports: 0,
 *   publicExportEntries: 1,
 *   uniquePackageSymbols: 1
 * })
 * console.log(totals.packages)
 * ```
 * @category models
 * @since 0.0.0
 */
export class RepoExportsCatalogTotals extends S.Class<RepoExportsCatalogTotals>($I`RepoExportsCatalogTotals`)(
  {
    packages: S.Number,
    packagesWithPublicExports: S.Number,
    packagesWithoutPublicExports: S.Number,
    missingWorkspaceMetadata: S.Number,
    importSpecifiers: S.Number,
    publicExportEntries: S.Number,
    uniquePackageSymbols: S.Number,
  },
  $I.annote("RepoExportsCatalogTotals", {
    description: "Aggregate counts recorded by the generated repo export catalog.",
  })
) {}

/**
 * Per-package counts in the generated export catalog.
 *
 * @example
 * ```ts
 * import { RepoExportsCatalogPackageCounts } from "@beep/repo-codegraph"
 * const counts = new RepoExportsCatalogPackageCounts({
 *   publicExportEntries: 1,
 *   sourceFiles: 1,
 *   uniqueSymbols: 1
 * })
 * console.log(counts.uniqueSymbols)
 * ```
 * @category models
 * @since 0.0.0
 */
export class RepoExportsCatalogPackageCounts extends S.Class<RepoExportsCatalogPackageCounts>(
  $I`RepoExportsCatalogPackageCounts`
)(
  {
    publicExportEntries: S.Number,
    uniqueSymbols: S.Number,
    sourceFiles: S.Number,
  },
  $I.annote("RepoExportsCatalogPackageCounts", {
    description: "Per-package export counts recorded by the generated repo export catalog.",
  })
) {}

/**
 * One legal public export fact from the generated catalog.
 *
 * @example
 * ```ts
 * import { RepoExportsCatalogEntry } from "@beep/repo-codegraph"
 * const entry = new RepoExportsCatalogEntry({
 *   categories: ["schemas"],
 *   exportKind: "const",
 *   exportSubpath: ".",
 *   exportedFromPath: "packages/foundation/modeling/schema/src/index.ts",
 *   importSpecifier: "@beep/schema",
 *   packageName: "@beep/schema",
 *   packagePath: "packages/foundation/modeling/schema",
 *   searchText: "unknown record",
 *   since: ["0.0.0"],
 *   sourceLine: 29,
 *   sourcePath: "packages/foundation/modeling/schema/src/Record.ts",
 *   summary: "Schema for object records with string keys and unknown values.",
 *   symbolName: "UnknownRecord",
 *   tags: ["@category"],
 *   topoOrder: 1
 * })
 * console.log(entry.importSpecifier)
 * ```
 * @category models
 * @since 0.0.0
 */
export class RepoExportsCatalogEntry extends S.Class<RepoExportsCatalogEntry>($I`RepoExportsCatalogEntry`)(
  {
    packageName: S.String,
    packagePath: S.String,
    topoOrder: S.Number,
    importSpecifier: S.String,
    exportSubpath: S.String,
    exportedFromPath: S.String,
    symbolName: S.String,
    exportKind: S.String,
    sourcePath: S.String,
    sourceLine: S.Number,
    summary: S.String,
    categories: S.Array(S.String),
    since: S.Array(S.String),
    tags: S.Array(S.String),
    searchText: S.String,
  },
  $I.annote("RepoExportsCatalogEntry", {
    description: "One legal public export fact derived from package exports and TypeScript declarations.",
  })
) {}

/**
 * Per-package export catalog entry.
 *
 * @example
 * ```ts
 * import { RepoExportsCatalogPackage } from "@beep/repo-codegraph"
 * import { RepoExportsCatalogPackageCounts } from "@beep/repo-codegraph"
 * const pkg = new RepoExportsCatalogPackage({
 *   counts: new RepoExportsCatalogPackageCounts({
 *     publicExportEntries: 0,
 *     sourceFiles: 0,
 *     uniqueSymbols: 0
 *   }),
 *   exports: [],
 *   importSpecifiers: [],
 *   packageName: "@beep/example",
 *   packagePath: "packages/tooling/library/example",
 *   status: "has-public-exports",
 *   topoOrder: 1
 * })
 * console.log(pkg.packageName)
 * ```
 * @category models
 * @since 0.0.0
 */
export class RepoExportsCatalogPackage extends S.Class<RepoExportsCatalogPackage>($I`RepoExportsCatalogPackage`)(
  {
    packageName: S.String,
    packagePath: S.String,
    topoOrder: S.Number,
    status: S.String,
    importSpecifiers: S.Array(S.String),
    counts: RepoExportsCatalogPackageCounts,
    exports: S.Array(RepoExportsCatalogEntry),
  },
  $I.annote("RepoExportsCatalogPackage", {
    description: "One package entry in the generated repo export catalog.",
  })
) {}

/**
 * Generated repo export catalog.
 *
 * @example
 * ```ts
 * import { RepoExportsCatalog } from "@beep/repo-codegraph"
 * console.log(RepoExportsCatalog)
 * ```
 * @category models
 * @since 0.0.0
 */
export class RepoExportsCatalog extends S.Class<RepoExportsCatalog>($I`RepoExportsCatalog`)(
  {
    standard: RepoExportsCatalogStandard,
    schemaVersion: RepoExportsCatalogSchemaVersion,
    deterministic: S.Boolean,
    authority: RepoExportsCatalogAuthority,
    source: RepoExportsCatalogSource,
    totals: RepoExportsCatalogTotals,
    packages: S.Array(RepoExportsCatalogPackage),
  },
  $I.annote("RepoExportsCatalog", {
    description: "Generated repo export catalog consumed by repo-codegraph lookup.",
  })
) {}

/**
 * Decode unknown input into a generated repo export catalog.
 *
 * @example
 * ```ts
 * import { decodeRepoExportsCatalog } from "@beep/repo-codegraph"
 * console.log(decodeRepoExportsCatalog)
 * ```
 * @category schemas
 * @since 0.0.0
 */
export const decodeRepoExportsCatalog = S.decodeUnknownEffect(RepoExportsCatalog);

/**
 * Encode a repo export catalog into its JSON-safe representation.
 *
 * @example
 * ```ts
 * import { encodeRepoExportsCatalog } from "@beep/repo-codegraph"
 * console.log(encodeRepoExportsCatalog)
 * ```
 * @category schemas
 * @since 0.0.0
 */
export const encodeRepoExportsCatalog = S.encodeEffect(RepoExportsCatalog);

/**
 * Decode JSON text into a generated repo export catalog.
 *
 * @param content - JSON text containing a generated repo export catalog.
 * @returns Effect that decodes the JSON text into a catalog model.
 * @example
 * ```ts
 * import { decodeRepoExportsCatalogJson } from "@beep/repo-codegraph"
 * console.log(decodeRepoExportsCatalogJson)
 * ```
 * @category schemas
 * @since 0.0.0
 */
export const decodeRepoExportsCatalogJson = (content: string) =>
  S.decodeUnknownEffect(S.UnknownFromJsonString)(content).pipe(Effect.flatMap(decodeRepoExportsCatalog));
