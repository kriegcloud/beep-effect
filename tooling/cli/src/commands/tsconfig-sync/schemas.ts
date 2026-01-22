/**
 * @file tsconfig-sync Input Validation Schemas
 *
 * Defines Effect Schema validation for tsconfig-sync command inputs.
 *
 * @module tsconfig-sync/schemas
 * @since 1.0.0
 */

import * as S from "effect/Schema";

/**
 * Input schema for the tsconfig-sync command.
 *
 * @since 0.1.0
 * @category schemas
 */
export class TsconfigSyncInput extends S.Class<TsconfigSyncInput>("TsconfigSyncInput")({
  /** When true, validate without modification (exit code 1 on drift) */
  check: S.Boolean,
  /** When true, preview changes without writing files */
  dryRun: S.Boolean,
  /** Optional package filter (e.g., "@beep/iam-server") */
  filter: S.optional(S.String),
  /** When true, skip transitive dependency hoisting */
  noHoist: S.Boolean,
  /** When true, show detailed output */
  verbose: S.Boolean,
  /** When true, only sync packages (skip apps) */
  packagesOnly: S.Boolean,
  /** When true, only sync apps (skip packages) */
  appsOnly: S.Boolean,
}) {}

/**
 * Sync mode determined from input flags.
 *
 * @since 0.1.0
 * @category models
 */
export type SyncMode = "check" | "dry-run" | "sync";

/**
 * Determine the sync mode from input flags.
 *
 * @since 0.1.0
 * @category utils
 */
export const getSyncMode = (input: TsconfigSyncInput): SyncMode => {
  if (input.check) return "check";
  if (input.dryRun) return "dry-run";
  return "sync";
};
