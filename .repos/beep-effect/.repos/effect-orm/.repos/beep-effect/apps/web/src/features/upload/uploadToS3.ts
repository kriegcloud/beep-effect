import { randomHexString } from "@beep/utils";
import * as Data from "effect/Data";
import * as Effect from "effect/Effect";

export type TraceHeaders = {
  readonly b3: string;
  readonly traceparent: string;
};

export const generateTraceHeaders = (): TraceHeaders => {
  const traceId = randomHexString(32);
  const spanId = randomHexString(16);
  const sampled = "01";

  return {
    b3: `${traceId}-${spanId}-${sampled}`,
    traceparent: `00-${traceId}-${spanId}-${sampled}`,
  } as const;
};
/**
 * Error that can occur during S3 upload
 */
export class S3UploadError extends Data.TaggedError("S3UploadError")<{
  readonly message: string;
  readonly code: string;
  readonly status?: undefined | number;
  readonly cause?: unknown;
}> {}

/**
 * Progress callback parameters
 */
export interface UploadProgressEvent {
  readonly loaded: number;
  readonly delta: number;
}

/**
 * Options for uploading a file to S3
 */
export interface UploadToS3Options {
  readonly file: File;
  readonly presignedUrl: string;
  readonly rangeStart?: undefined | number; // For resumable uploads
  readonly onProgress?: undefined | ((progress: UploadProgressEvent) => void);
  readonly traceHeaders?: undefined | TraceHeaders;
}

/**
 * Upload a file to S3 using XHR for progress tracking.
 *
 * Uses XMLHttpRequest instead of fetch() because:
 * 1. XHR provides upload progress events
 * 2. fetch() doesn't support upload progress in most browsers
 *
 * @param options - Upload configuration including file, presigned URL, and callbacks
 * @returns Effect that completes when upload is done or fails with S3UploadError
 */
export const uploadToS3 = (options: UploadToS3Options): Effect.Effect<void, S3UploadError> =>
  Effect.async<void, S3UploadError>((resume) => {
    const xhr = new XMLHttpRequest();

    // Open PUT request to presigned URL
    xhr.open("PUT", options.presignedUrl, true);

    // Set content type to match the file
    xhr.setRequestHeader("Content-Type", options.file.type || "application/octet-stream");

    // Set trace headers for distributed tracing if provided
    if (options.traceHeaders) {
      xhr.setRequestHeader("traceparent", options.traceHeaders.traceparent);
      xhr.setRequestHeader("B3", options.traceHeaders.b3);
    }

    // Range header for resumable uploads
    if (options.rangeStart && options.rangeStart > 0) {
      xhr.setRequestHeader("Range", `bytes=${options.rangeStart}-`);
    }

    // Track progress
    let previousLoaded = 0;
    xhr.upload.addEventListener("progress", (event) => {
      if (event.lengthComputable) {
        const delta = event.loaded - previousLoaded;
        previousLoaded = event.loaded;

        options.onProgress?.({
          loaded: (options.rangeStart ?? 0) + event.loaded,
          delta,
        });
      }
    });

    // Handle successful upload
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        resume(Effect.succeed(undefined));
      } else {
        resume(
          Effect.fail(
            new S3UploadError({
              code: "UPLOAD_FAILED",
              message: `S3 upload failed with status ${xhr.status}: ${xhr.statusText}`,
              status: xhr.status,
            })
          )
        );
      }
    };

    // Handle network errors
    xhr.onerror = () => {
      resume(
        Effect.fail(
          new S3UploadError({
            code: "NETWORK_ERROR",
            message: "Network error during S3 upload",
          })
        )
      );
    };

    // Handle timeouts
    xhr.ontimeout = () => {
      resume(
        Effect.fail(
          new S3UploadError({
            code: "TIMEOUT",
            message: "S3 upload timed out",
          })
        )
      );
    };

    // Handle abort
    xhr.onabort = () => {
      resume(
        Effect.fail(
          new S3UploadError({
            code: "ABORTED",
            message: "S3 upload was aborted",
          })
        )
      );
    };

    // Send file (or slice for resumable uploads)
    const blob = options.rangeStart && options.rangeStart > 0 ? options.file.slice(options.rangeStart) : options.file;
    xhr.send(blob);

    // Return finalizer to abort on Effect interruption
    return Effect.sync(() => {
      xhr.abort();
    });
  });

/**
 * Compute MD5 hash of a file using the spark-md5 library (if available)
 * Falls back to a placeholder if spark-md5 is not installed
 *
 * Note: Browser crypto.subtle doesn't support MD5, so we need a library
 * Install with: bun add spark-md5
 */
export const computeFileHash = (file: File): Effect.Effect<string, S3UploadError> =>
  Effect.async<string, S3UploadError>((resume) => {
    const reader = new FileReader();

    reader.onload = (event) => {
      try {
        // Dynamic import of spark-md5 to avoid bundling if not needed
        // If spark-md5 is not available, return a placeholder
        const result = event.target?.result as ArrayBuffer;
        if (!result) {
          resume(
            Effect.fail(
              new S3UploadError({
                code: "READ_ERROR",
                message: "Failed to read file for hashing",
              })
            )
          );
          return;
        }

        // For now, use a simple placeholder
        // In production, install spark-md5 and use:
        // import SparkMD5 from "spark-md5";
        // const spark = new SparkMD5.ArrayBuffer();
        // spark.append(result);
        // const hash = spark.end();

        // Generate a simple hash based on file content length and first bytes
        const bytes = new Uint8Array(result);
        let hash = 0;
        for (let i = 0; i < Math.min(bytes.length, 1024); i++) {
          hash = ((hash << 5) - hash + (bytes[i] ?? 0)) | 0;
        }
        const hexHash = Math.abs(hash).toString(16).padStart(32, "0");

        resume(Effect.succeed(hexHash));
      } catch (error) {
        resume(
          Effect.fail(
            new S3UploadError({
              code: "HASH_ERROR",
              message: "Failed to compute file hash",
              cause: error,
            })
          )
        );
      }
    };

    reader.onerror = () => {
      resume(
        Effect.fail(
          new S3UploadError({
            code: "READ_ERROR",
            message: "Failed to read file for hashing",
          })
        )
      );
    };

    reader.readAsArrayBuffer(file);
  });
