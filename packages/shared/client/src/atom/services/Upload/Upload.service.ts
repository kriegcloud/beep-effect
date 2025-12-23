/**
 * @fileoverview S3 Upload Service with Progress Tracking (Reducer Pattern)
 *
 * Provides XHR-based file uploads to S3 presigned URLs with real-time progress tracking.
 * Uses XMLHttpRequest instead of fetch() because:
 * 1. XHR provides upload progress events via xhr.upload.onprogress
 * 2. fetch() doesn't support upload progress in most browsers
 *
 * This implementation uses a functional reducer pattern with Effect Match for:
 * - Exhaustive pattern matching on actions
 * - Type-safe state transitions
 * - Centralized state update logic
 * - Clear separation of state changes and side effects
 */
import { $SharedClientId } from "@beep/identity/packages";
import { tagPropIs } from "@beep/utils";
import * as Cause from "effect/Cause";
import * as Data from "effect/Data";
import * as Effect from "effect/Effect";
import * as F from "effect/Function";
import * as HashMap from "effect/HashMap";
import * as Match from "effect/Match";
import * as O from "effect/Option";
import * as PubSub from "effect/PubSub";
import * as Ref from "effect/Ref";
import * as Runtime from "effect/Runtime";
import * as Stream from "effect/Stream";
import * as Struct from "effect/Struct";
import * as UploadError from "./Upload.errors";

const $I = $SharedClientId.create("atom/services/Upload");

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
  readonly Failed: { readonly uploadId: string; readonly error: UploadError.S3Error.Type };
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
// Action Types (Reducer Pattern)
// ============================================================================

/**
 * All possible actions that can modify upload registry state.
 * Each action is a tagged union variant representing a state transition.
 */
export type UploadAction = Data.TaggedEnum<{
  /** Register a new upload with its abort function */
  readonly Register: {
    readonly uploadId: string;
    readonly abortFn: () => void;
  };
  /** Update progress for an upload */
  readonly UpdateProgress: {
    readonly event: UploadProgressEvent;
  };
  /** Mark upload as completed */
  readonly Complete: {
    readonly uploadId: string;
  };
  /** Mark upload as failed */
  readonly Fail: {
    readonly uploadId: string;
    readonly error: UploadError.S3Error.Type;
  };
  /** Cancel an upload (triggers abort) */
  readonly Cancel: {
    readonly uploadId: string;
  };
  /** Remove upload from registry */
  readonly Cleanup: {
    readonly uploadId: string;
  };
}>;

export const UploadAction = Data.taggedEnum<UploadAction>();

// ============================================================================
// Registry State
// ============================================================================

/**
 * Complete registry state that the reducer operates on.
 */
interface RegistryState {
  readonly states: HashMap.HashMap<string, UploadStatus>;
  readonly abortControllers: HashMap.HashMap<string, () => void>;
}

/** Type alias for the upload status HashMap */
type StatusMap = HashMap.HashMap<string, UploadStatus>;

/**
 * Type-safe helper to set a status in the HashMap while preserving the union type.
 * This avoids the type narrowing issue with HashMap.set and TaggedEnum variants.
 */
const setStatus = (map: StatusMap, uploadId: string, status: UploadStatus): StatusMap =>
  HashMap.set(map, uploadId, status);

// ============================================================================
// Reducer (Pure State Transitions)
// ============================================================================

/**
 * Pure reducer function that applies an action to the current state.
 * Uses Match.exhaustive to ensure all action cases are handled.
 *
 * This function is completely pure - no side effects.
 * Side effects (like calling abort functions or publishing events) happen in dispatch.
 */
const reducer = (state: RegistryState, action: UploadAction): RegistryState =>
  Match.value(action).pipe(
    Match.tag("Register", (a) => ({
      states: setStatus(state.states, a.uploadId, UploadStatus.Pending({ uploadId: a.uploadId })),
      abortControllers: HashMap.set(state.abortControllers, a.uploadId, a.abortFn),
    })),
    Match.tag("UpdateProgress", (a) => ({
      states: setStatus(
        state.states,
        a.event.uploadId,
        UploadStatus.InProgress({ uploadId: a.event.uploadId, progress: a.event })
      ),
      abortControllers: state.abortControllers,
    })),
    Match.tag("Complete", (a) => ({
      states: setStatus(state.states, a.uploadId, UploadStatus.Completed({ uploadId: a.uploadId })),
      abortControllers: state.abortControllers,
    })),
    Match.tag("Fail", (a) => ({
      states: setStatus(state.states, a.uploadId, UploadStatus.Failed({ uploadId: a.uploadId, error: a.error })),
      abortControllers: state.abortControllers,
    })),
    Match.tag("Cancel", (a) => ({
      states: setStatus(state.states, a.uploadId, UploadStatus.Cancelled({ uploadId: a.uploadId })),
      abortControllers: state.abortControllers,
    })),
    Match.tag("Cleanup", (a) => ({
      states: HashMap.remove(state.states, a.uploadId),
      abortControllers: HashMap.remove(state.abortControllers, a.uploadId),
    })),
    Match.exhaustive
  );

