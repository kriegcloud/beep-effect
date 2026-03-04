/**
 * Data types and tagged errors for the version-sync command.
 *
 * @since 0.0.0
 * @module
 */

import { $RepoCliId } from "@beep/identity/packages";
import { LiteralKit } from "@beep/schema";
import { Tuple } from "effect";
import * as A from "effect/Array";
import * as O from "effect/Option";
import * as S from "effect/Schema";

const $I = $RepoCliId.create("commands/VersionSync/internal/Models");

// ── Errors ──────────────────────────────────────────────────────────────────

/**
 * Operational error during version sync (file read/write, parse failures).
 *
 * @since 0.0.0
 * @category CrossCutting
 */
export class VersionSyncError extends S.TaggedErrorClass<VersionSyncError>($I`VersionSyncError`)(
  "VersionSyncError",
  { message: S.String, file: S.String, cause: S.optional(S.Defect) },
  $I.annote("VersionSyncError", {
    title: "Version Sync Error",
    description: "Failed to read, resolve, or update a version pin",
  })
) {}

/**
 * Network unavailable during upstream version resolution.
 *
 * @since 0.0.0
 * @category CrossCutting
 */
export class NetworkUnavailableError extends S.TaggedErrorClass<NetworkUnavailableError>($I`NetworkUnavailableError`)(
  "NetworkUnavailableError",
  { message: S.String },
  $I.annote("NetworkUnavailableError", {
    title: "Network Unavailable",
    description: "Upstream version resolution failed due to network",
  })
) {}

/**
 * Drift detected in check mode (non-zero exit).
 *
 * @since 0.0.0
 * @category CrossCutting
 */
export class VersionSyncDriftError extends S.TaggedErrorClass<VersionSyncDriftError>($I`VersionSyncDriftError`)(
  "VersionSyncDriftError",
  { message: S.String, driftCount: S.Number },
  $I.annote("VersionSyncDriftError", {
    title: "Version Sync Drift Error",
    description: "Version drift detected in check mode",
  })
) {}

// ── Report model ────────────────────────────────────────────────────────────

/**
 * A single version pin location with its current and expected values.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export class VersionDriftItem extends S.Class<VersionDriftItem>($I`VersionDriftItem`)(
  {
    file: S.String,
    field: S.String,
    current: S.String,
    expected: S.String,
    line: S.Option(S.Number),
  },
  $I.annote("VersionDriftItem", {
    description: "A single version pin location with its current and expected values",
  })
) {}

/**
 * Version category for grouping drift items.
 *
 * @since 0.0.0
 * @category DomainModel
 */
const VersionCategoryKit = LiteralKit(["bun", "node", "docker", "biome"]);
/**
 * Version category for grouping drift items.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export const VersionCategory = Object.assign(
  VersionCategoryKit.annotate(
    $I.annote("VersionCategory", {
      description: "Version category for grouping drift items",
    })
  ),
  {
    $match: VersionCategoryKit.$match,
    Enum: VersionCategoryKit.Enum,
    Options: VersionCategoryKit.Options,
    is: VersionCategoryKit.is,
    omitOptions: VersionCategoryKit.omitOptions,
    pickOptions: VersionCategoryKit.pickOptions,
    thunk: VersionCategoryKit.thunk,
    toTaggedUnion: VersionCategoryKit.toTaggedUnion,
  }
);
/**
 * Version category for grouping drift items.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export type VersionCategory = typeof VersionCategory.Type;
/**
 * Status of a version category.
 *
 * @since 0.0.0
 * @category DomainModel
 */
