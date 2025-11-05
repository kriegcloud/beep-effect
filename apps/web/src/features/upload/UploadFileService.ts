import { accumulateEffectsAndReport } from "@beep/errors/client";
import * as Effect from "effect/Effect";
import { instrumentProcessFile, makeFileAnnotations } from "@/features/upload/observability";
import { extractBasicMetadata, extractExifMetadata, validateFile } from "@/features/upload/pipeline";
import type { PipelineConfig, ProcessFilesResult, UploadResult } from "@/features/upload/UploadModels";
/**
 * UploadFileService
 * - Effect service exposing high-level operations for processing one or many files
 * - Delegates to composable pipeline steps in `pipeline.ts`
 */
export class UploadFileService extends Effect.Service<UploadFileService>()("UploadFileService", {
  dependencies: [],
  accessors: true,
  effect: Effect.gen(function* () {
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
        const exif = yield* extractExifMetadata({ file, detected: basic.detected ?? validated.detected });

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
      const effects = files.map((file) => processFile({ file, config }));
      const result = yield* accumulateEffectsAndReport(effects, {
        concurrency: "unbounded",
        annotations: { service: "upload" },
      });
      return result satisfies ProcessFilesResult;
    });

    return { processFile, processFiles, validateFile, extractBasicMetadata, extractExifMetadata };
  }),
}) {}
