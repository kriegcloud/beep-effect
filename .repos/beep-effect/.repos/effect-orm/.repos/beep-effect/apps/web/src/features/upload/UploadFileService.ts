import { ExifToolService } from "@beep/documents-server/files";
import { accumulateEffectsAndReport } from "@beep/errors/client";
import * as A from "effect/Array";
import * as Effect from "effect/Effect";
import { instrumentProcessFile, makeFileAnnotations } from "@/features/upload/observability";
import { extractBasicMetadata, extractExifMetadata, validateFile } from "@/features/upload/pipeline";
import type { PipelineConfig, ProcessFilesResult, UploadResult } from "@/features/upload/UploadModels";
/**
 * UploadFileService
 * - Effect service exposing high-level operations for processing one or many files
 * - Delegates to composable pipeline steps in `pipeline.ts`
 * - ExifToolService dependency is satisfied internally via dependencies array
 */
export class UploadFileService extends Effect.Service<UploadFileService>()("UploadFileService", {
  dependencies: [ExifToolService.Default],
  accessors: true,
  effect: Effect.gen(function* () {
    // Obtain ExifToolService from context to use in wrapped pipeline functions
    const exifToolService = yield* ExifToolService;

    // Wrap extractExifMetadata to internalize ExifToolService requirement
    const extractExifMetadataInternal = (args: Parameters<typeof extractExifMetadata>[0]) =>
      extractExifMetadata(args).pipe(Effect.provideService(ExifToolService, exifToolService));

    const processFile = Effect.fn("UploadFileService.processFile")(function* ({
      file,
      config,
    }: {
      readonly file: File;
      readonly config?: PipelineConfig | undefined;
    }) {
      const eff = Effect.gen(function* () {
        const validated = yield* validateFile({ file, config });
        const basic = yield* extractBasicMetadata({ file, detected: validated.detected });
        const exif = yield* extractExifMetadataInternal({ file, detected: basic.detected ?? validated.detected });

        const result: UploadResult = {
          file,
          validated,
          basic,
          exif,
        };
        return result;
      });
      return yield* eff.pipe(instrumentProcessFile(makeFileAnnotations(file)));
    });

    const processFiles = Effect.fn("UploadFileService.processFiles")(function* ({
      files,
      config,
    }: {
      readonly files: ReadonlyArray<File>;
      readonly config?: PipelineConfig | undefined;
    }) {
      const effects = A.map(files, (file) => processFile({ file, config }));
      const result = yield* accumulateEffectsAndReport(effects, {
        concurrency: "unbounded",
        annotations: { service: "upload" },
      });
      return result satisfies ProcessFilesResult;
    });

    return { processFile, processFiles };
  }),
}) {}
