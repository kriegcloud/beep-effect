/**
 * Synthetic file-processing fixtures and test engine.
 *
 * @packageDocumentation
 * @since 0.0.0
 */

import { ArtifactReference, deriveArtifactId } from "@beep/file-processing/Artifact";
import { ArchiveExportResult, ExtractionResult } from "@beep/file-processing/Extraction";
import { DetectionResult, FileProcessingOperationError } from "@beep/file-processing/Operation";
import { FileProcessingEngineDescriptor } from "@beep/file-processing/Strategy";
import { NonNegativeInt } from "@beep/schema";
import { PosixPath } from "@beep/schema/PosixPath";
import { A } from "@beep/utils";
import { Effect, Match } from "effect";
import * as S from "effect/Schema";
import type {
  DetectFileOperation,
  ExportArchiveOperation,
  ExtractFileOperation,
} from "@beep/file-processing/Operation";
import type { FileProcessingEngineShape } from "@beep/file-processing/Service";

/**
 * Synthetic engine descriptor used by tests and proof fixtures.
 *
 * @example
 * ```ts
 * import { TestFileProcessingEngineDescriptor } from "@beep/file-processing/test"
 *
 * console.log(TestFileProcessingEngineDescriptor.supportedFormats.includes("pst")) // true
 * ```
 *
 * @category fixtures
 * @since 0.0.0
 */
export const TestFileProcessingEngineDescriptor = FileProcessingEngineDescriptor.make({
  capabilities: ["detect", "extract-text", "extract-metadata", "export-children"],
  engine: "test",
  name: "beep-test-file-processing-engine",
  supportedFormats: ["html", "image-metadata", "markdown", "plain-text", "pst", "rtf", "doc", "docx", "pdf-text-layer"],
  version: "0.0.0",
});

const classifyExtension = Match.type<string | undefined>().pipe(
  Match.whenOr("md", "markdown", () => "markdown" as const),
  Match.whenOr("html", "htm", () => "html" as const),
  Match.when("xhtml", () => "xhtml" as const),
  Match.whenOr("txt", "text", () => "plain-text" as const),
  Match.when("pst", () => "pst" as const),
  Match.when("rtf", () => "rtf" as const),
  Match.when("doc", () => "doc" as const),
  Match.when("docx", () => "docx" as const),
  Match.when("pdf", () => "pdf-text-layer" as const),
  Match.whenOr("png", "jpg", "jpeg", "gif", "webp", "tif", "tiff", () => "image-metadata" as const),
  Match.when("docm", () => "docm" as const),
  Match.when("xls", () => "xls" as const),
  Match.when("xlsx", () => "xlsx" as const),
  Match.orElse(() => "unknown" as const)
);

const decodeTestArtifactPath = (
  path: string,
  operation: ExportArchiveOperation
): Effect.Effect<PosixPath, FileProcessingOperationError> =>
  S.decodeUnknownEffect(PosixPath)(path).pipe(
    Effect.mapError(() =>
      FileProcessingOperationError.fromReason("archive-export-failed", {
        artifactId: operation.source.id,
        format: operation.format,
        message: "Synthetic child artifact path was not POSIX-normalized.",
        operationId: operation.operationId,
      })
    )
  );

const deriveTestChildArtifactId = (
  operation: ExportArchiveOperation,
  relativePath: PosixPath
): Effect.Effect<ArtifactReference["id"], FileProcessingOperationError> =>
  deriveArtifactId([operation.source.id, relativePath]).pipe(
    Effect.mapError(() =>
      FileProcessingOperationError.fromReason("archive-export-failed", {
        artifactId: operation.source.id,
        format: operation.format,
        message: "Synthetic child artifact id could not be derived.",
        operationId: operation.operationId,
      })
    )
  );

/**
 * Synthetic file-processing engine for generated fixtures.
 *
 * @example
 * ```ts
 * import { TestFileProcessingEngine } from "@beep/file-processing/test"
 *
 * console.log(TestFileProcessingEngine.descriptor.engine) // "test"
 * ```
 *
 * @category fixtures
 * @since 0.0.0
 */
export const TestFileProcessingEngine: FileProcessingEngineShape = {
  descriptor: TestFileProcessingEngineDescriptor,
  detect: Effect.fn("TestFileProcessingEngine.detect")(function* (operation: DetectFileOperation) {
    return DetectionResult.make({
      confidence: 1,
      engine: TestFileProcessingEngineDescriptor.name,
      format: classifyExtension(operation.source.extension),
      operationId: operation.operationId,
      sourceArtifactId: operation.source.id,
    });
  }),
  exportArchive: Effect.fn("TestFileProcessingEngine.exportArchive")(function* (operation: ExportArchiveOperation) {
    if (operation.format !== "pst") {
      return yield* FileProcessingOperationError.fromReason("unsupported-file-format", {
        artifactId: operation.source.id,
        format: operation.format,
        message: `Synthetic export only supports PST archives, not ${operation.format}.`,
        operationId: operation.operationId,
      });
    }

    const childRelativePath = yield* decodeTestArtifactPath("children/synthetic-message.txt", operation);
    const childArtifactId = yield* deriveTestChildArtifactId(operation, childRelativePath);
    const child = ArtifactReference.make({
      id: childArtifactId,
      mediaType: "text/plain",
      relativePath: childRelativePath,
      sizeBytes: NonNegativeInt.make(29),
    });

    return ArchiveExportResult.make({
      children: [child],
      engine: TestFileProcessingEngineDescriptor.name,
      operationId: operation.operationId,
      sourceArtifactId: operation.source.id,
      warnings: [],
    });
  }),
  extract: Effect.fn("TestFileProcessingEngine.extract")(function* (operation: ExtractFileOperation) {
    const text = operation.source.text ?? "synthetic extraction";
    if (A.contains(["docm", "xls", "xlsx", "unknown"], operation.format)) {
      return yield* FileProcessingOperationError.fromReason("unsupported-file-format", {
        artifactId: operation.source.id,
        format: operation.format,
        message: `Synthetic extraction intentionally defers ${operation.format}.`,
        operationId: operation.operationId,
      });
    }

    return ExtractionResult.make({
      engine: TestFileProcessingEngineDescriptor.name,
      format: operation.format,
      metadata: {},
      operationId: operation.operationId,
      sourceArtifactId: operation.source.id,
      text,
      warnings: [],
    });
  }),
};
