/**
 * Data types and tagged errors for sync-data-to-ts.
 *
 * @packageDocumentation
 * @since 0.0.0
 */

import { $RepoCliId } from "@beep/identity/packages";
import { LiteralKit } from "@beep/schema";
import { Effect } from "effect";
import * as Crypto from "effect/Crypto";
import * as S from "effect/Schema";
import { HttpClient } from "effect/unstable/http";
import type { JsonPatch } from "effect";
import type { SyncDataToTsError } from "../SyncDataToTs.errors.js";

/**
 * Public sync-data-to-ts error exports.
 *
 * @category errors
 * @since 0.0.0
 */
export { SyncDataToTsDriftError, SyncDataToTsError } from "../SyncDataToTs.errors.js";

const $I = $RepoCliId.create("commands/SyncDataToTs/internal/Models");

const SyncDataSourceFormatKit = LiteralKit(["json", "csv", "xml", "bytes", "text"]);

/**
 * Supported source formats for sync-data-to-ts helpers.
 *
 * @category models
 * @since 0.0.0
 */
export const SyncDataSourceFormat = SyncDataSourceFormatKit.pipe(
  $I.annoteSchema("SyncDataSourceFormat", {
    description: "Supported source formats for sync-data-to-ts helpers.",
  })
);

/**
 * Supported source formats for sync-data-to-ts helpers.
 *
 * @category models
 * @since 0.0.0
 */
export type SyncDataSourceFormat = typeof SyncDataSourceFormat.Type;

const SyncDataRunModeKit = LiteralKit(["write", "check", "dry-run"]);

/**
 * Command execution mode for sync-data-to-ts.
 *
 * @category models
 * @since 0.0.0
 */
export const SyncDataRunMode = SyncDataRunModeKit.pipe(
  $I.annoteSchema("SyncDataRunMode", {
    description: "Command execution mode for sync-data-to-ts.",
  })
);

/**
 * Command execution mode for sync-data-to-ts.
 *
 * @category models
 * @since 0.0.0
 */
export type SyncDataRunMode = typeof SyncDataRunMode.Type;

/**
 * Stable source metadata recorded in generated sidecars and PR reports.
 *
 * @category models
 * @since 0.0.0
 */
export class SyncDataSourceMetadata extends S.Class<SyncDataSourceMetadata>($I`SyncDataSourceMetadata`)(
  {
    id: S.String,
    url: S.String,
    sha256: S.String,
    version: S.optionalKey(S.String),
    published: S.optionalKey(S.String),
  },
  $I.annote("SyncDataSourceMetadata", {
    description: "Stable metadata for one upstream source used by a sync target.",
  })
) {}

/**
 * A generated file emitted by a sync target.
 *
 * @category models
 * @since 0.0.0
 */
export class SyncDataOutputFile extends S.Class<SyncDataOutputFile>($I`SyncDataOutputFile`)(
  {
    path: S.String,
    content: S.String,
  },
  $I.annote("SyncDataOutputFile", {
    description: "Generated file content with its repo-relative output path.",
  })
) {}

/**
 * Rendered target projection ready to compare or write to disk.
 *
 * @category models
 * @since 0.0.0
 */
export class SyncDataTargetProjection extends S.Class<SyncDataTargetProjection>($I`SyncDataTargetProjection`)(
  {
    files: S.Array(SyncDataOutputFile),
    canonicalPath: S.String,
    canonical: S.Json,
    recordCount: S.Finite,
    summary: S.String,
    sources: S.Array(SyncDataSourceMetadata),
  },
  $I.annote("SyncDataTargetProjection", {
    description: "Rendered target projection ready to compare or write to disk.",
  })
) {}

/**
 * Effect requirements shared by checked-in sync targets.
 *
 * @category models
 * @since 0.0.0
 */
export type SyncDataTargetServices = HttpClient.HttpClient | Crypto.Crypto;

/**
 * Checked-in sync target definition.
 *
 * @category models
 * @since 0.0.0
 */
export interface SyncDataTarget {
  readonly id: string;
  readonly description: string;
  readonly sourceUrls: ReadonlyArray<string>;
  readonly acquire: Effect.Effect<SyncDataTargetProjection, SyncDataToTsError, SyncDataTargetServices>;
}

/**
 * Per-file command result after diffing or writing.
 *
 * @category models
 * @since 0.0.0
 */
export class SyncDataFileResult extends S.Class<SyncDataFileResult>($I`SyncDataFileResult`)(
  {
    path: S.String,
    changed: S.Boolean,
  },
  $I.annote("SyncDataFileResult", {
    description: "Per-file sync result after diffing or writing.",
  })
) {}

/**
 * Per-target command result after diffing or writing.
 *
 * @category models
 * @since 0.0.0
 */
export interface SyncDataTargetResult {
  readonly targetId: string;
  readonly outputPaths: ReadonlyArray<string>;
  readonly changed: boolean;
  readonly changedFiles: ReadonlyArray<string>;
  readonly fileResults: ReadonlyArray<SyncDataFileResult>;
  readonly recordCount: number;
  readonly summary: string;
  readonly sourceUrls: ReadonlyArray<string>;
  readonly sources: ReadonlyArray<SyncDataSourceMetadata>;
  readonly canonicalPath: string;
  readonly canonicalPatch: JsonPatch.JsonPatch;
}