const VersionCategoryStatusKit = LiteralKit(["ok", "drift", "unpinned", "error"]);
/**
 * Status of a version category.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export const VersionCategoryStatus = Object.assign(
  VersionCategoryStatusKit.annotate(
    $I.annote("VersionCategoryStatus", {
      description: "Status of a version category",
    })
  ),
  {
    $match: VersionCategoryStatusKit.$match,
    Enum: VersionCategoryStatusKit.Enum,
    Options: VersionCategoryStatusKit.Options,
    is: VersionCategoryStatusKit.is,
    omitOptions: VersionCategoryStatusKit.omitOptions,
    pickOptions: VersionCategoryStatusKit.pickOptions,
    thunk: VersionCategoryStatusKit.thunk,
    toTaggedUnion: VersionCategoryStatusKit.toTaggedUnion,
  }
);
/**
 * Status of a version category.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export type VersionCategoryStatus = typeof VersionCategoryStatus.Type;

class VersionCategoryReportBun extends S.Class<VersionCategoryReportBun>($I`VersionCategoryReportBun`)(
  {
    category: S.tag("bun"),
    status: VersionCategoryStatus,
    items: S.Array(VersionDriftItem).pipe(
      S.withConstructorDefault(() => O.some(A.empty<VersionDriftItem>())),
      S.withDecodingDefault(() => A.empty<VersionDriftItem>())
    ),
    error: S.Option(S.String).pipe(S.withConstructorDefault(() => O.some(O.none<string>()))),
    latest: S.Option(S.String).pipe(S.withConstructorDefault(() => O.some(O.none<string>()))),
  },
  $I.annote("VersionCategoryReportBun", {
    description: "Version report entry for Bun category.",
  })
) {}

class VersionCategoryReportNode extends S.Class<VersionCategoryReportNode>($I`VersionCategoryReportNode`)(
  {
    category: S.tag("node"),
    status: VersionCategoryStatus,
    items: S.Array(VersionDriftItem).pipe(
      S.withConstructorDefault(() => O.some(A.empty<VersionDriftItem>())),
      S.withDecodingDefault(() => A.empty<VersionDriftItem>())
    ),
    error: S.Option(S.String).pipe(S.withConstructorDefault(() => O.some(O.none<string>()))),
    latest: S.Option(S.String).pipe(S.withConstructorDefault(() => O.some(O.none<string>()))),
  },
  $I.annote("VersionCategoryReportNode", {
    description: "Version report entry for Node category.",
  })
) {}

class VersionCategoryReportDocker extends S.Class<VersionCategoryReportDocker>($I`VersionCategoryReportDocker`)(
  {
    category: S.tag("docker"),
    status: VersionCategoryStatus,
    items: S.Array(VersionDriftItem).pipe(
      S.withConstructorDefault(() => O.some(A.empty<VersionDriftItem>())),
      S.withDecodingDefault(() => A.empty<VersionDriftItem>())
    ),
    error: S.Option(S.String).pipe(S.withConstructorDefault(() => O.some(O.none<string>()))),
    latest: S.Option(S.String).pipe(S.withConstructorDefault(() => O.some(O.none<string>()))),
  },
  $I.annote("VersionCategoryReportDocker", {
    description: "Version report entry for Docker category.",
  })
) {}

class VersionCategoryReportBiome extends S.Class<VersionCategoryReportBiome>($I`VersionCategoryReportBiome`)(
  {
    category: S.tag("biome"),
    status: VersionCategoryStatus,
    items: S.Array(VersionDriftItem).pipe(
      S.withConstructorDefault(() => O.some(A.empty<VersionDriftItem>())),
      S.withDecodingDefault(() => A.empty<VersionDriftItem>())
    ),
    error: S.Option(S.String).pipe(S.withConstructorDefault(() => O.some(O.none<string>()))),
    latest: S.Option(S.String).pipe(S.withConstructorDefault(() => O.some(O.none<string>()))),
  },
  $I.annote("VersionCategoryReportBiome", {
    description: "Version report entry for Biome category.",
  })
) {}

/**
 * Report for a single version category (bun, node, docker, or biome).
 *
 * @since 0.0.0
 * @category DomainModel
 */
export const VersionCategoryReport = VersionCategory.mapMembers(
  Tuple.evolve([
    () => VersionCategoryReportBun,
    () => VersionCategoryReportNode,
    () => VersionCategoryReportDocker,
    () => VersionCategoryReportBiome,
  ])
)
  .annotate(
    $I.annote("VersionCategoryReport", {
      description: "Report for a single version category, including its status, items, and error",
    })
  )
  .pipe(S.toTaggedUnion("category"));
/**
 * Report for a single version category (bun, node, docker, or biome).
 *
 * @since 0.0.0
 * @category DomainModel
 */
export type VersionCategoryReport = typeof VersionCategoryReport.Type;

/**
 * Full version sync report across all categories.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export class VersionSyncReport extends S.Class<VersionSyncReport>($I`VersionSyncReport`)(
  {
    categories: S.Array(VersionCategoryReport),
    hasDrift: S.Boolean,
  },
  $I.annote("VersionSyncReport", {
    description: "Full version sync report across all categories, including their statuses and errors",
  })
) {}

/**
 * Command execution mode.
 *
 * @since 0.0.0
 * @category DomainModel
 */
