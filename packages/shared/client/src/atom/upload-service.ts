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
import * as Cause from "effect/Cause";
import * as Data from "effect/Data";
import * as Effect from "effect/Effect";
import * as F from "effect/Function";
import * as HashMap from "effect/HashMap";
import * as O from "effect/Option";
import * as PubSub from "effect/PubSub";
import * as Ref from "effect/Ref";
import * as Stream from "effect/Stream";

const $I = $SharedClientId.create("atoms/upload-service");

// ============================================================================
// Error Types
// ============================================================================

/**
 * Error that can occur during S3 upload.
 */
export class S3UploadError extends Data.TaggedError("S3UploadError")<{
  readonly message: string;
  readonly code: "NETWORK_ERROR" | "TIMEOUT" | "ABORTED" | "UPLOAD_FAILED" | "VALIDATION_ERROR";
  readonly status?: number | undefined;
  readonly uploadId?: string | undefined;
  readonly cause?: unknown;
}> {}

// ============================================================================
// Progress Types
// ============================================================================

/**
 * Progress event emitted during upload.
 */
export interface UploadProgressEvent {
  /** Upload identifier */
  readonly uploadId: string;
  /** Bytes uploaded so far */
  readonly loaded: number;
  /** Total bytes to upload */
  readonly total: number;
  /** Bytes uploaded since last event */
  readonly delta: number;
  /** Upload percentage (0-100) */
  readonly percentage: number;
}

/**
 * Upload state for tracking in the registry.
 */
export type UploadStatus = Data.TaggedEnum<{
  readonly Pending: { readonly uploadId: string };
  readonly InProgress: { readonly uploadId: string; readonly progress: UploadProgressEvent };
  readonly Completed: { readonly uploadId: string };
  readonly Failed: { readonly uploadId: string; readonly error: S3UploadError };
  readonly Cancelled: { readonly uploadId: string };
}>;

export const UploadStatus = Data.taggedEnum<UploadStatus>();

// ============================================================================
// Upload Options
// ============================================================================

/**
 * Options for presigned PUT upload (direct file upload).
 */
export interface PresignedPutOptions {
  readonly _tag: "PUT";
  /** Unique upload identifier for progress tracking */
  readonly uploadId: string;
  /** The file to upload */
  readonly file: File;
  /** S3 presigned PUT URL */
  readonly presignedUrl: string;
  /** Optional byte offset for resumable uploads */
  readonly rangeStart?: number | undefined;
  /** Optional progress callback */
  readonly onProgress?: ((event: UploadProgressEvent) => void) | undefined;
}

/**
 * Options for presigned POST upload (FormData with policy fields).
 */
export interface PresignedPostOptions {
  readonly _tag: "POST";
  /** Unique upload identifier for progress tracking */
  readonly uploadId: string;
  /** The file to upload */
  readonly file: File;
  /** S3 presigned POST URL */
  readonly presignedUrl: string;
  /** Policy fields to include in FormData (from S3 presigned POST policy) */
  readonly fields: Record<string, string>;
  /** Optional progress callback */
  readonly onProgress?: ((event: UploadProgressEvent) => void) | undefined;
}

export type UploadOptions = PresignedPutOptions | PresignedPostOptions;

// ============================================================================
// Upload Registry Service
// ============================================================================

/**
 * Registry for tracking multiple concurrent uploads with progress.
 *
 * Uses PubSub for emitting progress events that atoms can subscribe to,
 * and Ref for storing current upload states.
 */
