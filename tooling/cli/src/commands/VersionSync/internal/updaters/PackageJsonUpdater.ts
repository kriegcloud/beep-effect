/**
 * Comment-preserving `package.json` `packageManager` updater via `jsonc-parser`.
 *
 * @module
 * @since 0.0.0
 */

import { Effect, FileSystem, Inspectable } from "effect";
import * as A from "effect/Array";
import * as jsonc from "jsonc-parser";
import { VersionSyncError } from "../Models.js";

/**
 * Formatting options matching the project standard.
 *
 * @category Configuration
 * @since 0.0.0
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
 * @category Utility
 * @since 0.0.0
 */
export const updatePackageManagerField: (
  filePath: string,
  version: string
) => Effect.Effect<boolean, VersionSyncError, FileSystem.FileSystem> = Effect.fn(function* (filePath, version) {
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

  yield* fs.writeFileString(filePath, updated).pipe(
    Effect.mapError(
      (e) =>
        new VersionSyncError({
          message: `Failed to write ${filePath}: ${Inspectable.toStringUnknown(e, 0)}`,
          file: filePath,
        })
    )
  );

  return true;
});

/**
 * Update a root package.json `catalog` entry using `jsonc-parser`.
 *
 * Returns `true` when the file was modified, `false` when already correct.
 *
 * @category Utility
 * @since 0.0.0
 */
export const updateCatalogEntry: (
  filePath: string,
  dependencyName: string,
  versionSpecifier: string
) => Effect.Effect<boolean, VersionSyncError, FileSystem.FileSystem> = Effect.fn(
  function* (filePath, dependencyName, versionSpecifier) {
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

    const edits = jsonc.modify(original, ["catalog", dependencyName], versionSpecifier, {
      formattingOptions: FORMATTING_OPTIONS,
    });

    if (A.isReadonlyArrayEmpty(edits)) {
      return false;
    }

    const updated = jsonc.applyEdits(original, edits);

    if (updated === original) {
      return false;
    }

    yield* fs.writeFileString(filePath, updated).pipe(
      Effect.mapError(
        (e) =>
          new VersionSyncError({
            message: `Failed to write ${filePath}: ${Inspectable.toStringUnknown(e, 0)}`,
            file: filePath,
          })
      )
    );

    return true;
  }
);
