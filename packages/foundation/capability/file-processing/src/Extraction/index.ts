/**
 * Extraction result and manifest schemas for file processing.
 *
 * @packageDocumentation
 * @since 0.0.0
 */

import { ArtifactId, ArtifactReference, OperationId } from "@beep/file-processing/Artifact";
import { FileFormatFamily, FileProcessingSkipReason, SelectedStrategy } from "@beep/file-processing/Strategy";
import { $FileProcessingId } from "@beep/identity";
import { LiteralKit } from "@beep/schema";
import * as S from "effect/Schema";

const $I = $FileProcessingId.create("Extraction");

/**
 * Processing status emitted for each source row.
 *
 * @example
 * ```ts
 * import { SourceProcessingStatus } from "@beep/file-processing/Extraction"
 *
 * console.log(SourceProcessingStatus)
 * ```
 *
 * @category schemas
 * @since 0.0.0
 */
export const SourceProcessingStatus = LiteralKit(["succeeded", "skipped", "failed"]).pipe(
  $I.annoteSchema("SourceProcessingStatus", {
    description: "Per-source processing status used in sources.jsonl.",
  })
);

/**
 * Type for {@link SourceProcessingStatus}.
 *
 * @category models
 * @since 0.0.0
 */
export type SourceProcessingStatus = typeof SourceProcessingStatus.Type;