export class UploadRegistry extends Effect.Service<UploadRegistry>()($I`UploadRegistry`, {
  effect: Effect.gen(function* () {
    // PubSub for broadcasting progress events
    const progressPubSub = yield* PubSub.unbounded<UploadProgressEvent>();
    // Ref for current upload states
    const statesRef = yield* Ref.make(HashMap.empty<string, UploadStatus>());
    // Ref for abort controllers
    const abortControllersRef = yield* Ref.make(HashMap.empty<string, () => void>());

    return {
      /**
       * Stream of all progress events (for UI subscriptions).
       */
      progressStream: Stream.fromPubSub(progressPubSub),

      /**
       * Register a new upload and return its abort function.
       */
      register: (uploadId: string, abortFn: () => void) =>
        Effect.gen(function* () {
          yield* Ref.update(statesRef, (map) =>
            F.pipe(map, HashMap.set(uploadId, UploadStatus.Pending({ uploadId }) as UploadStatus))
          );
          yield* Ref.update(abortControllersRef, (map) => F.pipe(map, HashMap.set(uploadId, abortFn)));
        }),

      /**
       * Update progress for an upload.
       */
      updateProgress: (event: UploadProgressEvent) =>
        Effect.gen(function* () {
          yield* Ref.update(statesRef, (map) =>
            F.pipe(
              map,
              HashMap.set(
                event.uploadId,
                UploadStatus.InProgress({ uploadId: event.uploadId, progress: event }) as UploadStatus
              )
            )
          );
          yield* PubSub.publish(progressPubSub, event);
        }),

      /**
       * Mark upload as completed.
       */
      complete: (uploadId: string) =>
        Ref.update(statesRef, (map) =>
          F.pipe(map, HashMap.set(uploadId, UploadStatus.Completed({ uploadId }) as UploadStatus))
        ),

      /**
       * Mark upload as failed.
       */
      fail: (uploadId: string, error: S3UploadError) =>
        Ref.update(statesRef, (map) =>
          F.pipe(map, HashMap.set(uploadId, UploadStatus.Failed({ uploadId, error }) as UploadStatus))
        ),

      /**
       * Cancel an upload.
       */
      cancel: (uploadId: string) =>
        Effect.gen(function* () {
          const controllers = yield* Ref.get(abortControllersRef);
          const abortFn = F.pipe(controllers, HashMap.get(uploadId), O.getOrNull);
          if (abortFn) {
            abortFn();
          }
          yield* Ref.update(statesRef, (map) =>
            F.pipe(map, HashMap.set(uploadId, UploadStatus.Cancelled({ uploadId }) as UploadStatus))
          );
        }),

      /**
       * Get current status of an upload.
       */
      getStatus: (uploadId: string) => Ref.get(statesRef).pipe(Effect.map((map) => HashMap.get(map, uploadId))),

      /**
       * Get all current upload states.
       */
      getAllStates: () => Ref.get(statesRef),

      /**
       * Clean up a completed/failed/cancelled upload from registry.
       */
      cleanup: (uploadId: string) =>
        Effect.gen(function* () {
          yield* Ref.update(statesRef, (map) => F.pipe(map, HashMap.remove(uploadId)));
          yield* Ref.update(abortControllersRef, (map) => F.pipe(map, HashMap.remove(uploadId)));
        }),
    };
  }),
}) {}

// ============================================================================
// Upload Functions
// ============================================================================

/**
 * Upload a file to S3 using XHR with progress tracking.
 *
 * Supports both PUT (direct upload) and POST (FormData with policy fields).
 *
 * @param options - Upload configuration
 * @returns Effect that completes when upload is done or fails with S3UploadError
 */
