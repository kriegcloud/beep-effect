/**
 * Tika-backed file-processing engine scaffold.
 *
 * @packageDocumentation
 * @since 0.0.0
 */

import { ArtifactReference } from "@beep/file-processing/Artifact";
import { ArchiveExportResult, ExtractionResult } from "@beep/file-processing/Extraction";
import { DetectionResult, FileProcessingOperationError } from "@beep/file-processing/Operation";
import { FileProcessingEngineDescriptor } from "@beep/file-processing/Strategy";
import { A } from "@beep/utils";
import { Effect, Match } from "effect";
import * as O from "effect/Option";
import * as R from "effect/Record";
import { makeTikaError } from "./Tika.errors.ts";
import type {
  DetectFileOperation,
  ExportArchiveOperation,
  ExtractFileOperation,
} from "@beep/file-processing/Operation";
import type { FileProcessingEngineShape } from "@beep/file-processing/Service";
import type { FileFormatFamily } from "@beep/file-processing/Strategy";
import type { TikaError } from "./Tika.errors.ts";

/**
 * Tika file-processing engine descriptor.
 *
 * @example
 * ```ts
 * import { TikaFileProcessingEngineDescriptor } from "@beep/tika"
 *
 * console.log(TikaFileProcessingEngineDescriptor.name)
 * ```
 *
 * @category services
 * @since 0.0.0
 */
export const TikaFileProcessingEngineDescriptor = FileProcessingEngineDescriptor.make({
  capabilities: ["detect", "extract-text", "extract-metadata"],
  engine: "tika",
  name: "apache-tika",
  supportedFormats: [
    "doc",
    "docx",
    "docm",
    "rtf",
    "html",
    "xhtml",
    "pdf-text-layer",
    "plain-text",
    "markdown",
    "image-metadata",
    "xls",
    "xlsx",
  ],
});

const classifyExtension = Match.type<string | undefined>().pipe(
  Match.when("doc", () => "doc" as const),
  Match.when("docx", () => "docx" as const),
  Match.when("docm", () => "docm" as const),
  Match.when("rtf", () => "rtf" as const),
  Match.whenOr("htm", "html", () => "html" as const),
  Match.when("xhtml", () => "xhtml" as const),
  Match.when("pdf", () => "pdf-text-layer" as const),
  Match.whenOr("txt", "text", () => "plain-text" as const),
  Match.whenOr("md", "markdown", () => "markdown" as const),
  Match.whenOr("bmp", "gif", "jpeg", "jpg", "png", "tif", "tiff", "webp", () => "image-metadata" as const),
  Match.when("xls", () => "xls" as const),
  Match.when("xlsx", () => "xlsx" as const),
  Match.orElse(() => "unknown" as const)
);

const textExtractionFormats: ReadonlyArray<FileFormatFamily> = ["html", "xhtml", "markdown", "plain-text"];
const deferredExtractionFormats: ReadonlyArray<FileFormatFamily> = ["doc", "docx", "rtf", "pdf-text-layer"];
const outOfScopeFormats: ReadonlyArray<FileFormatFamily> = ["docm", "xls", "xlsx"];

const mapTikaErrorToOperationError = (
  error: TikaError,
  operation: ExtractFileOperation
): FileProcessingOperationError =>
  Match.value(error.reason).pipe(
    Match.when("engine-unavailable", () =>
      FileProcessingOperationError.fromReason("engine-unavailable", {
        artifactId: operation.source.id,
        engine: TikaFileProcessingEngineDescriptor.name,
        format: operation.format,
        message: "Tika extraction is deferred because no Tika runtime is configured for this proof.",
        operationId: operation.operationId,
      })
    ),
    Match.when("timeout", () =>
      FileProcessingOperationError.fromReason("operation-timed-out", {
        artifactId: operation.source.id,
        engine: TikaFileProcessingEngineDescriptor.name,
        format: operation.format,
        message: "Tika extraction timed out.",
        operationId: operation.operationId,
      })
    ),
    Match.orElse(() =>
      FileProcessingOperationError.fromReason("file-extraction-failed", {
        artifactId: operation.source.id,
        engine: TikaFileProcessingEngineDescriptor.name,
        format: operation.format,
        message: "Tika extraction failed inside the driver boundary.",
        operationId: operation.operationId,
      })
    )
  );

