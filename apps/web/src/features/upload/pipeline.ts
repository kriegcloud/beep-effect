// Direct import to avoid pulling in server-only dependencies (pg, fs, dns, etc.)
// from the barrel export which includes DocumentsRepos/Db layers
import { ExifToolService } from "@beep/documents-infra/files";
import { BS } from "@beep/schema";
import { type DetectedFileInfo, FileAttributes, fileTypeChecker, getFileChunk } from "@beep/schema/integrations/files";
import { formatSize } from "@beep/schema/integrations/files/utils/formatSize";
import * as A from "effect/Array";
import * as Effect from "effect/Effect";
import * as Metric from "effect/Metric";
import * as R from "effect/Record";
import * as S from "effect/Schema";
import * as Str from "effect/String";
import * as Errors from "./errors";
import { logInfo, logWarning, makeFileAnnotations, UploadMetrics } from "./observability";
import {
  type BasicMetadataOutput,
  DEFAULT_CHUNK_SIZE,
  type PipelineConfig,
  type ValidateFileOutput,
} from "./UploadModels";

/**
 * Validate a File against size and signature rules.
 */
export const validateFile = Effect.fn("upload.validateFile")(function* ({
  file,
  config,
}: {
  readonly file: File;
  readonly config?: PipelineConfig | undefined;
}) {
  const formattedSize = formatSize(file.size);
  // Size check (friendly message using BS.formatSize)
  if (typeof config?.maxSizeBytes === "number" && file.size > config.maxSizeBytes) {
    const actual = formattedSize;
    const max = formatSize(config.maxSizeBytes);
    return yield* new Errors.ValidationError({
      message: `File too large: ${actual} (max ${max})`,
      fileName: file.name,
      fileType: file.type,
      fileSize: file.size,
    });
  }

  const chunkSize = config?.chunkSize ?? DEFAULT_CHUNK_SIZE;
  const buffer = yield* Effect.tryPromise({
    try: async () => file.arrayBuffer(),
    catch: (e) =>
      new Errors.DetectionError({
        message: "Could not detect file type from signature",
        cause: e,
        fileName: file.name,
        fileType: file.type,
        fileSize: file.size,
        chunkSize,
      }),
  });
  const chunk = getFileChunk(buffer, chunkSize);
  const detected = fileTypeChecker.detectFile(chunk, { chunkSize });
  if (!detected) {
    // increment metric and warn before failing
    yield* Metric.increment(UploadMetrics.detectionFailedTotal);
    yield* logWarning("upload.validateFile: signature detection failed", makeFileAnnotations(file));
    return yield* new Errors.DetectionError({
      message: "Could not detect file type from signature",
      fileName: file.name,
      fileType: file.type,
      fileSize: file.size,
      chunkSize,
    });
  }
  // Ensure detected mime is supported by our schema; fail early with a helpful error
  const candidate = detected?.mimeType ?? file.type;
  yield* S.decodeUnknown(BS.MimeType)(candidate).pipe(
    Effect.tapError((error) =>
      logWarning("upload.validateFile: unsupported mime type", {
        ...makeFileAnnotations(file),
        candidate,
        error,
      })
    ),
    Effect.mapError(
      (error) =>
        new Errors.ValidationError({
          message: `Unsupported mime type: ${candidate}`,
          cause: error,
          fileName: file.name,
          fileType: candidate,
          fileSize: file.size,
        })
    )
  );
  if (config?.allowedMime) {
    if (!A.contains(candidate)(config.allowedMime)) {
      yield* logWarning("upload.validateFile: disallowed MIME", {
        ...makeFileAnnotations(file),
        candidate,
        allowed: config.allowedMime,
      });
      return yield* new Errors.ValidationError({
        message: `Disallowed type: ${candidate}`,
        fileName: file.name,
        fileType: file.type,
        fileSize: file.size,
        candidateMime: candidate,
        allowedMime: config.allowedMime,
      });
    }
  }

  return { detected, formattedSize } satisfies ValidateFileOutput;
});

/**
 * Extract basic file metadata and optionally reuse detection result.
 * NOTE: This is a scaffolding stub. Use Effect + Schema to validate attributes when implementing.
 */
export const extractBasicMetadata = Effect.fn("upload.extractBasicMetadata")(function* ({
  file,
  detected,
}: {
  readonly file: File;
  readonly detected?: DetectedFileInfo.Type | undefined;
}) {
  // Build attributes and validate at runtime using effect/Schema
  const wrp = file.webkitRelativePath;
  const hasWrp = Str.isString(wrp) && Str.length(wrp) > 0;
  const candidateType = detected?.mimeType ?? file.type;

  const attributesInput = {
    size: file.size,
    type: candidateType,
    // Schema expects both lastModifiedDate and lastModified as acceptable date types
    lastModifiedDate: file.lastModified,
    lastModified: file.lastModified,
    name: file.name,
    ...(hasWrp ? { webkitRelativePath: wrp, relativePath: wrp } : R.empty()),
  };

  const attributes = yield* S.decodeUnknown(FileAttributes)(attributesInput).pipe(
    Effect.tapError((error) =>
      logWarning("upload.extractBasicMetadata: invalid file attributes", {
        ...makeFileAnnotations(file),
        candidateType,
        error,
      })
    ),
    Effect.mapError(
      (error) =>
        new Errors.ValidationError({
          message: "Invalid file attributes",
          cause: error,
          fileName: file.name,
          fileType: candidateType,
          fileSize: file.size,
        })
    )
  );

  return { attributes, detected } satisfies BasicMetadataOutput;
});

/**
 * Extract EXIF metadata for images (when present).
 * Returns undefined on non-images or parse failure.
 */
export const extractExifMetadata = Effect.fn("upload.extractExifMetadata")(function* ({
  file,
  detected,
}: {
  readonly file: File;
  readonly detected?: DetectedFileInfo.Type | undefined;
}) {
  // Simple guard: skip if not an image by MIME (prefer detected mime when available)
  const candidateMime = detected?.mimeType ?? file.type;
  if (!candidateMime || !candidateMime.startsWith("image/")) {
    return undefined;
  }

  // Try EXIF parse via service, but do not fail the pipeline
  return yield* Effect.gen(function* () {
    const exif = yield* ExifToolService.extractMetadata(file);

    // Success: increment metric and log
    yield* Metric.increment(UploadMetrics.exifParsedTotal);
    yield* logInfo("upload.extractExifMetadata: parsed EXIF", makeFileAnnotations(file));

    return exif;
  }).pipe(
    Effect.catchAll((error) =>
      Effect.gen(function* () {
        yield* Metric.increment(UploadMetrics.exifFailedTotal);
        yield* logWarning("upload.extractExifMetadata: non-fatal EXIF parse failure", {
          ...makeFileAnnotations(file),
          error,
        });
        return undefined;
      })
    )
  );
});
