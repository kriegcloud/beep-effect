/**
 * Tagged errors for the TsconfigSync command suite.
 *
 * @packageDocumentation
 * @since 0.0.0
 */
import { $RepoCliId } from "@beep/identity/packages";
import { TaggedErrorClass } from "@beep/schema";
import * as S from "effect/Schema";

const $I = $RepoCliId.create("commands/TsconfigSync/TsconfigSync.errors"); /**
 * Drift error raised in check mode when changes are required.
 *
 * @category utilities
 * @since 0.0.0
 */
export class TsconfigSyncDriftError extends TaggedErrorClass<TsconfigSyncDriftError>($I`TsconfigSyncDriftError`)(
  "TsconfigSyncDriftError",
  {
    fileCount: S.Number,
    summary: S.String,
  },
  $I.annote("TsconfigSyncDriftError", {
    title: "Tsconfig Sync Drift Error",
    description: "Raised when tsconfig-sync --check detects one or more files that are out of sync.",
  })
) {}

/**
 * Cycle error raised when workspace dependency cycles are detected.
 *
 * @category utilities
 * @since 0.0.0
 */
export class TsconfigSyncCycleError extends TaggedErrorClass<TsconfigSyncCycleError>($I`TsconfigSyncCycleError`)(
  "TsconfigSyncCycleError",
  {
    cycles: S.String.pipe(S.Array, S.Array),
    message: S.String,
  },
  $I.annote("TsconfigSyncCycleError", {
    title: "Tsconfig Sync Cycle Error",
    description: "Raised when workspace dependency graph contains one or more cycles.",
  })
) {}

/**
 * Filter error raised when `--filter` does not match any workspace package.
 *
 * @category utilities
 * @since 0.0.0
 */
export class TsconfigSyncFilterError extends TaggedErrorClass<TsconfigSyncFilterError>($I`TsconfigSyncFilterError`)(
  "TsconfigSyncFilterError",
  {
    filter: S.String,
    message: S.String,
  },
  $I.annote("TsconfigSyncFilterError", {
    title: "Tsconfig Sync Filter Error",
    description: "Raised when tsconfig-sync filter does not match any workspace package name or path.",
  })
) {}
