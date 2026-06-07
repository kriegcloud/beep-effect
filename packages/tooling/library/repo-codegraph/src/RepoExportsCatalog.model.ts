/**
 * Schema-first models for the generated repo export catalog.
 *
 * @packageDocumentation
 * @since 0.0.0
 */

import { $RepoCodegraphId } from "@beep/identity/packages";
import { LiteralKit, UnknownRecord } from "@beep/schema";
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
export const RepoExportsCatalogStandard = LiteralKit(["repo-exports-catalog"]).pipe(
  $I.annoteSchema("RepoExportsCatalogStandard", {
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
export const RepoExportsCatalogSchemaVersion = LiteralKit(["repo-exports-catalog/v1"]).pipe(
  $I.annoteSchema("RepoExportsCatalogSchemaVersion", {
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
 * const authority = RepoExportsCatalogAuthority.make({
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
 * const source = RepoExportsCatalogSource.make({
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
 * const totals = RepoExportsCatalogTotals.make({
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
    packages: S.Finite,
    packagesWithPublicExports: S.Finite,
    packagesWithoutPublicExports: S.Finite,
    missingWorkspaceMetadata: S.Finite,
    importSpecifiers: S.Finite,
    publicExportEntries: S.Finite,
    uniquePackageSymbols: S.Finite,
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
 * const counts = RepoExportsCatalogPackageCounts.make({
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
    publicExportEntries: S.Finite,
    uniqueSymbols: S.Finite,
    sourceFiles: S.Finite,
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
 * const entry = RepoExportsCatalogEntry.make({
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
    topoOrder: S.Finite,
    importSpecifier: S.String,
    exportSubpath: S.String,
    exportedFromPath: S.String,
    symbolName: S.String,
    exportKind: S.String,
    sourcePath: S.String,
    sourceLine: S.Finite,
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
 * const pkg = RepoExportsCatalogPackage.make({
 *   counts: RepoExportsCatalogPackageCounts.make({
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
    topoOrder: S.Finite,
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
 * Generated export catalog shard standard identifier.
 *
 * @example
 * ```ts
 * import { RepoExportsCatalogShardStandard } from "@beep/repo-codegraph"
 * console.log(RepoExportsCatalogShardStandard.Enum["repo-exports-catalog-shard"])
 * ```
 * @category models
 * @since 0.0.0
 */
export const RepoExportsCatalogShardStandard = LiteralKit(["repo-exports-catalog-shard"]).pipe(
  $I.annoteSchema("RepoExportsCatalogShardStandard", {
    description: "Standard identifier for a package-local repo export catalog shard.",
  })
);

/**
 * Runtime type for {@link RepoExportsCatalogShardStandard}.
 *
 * @example
 * ```ts
 * import type { RepoExportsCatalogShardStandard } from "@beep/repo-codegraph"
 * const standard: RepoExportsCatalogShardStandard = "repo-exports-catalog-shard"
 * console.log(standard)
 * ```
 * @category models
 * @since 0.0.0
 */
export type RepoExportsCatalogShardStandard = typeof RepoExportsCatalogShardStandard.Type;

/**
 * Generated export catalog shard schema version.
 *
 * @example
 * ```ts
 * import { RepoExportsCatalogShardSchemaVersion } from "@beep/repo-codegraph"
 * console.log(RepoExportsCatalogShardSchemaVersion.Enum["repo-exports-catalog-shard/v1"])
 * ```
 * @category models
 * @since 0.0.0
 */
export const RepoExportsCatalogShardSchemaVersion = LiteralKit(["repo-exports-catalog-shard/v1"]).pipe(
  $I.annoteSchema("RepoExportsCatalogShardSchemaVersion", {
    description: "Schema version for package-local repo export catalog shards.",
  })
);

/**
 * Runtime type for {@link RepoExportsCatalogShardSchemaVersion}.
 *
 * @example
 * ```ts
 * import type { RepoExportsCatalogShardSchemaVersion } from "@beep/repo-codegraph"
 * const version: RepoExportsCatalogShardSchemaVersion = "repo-exports-catalog-shard/v1"
 * console.log(version)
 * ```
 * @category models
 * @since 0.0.0
 */
export type RepoExportsCatalogShardSchemaVersion = typeof RepoExportsCatalogShardSchemaVersion.Type;

/**
 * One content input recorded in a repo export catalog shard fingerprint.
 *
 * @example
 * ```ts
 * import { RepoExportsCatalogShardFingerprintInput } from "@beep/repo-codegraph"
 * const input = RepoExportsCatalogShardFingerprintInput.make({
 *   bytes: 42,
 *   path: "packages/example/package.json",
 *   sha256: "a".repeat(64)
 * })
 * console.log(input.path)
 * ```
 * @category models
 * @since 0.0.0
 */
export class RepoExportsCatalogShardFingerprintInput extends S.Class<RepoExportsCatalogShardFingerprintInput>(
  $I`RepoExportsCatalogShardFingerprintInput`
)(
  {
    path: S.String,
    sha256: S.String,
    bytes: S.Finite,
  },
  $I.annote("RepoExportsCatalogShardFingerprintInput", {
    description: "One package or generator file input recorded in a package-local repo export shard fingerprint.",
  })
) {}

/**
 * Deterministic content fingerprint for a repo export catalog shard.
 *
 * @example
 * ```ts
 * import { RepoExportsCatalogShardFingerprint } from "@beep/repo-codegraph"
 * const fingerprint = RepoExportsCatalogShardFingerprint.make({
 *   algorithm: "sha256",
 *   digest: "b".repeat(64),
 *   inputs: []
 * })
 * console.log(fingerprint.algorithm)
 * ```
 * @category models
 * @since 0.0.0
 */
export class RepoExportsCatalogShardFingerprint extends S.Class<RepoExportsCatalogShardFingerprint>(
  $I`RepoExportsCatalogShardFingerprint`
)(
  {
    algorithm: S.Literal("sha256"),
    digest: S.String,
    inputs: S.Array(RepoExportsCatalogShardFingerprintInput),
  },
  $I.annote("RepoExportsCatalogShardFingerprint", {
    description: "Deterministic content fingerprint metadata for a package-local repo export shard.",
  })
) {}

/**
 * Package-local generated repo export catalog shard.
 *
 * @example
 * ```ts
 * import { RepoExportsCatalogShard } from "@beep/repo-codegraph"
 * import { RepoExportsCatalogShardFingerprint } from "@beep/repo-codegraph"
 * import { RepoExportsCatalogPackage } from "@beep/repo-codegraph"
 * const shard = RepoExportsCatalogShard.make({
 *   deterministic: true,
 *   fingerprint: RepoExportsCatalogShardFingerprint.make({
 *     algorithm: "sha256",
 *     digest: "c".repeat(64),
 *     inputs: []
 *   }),
 *   package: RepoExportsCatalogPackage.make({
 *     counts: { publicExportEntries: 0, sourceFiles: 0, uniqueSymbols: 0 },
 *     exports: [],
 *     importSpecifiers: [],
 *     packageName: "@beep/example",
 *     packagePath: "packages/example",
 *     status: "no-public-exports",
 *     topoOrder: 1
 *   }),
 *   schemaVersion: "repo-exports-catalog-shard/v1",
 *   source: {},
 *   standard: "repo-exports-catalog-shard"
 * })
 * console.log(shard.package.packageName)
 * ```
 * @category models
 * @since 0.0.0
 */
export class RepoExportsCatalogShard extends S.Class<RepoExportsCatalogShard>($I`RepoExportsCatalogShard`)(
  {
    standard: RepoExportsCatalogShardStandard,
    schemaVersion: RepoExportsCatalogShardSchemaVersion,
    deterministic: S.Boolean,
    source: UnknownRecord,
    fingerprint: RepoExportsCatalogShardFingerprint,
    package: RepoExportsCatalogPackage,
  },
  $I.annote("RepoExportsCatalogShard", {
    description: "Package-local generated shard containing one package's public repo export facts.",
  })
) {}

/**
 * Generated export catalog index standard identifier.
 *
 * @example
 * ```ts
 * import { RepoExportsCatalogIndexStandard } from "@beep/repo-codegraph"
 * console.log(RepoExportsCatalogIndexStandard.Enum["repo-exports-catalog-index"])
 * ```
 * @category models
 * @since 0.0.0
 */
export const RepoExportsCatalogIndexStandard = LiteralKit(["repo-exports-catalog-index"]).pipe(
  $I.annoteSchema("RepoExportsCatalogIndexStandard", {
    description: "Standard identifier for the root repo export catalog shard index.",
  })
);

/**
 * Runtime type for {@link RepoExportsCatalogIndexStandard}.
 *
 * @example
 * ```ts
 * import type { RepoExportsCatalogIndexStandard } from "@beep/repo-codegraph"
 * const standard: RepoExportsCatalogIndexStandard = "repo-exports-catalog-index"
 * console.log(standard)
 * ```
 * @category models
 * @since 0.0.0
 */
export type RepoExportsCatalogIndexStandard = typeof RepoExportsCatalogIndexStandard.Type;

/**
 * Generated export catalog index schema version.
 *
 * @example
 * ```ts
 * import { RepoExportsCatalogIndexSchemaVersion } from "@beep/repo-codegraph"
 * console.log(RepoExportsCatalogIndexSchemaVersion.Enum["repo-exports-catalog-index/v1"])
 * ```
 * @category models
 * @since 0.0.0
 */
export const RepoExportsCatalogIndexSchemaVersion = LiteralKit(["repo-exports-catalog-index/v1"]).pipe(
  $I.annoteSchema("RepoExportsCatalogIndexSchemaVersion", {
    description: "Schema version for the root repo export catalog shard index.",
  })
);

/**
 * Runtime type for {@link RepoExportsCatalogIndexSchemaVersion}.
 *
 * @example
 * ```ts
 * import type { RepoExportsCatalogIndexSchemaVersion } from "@beep/repo-codegraph"
 * const version: RepoExportsCatalogIndexSchemaVersion = "repo-exports-catalog-index/v1"
 * console.log(version)
 * ```
 * @category models
 * @since 0.0.0
 */
export type RepoExportsCatalogIndexSchemaVersion = typeof RepoExportsCatalogIndexSchemaVersion.Type;

/**
 * One package entry in the compact root repo export catalog index.
 *
 * @example
 * ```ts
 * import { RepoExportsCatalogIndexPackage } from "@beep/repo-codegraph"
 * const pkg = RepoExportsCatalogIndexPackage.make({
 *   packageName: "@beep/example",
 *   packagePath: "packages/example",
 *   shardPath: "packages/example/.beep/repo-exports/catalog.shard.jsonc",
 *   status: "has-public-exports",
 *   topoOrder: 1
 * })
 * console.log(pkg.shardPath)
 * ```
 * @category models
 * @since 0.0.0
 */
export class RepoExportsCatalogIndexPackage extends S.Class<RepoExportsCatalogIndexPackage>(
  $I`RepoExportsCatalogIndexPackage`
)(
  {
    packageName: S.String,
    packagePath: S.String,
    topoOrder: S.Finite,
    status: S.String,
    shardPath: S.optionalKey(S.String),
  },
  $I.annote("RepoExportsCatalogIndexPackage", {
    description: "Compact package reference in the root repo export catalog index.",
  })
) {}

/**
 * Compact root index for package-local repo export catalog shards.
 *
 * @example
 * ```ts
 * import { RepoExportsCatalogIndex } from "@beep/repo-codegraph"
 * import { RepoExportsCatalogSource } from "@beep/repo-codegraph"
 * const index = RepoExportsCatalogIndex.make({
 *   authority: {
 *     boundaryDoctrine: ["standards/ARCHITECTURE.md"],
 *     canonicalStatus: "not-evaluated",
 *     note: "Descriptive export metadata.",
 *     posture: "descriptive-current-state"
 *   },
 *   deterministic: true,
 *   packages: [],
 *   schemaVersion: "repo-exports-catalog-index/v1",
 *   source: RepoExportsCatalogSource.make({
 *     generator: "bun run beep quality repo-exports-catalog",
 *     inputs: ["package.json exports"],
 *     packageUniverseCommand: "bun run topo-sort"
 *   }),
 *   standard: "repo-exports-catalog-index",
 *   totals: {
 *     importSpecifiers: 0,
 *     missingWorkspaceMetadata: 0,
 *     packages: 0,
 *     packagesWithPublicExports: 0,
 *     packagesWithoutPublicExports: 0,
 *     publicExportEntries: 0,
 *     uniquePackageSymbols: 0
 *   }
 * })
 * console.log(index.standard)
 * ```
 * @category models
 * @since 0.0.0
 */
export class RepoExportsCatalogIndex extends S.Class<RepoExportsCatalogIndex>($I`RepoExportsCatalogIndex`)(
  {
    standard: RepoExportsCatalogIndexStandard,
    schemaVersion: RepoExportsCatalogIndexSchemaVersion,
    deterministic: S.Boolean,
    authority: RepoExportsCatalogAuthority,
    source: RepoExportsCatalogSource,
    totals: RepoExportsCatalogTotals,
    packages: S.Array(RepoExportsCatalogIndexPackage),
  },
  $I.annote("RepoExportsCatalogIndex", {
    description: "Compact root index that lets repo-codegraph hydrate package-local repo export shards.",
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
 * Decode unknown input into a compact repo export catalog index.
 *
 * @example
 * ```ts
 * import { decodeRepoExportsCatalogIndex } from "@beep/repo-codegraph"
 * console.log(decodeRepoExportsCatalogIndex)
 * ```
 * @category schemas
 * @since 0.0.0
 */
export const decodeRepoExportsCatalogIndex = S.decodeUnknownEffect(RepoExportsCatalogIndex);

/**
 * Decode unknown input into a package-local repo export catalog shard.
 *
 * @example
 * ```ts
 * import { decodeRepoExportsCatalogShard } from "@beep/repo-codegraph"
 * console.log(decodeRepoExportsCatalogShard)
 * ```
 * @category schemas
 * @since 0.0.0
 */
export const decodeRepoExportsCatalogShard = S.decodeUnknownEffect(RepoExportsCatalogShard);
