/**
 * Data types and tagged errors for sync-data-to-ts.
 *
 * @packageDocumentation
 * @since 0.0.0
 */

import { $RepoCliId } from "@beep/identity/packages";
import { Fn, LiteralKit } from "@beep/schema";
import { Effect, Tuple } from "effect";
import * as S from "effect/Schema";
import type { SyncDataToTsError } from "../SyncDataToTs.errors.js";

/**
 * Public sync-data-to-ts error exports.
 *
 * @category errors
 * @since 0.0.0
 */
export { SyncDataToTsDriftError, SyncDataToTsError } from "../SyncDataToTs.errors.js";

const $I = $RepoCliId.create("commands/SyncDataToTs/internal/Models");

const SyncDataSourceFormatKit = LiteralKit(["json", "csv", "xml"]);

/**
 * Supported source formats for sync-data-to-ts targets.
 *
 * @category models
 * @since 0.0.0
 */
export const SyncDataSourceFormat = SyncDataSourceFormatKit.annotate(
  $I.annote("SyncDataSourceFormat", {
    description: "Supported source formats for sync-data-to-ts targets.",
  })
);

/**
 * Supported source formats for sync-data-to-ts targets.
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
export const SyncDataRunMode = SyncDataRunModeKit.annotate(
  $I.annote("SyncDataRunMode", {
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
 * Rendered target projection ready to compare or write to disk.
 *
 * @category models
 * @since 0.0.0
 */
export class SyncDataTargetProjection extends S.Class<SyncDataTargetProjection>($I`SyncDataTargetProjection`)(
  {
    content: S.String,
    recordCount: S.Number,
    summary: S.String,
  },
  $I.annote("SyncDataTargetProjection", {
    description: "Rendered target projection ready to compare or write to disk.",
  })
) {}

const ProjectSchema = Fn({
  input: S.Unknown,
  output: S.declare((u: unknown): u is Effect.Effect<SyncDataTargetProjection, SyncDataToTsError> =>
    Effect.isEffect(u)
  ),
});

class SyncDataTargetJson extends S.Class<SyncDataTargetJson>($I`SyncDataTargetJson`)(
  {
    id: S.String,
    description: S.String,
    sourceUrl: S.String,
    outputPath: S.String,
    project: ProjectSchema,
    format: S.tag("json"),
  },
  $I.annote("SyncDataTargetJson", {
    description: "Checked-in JSON sync target definition.",
  })
) {}

class SyncDataTargetCsv extends S.Class<SyncDataTargetCsv>($I`SyncDataTargetCsv`)(
  {
    id: S.String,
    description: S.String,
    sourceUrl: S.String,
    outputPath: S.String,
    project: ProjectSchema,
    format: S.tag("csv"),
  },
  $I.annote("SyncDataTargetCsv", {
    description: "Checked-in CSV sync target definition.",
  })
) {}

class SyncDataTargetXml extends S.Class<SyncDataTargetXml>($I`SyncDataTargetXml`)(
  {
    id: S.String,
    description: S.String,
    sourceUrl: S.String,
    outputPath: S.String,
    project: ProjectSchema,
    format: S.tag("xml"),
  },
  $I.annote("SyncDataTargetXml", {
    description: "Checked-in XML sync target definition.",
  })
) {}
/**
 * Checked-in sync target definition.
 *
 * @returns Tagged union schema keyed by `format`.
 * @category models
 * @since 0.0.0
 */
export const SyncDataTarget = SyncDataSourceFormat.mapMembers(
  Tuple.evolve([() => SyncDataTargetJson, () => SyncDataTargetCsv, () => SyncDataTargetXml])
)
  .annotate(
    $I.annote("SyncDataTarget", {
      description: "Checked-in sync target definition.",
    })
  )
  .pipe(S.toTaggedUnion("format"));

/**
 * {@inheritDoc SyncDataTarget}
 *
 * @category models
 * @since 0.0.0
 */
export type SyncDataTarget = typeof SyncDataTarget.Type;

/**
 * Per-target command result after diffing or writing.
 *
 * @category models
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
  $I.annote("SyncDataTargetResult", {
    description: "Per-target sync result after diffing or writing.",
  })
) {
  static readonly new = (params: SyncDataTargetResult) => SyncDataTargetResult.make(params);
}
