import type { AccumulateResult } from "@beep/errors/client";
import { $WebId } from "@beep/identity/packages";
import type {
  DetectedFileInfo,
  ExifMetadata,
  FileAttributes,
  IllegalChunkError,
  InvalidFileTypeError,
  MimeType,
} from "@beep/schema/integrations/files";
import type { InvalidChunkSizeError } from "@beep/schema/integrations/files/file-types/detection";
import * as S from "effect/Schema";
import type * as Errors from "./errors";

const $I = $WebId.create("features/upload/UploadModels");

/**************
 * Upload pipeline shared models (scaffolding)
 * - Keep types colocated with the feature in apps/web/src/features/upload
 * - Reuse shared schemas via @beep/schema (BS namespace)
 **************/

export interface PipelineConfig {
  readonly maxSizeBytes?: number | undefined; // e.g., 3_145_728
  readonly allowedMime?: ReadonlyArray<MimeType.Type> | undefined; // e.g., ['image/jpeg', 'image/png']
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
export type UploadError =
  | Errors.ValidationError
  | Errors.DetectionError
  | Errors.MetadataParseError
  | InvalidFileTypeError
  | IllegalChunkError
  | InvalidChunkSizeError;

export interface UploadResult {
  readonly file: File;
  readonly validated: ValidateFileOutput;
  readonly basic: BasicMetadataOutput;
  readonly exif: ExifMetadataOutput; // cleaned/validated EXIF (images only)
}

export type ProcessFilesResult = AccumulateResult<UploadResult, UploadError>;

export const DEFAULT_CHUNK_SIZE = 64 as const;

// ============================================================================
// Extended Upload Types for Full Pipeline
// ============================================================================

/**
 * Extended configuration for the complete upload pipeline
 */
export interface UploadConfig extends PipelineConfig {
  readonly input?: unknown; // Custom metadata to pass to server
  readonly concurrency?: number; // Parallel upload count (default: 3)
  readonly onProgress?: (progress: FileUploadProgress) => void;
  readonly onFileComplete?: (result: UploadedFileResult) => void;
  readonly onError?: (error: UploadPipelineError) => void;
}

/**
 * Progress information for a single file upload
 */
export interface FileUploadProgress {
  readonly fileId: string;
  readonly fileName: string;
  readonly loaded: number;
  readonly total: number;
  readonly percent: number;
}

/**
 * Result of a successful file upload
 */
export interface UploadedFileResult {
  readonly fileId: string;
  readonly key: string;
  readonly name: string;
  readonly size: number;
  readonly mimeType: string;
}

/**
 * Error from the upload pipeline
 */
export interface UploadPipelineError {
  readonly _tag: string;
  readonly code: string;
  readonly message: string;
  readonly fileName?: string;
  readonly cause?: unknown;
}

// ============================================================================
// Effect Schema Types for API Communication
// ============================================================================

/**
 * Single presigned URL item returned from the server
 */
export class PresignedUrlItem extends S.Class<PresignedUrlItem>($I`PresignedUrlItem`)(
  {
    url: S.String,
    key: S.String,
    fileId: S.String,
    name: S.String,
    customId: S.NullOr(S.String),
  },
  $I.annotations("PresignedUrlItem", { description: "Single presigned URL item returned from the server" })
) {}

/**
 * Trace headers for distributed tracing
 */
export class TraceHeadersSchema extends S.Class<TraceHeadersSchema>($I`TraceHeadersSchema`)(
  {
    b3: S.String,
    traceparent: S.String,
  },
  $I.annotations("TraceHeadersSchema", { description: "Trace headers for distributed tracing" })
) {}

/**
 * Response from presigned URL request
 */
export class PresignedUrlResponse extends S.Class<PresignedUrlResponse>($I`PresignedUrlResponse`)(
  {
    urls: S.Array(PresignedUrlItem),
    traceHeaders: TraceHeadersSchema,
    signature: S.String,
  },
  $I.annotations("PresignedUrlResponse", { description: "Response from presigned URL request" })
) {}

/**
 * Callback request payload for upload completion
 */
export class UploadCallbackPayload extends S.Class<UploadCallbackPayload>($I`UploadCallbackPayload`)(
  {
    fileId: S.String,
    key: S.String,
    fileHash: S.String,
  },
  $I.annotations("UploadCallbackPayload", { description: "Callback request payload for upload completion" })
) {}

/**
 * Response from callback endpoint
 */
export class UploadCallbackResponse extends S.Class<UploadCallbackResponse>($I`UploadCallbackResponse`)(
  {
    success: S.Boolean,
    fileId: S.String,
    status: S.String,
    message: S.String,
  },
  $I.annotations("UploadCallbackResponse", { description: "Response from callback endpoint" })
) {}

/**
 * Error response from API
 */
export class ApiErrorResponse extends S.Class<ApiErrorResponse>($I`ApiErrorResponse`)(
  {
    error: S.Struct({
      _tag: S.String,
      code: S.String,
      message: S.String,
    }),
  },
  $I.annotations("ApiErrorResponse", { description: "Error response from API" })
) {}
