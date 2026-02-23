/**
 * Effect-based file/blob MD5 hashing with streaming support
 * @module
 */
import * as Effect from "effect/Effect";
import * as F from "effect/Function";
import * as Stream from "effect/Stream";
import { BlobSliceError, FileReadError } from "./errors";

// Re-export errors for external use
export { FileReadError, BlobSliceError };

import { appendByteArray, finalize, Md5ComputationError, makeState, type UnicodeEncodingError } from "./md5";

/**
 * Configuration for file hashing
 * @since 1.0.0
 * @category Models
 */
export interface FileHasherConfig {
  readonly chunkSize: number;
}

/**
 * Default chunk size: 1MB
 * @since 1.0.0
 * @category Constants
 */
export const DEFAULT_CHUNK_SIZE = 1048576;

/**
 * Create a FileHasherConfig with defaults
 * @since 1.0.0
 * @category Constructors
 */
export const makeConfig = (overrides?: Partial<FileHasherConfig>): FileHasherConfig => ({
  chunkSize: overrides?.chunkSize ?? DEFAULT_CHUNK_SIZE,
});

/**
 * Slice a blob into a specific chunk
 * @since 1.0.0
 * @category Utilities
 */
const sliceBlob = (blob: Blob, start: number, end: number): Effect.Effect<Blob, BlobSliceError> =>
  Effect.try({
    try: () => {
      const actualEnd = Math.min(end, blob.size);
      return blob.slice(start, actualEnd);
    },
    catch: (cause) =>
      new BlobSliceError({
        message: "Failed to slice blob",
        cause,
      }),
  });

/**
 * Read a blob chunk as ArrayBuffer using FileReader
 * @since 1.0.0
 * @category Utilities
 */
const readBlobChunk = (chunk: Blob): Effect.Effect<ArrayBuffer, FileReadError> =>
  Effect.async<ArrayBuffer, FileReadError>((resume) => {
    const reader = new FileReader();

    reader.onload = () => {
      if (reader.result instanceof ArrayBuffer) {
        resume(Effect.succeed(reader.result));
      } else {
        resume(
          Effect.fail(
            new FileReadError({
              message: "FileReader result is not an ArrayBuffer",
              cause: reader.result,
            })
          )
        );
      }
    };

    reader.onerror = () => {
      resume(
        Effect.fail(
          new FileReadError({
            message: "FileReader error",
            cause: reader.error,
          })
        )
      );
    };

    reader.onabort = () => {
      resume(
        Effect.fail(
          new FileReadError({
            message: "FileReader aborted",
            cause: null,
          })
        )
      );
    };

    reader.readAsArrayBuffer(chunk);
  });

/**
 * Read a blob chunk synchronously using FileReaderSync (only in workers)
 * @since 1.0.0
 * @category Utilities
 */
const readBlobChunkSync = (chunk: Blob): Effect.Effect<ArrayBuffer, FileReadError> =>
  Effect.try({
    try: () => {
      // FileReaderSync is only available in web workers
      const FileReaderSync = (globalThis as any).FileReaderSync;
      if (!FileReaderSync) {
        throw new Error("FileReaderSync not available");
      }
      const reader = new FileReaderSync();
      return reader.readAsArrayBuffer(chunk);
    },
    catch: (cause) =>
      new FileReadError({
        message: "FileReaderSync failed",
        cause,
      }),
  });

/**
 * Create a stream of blob chunks
 * @since 1.0.0
 * @category Streams
 */
const makeBlobChunkStream = (blob: Blob, config: FileHasherConfig): Stream.Stream<Blob, BlobSliceError> => {
  const totalChunks = Math.ceil(blob.size / config.chunkSize);

  return Stream.range(0, totalChunks - 1).pipe(
    Stream.mapEffect((chunkIndex) => {
      const start = chunkIndex * config.chunkSize;
      const end = start + config.chunkSize;
      return sliceBlob(blob, start, end);
    })
  );
};

/**
 * Hash a blob using async FileReader (for main thread)
 * @since 1.0.0
 * @category Hashing
 */
export const hashBlobAsync = (
  blob: Blob,
  config?: Partial<FileHasherConfig>
): Effect.Effect<string, FileReadError | BlobSliceError | UnicodeEncodingError | Md5ComputationError> =>
  Effect.gen(function* () {
    const cfg = makeConfig(config);
    const chunkStream = makeBlobChunkStream(blob, cfg);

    const initialState = makeState();

    const finalState = yield* chunkStream.pipe(
      Stream.mapEffect((chunk) =>
        Effect.gen(function* () {
          const arrayBuffer = yield* readBlobChunk(chunk);
          const uint8Array = new Uint8Array(arrayBuffer);
          return uint8Array;
        })
      ),
      Stream.runFold(initialState, (state, chunk) => F.pipe(state, appendByteArray(chunk)))
    );

    const result = yield* F.pipe(finalState, finalize(false));

    if (typeof result === "string") {
      return result;
    }

    // Shouldn't happen when raw=false, but handle it
    return yield* new Md5ComputationError({
      message: "Expected string result but got Int32Array",
      cause: result,
    });
  });

/**
 * Hash a blob using sync FileReaderSync (for workers only)
 * @since 1.0.0
 * @category Hashing
 */
export const hashBlobSync = (
  blob: Blob,
  config?: Partial<FileHasherConfig>
): Effect.Effect<string, FileReadError | BlobSliceError | UnicodeEncodingError | Md5ComputationError> =>
  Effect.gen(function* () {
    const cfg = makeConfig(config);
    const chunkStream = makeBlobChunkStream(blob, cfg);

    const initialState = makeState();

    const finalState = yield* chunkStream.pipe(
      Stream.mapEffect((chunk) =>
        Effect.gen(function* () {
          const arrayBuffer = yield* readBlobChunkSync(chunk);
          const uint8Array = new Uint8Array(arrayBuffer);
          return uint8Array;
        })
      ),
      Stream.runFold(initialState, (state, chunk) => F.pipe(state, appendByteArray(chunk)))
    );

    const result = yield* F.pipe(finalState, finalize(false));

    if (typeof result === "string") {
      return result;
    }

    return yield* new Md5ComputationError({
      message: "Expected string result but got Int32Array",
      cause: result,
    });
  });

/**
 * Hash a blob - automatically selects async or sync based on environment
 * @since 1.0.0
 * @category Hashing
 */
export const hashBlob = (
  blob: Blob,
  config?: Partial<FileHasherConfig>
): Effect.Effect<string, FileReadError | BlobSliceError | UnicodeEncodingError | Md5ComputationError> => {
  // Check if FileReaderSync is available (worker context)
  const hasFileReaderSync = typeof (globalThis as any).FileReaderSync !== "undefined";

  return hasFileReaderSync ? hashBlobSync(blob, config) : hashBlobAsync(blob, config);
};
