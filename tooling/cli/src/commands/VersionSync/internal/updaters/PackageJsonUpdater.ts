/**
 * Comment-preserving `package.json` `packageManager` updater via `jsonc-parser`.
 *
 * @since 0.0.0
 * @module
 */

import { Effect, FileSystem } from "effect";
import * as A from "effect/Array";
import * as jsonc from "jsonc-parser";
import { VersionSyncError } from "../Models.js";

/**
 * Formatting options matching the project standard.
 *
 * @since 0.0.0
 * @category Configuration
 */
const FORMATTING_OPTIONS: jsonc.FormattingOptions = {
  tabSize: 2,
  insertSpaces: true,
};

/**
 * Update the `packageManager` field in `package.json` using `jsonc-parser`.
 *
 * Comment-preserving: uses `modify()` + `applyEdits()` pattern.
 * Returns `true` when the file was modified, `false` when already correct.
 *
 * @since 0.0.0
 * @category Utility
 */
export const updatePackageManagerField: (
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

  const newValue = `bun@${version}`;

  const edits = jsonc.modify(original, ["packageManager"], newValue, {
    formattingOptions: FORMATTING_OPTIONS,
  });

  if (A.isReadonlyArrayEmpty(edits)) {
    return false;
  }

  const updated = jsonc.applyEdits(original, edits);

  if (updated === original) {
    return false;
  }

  yield* fs
    .writeFileString(filePath, updated)
    .pipe(
      Effect.mapError(
        (e) => new VersionSyncError({ message: `Failed to write ${filePath}: ${String(e)}`, file: filePath })
      )
    );

  return true;
});
