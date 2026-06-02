/**
 * Effect service contracts for runtime-neutral file processing.
 *
 * @packageDocumentation
 * @since 0.0.0
 */

import { $FileProcessingId } from "@beep/identity";
import { A } from "@beep/utils";
import { Context, Effect, Layer, pipe } from "effect";
import * as O from "effect/Option";
import * as R from "effect/Record";
import { FileProcessingOperationError as OperationError } from "../Operation/index.ts";
import type { ArchiveExportResult, ExtractionResult } from "@beep/file-processing/Extraction";
import type {
  DetectFileOperation,
  DetectionResult,
  ExportArchiveOperation,
  ExtractFileOperation,
  FileProcessingOperationError,
  ProcessFileOperation,
} from "@beep/file-processing/Operation";
import type { FileProcessingEngineDescriptor } from "@beep/file-processing/Strategy";
import type { FileProcessingOperationErrorReason } from "../Operation/index.ts";

const $I = $FileProcessingId.create("Service");

/**
 * Runtime-neutral file-processing engine shape implemented by drivers.
 *
 * @example
 * ```ts
 * import type { FileProcessingEngineShape } from "@beep/file-processing/Service"
 *
 * const engine = {} as FileProcessingEngineShape
 * console.log(engine)
 * ```
 *
 * @category services
 * @since 0.0.0
 */
export type FileProcessingEngineShape = {
  readonly descriptor: FileProcessingEngineDescriptor;
  readonly detect: (operation: DetectFileOperation) => Effect.Effect<DetectionResult, FileProcessingOperationError>;
  readonly exportArchive: (
    operation: ExportArchiveOperation
  ) => Effect.Effect<ArchiveExportResult, FileProcessingOperationError>;
  readonly extract: (operation: ExtractFileOperation) => Effect.Effect<ExtractionResult, FileProcessingOperationError>;
};

/**
 * Service contract exposed by the file-processing capability.
 *
 * @example
 * ```ts
 * import type { FileProcessingServiceShape } from "@beep/file-processing/Service"
 *
 * const service = {} as FileProcessingServiceShape
 * console.log(service)
 * ```
 *
 * @category services
 * @since 0.0.0
 */
export type FileProcessingServiceShape = {
  readonly detect: (operation: DetectFileOperation) => Effect.Effect<DetectionResult, FileProcessingOperationError>;
  readonly exportArchive: (
    operation: ExportArchiveOperation
  ) => Effect.Effect<ArchiveExportResult, FileProcessingOperationError>;
  readonly extract: (operation: ExtractFileOperation) => Effect.Effect<ExtractionResult, FileProcessingOperationError>;
  readonly process: (operation: ProcessFileOperation) => Effect.Effect<ExtractionResult, FileProcessingOperationError>;
};

/**
 * File-processing service tag.
 *
 * @example
 * ```ts
 * import { FileProcessingService } from "@beep/file-processing/Service"
 *
 * console.log(FileProcessingService)
 * ```
 *
 * @category services
 * @since 0.0.0
 */
export class FileProcessingService extends Context.Service<FileProcessingService, FileProcessingServiceShape>()(
  $I`FileProcessingService`
) {}

const operationError = (reason: FileProcessingOperationErrorReason, message: string): FileProcessingOperationError =>
  OperationError.fromReason(reason, { message });

const matchesEnginePreference = (
  operationEngine: FileProcessingEngineDescriptor["engine"],
  preferredEngine: FileProcessingEngineDescriptor["engine"]
): boolean => preferredEngine === "auto" || operationEngine === preferredEngine;

const selectEngine = (
  engines: ReadonlyArray<FileProcessingEngineShape>,
  preferredEngine: FileProcessingEngineDescriptor["engine"]
): Effect.Effect<FileProcessingEngineShape, FileProcessingOperationError> =>
  pipe(
    engines,
    A.findFirst((engine) => matchesEnginePreference(engine.descriptor.engine, preferredEngine)),
    O.match({
      onNone: () =>
        Effect.fail(
          operationError(
            "engine-unavailable",
            `No file-processing engine is available for preference "${preferredEngine}".`
          )
        ),
      onSome: Effect.succeed,
    })
  );

/**
 * Build a runtime-neutral file-processing service layer from concrete drivers.
 *
 * @param engines - Concrete driver engines available to this runtime.
 * @returns Layer for {@link FileProcessingService}.
 * @example
 * ```ts
 * import { makeFileProcessingServiceLayer } from "@beep/file-processing/Service"
 *
 * const layer = makeFileProcessingServiceLayer([])
 * console.log(layer)
 * ```
 *
 * @category layers
 * @since 0.0.0
 */
export const makeFileProcessingServiceLayer = (
  engines: ReadonlyArray<FileProcessingEngineShape>
): Layer.Layer<FileProcessingService> =>
  Layer.succeed(
    FileProcessingService,
    FileProcessingService.of({
      detect: Effect.fn("FileProcessingService.detect")(function* (operation) {
        const engine = yield* selectEngine(engines, operation.preference.engine);
        return yield* engine.detect(operation);
      }),
      exportArchive: Effect.fn("FileProcessingService.exportArchive")(function* (operation) {
        const engine = yield* selectEngine(engines, operation.preference.engine);
        return yield* engine.exportArchive(operation);
      }),
      extract: Effect.fn("FileProcessingService.extract")(function* (operation) {
        const engine = yield* selectEngine(engines, operation.preference.engine);
        return yield* engine.extract(operation);
      }),
      process: Effect.fn("FileProcessingService.process")(function* (operation) {
        const engine = yield* selectEngine(engines, operation.preference.engine);
        const detected = yield* engine.detect({
          operationId: operation.operationId,
          operationKind: "detect",
          preference: operation.preference,
          source: operation.source,
        });

        return yield* engine.extract({
          format: detected.format,
          operationId: operation.operationId,
          operationKind: "extract",
          preference: operation.preference,
          source: operation.source,
          ...R.getSomes({
            maxMaterializedBytes: O.fromUndefinedOr(operation.maxMaterializedBytes),
          }),
        });
      }),
    })
  );

/**
 * Detect a source artifact with the configured service.
 *
 * @category use-cases
 * @since 0.0.0
 */
export const detectFile = Effect.fn("FileProcessing.detectFile")(function* (
  operation: DetectFileOperation
): Effect.fn.Return<DetectionResult, FileProcessingOperationError, FileProcessingService> {
  const service = yield* FileProcessingService;
  return yield* service.detect(operation);
});

/**
 * Extract text and metadata from a source artifact with the configured service.
 *
 * @category use-cases
 * @since 0.0.0
 */
export const extractFile = Effect.fn("FileProcessing.extractFile")(function* (
  operation: ExtractFileOperation
): Effect.fn.Return<ExtractionResult, FileProcessingOperationError, FileProcessingService> {
  const service = yield* FileProcessingService;
  return yield* service.extract(operation);
});

/**
 * Export child artifacts from an archive source with the configured service.
 *
 * @category use-cases
 * @since 0.0.0
 */
export const exportArchive = Effect.fn("FileProcessing.exportArchive")(function* (
  operation: ExportArchiveOperation
): Effect.fn.Return<ArchiveExportResult, FileProcessingOperationError, FileProcessingService> {
  const service = yield* FileProcessingService;
  return yield* service.exportArchive(operation);
});
