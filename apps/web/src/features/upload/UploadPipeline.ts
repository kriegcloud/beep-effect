import { $WebId } from "@beep/identity/packages";
import * as Cause from "effect/Cause";
import * as Data from "effect/Data";
import * as Effect from "effect/Effect";
import * as Metric from "effect/Metric";
import { completeUpload } from "./completeUpload";
import { makeFileAnnotations, UploadMetrics } from "./observability";
import { requestPresignedUrls } from "./requestPresignedUrls";
import { UploadFileService } from "./UploadFileService";
import type {
  FileUploadProgress,
  UploadConfig,
  UploadError,
  UploadedFileResult,
  UploadPipelineError,
  UploadResult,
} from "./UploadModels";
import { computeFileHash, uploadToS3 } from "./uploadToS3";

const $I = $WebId.create("features/upload/UploadPipeline");

/**
 * Error for pipeline-level failures
 */
export class PipelineError extends Data.TaggedError($I`PipelineError`)<{
  readonly message: string;
  readonly code: string;
  readonly fileName?: string;
  readonly cause?: unknown;
}> {}

/**
 * Result of processing all files through the pipeline
 */
export interface UploadPipelineResult {
  readonly successes: ReadonlyArray<UploadedFileResult>;
  readonly failures: ReadonlyArray<UploadPipelineError>;
}

/**
 * Extract errors from Cause array (from AccumulateResult)
 */
const extractErrors = (causes: ReadonlyArray<Cause.Cause<UploadError>>): ReadonlyArray<UploadError> =>
  causes.flatMap((cause) => [...Cause.failures(cause)]);

/**
 * Upload files through the complete pipeline.
 *
 * Flow:
 * 1. Validate files client-side (size, type, signature)
 * 2. Request presigned URLs from server
 * 3. Upload each file to S3 with progress tracking
 * 4. Complete uploads via callback API
 *
 * @param files - Array of File objects to upload
 * @param config - Upload configuration including callbacks
 * @returns Effect with pipeline result containing successes and failures
 */
