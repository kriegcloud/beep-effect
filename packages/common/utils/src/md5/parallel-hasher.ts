/**
 * Effect-based parallel MD5 hashing using Worker Pool
 *
 * This module provides a worker pool interface for parallel MD5 hashing
 * using Effect Platform's serialized worker system.
 *
 * Note: For browser environments with small files, the single-threaded
 * hashBlob from md5-file-hasher may be more efficient due to the overhead
 * of worker communication and Blob serialization.
 *
 * @module
 */

import { $UtilsId } from "@beep/identity/packages";
import * as Worker from "@effect/platform/Worker";
import * as BrowserWorker from "@effect/platform-browser/BrowserWorker";
import * as Context from "effect/Context";
import * as Effect from "effect/Effect";
import * as F from "effect/Function";
import * as Layer from "effect/Layer";
import * as O from "effect/Option";
import { WorkerHashError } from "./errors";
import { HashRequest, type WorkerRequest } from "./worker";

const $I = $UtilsId.create("md5/parallel-hasher");

/**
 * Configuration for the parallel hasher pool
 * @since 0.1.0
 * @category Models
 */
export interface ParallelHasherConfig {
  readonly workerUrl: string;
  readonly poolSize: number;
  readonly chunkSize?: number | undefined;
}

/**
 * Default pool configuration
 * @since 0.1.0
 * @category Constants
 */
export const DEFAULT_POOL_SIZE = 4;

/**
 * Default chunk size for file hashing
 * @since 0.1.0
 * @category Constants
 */
export const DEFAULT_CHUNK_SIZE = 1048576; // 1MB

/**
 * Service interface for parallel MD5 hashing
 * @since 0.1.0
 * @category Models
 */
export interface ParallelHasherService {
  readonly hashBlob: (blob: Blob, chunkSize?: number | undefined) => Effect.Effect<string, WorkerHashError>;
}

/**
 * Context tag for parallel hasher service
 * @since 0.1.0
 * @category Services
 */
export class ParallelHasher extends Context.Tag($I`ParallelHasher`)<ParallelHasher, ParallelHasherService>() {}

/**
 * Convert Blob to Uint8Array for worker serialization
 * @since 0.1.0
 * @category Utilities
 */