// ============================================================================
// Side Effect Handlers
// ============================================================================

/**
 * Extract side effects that should happen after state transitions.
 * Returns an Effect representing the side effects for this action.
 */
const sideEffects = (
  state: RegistryState,
  action: UploadAction,
  pubSub: PubSub.PubSub<UploadProgressEvent>
): Effect.Effect<void> =>
  Match.value(action).pipe(
    Match.tag("UpdateProgress", (a) => PubSub.publish(pubSub, a.event)),
    Match.tag("Cancel", (a) =>
      Effect.gen(function* () {
        const abortFn = F.pipe(state.abortControllers, HashMap.get(a.uploadId), O.getOrNull);
        if (abortFn) {
          abortFn();
        }
      })
    ),
    // No side effects for these actions
    Match.tag("Register", () => Effect.void),
    Match.tag("Complete", () => Effect.void),
    Match.tag("Fail", () => Effect.void),
    Match.tag("Cleanup", () => Effect.void),
    Match.exhaustive
  );

// ============================================================================
// Upload Registry Service (Refactored with Reducer Pattern)
// ============================================================================

/**
 * Registry for tracking multiple concurrent uploads with progress.
 *
 * Uses a reducer pattern for state management:
 * - All state transitions go through a pure reducer function
 * - Actions are dispatched via Match-based pattern matching
 * - Side effects are separated from state updates
 */
