/**
 * @file peer-deps-sync Input Validation Schemas
 *
 * Defines Effect Schema validation for peer-deps-sync command inputs.
 *
 * @module peer-deps-sync/schemas
 * @since 0.1.0
 */

import * as S from "effect/Schema";

/**
 * Input schema for the peer-deps-sync command.
 *
 * @since 0.1.0
 * @category schemas
 */
export class PeerDepsSyncInput extends S.Class<PeerDepsSyncInput>("PeerDepsSyncInput")({
  check: S.Boolean,
  dryRun: S.Boolean,
  filter: S.optional(S.String),
  verbose: S.Boolean,
  preCommit: S.Boolean,
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
export const getSyncMode = (input: PeerDepsSyncInput): SyncMode => {
  if (input.check) return "check";
  if (input.dryRun) return "dry-run";
  return "sync";
};
