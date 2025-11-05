import type { AccumulateResult } from "@beep/errors/client";
import type { DetectedFileInfo, ExifMetadata, FileAttributes } from "@beep/files-domain/value-objects";
import type * as Errors from "./errors";
/**************
 * Upload pipeline shared models (scaffolding)
 * - Keep types colocated with the feature in apps/web/src/features/upload
 * - Reuse shared schemas via @beep/schema (BS namespace)
 **************/

export interface PipelineConfig {
  readonly maxSizeBytes?: number | undefined; // e.g., 3_145_728
  readonly allowedMime?: ReadonlyArray<string> | undefined; // e.g., ['image/jpeg', 'image/png']
  readonly chunkSize?: number | undefined; // default 64
  readonly excludeSimilarTypes?: boolean | undefined; // if helpers support it
}

// Step outputs
export interface ValidateFileOutput {
  readonly detected?: DetectedFileInfo.Type | undefined;
  readonly formattedSize: string;
}

export interface BasicMetadataOutput {
  readonly attributes: FileAttributes.Type;
  readonly detected?: DetectedFileInfo.Type | undefined;
}

export type ExifMetadataOutput = typeof ExifMetadata.Type | undefined;

// Union of domain failures (scaffolding)
export type UploadError = Errors.ValidationError | Errors.DetectionError | Errors.ExifParseError;

export interface UploadResult {
  readonly file: File;
  readonly validated: ValidateFileOutput;
  readonly basic: BasicMetadataOutput;
  readonly exif: ExifMetadataOutput; // cleaned/validated EXIF (images only)
}

export type ProcessFilesResult = AccumulateResult<UploadResult, UploadError>;

export const DEFAULT_CHUNK_SIZE = 64 as const;