const VersionSyncModeKit = LiteralKit(["check", "write", "dry-run"]);
/**
 * Command execution mode.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export const VersionSyncMode = Object.assign(
  VersionSyncModeKit.annotate(
    $I.annote("VersionSyncMode", {
      description: "Command execution mode for version sync operations",
    })
  ),
  {
    $match: VersionSyncModeKit.$match,
    Enum: VersionSyncModeKit.Enum,
    Options: VersionSyncModeKit.Options,
    is: VersionSyncModeKit.is,
    omitOptions: VersionSyncModeKit.omitOptions,
    pickOptions: VersionSyncModeKit.pickOptions,
    thunk: VersionSyncModeKit.thunk,
    toTaggedUnion: VersionSyncModeKit.toTaggedUnion,
  }
);

/**
 * Command execution mode.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export type VersionSyncMode = typeof VersionSyncMode.Type;

const DefaultedVersionSyncFlag = S.Boolean.pipe(
  S.withConstructorDefault(() => O.some(false)),
  S.withDecodingDefault(() => false)
);

class VersionSyncOptionsCheck extends S.Class<VersionSyncOptionsCheck>($I`VersionSyncOptionsCheck`)(
  {
    mode: S.tag("check"),
    skipNetwork: DefaultedVersionSyncFlag,
    bunOnly: DefaultedVersionSyncFlag,
    nodeOnly: DefaultedVersionSyncFlag,
    dockerOnly: DefaultedVersionSyncFlag,
    biomeOnly: DefaultedVersionSyncFlag,
  },
  $I.annote("VersionSyncOptionsCheck", {
    description: "Resolved option set for check mode.",
  })
) {}

class VersionSyncOptionsWrite extends S.Class<VersionSyncOptionsWrite>($I`VersionSyncOptionsWrite`)(
  {
    mode: S.tag("write"),
    skipNetwork: DefaultedVersionSyncFlag,
    bunOnly: DefaultedVersionSyncFlag,
    nodeOnly: DefaultedVersionSyncFlag,
    dockerOnly: DefaultedVersionSyncFlag,
    biomeOnly: DefaultedVersionSyncFlag,
  },
  $I.annote("VersionSyncOptionsWrite", {
    description: "Resolved option set for write mode.",
  })
) {}

class VersionSyncOptionsDryRun extends S.Class<VersionSyncOptionsDryRun>($I`VersionSyncOptionsDryRun`)(
  {
    mode: S.tag("dry-run"),
    skipNetwork: DefaultedVersionSyncFlag,
    bunOnly: DefaultedVersionSyncFlag,
    nodeOnly: DefaultedVersionSyncFlag,
    dockerOnly: DefaultedVersionSyncFlag,
    biomeOnly: DefaultedVersionSyncFlag,
  },
  $I.annote("VersionSyncOptionsDryRun", {
    description: "Resolved option set for dry-run mode.",
  })
) {}

/**
 * Resolved command options after flag parsing.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export const VersionSyncOptions = VersionSyncMode.mapMembers(
  Tuple.evolve([() => VersionSyncOptionsCheck, () => VersionSyncOptionsWrite, () => VersionSyncOptionsDryRun])
)
  .annotate(
    $I.annote("VersionSyncOptions", {
      description: "Resolved command options after flag parsing.",
    })
  )
  .pipe(S.toTaggedUnion("mode"));

/**
 * Resolved command options after flag parsing.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export type VersionSyncOptions = typeof VersionSyncOptions.Type;

/**
 * YAML location to update in write mode.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export class VersionSyncUpdateLocation extends S.Class<VersionSyncUpdateLocation>($I`VersionSyncUpdateLocation`)(
  {
    file: S.String,
    yamlPath: S.Array(S.Union([S.String, S.Number])),
  },
  $I.annote("VersionSyncUpdateLocation", {
    description: "YAML location to update in write mode.",
  })
) {}

/**
 * Resolver output consumed by reporting and write-mode services.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export class VersionSyncResolution extends S.Class<VersionSyncResolution>($I`VersionSyncResolution`)(
  {
    report: VersionSyncReport,
    nodeLocations: S.Array(VersionSyncUpdateLocation).pipe(
      S.withConstructorDefault(() => O.some(A.empty<VersionSyncUpdateLocation>())),
      S.withDecodingDefault(() => A.empty<VersionSyncUpdateLocation>())
    ),
  },
  $I.annote("VersionSyncResolution", {
    description: "Resolver output consumed by reporting and write-mode services.",
  })
) {}
