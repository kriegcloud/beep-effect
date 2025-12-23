/**
 * @fileoverview S3 Upload Service with Progress Tracking
 *
 * Provides XHR-based file uploads to S3 presigned URLs with real-time progress tracking.
 * Uses XMLHttpRequest instead of fetch() because:
 * 1. XHR provides upload progress events via xhr.upload.onprogress
 * 2. fetch() doesn't support upload progress in most browsers
 *
 * This service supports both:
 * - Presigned PUT: Direct file upload (simpler, used in scratchpad simulation)
 * - Presigned POST: FormData upload with policy fields (used in production)
 */
import { $SharedClientId } from "@beep/identity/packages";
import { BS } from "@beep/schema";
import * as S from "effect/Schema";

const $I = $SharedClientId.create("atoms/upload-service");

// ============================================================================
// Error Types
// ============================================================================

export class UploadErrorCode extends BS.StringLiteralKit(
  "NETWORK_ERROR",
  "TIMEOUT",
  "ABORTED",
  "UPLOAD_FAILED",
  "VALIDATION_ERROR"
).annotations(
  $I.annotations("UploadErrorCode", {
    description: "Error codes for upload service",
  })
) {}

export declare namespace UploadErrorCode {
  export type Type = typeof UploadErrorCode.Type;
  export type Encoded = typeof UploadErrorCode.Encoded;
}

const withCommonErrorFields = (code: UploadErrorCode.Type) =>
  ({
    message: S.String,
    status: S.optional(S.Number),
    uploadId: S.optional(S.String),
    cause: S.optional(S.Defect),
    code: BS.LiteralWithDefault(code),
  }) as const;

export class S3NetworkError extends S.TaggedError<S3NetworkError>($I`S3NetworkError`)(
  `S3NetworkError`,
  withCommonErrorFields(UploadErrorCode.Enum.NETWORK_ERROR),
  $I.annotations("S3NetworkError", {
    description: "Error that can occur during S3 upload",
  })
) {}

export class S3TimeoutError extends S.TaggedError<S3TimeoutError>($I`S3TimeoutError`)(
  `S3TimeoutError`,
  withCommonErrorFields(UploadErrorCode.Enum.TIMEOUT),
  $I.annotations("S3TimeoutError", {
    description: "Error that can occur during S3 upload",
  })
) {}

export class S3AbortedError extends S.TaggedError<S3AbortedError>($I`S3AbortedError`)(
  `S3AbortedError`,
  withCommonErrorFields(UploadErrorCode.Enum.ABORTED),
  $I.annotations("S3AbortedError", {
    description: "Error that can occur during S3 upload",
  })
) {}

export class S3UploadFailedError extends S.TaggedError<S3UploadFailedError>($I`S3UploadFailedError`)(
  `S3UploadFailedError`,
  withCommonErrorFields(UploadErrorCode.Enum.UPLOAD_FAILED),
  $I.annotations("S3UploadFailedError", {
    description: "Error when S3 upload fails with non-2xx status",
  })
) {}

export class S3ValidationError extends S.TaggedError<S3ValidationError>($I`S3ValidationError`)(
  `S3ValidationError`,
  withCommonErrorFields(UploadErrorCode.Enum.VALIDATION_ERROR),
  $I.annotations("S3ValidationError", {
    description: "Error when S3 upload validation fails",
  })
) {}

export class S3Error extends S.Union(
  S3NetworkError,
  S3TimeoutError,
  S3AbortedError,
  S3UploadFailedError,
  S3ValidationError
).annotations(
  $I.annotations("S3Error", {
    description: "Union of all S3 upload errors",
  })
) {}

export declare namespace S3Error {
  export type Type = typeof S3Error.Type;
  export type Encoded = typeof S3Error.Encoded;
}
// /**
//  * Error that can occur during S3 upload.
//  */
// export class S3UploadError extends S.TaggedError<S3UploadError>($I`S3UploadError`)(
//   "S3UploadError",
//   {
//     message: S.String,
//     code: UploadErrorCode,
//     status: S.optional(S.Number),
//     uploadId: S.optional(S.String),
//     cause: S.optional(S.Defect)
//   },
//   $I.annotations("S3UploadError", {
//     description: "Error that can occur during S3 upload",
//   })
// ) {}