const decodeSourceText = (operation: ExtractFileOperation): Effect.Effect<string, TikaError> => {
  if (operation.source.text !== undefined) {
    return Effect.succeed(operation.source.text);
  }

  if (operation.source.bytes === undefined) {
    return Effect.fail(makeTikaError("engine-unavailable", { cause: "source bytes unavailable" }));
  }

  return Effect.try({
    try: () => new TextDecoder().decode(operation.source.bytes),
    catch: () => makeTikaError("response-decoding"),
  });
};

/**
 * Create the P1 Tika file-processing engine.
 *
 * @example
 * ```ts
 * import { makeTikaFileProcessingEngine } from "@beep/tika"
 *
 * const engine = makeTikaFileProcessingEngine()
 * console.log(engine.descriptor.engine)
 * ```
 *
 * @category constructors
 * @since 0.0.0
 */
export const makeTikaFileProcessingEngine = (): FileProcessingEngineShape => ({
  descriptor: TikaFileProcessingEngineDescriptor,
  detect: Effect.fn("TikaFileProcessingEngine.detect")(function* (operation: DetectFileOperation) {
    return DetectionResult.make({
      confidence: 0.95,
      engine: TikaFileProcessingEngineDescriptor.name,
      format: classifyExtension(operation.source.extension),
      operationId: operation.operationId,
      sourceArtifactId: operation.source.id,
      ...R.getSomes({
        mediaType: O.fromUndefinedOr(operation.source.mediaType),
      }),
    });
  }),
  exportArchive: Effect.fn("TikaFileProcessingEngine.exportArchive")(function* (operation: ExportArchiveOperation) {
    const child = ArtifactReference.make({
      id: operation.source.id,
      relativePath: "children/not-exported-by-tika",
    });

    return ArchiveExportResult.make({
      children: [child],
      engine: TikaFileProcessingEngineDescriptor.name,
      operationId: operation.operationId,
      sourceArtifactId: operation.source.id,
      warnings: ["Tika does not export archive children in the P1 proof."],
    });
  }),
  extract: Effect.fn("TikaFileProcessingEngine.extract")(function* (operation: ExtractFileOperation) {
    if (A.contains(outOfScopeFormats, operation.format)) {
      return yield* FileProcessingOperationError.fromReason("unsupported-file-format", {
        artifactId: operation.source.id,
        engine: TikaFileProcessingEngineDescriptor.name,
        format: operation.format,
        message: `${operation.format} is classified deterministically but deep extraction is out of scope for V1.`,
        operationId: operation.operationId,
      });
    }

    if (operation.format === "image-metadata") {
      return ExtractionResult.make({
        engine: TikaFileProcessingEngineDescriptor.name,
        format: operation.format,
        metadata: {
          "beep.processing": "metadata-only",
        },
        operationId: operation.operationId,
        sourceArtifactId: operation.source.id,
        warnings: [],
      });
    }

    if (A.contains(deferredExtractionFormats, operation.format)) {
      return yield* mapTikaErrorToOperationError(makeTikaError("engine-unavailable"), operation);
    }

    if (!A.contains(textExtractionFormats, operation.format)) {
      return yield* FileProcessingOperationError.fromReason("unsupported-file-format", {
        artifactId: operation.source.id,
        engine: TikaFileProcessingEngineDescriptor.name,
        format: operation.format,
        message: `Tika extraction does not support ${operation.format} in the P1 proof.`,
        operationId: operation.operationId,
      });
    }

    const text = yield* decodeSourceText(operation).pipe(
      Effect.mapError((error) => mapTikaErrorToOperationError(error, operation))
    );

    return ExtractionResult.make({
      engine: TikaFileProcessingEngineDescriptor.name,
      format: operation.format,
      metadata: {},
      operationId: operation.operationId,
      sourceArtifactId: operation.source.id,
      text,
      warnings: [],
    });
  }),
});

/**
 * P1 Tika file-processing engine value.
 *
 * @category services
 * @since 0.0.0
 */
export const TikaFileProcessingEngine: FileProcessingEngineShape = makeTikaFileProcessingEngine();