export class UploadRegistry extends Effect.Service<UploadRegistry>()($I`UploadRegistry`, {
  effect: Effect.gen(function* () {
    // PubSub for broadcasting progress events
    const progressPubSub = yield* PubSub.unbounded<UploadProgressEvent>();

    // Single Ref for the entire registry state
    const stateRef = yield* Ref.make<RegistryState>({
      states: HashMap.empty(),
      abortControllers: HashMap.empty(),
    });

    /**
     * Dispatch an action through the reducer, apply state changes, and handle side effects.
     */
    const dispatch = (action: UploadAction) =>
      Effect.gen(function* () {
        // Get current state before update (for side effects that need it)
        const currentState = yield* Ref.get(stateRef);

        // Apply the reducer to get new state
        yield* Ref.update(stateRef, (state) => reducer(state, action));

        // Execute side effects based on the action
        yield* sideEffects(currentState, action, progressPubSub);
      });

    return {
      /**
       * Stream of all progress events (for UI subscriptions).
       */
      progressStream: Stream.fromPubSub(progressPubSub),

      /**
       * Register a new upload and return its abort function.
       */
      register: (uploadId: string, abortFn: () => void) => dispatch(UploadAction.Register({ uploadId, abortFn })),

      /**
       * Update progress for an upload.
       */
      updateProgress: (event: UploadProgressEvent) => dispatch(UploadAction.UpdateProgress({ event })),

      /**
       * Mark upload as completed.
       */
      complete: (uploadId: string) => dispatch(UploadAction.Complete({ uploadId })),

      /**
       * Mark upload as failed.
       */
      fail: (uploadId: string, error: UploadError.S3Error.Type) => dispatch(UploadAction.Fail({ uploadId, error })),

      /**
       * Cancel an upload.
       */
      cancel: (uploadId: string) => dispatch(UploadAction.Cancel({ uploadId })),

      /**
       * Get current status of an upload.
       */
      getStatus: (uploadId: string) =>
        Ref.get(stateRef).pipe(Effect.map((state) => F.pipe(state.states, HashMap.get(uploadId)))),

      /**
       * Get all current upload states.
       */
      getAllStates: () => Ref.get(stateRef).pipe(Effect.map((state) => state.states)),

      /**
       * Clean up a completed/failed/cancelled upload from registry.
       */
      cleanup: (uploadId: string) => dispatch(UploadAction.Cleanup({ uploadId })),
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
 * @returns Effect that completes when upload is done or fails with UploadError.S3Error.Type
 */
export const uploadToS3 = (options: UploadOptions): Effect.Effect<void, UploadError.S3Error.Type, UploadRegistry> =>
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
    // Extract runtime once to use in XHR callbacks (avoids creating new minimal runtimes)
    const runtime = yield* Effect.runtime<UploadRegistry>();
    const runSync = Runtime.runSync(runtime);

    yield* Effect.async<void, UploadError.S3Error.Type>((resume) => {
      const xhr = new XMLHttpRequest();
      let previousLoaded = 0;

      runSync(
        Effect.logDebug(`[S3Upload] Registering abort function`, {
          uploadId: options.uploadId,
        })
      );

      // Register abort function
      runSync(
        registry.register(options.uploadId, () => {
          runSync(
            Effect.logWarning(`[S3Upload] Abort function called`, {
              uploadId: options.uploadId,
            })
          );
          xhr.abort();
        })
      );

      // Configure request based on type
      if (tagPropIs(options, "PUT")) {
        runSync(
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
        runSync(
          Effect.logInfo(`[S3Upload] Configuring POST request`, {
            uploadId: options.uploadId,
            url: options.presignedUrl,
            fields: options.fields,
            fieldsCount: Struct.keys(options.fields).length,
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
            runSync(
              Effect.logDebug(`[S3Upload] Progress update`, {
                uploadId: options.uploadId,
                loaded: progressEvent.loaded,
                total: progressEvent.total,
                percentage: progressEvent.percentage.toFixed(1),
              })
            );
          }

          // Update registry
          runSync(registry.updateProgress(progressEvent));

          // Call optional callback
          options.onProgress?.(progressEvent);
        }
      });

      // Handle successful upload
      xhr.onload = () => {
        runSync(
          Effect.logInfo(`[S3Upload] XHR onload event`, {
            uploadId: options.uploadId,
            status: xhr.status,
            statusText: xhr.statusText,
            responseType: xhr.responseType,
            responseTextLength: xhr.responseText?.length,
          })
        );

        if (xhr.status >= 200 && xhr.status < 300) {
          runSync(
            Effect.logInfo(`[S3Upload] Upload successful`, {
              uploadId: options.uploadId,
              status: xhr.status,
            })
          );
          runSync(registry.complete(options.uploadId));
          resume(Effect.succeed(undefined));
        } else {
          const error = new UploadError.S3UploadFailedError({
            message: `S3 upload failed with status ${xhr.status}: ${xhr.statusText}`,
            status: xhr.status,
            uploadId: options.uploadId,
          });

          runSync(
            Effect.logError(`[S3Upload] Upload failed with non-2xx status`, {
              uploadId: options.uploadId,
              status: xhr.status,
              statusText: xhr.statusText,
              responseText: xhr.responseText,
              error,
            })
          );

          runSync(registry.fail(options.uploadId, error));
          resume(Effect.fail(error));
        }
      };

      // Handle network errors
      xhr.onerror = () => {
        const error = new UploadError.S3NetworkError({
          message: "Network error during S3 upload",
          uploadId: options.uploadId,
        });

        runSync(
          Effect.logError(`[S3Upload] Network error`, {
            uploadId: options.uploadId,
            readyState: xhr.readyState,
            status: xhr.status,
            error,
          })
        );

        runSync(registry.fail(options.uploadId, error));
        resume(Effect.fail(error));
      };

      // Handle timeouts
      xhr.ontimeout = () => {
        const error = new UploadError.S3TimeoutError({
          message: "S3 upload timed out",
          uploadId: options.uploadId,
        });

        runSync(
          Effect.logError(`[S3Upload] Timeout error`, {
            uploadId: options.uploadId,
            timeout: xhr.timeout,
            error,
          })
        );

        runSync(registry.fail(options.uploadId, error));
        resume(Effect.fail(error));
      };

      // Handle abort
      xhr.onabort = () => {
        const error = new UploadError.S3AbortedError({
          message: "S3 upload was aborted",
          uploadId: options.uploadId,
        });

        runSync(
          Effect.logWarning(`[S3Upload] Upload aborted`, {
            uploadId: options.uploadId,
            error,
          })
        );

        // Don't update registry here - cancel() already did
        resume(Effect.fail(error));
      };

      // Prepare and send the request
      if (tagPropIs(options, "PUT")) {
        // Direct file upload
        const blob =
          options.rangeStart && options.rangeStart > 0 ? options.file.slice(options.rangeStart) : options.file;

        runSync(
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
        const fieldEntries = Struct.entries(options.fields);
        runSync(
          Effect.logInfo(`[S3Upload] Building FormData`, {
            uploadId: options.uploadId,
            fieldCount: fieldEntries.length,
            fields: options.fields,
          })
        );

        for (const [key, value] of fieldEntries) {
          formData.append(key, value);
          runSync(
            Effect.logDebug(`[S3Upload] Added FormData field`, {
              uploadId: options.uploadId,
              key,
              value,
            })
          );
        }

        // Add file last
        formData.append("file", options.file);

        runSync(
          Effect.logInfo(`[S3Upload] Sending POST request with FormData`, {
            uploadId: options.uploadId,
            fileName: options.file.name,
            fileSize: options.file.size,
            totalFields: fieldEntries.length + 1,
          })
        );

        xhr.send(formData);
      }

      runSync(
        Effect.logDebug(`[S3Upload] XHR request sent, waiting for response`, {
          uploadId: options.uploadId,
          readyState: xhr.readyState,
        })
      );

      // Return finalizer to abort on Effect interruption
      return Effect.sync(() => {
        runSync(
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
  options?:
    | undefined
    | {
        readonly rangeStart?: undefined | number;
        readonly onProgress?: undefined | ((event: UploadProgressEvent) => void);
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
  options?:
    | undefined
    | {
        readonly onProgress?: undefined | ((event: UploadProgressEvent) => void);
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

export const formatPercentage = (percentage: number): string => `${percentage.toFixed(1)}%`;