/**
 * Materialized text artifact reference.
 *
 * @example
 * ```ts
 * import { TextArtifactReference } from "@beep/file-processing/Extraction"
 *
 * console.log(TextArtifactReference)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class TextArtifactReference extends S.Class<TextArtifactReference>($I`TextArtifactReference`)(
  {
    artifact: ArtifactReference,
    operationId: OperationId,
  },
  $I.annote("TextArtifactReference", {
    description: "Reference to a text artifact emitted for one extraction operation.",
  })
) {}

/**
 * Text span emitted by a text extraction operation.
 *
 * @example
 * ```ts
 * import { TextSpan } from "@beep/file-processing/Extraction"
 *
 * console.log(TextSpan)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class TextSpan extends S.Class<TextSpan>($I`TextSpan`)(
  {
    endOffset: S.Number,
    startOffset: S.Number,
    text: S.String,
  },
  $I.annote("TextSpan", {
    description: "Extracted text span with byte or character offsets supplied by the engine.",
  })
) {}

/**
 * Text and metadata extraction result.
 *
 * @example
 * ```ts
 * import { ExtractionResult } from "@beep/file-processing/Extraction"
 *
 * console.log(ExtractionResult)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class ExtractionResult extends S.Class<ExtractionResult>($I`ExtractionResult`)(
  {
    engine: S.String,
    format: FileFormatFamily,
    metadata: S.Record(S.String, S.String),
    operationId: OperationId,
    sourceArtifactId: ArtifactId,
    text: S.optionalKey(S.String),
    textArtifact: S.optionalKey(TextArtifactReference),
    warnings: S.Array(S.String),
  },
  $I.annote("ExtractionResult", {
    description: "Runtime-neutral text and metadata extraction result.",
  })
) {}

/**
 * Archive export result.
 *
 * @example
 * ```ts
 * import { ArchiveExportResult } from "@beep/file-processing/Extraction"
 *
 * console.log(ArchiveExportResult)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class ArchiveExportResult extends S.Class<ArchiveExportResult>($I`ArchiveExportResult`)(
  {
    children: S.Array(ArtifactReference),
    engine: S.String,
    operationId: OperationId,
    sourceArtifactId: ArtifactId,
    warnings: S.Array(S.String),
  },
  $I.annote("ArchiveExportResult", {
    description: "Runtime-neutral child artifact export result for archive-like source files.",
  })
) {}

/**
 * Source row written to sources.jsonl.
 *
 * @example
 * ```ts
 * import { SourceProcessingRecord } from "@beep/file-processing/Extraction"
 *
 * console.log(SourceProcessingRecord)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class SourceProcessingRecord extends S.Class<SourceProcessingRecord>($I`SourceProcessingRecord`)(
  {
    artifactId: ArtifactId,
    digest: S.String,
    engine: S.optionalKey(S.String),
    format: FileFormatFamily,
    operationId: OperationId,
    relativePath: S.String,
    sizeBytes: S.Number,
    skipReason: S.optionalKey(FileProcessingSkipReason),
    status: SourceProcessingStatus,
    textPath: S.optionalKey(S.String),
  },
  $I.annote("SourceProcessingRecord", {
    description: "JSONL-safe source processing record emitted by the CLI proof.",
  })
) {}

/**
 * Failure row written to failures.jsonl.
 *
 * @example
 * ```ts
 * import { FileProcessingFailureRecord } from "@beep/file-processing/Extraction"
 *
 * console.log(FileProcessingFailureRecord)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class FileProcessingFailureRecord extends S.Class<FileProcessingFailureRecord>($I`FileProcessingFailureRecord`)(
  {
    artifactId: ArtifactId,
    engine: S.optionalKey(S.String),
    format: S.optionalKey(FileFormatFamily),
    message: S.String,
    operationId: OperationId,
    reason: S.String,
    relativePath: S.String,
    status: SourceProcessingStatus,
  },
  $I.annote("FileProcessingFailureRecord", {
    description: "JSONL-safe sanitized skipped or failed source record.",
  })
) {}

/**
 * Child artifact row written to children/<source-artifact-id>/artifacts.jsonl.
 *
 * @example
 * ```ts
 * import { ChildArtifactRecord } from "@beep/file-processing/Extraction"
 *
 * console.log(ChildArtifactRecord)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class ChildArtifactRecord extends S.Class<ChildArtifactRecord>($I`ChildArtifactRecord`)(
  {
    child: ArtifactReference,
    sourceArtifactId: ArtifactId,
  },
  $I.annote("ChildArtifactRecord", {
    description: "JSONL-safe child artifact record emitted for archive exports.",
  })
) {}

/**
 * Coverage summary written to coverage.json.
 *
 * @example
 * ```ts
 * import { FileProcessingCoverageSummary } from "@beep/file-processing/Extraction"
 *
 * console.log(FileProcessingCoverageSummary)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class FileProcessingCoverageSummary extends S.Class<FileProcessingCoverageSummary>(
  $I`FileProcessingCoverageSummary`
)(
  {
    byFormat: S.Record(S.String, S.Record(S.String, S.Number)),
    failedCount: S.Number,
    skippedCount: S.Number,
    sourceCount: S.Number,
    succeededCount: S.Number,
    textArtifactCount: S.Number,
  },
  $I.annote("FileProcessingCoverageSummary", {
    description: "Aggregate processing coverage counts for the proof manifest.",
  })
) {}

/**
 * Top-level run manifest written to run.json.
 *
 * @example
 * ```ts
 * import { ProcessRunManifest } from "@beep/file-processing/Extraction"
 *
 * console.log(ProcessRunManifest)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class ProcessRunManifest extends S.Class<ProcessRunManifest>($I`ProcessRunManifest`)(
  {
    coverage: FileProcessingCoverageSummary,
    engine: S.String,
    manifestVersion: S.Literal("beep.file-processing.run.v1"),
    outDir: S.String,
    runId: OperationId,
    sourceRoot: S.String,
    strategies: S.Array(SelectedStrategy),
  },
  $I.annote("ProcessRunManifest", {
    description: "JSON-safe root manifest for a file-processing proof run.",
  })
) {}

/**
 * JSON encoder for {@link ProcessRunManifest}.
 *
 * @category codecs
 * @since 0.0.0
 */
export const encodeProcessRunManifestJson = S.encodeUnknownEffect(S.fromJsonString(ProcessRunManifest));

/**
 * JSON encoder for {@link FileProcessingCoverageSummary}.
 *
 * @category codecs
 * @since 0.0.0
 */
export const encodeFileProcessingCoverageSummaryJson = S.encodeUnknownEffect(
  S.fromJsonString(FileProcessingCoverageSummary)
);

/**
 * JSONL encoder for {@link SourceProcessingRecord}.
 *
 * @category codecs
 * @since 0.0.0
 */
export const encodeSourceProcessingRecordJson = S.encodeUnknownEffect(S.fromJsonString(SourceProcessingRecord));

/**
 * JSONL encoder for {@link FileProcessingFailureRecord}.
 *
 * @category codecs
 * @since 0.0.0
 */
export const encodeFileProcessingFailureRecordJson = S.encodeUnknownEffect(
  S.fromJsonString(FileProcessingFailureRecord)
);

/**
 * JSONL encoder for {@link ChildArtifactRecord}.
 *
 * @category codecs
 * @since 0.0.0
 */
export const encodeChildArtifactRecordJson = S.encodeUnknownEffect(S.fromJsonString(ChildArtifactRecord));