const blobToUint8Array = (blob: Blob): Effect.Effect<Uint8Array, WorkerHashError> =>
  Effect.async<Uint8Array, WorkerHashError>((resume) => {
    const reader = new FileReader();

    reader.onload = () => {
      if (reader.result instanceof ArrayBuffer) {
        resume(Effect.succeed(new Uint8Array(reader.result)));
      } else {
        resume(
          Effect.fail(
            new WorkerHashError({
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
          new WorkerHashError({
            message: "FileReader error during Blob serialization",
            cause: reader.error,
          })
        )
      );
    };

    reader.readAsArrayBuffer(blob);
  });

/**
 * Create the parallel hasher service implementation
 * @since 0.1.0
 * @category Constructors
 */
const makeService = (
  pool: Worker.SerializedWorkerPool<WorkerRequest>,
  defaultChunkSize: number
): ParallelHasherService => ({
  hashBlob: Effect.fn(
    function* (blob, chunkSize) {
      const buffer = yield* blobToUint8Array(blob);
      const request = new HashRequest({
        buffer,
        size: blob.size,
        chunkSize: F.pipe(
          O.fromNullable(chunkSize),
          O.getOrElse(() => defaultChunkSize)
        ),
      });
      return yield* pool.executeEffect(request);
    },
    Effect.mapError(
      (error) =>
        new WorkerHashError({
          message: "Worker execution failed or hashing error occurred",
          cause: error,
        })
    )
  ),
});

/**
 * Create a parallel hasher layer with custom configuration
 *
 * Example usage:
 * ```typescript
 * const hasherLayer = ParallelHasher.makeLayer({
 *   workerUrl: "/workers/md5-worker.js",
 *   poolSize: 4,
 *   chunkSize: 2097152 // 2MB
 * });
 *
 * const program = Effect.gen(function*() {
 *   const hasher = yield* ParallelHasher;
 *   const hash = yield* hasher.hashBlob(myBlob);
 *   return hash;
 * });
 *
 * Effect.runPromise(program.pipe(Effect.provide(hasherLayer)));
 * ```
 *
 * @since 0.1.0
 * @category Layers
 */
export const makeLayer = (config: ParallelHasherConfig): Layer.Layer<ParallelHasher, WorkerHashError, never> =>
  Layer.scoped(
    ParallelHasher,
    Effect.gen(function* () {
      const spawner = (_id: number) => new globalThis.Worker(config.workerUrl);

      const workerLayer = BrowserWorker.layer(spawner);

      const pool: Worker.SerializedWorkerPool<WorkerRequest> = yield* Worker.makePoolSerialized<WorkerRequest>({
        size: config.poolSize,
      }).pipe(Effect.provide(workerLayer));

      const chunkSize = config.chunkSize ?? DEFAULT_CHUNK_SIZE;

      return makeService(pool, chunkSize);
    })
  ).pipe(
    Layer.catchAll((error) =>
      Layer.fail(
        new WorkerHashError({
          message: "Failed to initialize worker pool",
          cause: error,
        })
      )
    )
  );

/**
 * Configuration for the parallel hasher with spawner function.
 * Use this for bundler-compatible worker creation.
 * @since 0.1.0
 * @category Models
 */
export interface ParallelHasherSpawnerConfig {
  readonly spawner: (id: number) => globalThis.Worker;
  readonly poolSize: number;
  readonly chunkSize?: number | undefined;
}

/**
 * Create a parallel hasher layer with a worker spawner function.
 *
 * This is the preferred method when using module bundlers (Vite, Bun, etc.)
 * that support the `new URL(..., import.meta.url)` pattern for workers.
 *
 * Example usage:
 * ```typescript
 * const hasherLayer = makeLayerWithSpawner({
 *   spawner: () => new Worker(
 *     new URL("@beep/runtime-client/workers/md5-hasher-worker.ts?worker", import.meta.url),
 *     { type: "module" }
 *   ),
 *   poolSize: 4,
 *   chunkSize: 2097152 // 2MB
 * });
 * ```
 *
 * @since 0.1.0
 * @category Layers
 */
export const makeLayerWithSpawner = (
  config: ParallelHasherSpawnerConfig
): Layer.Layer<ParallelHasher, WorkerHashError, never> =>
  Layer.scoped(
    ParallelHasher,
    Effect.gen(function* () {
      const workerLayer = BrowserWorker.layer(config.spawner);

      const pool: Worker.SerializedWorkerPool<WorkerRequest> = yield* Worker.makePoolSerialized<WorkerRequest>({
        size: config.poolSize,
      }).pipe(Effect.provide(workerLayer));

      const chunkSize = config.chunkSize ?? DEFAULT_CHUNK_SIZE;

      return makeService(pool, chunkSize);
    })
  ).pipe(
    Layer.catchAll((error) =>
      Layer.fail(
        new WorkerHashError({
          message: "Failed to initialize worker pool",
          cause: error,
        })
      )
    )
  );

/**
 * Hash a blob using parallel workers from context
 *
 * This function requires ParallelHasher to be provided in the context.
 * Use makeLayer to create the layer.
 *
 * @since 0.1.0
 * @category Hashing
 */
export const hashBlob: (
  blob: Blob,
  chunkSize?: number | undefined
) => Effect.Effect<string, WorkerHashError, ParallelHasher> = Effect.fn(function* (blob, chunkSize) {
  const hasher = yield* ParallelHasher;
  return yield* hasher.hashBlob(blob, chunkSize);
});

/**
 * Hash a blob with inline configuration (no context needed)
 *
 * This is a convenience function that creates a scoped worker pool,
 * hashes the blob, and cleans up. For multiple hashes, prefer using
 * makeLayer and hashBlob to reuse the worker pool.
 *
 * @since 0.1.0
 * @category Hashing
 */
export const hashBlobWithConfig = (blob: Blob, config: ParallelHasherConfig): Effect.Effect<string, WorkerHashError> =>
  Effect.scoped(
    Effect.gen(function* () {
      const hasher = yield* ParallelHasher;
      return yield* hasher.hashBlob(blob, config.chunkSize);
    }).pipe(Effect.provide(makeLayer(config)))
  );
