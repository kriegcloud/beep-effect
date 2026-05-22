/**
 * Tagged errors for the VersionSync command suite.
 *
 * @packageDocumentation
 * @since 0.0.0
 */
import { $RepoCliId } from "@beep/identity/packages";
import { TaggedErrorClass } from "@beep/schema";
import * as S from "effect/Schema";

const $I = $RepoCliId.create("commands/VersionSync/VersionSync.errors"); /**
 * Operational error during version sync (file read/write, parse failures).
 *
 * @category utilities
 * @since 0.0.0
 */
export class VersionSyncError extends TaggedErrorClass<VersionSyncError>($I`VersionSyncError`)(
  "VersionSyncError",
  { message: S.String, file: S.String, cause: S.optionalKey(S.Defect) },
  $I.annote("VersionSyncError", {
    title: "Version Sync Error",
    description: "Failed to read, resolve, or update a version pin",
  })
) {}

/**
 * Network unavailable during upstream version resolution.
 *
 * @category utilities
 * @since 0.0.0
 */
export class NetworkUnavailableError extends TaggedErrorClass<NetworkUnavailableError>($I`NetworkUnavailableError`)(
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
 * @category utilities
 * @since 0.0.0
 */
export class VersionSyncDriftError extends TaggedErrorClass<VersionSyncDriftError>($I`VersionSyncDriftError`)(
  "VersionSyncDriftError",
  { message: S.String, driftCount: S.Number },
  $I.annote("VersionSyncDriftError", {
    title: "Version Sync Drift Error",
    description: "Version drift detected in check mode",
  })
) {}