export const uploadFiles = Effect.fn("uploadFiles")(function* (files: ReadonlyArray<File>, config: UploadConfig = {}) {
  const startTime = Date.now();

  // 1. Validate files client-side using existing UploadFileService
  const uploadService = yield* UploadFileService;
  const validated = yield* uploadService.processFiles({ files, config });

  // Extract errors from Cause array
  const validationErrors = extractErrors(validated.errors);

  // Log validation failures
  if (validationErrors.length > 0) {
    yield* Effect.logWarning("Some files failed validation", {
      failureCount: validationErrors.length,
      failures: validationErrors.map((f) => ({
        message: f.message,
        fileName: "fileName" in f ? f.fileName : undefined,
      })),
    });
  }

  // If no files passed validation, return early
  if (validated.successes.length === 0) {
    return {
      successes: [] as UploadedFileResult[],
      failures: validationErrors.map((f) => ({
        _tag: f._tag,
        code: "VALIDATION_ERROR",
        message: f.message,
        fileName: "fileName" in f ? (f.fileName as string) : undefined,
        cause: f,
      })),
    } satisfies UploadPipelineResult;
  }

  // 2. Build file data for presigned URL request
  const fileData = validated.successes.map((result) => ({
    name: result.file.name,
    size: result.file.size,
    type: result.validated.detected?.mimeType ?? result.file.type,
    lastModified: result.file.lastModified,
  }));

  // 3. Request presigned URLs
  const presigned = yield* requestPresignedUrls({
    files: fileData,
    input: config.input,
  }).pipe(
    Effect.mapError(
      (error) =>
        new PipelineError({
          code: error.code,
          message: error.message,
          cause: error,
        })
    )
  );

  // 4. Upload each file to S3 with progress tracking
  const uploadResults: Array<{
    readonly success: boolean;
    readonly urlInfo: (typeof presigned.urls)[number];
    readonly file: File;
    readonly result?: undefined | UploadResult;
    readonly error?: unknown;
  }> = [];

  const concurrency = config.concurrency ?? 3;

  yield* Effect.forEach(
    presigned.urls,
    (urlInfo, index) =>
      Effect.gen(function* () {
        const result = validated.successes[index];
        if (!result) {
          uploadResults.push({
            success: false,
            urlInfo,
            file: files[index]!,
            error: new PipelineError({
              code: "INTERNAL_ERROR",
              message: "Missing validation result for file",
              fileName: urlInfo.name,
            }),
          });
          return;
        }

        const file = result.file;

        // Track upload progress
        const onProgress = (progress: { loaded: number; delta: number }) => {
          const fileProgress: FileUploadProgress = {
            fileId: urlInfo.fileId,
            fileName: file.name,
            loaded: progress.loaded,
            total: file.size,
            percent: file.size > 0 ? (progress.loaded / file.size) * 100 : 0,
          };
          config.onProgress?.(fileProgress);
        };

        // Upload to S3
        const uploadResult = yield* uploadToS3({
          file,
          presignedUrl: urlInfo.url,
          traceHeaders: presigned.traceHeaders,
          onProgress,
        }).pipe(
          Effect.catchAll((error) =>
            Effect.gen(function* () {
              yield* Metric.increment(UploadMetrics.filesFailedTotal);
              yield* Effect.logWarning("S3 upload failed", {
                ...makeFileAnnotations(file),
                error: error.message,
              });

              uploadResults.push({
                success: false,
                urlInfo,
                file,
                result,
                error,
              });

              config.onError?.({
                _tag: "S3UploadError",
                code: error.code,
                message: error.message,
                fileName: file.name,
                cause: error,
              });

              return undefined;
            })
          )
        );

        // If upload succeeded, continue with completion
        if (uploadResult !== undefined) {
          return;
        }

        // Compute file hash (placeholder for now)
        const fileHash = yield* computeFileHash(file).pipe(Effect.catchAll(() => Effect.succeed("placeholder-hash")));

        // Complete upload via callback
        yield* completeUpload({
          fileId: urlInfo.fileId,
          key: urlInfo.key,
          fileHash,
          signature: presigned.signature,
        }).pipe(
          Effect.flatMap(() =>
            Effect.gen(function* () {
              yield* Metric.increment(UploadMetrics.filesProcessedTotal);

              const uploadedResult: UploadedFileResult = {
                fileId: urlInfo.fileId,
                key: urlInfo.key,
                name: file.name,
                size: file.size,
                mimeType: result.validated.detected?.mimeType ?? file.type,
              };

              uploadResults.push({
                success: true,
                urlInfo,
                file,
                result,
              });

              config.onFileComplete?.(uploadedResult);
            })
          ),
          Effect.catchAll((error) =>
            Effect.gen(function* () {
              yield* Effect.logWarning("Upload callback failed", {
                ...makeFileAnnotations(file),
                fileId: urlInfo.fileId,
                error: error.message,
              });

              uploadResults.push({
                success: false,
                urlInfo,
                file,
                result,
                error,
              });

              config.onError?.({
                _tag: "CompleteUploadError",
                code: error.code,
                message: error.message,
                fileName: file.name,
                cause: error,
              });
            })
          )
        );
      }),
    { concurrency }
  );

  // 5. Record duration metric
  const duration = Date.now() - startTime;
  yield* Metric.update(UploadMetrics.processFileDurationMs, duration);

  // 6. Build final result
  const successes: UploadedFileResult[] = [];
  const failures: UploadPipelineError[] = [];

  for (const uploadResult of uploadResults) {
    if (uploadResult.success && uploadResult.result) {
      successes.push({
        fileId: uploadResult.urlInfo.fileId,
        key: uploadResult.urlInfo.key,
        name: uploadResult.file.name,
        size: uploadResult.file.size,
        mimeType: uploadResult.result.validated.detected?.mimeType ?? uploadResult.file.type,
      });
    } else if (uploadResult.error) {
      const err = uploadResult.error as { _tag?: string; code?: string; message?: string };
      failures.push({
        _tag: err._tag ?? "UnknownError",
        code: err.code ?? "UNKNOWN",
        message: err.message ?? "Unknown error",
        fileName: uploadResult.file.name,
        cause: uploadResult.error,
      });
    }
  }

  // Add validation failures
  for (const failure of validationErrors) {
    failures.push({
      _tag: failure._tag,
      code: "VALIDATION_ERROR",
      message: failure.message,
      fileName: "fileName" in failure ? (failure.fileName as string) : undefined,
      cause: failure,
    });
  }

  return {
    successes,
    failures,
  } satisfies UploadPipelineResult;
});

/**
 * Upload a single file through the pipeline.
 * Convenience wrapper around uploadFiles for single file uploads.
 */
export const uploadFile = Effect.fn("uploadFile")(function* (file: File, config: UploadConfig = {}) {
  const result = yield* uploadFiles([file], config);

  if (result.successes.length > 0) {
    return result.successes[0]!;
  }

  if (result.failures.length > 0) {
    return yield* Effect.fail(
      new PipelineError({
        code: result.failures[0]!.code,
        message: result.failures[0]!.message,
        fileName: result.failures[0]!.fileName,
        cause: result.failures[0]!.cause,
      })
    );
  }

  return yield* Effect.fail(
    new PipelineError({
      code: "UNKNOWN",
      message: "Upload failed with no error information",
      fileName: file.name,
    })
  );
});
