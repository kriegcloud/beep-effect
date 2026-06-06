/**
 * Operation request and boundary error schemas for file processing.
 *
 * @packageDocumentation
 * @since 0.0.0
 */

import { ArtifactId, OperationId, SourceArtifact } from "@beep/file-processing/Artifact";
import { FileFormatFamily, StrategyPreference } from "@beep/file-processing/Strategy";
import { $FileProcessingId } from "@beep/identity";
import { LiteralKit, TaggedErrorClass } from "@beep/schema";
import { MimeType } from "@beep/schema/MimeType";
import * as S from "effect/Schema";

const $I = $FileProcessingId.create("Operation");

/**
 * Machine-readable file-processing operation failure reasons.
 *
 * @example
 * ```ts
 * import { FileProcessingOperationErrorReason } from "@beep/file-processing/Operation"
 *
 * console.log(FileProcessingOperationErrorReason)
 * ```
 *
 * @category errors
 * @since 0.0.0
 */
export const FileProcessingOperationErrorReason = LiteralKit([
  "file-detection-failed",
  "unsupported-file-format",
  "file-extraction-failed",
  "archive-export-failed",
  "engine-unavailable",
  "operation-timed-out",
  "output-limit-exceeded",
]).pipe(
  $I.annoteSchema("FileProcessingOperationErrorReason", {
    description:
      "Operation-level failure reasons that hide driver, process, HTTP, and filesystem implementation details.",
  })
);

/**
 * Type for {@link FileProcessingOperationErrorReason}.
 *
 * @category errors
 * @since 0.0.0
 */
export type FileProcessingOperationErrorReason = typeof FileProcessingOperationErrorReason.Type;

/**
 * Sanitized file-processing operation error.
 *
 * @example
 * ```ts
 * import { FileProcessingOperationError } from "@beep/file-processing/Operation"
 *
 * const error = FileProcessingOperationError.fromReason("engine-unavailable", {
 *   message: "No extraction engine is available"
 * })
 * console.log(error.reason)
 * ```
 *
 * @category errors
 * @since 0.0.0
 */
export class FileProcessingOperationError extends TaggedErrorClass<FileProcessingOperationError>(
  $I`FileProcessingOperationError`
)(
  "FileProcessingOperationError",
  {
    artifactId: S.optionalKey(ArtifactId),
    details: S.optionalKey(S.Record(S.String, S.String)),
    engine: S.optionalKey(S.String),
    format: S.optionalKey(FileFormatFamily),
    message: S.String,
    operationId: S.optionalKey(OperationId),
    reason: FileProcessingOperationErrorReason,
  },
  $I.annote("FileProcessingOperationError", {
    description: "Sanitized operation-level error exposed by the file-processing capability boundary.",
  })
) {
  /**
   * Create an operation error from a reason and sanitized context.
   *
   * @category constructors
   * @since 0.0.0
   */
  static readonly fromReason = (
    reason: FileProcessingOperationErrorReason,
    options: {
      readonly artifactId?: ArtifactId;
      readonly details?: Readonly<Record<string, string>>;
      readonly engine?: string;
      readonly format?: FileFormatFamily;
      readonly message: string;
      readonly operationId?: OperationId;
    }
  ): FileProcessingOperationError => FileProcessingOperationError.make({ reason, ...options });
}

/**
 * Operation request for format detection.
 *
 * @example
 * ```ts
 * import { DetectFileOperation } from "@beep/file-processing/Operation"
 *
 * console.log(DetectFileOperation)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class DetectFileOperation extends S.Class<DetectFileOperation>($I`DetectFileOperation`)(
  {
    operationId: OperationId,
    operationKind: S.Literal("detect"),
    preference: StrategyPreference,
    source: SourceArtifact,
  },
  $I.annote("DetectFileOperation", {
    description: "Runtime-neutral request to detect a source artifact format.",
  })
) {}

/**
 * Result emitted by format detection.
 *
 * @example
 * ```ts
 * import { DetectionResult } from "@beep/file-processing/Operation"
 *
 * console.log(DetectionResult)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class DetectionResult extends S.Class<DetectionResult>($I`DetectionResult`)(
  {
    confidence: S.optionalKey(S.Finite),
    engine: S.String,
    format: FileFormatFamily,
    mediaType: S.optionalKey(MimeType),
    operationId: OperationId,
    sourceArtifactId: ArtifactId,
  },
  $I.annote("DetectionResult", {
    description: "Detected format for a source artifact.",
  })
) {}

/**
 * Operation request for text and metadata extraction.
 *
 * @example
 * ```ts
 * import { ExtractFileOperation } from "@beep/file-processing/Operation"
 *
 * console.log(ExtractFileOperation)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class ExtractFileOperation extends S.Class<ExtractFileOperation>($I`ExtractFileOperation`)(
  {
    format: FileFormatFamily,
    maxMaterializedBytes: S.optionalKey(S.Finite),
    operationId: OperationId,
    operationKind: S.Literal("extract"),
    preference: StrategyPreference,
    source: SourceArtifact,
  },
  $I.annote("ExtractFileOperation", {
    description: "Runtime-neutral request to extract text and metadata from a source artifact.",
  })
) {}

/**
 * Operation request for archive child export.
 *
 * @example
 * ```ts
 * import { ExportArchiveOperation } from "@beep/file-processing/Operation"
 *
 * console.log(ExportArchiveOperation)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class ExportArchiveOperation extends S.Class<ExportArchiveOperation>($I`ExportArchiveOperation`)(
  {
    format: FileFormatFamily,
    maxMaterializedBytes: S.optionalKey(S.Finite),
    operationId: OperationId,
    operationKind: S.Literal("export-archive"),
    preference: StrategyPreference,
    source: SourceArtifact,
  },
  $I.annote("ExportArchiveOperation", {
    description: "Runtime-neutral request to export child artifacts from an archive source.",
  })
) {}

/**
 * Operation request for a full source processing pass.
 *
 * @example
 * ```ts
 * import { ProcessFileOperation } from "@beep/file-processing/Operation"
 *
 * console.log(ProcessFileOperation)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class ProcessFileOperation extends S.Class<ProcessFileOperation>($I`ProcessFileOperation`)(
  {
    exportChildren: S.Boolean,
    maxMaterializedBytes: S.optionalKey(S.Finite),
    operationId: OperationId,
    operationKind: S.Literal("process"),
    preference: StrategyPreference,
    source: SourceArtifact,
  },
  $I.annote("ProcessFileOperation", {
    description: "Runtime-neutral request to run the minimum file-processing vertical slice for one source.",
  })
) {}
