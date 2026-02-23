/**
 * Data types and tagged errors for the version-sync command.
 *
 * @since 0.0.0
 * @module
 */

import type * as O from "effect/Option";
import * as Schema from "effect/Schema";

// ── Errors ──────────────────────────────────────────────────────────────────

/**
 * Operational error during version sync (file read/write, parse failures).
 *
 * @since 0.0.0
 * @category errors
 */
export class VersionSyncError extends Schema.TaggedErrorClass<VersionSyncError>(
  "@beep/repo-cli/commands/version-sync/VersionSyncError"
)(
  "VersionSyncError",
  { message: Schema.String, file: Schema.String, cause: Schema.optional(Schema.Unknown) },
  { title: "Version Sync Error", description: "Failed to read, resolve, or update a version pin" }
) {}

/**
 * Network unavailable during upstream version resolution.
 *
 * @since 0.0.0
 * @category errors
 */
export class NetworkUnavailableError extends Schema.TaggedErrorClass<NetworkUnavailableError>(
  "@beep/repo-cli/commands/version-sync/NetworkUnavailableError"
)(
  "NetworkUnavailableError",
  { message: Schema.String },
  { title: "Network Unavailable", description: "Upstream version resolution failed due to network" }
) {}

/**
 * Drift detected in check mode (non-zero exit).
 *
 * @since 0.0.0
 * @category errors
 */
export class VersionSyncDriftError extends Schema.TaggedErrorClass<VersionSyncDriftError>(
  "@beep/repo-cli/commands/version-sync/VersionSyncDriftError"
)(
  "VersionSyncDriftError",
  { message: Schema.String, driftCount: Schema.Number },
  { title: "Version Sync Drift Error", description: "Version drift detected in check mode" }
) {}

// ── Report model ────────────────────────────────────────────────────────────

/**
 * A single version pin location with its current and expected values.
 *
 * @since 0.0.0
 * @category models
 */
export interface VersionDriftItem {
  readonly file: string;
  readonly field: string;
  readonly current: string;
  readonly expected: string;
  readonly line: O.Option<number>;
}

/**
 * Version category for grouping drift items.
 *
 * @since 0.0.0
 * @category models
 */
export type VersionCategory = "bun" | "node" | "docker";

/**
 * Status of a version category.
 *
 * @since 0.0.0
 * @category models
 */
export type VersionCategoryStatus = "ok" | "drift" | "unpinned" | "error";

/**
 * Report for a single version category (bun, node, or docker).
 *
 * @since 0.0.0
 * @category models
 */
export interface VersionCategoryReport {
  readonly category: VersionCategory;
  readonly status: VersionCategoryStatus;
  readonly items: ReadonlyArray<VersionDriftItem>;
  readonly latest: O.Option<string>;
  readonly error: O.Option<string>;
}

/**
 * Full version sync report across all categories.
 *
 * @since 0.0.0
 * @category models
 */
export interface VersionSyncReport {
  readonly categories: ReadonlyArray<VersionCategoryReport>;
  readonly hasDrift: boolean;
}

/**
 * Command execution mode.
 *
 * @since 0.0.0
 * @category models
 */
export type VersionSyncMode = "check" | "write" | "dry-run";

/**
 * Resolved command options after flag parsing.
 *
 * @since 0.0.0
 * @category models
 */
export interface VersionSyncOptions {
  readonly mode: VersionSyncMode;
  readonly skipNetwork: boolean;
  readonly bunOnly: boolean;
  readonly nodeOnly: boolean;
  readonly dockerOnly: boolean;
}