export const uploadToS3 = (options: UploadOptions): Effect.Effect<void, S3UploadError, UploadRegistry> =>
  Effect.gen(function* () {
    yield* Effect.logInfo(`[S3Upload] Starting upload`, {
      uploadId: options.uploadId,
      method: options._tag,
      fileName: options.file.name,
      fileSize: options.file.size,
      mimeType: options.file.type,
      presignedUrl: options.presignedUrl,
      presignedUrlLength: options.presignedUrl.length,
      hasPresignedUrl: !!options.presignedUrl,
    });

    const registry = yield* UploadRegistry;

    yield* Effect.async<void, S3UploadError>((resume) => {
      const xhr = new XMLHttpRequest();
      let previousLoaded = 0;

      Effect.runSync(
        Effect.logDebug(`[S3Upload] Registering abort function`, {
          uploadId: options.uploadId,
        })
      );

      // Register abort function
      Effect.runSync(
        registry.register(options.uploadId, () => {
          Effect.runSync(
            Effect.logWarning(`[S3Upload] Abort function called`, {
              uploadId: options.uploadId,
            })
          );
          xhr.abort();
        })
      );

      // Configure request based on type
      if (options._tag === "PUT") {
        Effect.runSync(
          Effect.logInfo(`[S3Upload] Configuring PUT request`, {
            uploadId: options.uploadId,
            url: options.presignedUrl,
            contentType: options.file.type || "application/octet-stream",
            rangeStart: options.rangeStart,
          })
        );

        xhr.open("PUT", options.presignedUrl, true);
        xhr.setRequestHeader("Content-Type", options.file.type || "application/octet-stream");

        // Range header for resumable uploads
        if (options.rangeStart && options.rangeStart > 0) {
          xhr.setRequestHeader("Range", `bytes=${options.rangeStart}-`);
        }
      } else {
        Effect.runSync(
          Effect.logInfo(`[S3Upload] Configuring POST request`, {
            uploadId: options.uploadId,
            url: options.presignedUrl,
            fields: options.fields,
            fieldsCount: Object.keys(options.fields).length,
          })
        );

        xhr.open("POST", options.presignedUrl, true);
        // Content-Type is set automatically by browser for FormData
      }

      // Track progress
      xhr.upload.addEventListener("progress", (event) => {
        if (event.lengthComputable) {
          const delta = event.loaded - previousLoaded;
          previousLoaded = event.loaded;

          const progressEvent: UploadProgressEvent = {
            uploadId: options.uploadId,
            loaded: event.loaded,
            total: event.total,
            delta,
            percentage: event.total > 0 ? (event.loaded / event.total) * 100 : 0,
          };

          // Log progress (throttled to every 10%)
          if (progressEvent.percentage % 10 < 1) {
            Effect.runSync(
              Effect.logDebug(`[S3Upload] Progress update`, {
                uploadId: options.uploadId,
                loaded: progressEvent.loaded,
                total: progressEvent.total,
                percentage: progressEvent.percentage.toFixed(1),
              })
            );
          }

          // Update registry
          Effect.runSync(registry.updateProgress(progressEvent));

          // Call optional callback
          options.onProgress?.(progressEvent);
        }
      });

      // Handle successful upload
      xhr.onload = () => {
        Effect.runSync(
          Effect.logInfo(`[S3Upload] XHR onload event`, {
            uploadId: options.uploadId,
            status: xhr.status,
            statusText: xhr.statusText,
            responseType: xhr.responseType,
            responseTextLength: xhr.responseText?.length,
          })
        );

        if (xhr.status >= 200 && xhr.status < 300) {
          Effect.runSync(
            Effect.logInfo(`[S3Upload] Upload successful`, {
              uploadId: options.uploadId,
              status: xhr.status,
            })
          );
          Effect.runSync(registry.complete(options.uploadId));
          resume(Effect.succeed(undefined));
        } else {
          const error = new S3UploadError({
            code: "UPLOAD_FAILED",
            message: `S3 upload failed with status ${xhr.status}: ${xhr.statusText}`,
            status: xhr.status,
            uploadId: options.uploadId,
          });

          Effect.runSync(
            Effect.logError(`[S3Upload] Upload failed with non-2xx status`, {
              uploadId: options.uploadId,
              status: xhr.status,
              statusText: xhr.statusText,
              responseText: xhr.responseText,
              error,
            })
          );

          Effect.runSync(registry.fail(options.uploadId, error));
          resume(Effect.fail(error));
        }
      };

      // Handle network errors
      xhr.onerror = () => {
        const error = new S3UploadError({
          code: "NETWORK_ERROR",
          message: "Network error during S3 upload",
          uploadId: options.uploadId,
        });

        Effect.runSync(
          Effect.logError(`[S3Upload] Network error`, {
            uploadId: options.uploadId,
            readyState: xhr.readyState,
            status: xhr.status,
            error,
          })
        );

        Effect.runSync(registry.fail(options.uploadId, error));
        resume(Effect.fail(error));
      };

      // Handle timeouts
      xhr.ontimeout = () => {
        const error = new S3UploadError({
          code: "TIMEOUT",
          message: "S3 upload timed out",
          uploadId: options.uploadId,
        });

        Effect.runSync(
          Effect.logError(`[S3Upload] Timeout error`, {
            uploadId: options.uploadId,
            timeout: xhr.timeout,
            error,
          })
        );

        Effect.runSync(registry.fail(options.uploadId, error));
        resume(Effect.fail(error));
      };

      // Handle abort
      xhr.onabort = () => {
        const error = new S3UploadError({
          code: "ABORTED",
          message: "S3 upload was aborted",
          uploadId: options.uploadId,
        });

        Effect.runSync(
          Effect.logWarning(`[S3Upload] Upload aborted`, {
            uploadId: options.uploadId,
            error,
          })
        );

        // Don't update registry here - cancel() already did
        resume(Effect.fail(error));
      };

      // Prepare and send the request
      if (options._tag === "PUT") {
        // Direct file upload
        const blob =
          options.rangeStart && options.rangeStart > 0 ? options.file.slice(options.rangeStart) : options.file;

        Effect.runSync(
          Effect.logInfo(`[S3Upload] Sending PUT request`, {
            uploadId: options.uploadId,
            blobSize: blob.size,
            rangeStart: options.rangeStart,
          })
        );

        xhr.send(blob);
      } else {
        // FormData upload with policy fields
        const formData = new FormData();

        // Add policy fields first (order matters for S3)
        const fieldEntries = Object.entries(options.fields);
        Effect.runSync(
          Effect.logInfo(`[S3Upload] Building FormData`, {
            uploadId: options.uploadId,
            fieldCount: fieldEntries.length,
            fields: options.fields,
          })
        );

        for (const [key, value] of fieldEntries) {
          formData.append(key, value);
          Effect.runSync(
            Effect.logDebug(`[S3Upload] Added FormData field`, {
              uploadId: options.uploadId,
              key,
              value,
            })
          );
        }

        // Add file last
        formData.append("file", options.file);

        Effect.runSync(
          Effect.logInfo(`[S3Upload] Sending POST request with FormData`, {
            uploadId: options.uploadId,
            fileName: options.file.name,
            fileSize: options.file.size,
            totalFields: fieldEntries.length + 1,
          })
        );

        xhr.send(formData);
      }

      Effect.runSync(
        Effect.logDebug(`[S3Upload] XHR request sent, waiting for response`, {
          uploadId: options.uploadId,
          readyState: xhr.readyState,
        })
      );

      // Return finalizer to abort on Effect interruption
      return Effect.sync(() => {
        Effect.runSync(
          Effect.logWarning(`[S3Upload] Effect interrupted, aborting XHR`, {
            uploadId: options.uploadId,
          })
        );
        xhr.abort();
      });
    });
  }).pipe(
    Effect.tapErrorCause((cause) =>
      Effect.logError(`[S3Upload] Upload failed with cause`, {
        uploadId: options.uploadId,
        cause: Cause.pretty(cause),
        causeSquash: Cause.squash(cause),
      })
    )
  );

