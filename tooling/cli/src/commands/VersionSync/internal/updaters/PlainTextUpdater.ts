/**
 * Plain text file updater for `.bun-version` and similar single-value files.
 *
 * @module
 * @since 0.0.0
 */

import { Effect, FileSystem, Inspectable } from "effect";
import { dual } from "effect/Function";
import * as Str from "effect/String";
import { VersionSyncError } from "../Models.js";

/**
 * Update a plain text version file (e.g. `.bun-version`).
 *
 * Returns `true` when the file was modified, `false` when already correct.
 *
 * @category Utility
 * @since 0.0.0
 */
export const updatePlainTextFile: {
  (filePath: string, version: string): Effect.Effect<boolean, VersionSyncError, FileSystem.FileSystem>;
  (version: string): (filePath: string) => Effect.Effect<boolean, VersionSyncError, FileSystem.FileSystem>;
} = dual(
  2,
  Effect.fn(function* (filePath: string, version: string) {
    const fs = yield* FileSystem.FileSystem;

    const original = yield* fs.readFileString(filePath).pipe(
      Effect.mapError(
        (e) =>
          new VersionSyncError({
            message: `Failed to read ${filePath}: ${Inspectable.toStringUnknown(e, 0)}`,
            file: filePath,
          })
      )
    );

    const currentValue = Str.trim(original);
    if (currentValue === version) {
      return false;
    }

    yield* fs.writeFileString(filePath, `${version}\n`).pipe(
      Effect.mapError(
        (e) =>
          new VersionSyncError({
            message: `Failed to write ${filePath}: ${Inspectable.toStringUnknown(e, 0)}`,
            file: filePath,
          })
      )
    );

    return true;
  })
);
