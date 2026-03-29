/**
 * Data types and tagged errors for sync-data-to-ts.
 *
 * @module
 * @since 0.0.0
 */

import {$RepoCliId} from "@beep/identity/packages";
import {LiteralKit, TaggedErrorClass} from "@beep/schema";
import type {Effect} from "effect";
import * as S from "effect/Schema";

const $I = $RepoCliId.create("commands/SyncDataToTs/internal/Models");

const SyncDataSourceFormatKit = LiteralKit([
  "json",
  "csv",
  "xml"
]);

/**
 * Supported source formats for sync-data-to-ts targets.
 *
 * @category DomainModel
 * @since 0.0.0
 */
export const SyncDataSourceFormat = SyncDataSourceFormatKit.annotate(
  $I.annote(
    "SyncDataSourceFormat",
    {
      description: "Supported source formats for sync-data-to-ts targets.",
    }
  )
);

/**
 * Supported source formats for sync-data-to-ts targets.
 *
 * @category DomainModel
 * @since 0.0.0
 */
export type SyncDataSourceFormat = typeof SyncDataSourceFormat.Type;

const SyncDataRunModeKit = LiteralKit([
  "write",
  "check",
  "dry-run"
]);

/**
 * Command execution mode for sync-data-to-ts.
 *
 * @category DomainModel
 * @since 0.0.0
 */
export const SyncDataRunMode = SyncDataRunModeKit.annotate(
  $I.annote(
    "SyncDataRunMode",
    {
      description: "Command execution mode for sync-data-to-ts.",
    }
  )
);

/**
 * Command execution mode for sync-data-to-ts.
 *
 * @category DomainModel
 * @since 0.0.0
 */
export type SyncDataRunMode = typeof SyncDataRunMode.Type;

/**
 * Operational error during source fetch, parsing, projection, or file writes.
 *
 * @category CrossCutting
 * @since 0.0.0
 */
export class SyncDataToTsError extends TaggedErrorClass<SyncDataToTsError>($I`SyncDataToTsError`)(
  "SyncDataToTsError",
  {
    message: S.String,
    targetId: S.optional(S.String),
    file: S.optional(S.String),
    cause: S.optional(S.Defect),
  },
  $I.annote(
    "SyncDataToTsError",
    {
      title: "Sync Data To TypeScript Error",
      description: "Failed to fetch, decode, normalize, render, or write synced data.",
    }
  )
) {
}

/**
 * Drift detected in check mode.
 *
 * @category CrossCutting
 * @since 0.0.0
 */
export class SyncDataToTsDriftError extends TaggedErrorClass<SyncDataToTsDriftError>($I`SyncDataToTsDriftError`)(
  "SyncDataToTsDriftError",
  {
    message: S.String,
    driftCount: S.Number,
  },
  $I.annote(
    "SyncDataToTsDriftError",
    {
      title: "Sync Data To TypeScript Drift Error",
      description: "Generated data drift was detected while running in check mode.",
    }
  )
) {
}

/**
 * Rendered target projection ready to compare or write to disk.
 *
 * @category DomainModel
 * @since 0.0.0
 */
export class SyncDataTargetProjection extends S.Class<SyncDataTargetProjection>($I`SyncDataTargetProjection`)(
  {
    content: S.String,
    recordCount: S.Number,
    summary: S.String,
  },
  $I.annote(
    "SyncDataTargetProjection",
    {
      description: "Rendered target projection ready to compare or write to disk."
    }
  )
) {
}


/**
 * Checked-in sync target definition.
 *
 * @category DomainModel
 * @since 0.0.0
 */
export type SyncDataTarget = {
  readonly id: string;
  readonly description: string;
  readonly sourceUrl: string;
  readonly outputPath: string;
  readonly format: SyncDataSourceFormat;
  readonly project: (document: unknown) => Effect.Effect<SyncDataTargetProjection, SyncDataToTsError>;
};

/**
 * Per-target command result after diffing or writing.
 *
 * @category DomainModel
 * @since 0.0.0
 */
export class SyncDataTargetResult extends S.Class<SyncDataTargetResult>($I`SyncDataTargetResult`)(
  {
    targetId: S.String,
    outputPath: S.String,
    changed: S.Boolean,
    recordCount: S.Number,
    summary: S.String,
    sourceUrl: S.String,
  },
  $I.annote(
    "SyncDataTargetResult",
    {
      description: "Per-target sync result after diffing or writing.",
    }
  )
) {
}