/**
 * Create a presigned PUT upload options object.
 */
export const makePresignedPutOptions = (
  uploadId: string,
  file: File,
  presignedUrl: string,
  options?: {
    readonly rangeStart?: number;
    readonly onProgress?: (event: UploadProgressEvent) => void;
  }
): PresignedPutOptions => ({
  _tag: "PUT",
  uploadId,
  file,
  presignedUrl,
  rangeStart: options?.rangeStart,
  onProgress: options?.onProgress,
});

/**
 * Create a presigned POST upload options object.
 */
export const makePresignedPostOptions = (
  uploadId: string,
  file: File,
  presignedUrl: string,
  fields: Record<string, string>,
  options?: {
    readonly onProgress?: (event: UploadProgressEvent) => void;
  }
): PresignedPostOptions => ({
  _tag: "POST",
  uploadId,
  file,
  presignedUrl,
  fields,
  onProgress: options?.onProgress,
});

// ============================================================================
// Progress Stream Utilities
// ============================================================================

/**
 * Create a stream that emits progress events for a specific upload.
 */
export const progressStreamForUpload = (uploadId: string) =>
  Effect.gen(function* () {
    const registry = yield* UploadRegistry;
    return F.pipe(
      registry.progressStream,
      Stream.filter((event) => event.uploadId === uploadId)
    );
  }).pipe(Stream.unwrap);

/**
 * Formatting utilities for progress display.
 */
export const formatBytes = (bytes: number): string => {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${(bytes / k ** i).toFixed(2)} ${sizes[i]}`;
};

export const formatPercentage = (percentage: number): string => `${percentage.toFixed(1)}%`;
