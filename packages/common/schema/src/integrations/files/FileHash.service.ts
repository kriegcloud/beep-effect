/**
 * Service for MD5 hash operations on NormalizedFile instances.
 *
 * Since NormalizedFile now requires md5Hash to be computed during schema
 * transformation, this service provides utilities for:
 * - Recomputing hashes (e.g., for verification or after file modification)
 * - Verifying hash integrity
 *
 * @since 0.1.0
 * @module
 */

import { $SchemaId } from "@beep/identity/packages";
import { ParallelHasher, type WorkerHashError } from "@beep/utils/md5";
import * as Effect from "effect/Effect";
import * as F from "effect/Function";
import type * as ParseResult from "effect/ParseResult";
import * as S from "effect/Schema";
import { Md5Hash, type NormalizedFile } from "./File";

const $I = $SchemaId.create("integrations/files/FileHashService");

/**
 * Service for MD5 hash operations on NormalizedFile instances.
 *
 * Since NormalizedFile now requires md5Hash to be computed during schema
 * transformation, this service provides utilities for:
 * - Recomputing hashes (e.g., for verification or after file modification)
 * - Verifying hash integrity
 *
 * @since 0.1.0
 * @category Services
 */
export class FileHashService extends Effect.Service<FileHashService>()($I`FileHashService`, {
  dependencies: [],
  effect: Effect.gen(function* () {
    const hasher = yield* ParallelHasher;

    return {
      /**
       * Recompute the MD5 hash and return a new file with the updated hash.
       * Useful for verifying file integrity or after file content changes.
       *
       * @example
       * ```typescript
       * const service = yield* FileHashService;
       * const fileWithNewHash = yield* service.recomputeHash(file);
       * ```
       */
      recomputeHash: Effect.fnUntraced(function* <T extends NormalizedFile.Type>(file: T) {
        const hashString = yield* hasher.hashBlob(file.file);
        const md5Hash = yield* S.decode(Md5Hash)(hashString);

        return {
          ...file,
          md5Hash,
        } as T;
      }),

      /**
       * Batch recompute hashes for multiple files in parallel.
       *
       * @example
       * ```typescript
       * const service = yield* FileHashService;
       * const filesWithNewHashes = yield* service.recomputeMany(files);
       * ```
       */
      recomputeMany: <T extends NormalizedFile.Type>(
        files: ReadonlyArray<T>
      ): Effect.Effect<ReadonlyArray<T>, WorkerHashError | ParseResult.ParseError> =>
        F.pipe(
          files,
          Effect.forEach(
            (file) =>
              Effect.gen(function* () {
                const hashString = yield* hasher.hashBlob(file.file);
                const md5Hash = yield* S.decode(Md5Hash)(hashString);

                return {
                  ...file,
                  md5Hash,
                } as T;
              }),
            { concurrency: "unbounded" }
          )
        ),

      /**
       * Verify that the stored hash matches the actual file content.
       * Returns true if the hash is valid, false otherwise.
       *
       * @example
       * ```typescript
       * const service = yield* FileHashService;
       * const isValid = yield* service.verifyHash(file);
       * if (!isValid) {
       *   console.error("File has been corrupted!");
       * }
       * ```
       */
      verifyHash: Effect.fnUntraced(function* (file: NormalizedFile.Type) {
        const computedHash = yield* hasher.hashBlob(file.file);
        return computedHash === file.md5Hash;
      }),

      /**
       * Verify hashes for multiple files in parallel.
       * Returns an array of results indicating which files have valid hashes.
       *
       * @example
       * ```typescript
       * const service = yield* FileHashService;
       * const results = yield* service.verifyMany(files);
       * const invalidFiles = files.filter((_, i) => !results[i]);
       * ```
       */
      verifyMany: (files: ReadonlyArray<NormalizedFile.Type>): Effect.Effect<ReadonlyArray<boolean>, WorkerHashError> =>
        F.pipe(
          files,
          Effect.forEach(
            (file) =>
              Effect.gen(function* () {
                const computedHash = yield* hasher.hashBlob(file.file);
                return computedHash === file.md5Hash;
              }),
            { concurrency: "unbounded" }
          )
        ),

      /**
       * Get the hash of a file. Since md5Hash is now required,
       * this simply returns the existing hash.
       *
       * @example
       * ```typescript
       * const service = yield* FileHashService;
       * const hash = service.getHash(file);
       * // hash: Md5Hash (32 hex characters)
       * ```
       */
      getHash: (file: NormalizedFile.Type): Md5Hash => file.md5Hash,
    };
  }),
}) {}
