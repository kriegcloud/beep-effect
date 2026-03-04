/**
 * Data types and tagged errors for the version-sync command.
 *
 * @since 0.0.0
 * @module
 */

import { $RepoCliId } from "@beep/identity/packages";
import { LiteralKit } from "@beep/schema";
import { Tuple } from "effect";
import * as S from "effect/Schema";

const $I = $RepoCliId.create("commands/version-sync/types");

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
export const VersionCategory = LiteralKit(["bun", "node", "docker", "biome"]).annotate(
  $I.annote("VersionCategory", {
    description: "Version category for grouping drift items",
  })
);
export type VersionCategory = typeof VersionCategory.Type;
/**
 * Status of a version category.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export const VersionCategoryStatus = LiteralKit(["ok", "drift", "unpinned", "error"]).annotate(
  $I.annote("VersionCategoryStatus", {
    description: "Status of a version category",
  })
);
export type VersionCategoryStatus = typeof VersionCategoryStatus.Type;

/**
 * Report for a single version category (bun, node, or docker).
 *
 * @since 0.0.0
 * @category DomainModel
 */

export const makeVersionCategoryReport = <Category extends VersionCategory>(categoryTag: S.Literal<Category>) => {
  const make = <Status extends VersionCategoryStatus>(statusTag: S.Literal<Status>) => {
    return S.Struct({
      category: S.tag(categoryTag.literal),
      status: S.tag(statusTag.literal),
      items: S.Array(VersionDriftItem),
      error: S.Option(S.String),
      latest: S.Option(S.String),
    });
  };

  return VersionCategoryStatus.mapMembers(Tuple.evolve([make, make, make, make])).pipe(S.toTaggedUnion("status"));
};

export const VersionCategoryReport = VersionCategory.mapMembers(
  Tuple.evolve([
    makeVersionCategoryReport,
    makeVersionCategoryReport,
    makeVersionCategoryReport,
    makeVersionCategoryReport,
  ])
)
  .pipe(S.toTaggedUnion("category"))
  .annotate(
    $I.annote("VersionCategoryReport", {
      description: "Report for a single version category, including its status, items, and error",
    })
  );
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
export const VersionSyncMode = LiteralKit(["check", "write", "dry-run"]).annotate(
  $I.annote("VersionSyncMode", {
    description: "Command execution mode for version sync operations",
  })
);

export type VersionSyncMode = typeof VersionSyncMode.Type;

/**
 * Resolved command options after flag parsing.
 *
 * @since 0.0.0
 * @category DomainModel
 */
const makeVersionSyncOption = <T extends VersionSyncMode>(modeTag: S.Literal<T>) =>
  S.Struct({
    mode: S.tag(modeTag.literal),
    skipNetwork: S.Boolean,
    bunOnly: S.Boolean,
    nodeOnly: S.Boolean,
    dockerOnly: S.Boolean,
    biomeOnly: S.Boolean,
  });

export const VersionSyncOptions = VersionSyncMode.mapMembers(
  Tuple.evolve([makeVersionSyncOption, makeVersionSyncOption, makeVersionSyncOption])
);

export type VersionSyncOptions = typeof VersionSyncOptions.Type;
