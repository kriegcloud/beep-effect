/**
 * Plain text file updater for `.bun-version` and similar single-value files.
 *
 * @since 0.0.0
 * @module
 */

import { Effect, FileSystem, String as Str } from "effect";
import { VersionSyncError } from "../types.js";

/**
 * Update a plain text version file (e.g. `.bun-version`).
 *
 * Returns `true` when the file was modified, `false` when already correct.
 *
 * @since 0.0.0
 * @category Utility
 */
export const updatePlainTextFile: (
  filePath: string,
  version: string
) => Effect.Effect<boolean, VersionSyncError, FileSystem.FileSystem> = Effect.fn(function* (filePath, version) {
  const fs = yield* FileSystem.FileSystem;

  const original = yield* fs
    .readFileString(filePath)
    .pipe(
      Effect.mapError(
        (e) => new VersionSyncError({ message: `Failed to read ${filePath}: ${String(e)}`, file: filePath })
      )
    );

  const currentValue = Str.trim(original);
  if (currentValue === version) {
    return false;
  }

  yield* fs
    .writeFileString(filePath, `${version}\n`)
    .pipe(
      Effect.mapError(
        (e) => new VersionSyncError({ message: `Failed to write ${filePath}: ${String(e)}`, file: filePath })
      )
    );

  return true;
});
