/**
 * Effect-based MD5 hashing library
 *
 * This module provides pure functional MD5 hashing with Effect patterns:
 * - Immutable state management
 * - Tagged errors with Schema
 * - Stream-based file hashing
 * - Worker pool for parallel processing
 * - Type-safe error handling
 *
 * @example
 * ```typescript
 * import * as Md5 from "@beep/utils/md5";
 * import * as Effect from "effect/Effect";
 *
 * // Hash a string
 * const hashEffect = Md5.hashStr("hello world");
 * const hash = Effect.runSync(hashEffect);
 *
 * // Hash a file/blob
 * const fileHashEffect = Md5.hashBlob(blob);
 * const fileHash = await Effect.runPromise(fileHashEffect);
 *
 * // Parallel hashing with worker pool
 * const config: Md5.ParallelHasherConfig = {
 *   workerUrl: "/md5-worker.js",
 *   poolSize: 4,
 * };
 * const parallelHash = await Effect.runPromise(
 *   Md5.hashBlobWithConfig(blob, config)
 * );
 * ```
 *
 * @module
 */

// Errors
export {
  BlobSliceError,
  FileReadError,
  Md5ComputationError,
  UnicodeEncodingError,
  WorkerHashError,
} from "./errors";
// Core MD5 functionality
export {
  appendAsciiStr,
  appendByteArray,
  appendStr,
  finalize,
  getSerializableState,
  hashAsciiStr,
  hashStr,
  type Md5State,
  makeState,
  type SerializableMd5State,
  selfTest,
  setSerializableState,
} from "./md5";
// File/Blob hashing
export {
  DEFAULT_CHUNK_SIZE,
  type FileHasherConfig,
  hashBlob,
  hashBlobAsync,
  hashBlobSync,
  makeConfig,
} from "./md5-file-hasher";
// Parallel worker pool hashing
export {
  DEFAULT_POOL_SIZE,
  hashBlob as hashBlobParallel,
  hashBlobWithConfig,
  makeLayer,
  makeLayerWithSpawner,
  ParallelHasher,
  type ParallelHasherConfig,
  type ParallelHasherSpawnerConfig,
} from "./parallel-hasher";
// Worker implementation (for use in worker context)
export {
  HashRequest,
  launchWorker,
  type WorkerRequest,
  WorkerRequestSchema,
} from "./worker";
