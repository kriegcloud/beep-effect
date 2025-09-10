import type { AccumulateResult } from "@beep/errors/utils-client";
import type { BS } from "@beep/schema";
import type * as Errors from "./errors";
/**************
 * Upload pipeline shared models (scaffolding)
 * - Keep types colocated with the feature in apps/web/src/features/upload
 * - Reuse shared schemas via @beep/schema (BS namespace)
 **************/

export interface PipelineConfig {
  readonly maxSizeBytes?: number; // e.g., 3_145_728
  readonly allowedMime?: ReadonlyArray<string>; // e.g., ['image/jpeg', 'image/png']
  readonly chunkSize?: number; // default 64
  readonly excludeSimilarTypes?: boolean; // if helpers support it
}

// Step outputs
export interface ValidateFileOutput {
  readonly detected?: BS.DetectedFileInfo.Type;
  readonly formattedSize: string;
}

export interface BasicMetadataOutput {
  readonly attributes: BS.FileAttributes.Type;
  readonly detected?: BS.DetectedFileInfo.Type;
}

export type ExifMetadataOutput = BS.ExpandedTags.Type | undefined;

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
