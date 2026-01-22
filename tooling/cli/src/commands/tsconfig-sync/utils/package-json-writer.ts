/**
 * @file Package.json Writer Utility
 *
 * Writes sorted dependencies to package.json files.
 * Handles reading existing content, merging with sorted dependencies, and writing back.
 *
 * @module tsconfig-sync/utils/package-json-writer
 * @since 1.0.0
 */

import { $RepoCliId } from "@beep/identity/packages";
import * as FileSystem from "@effect/platform/FileSystem";
import * as A from "effect/Array";
import * as Effect from "effect/Effect";
import * as F from "effect/Function";
import * as O from "effect/Option";
import * as R from "effect/Record";
import { TsconfigSyncError } from "../errors.js";

// -----------------------------------------------------------------------------
// Identity Composer
// -----------------------------------------------------------------------------

const $I = $RepoCliId.create("commands/tsconfig-sync/utils/package-json-writer");

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------

/**
 * Package.json dependencies structure.
 *
 * @since 0.1.0
 * @category models
 */
export interface PackageJsonDeps {
  readonly dependencies?: undefined | Record<string, string>;
  readonly devDependencies?: undefined | Record<string, string>;
  readonly peerDependencies?: undefined | Record<string, string>;
}

/**
 * Sorted dependencies result from sortDependencies utility.
 *
 * @since 0.1.0
 * @category models
 */
export interface SortedDeps {
  readonly workspace: readonly string[];
  readonly external: readonly string[];
}

/**
 * Result of comparing current vs expected dependencies.
 *
 * @since 0.1.0
 * @category models
 */
export interface PackageJsonDiff {
  /** Whether dependencies ordering differs */
  readonly hasChanges: boolean;
  /** Current dependency order */
  readonly current: readonly string[];
  /** Expected dependency order */
  readonly expected: readonly string[];
}

// -----------------------------------------------------------------------------
// Core Functions
// -----------------------------------------------------------------------------

/**
 * Reads a package.json file and parses its content.
 *
 * @param filePath - Absolute path to the package.json file
 * @returns Effect that yields the parsed content or fails
 *
 * @since 0.1.0
 * @category functions
 */
export const readPackageJson = (
  filePath: string
): Effect.Effect<PackageJsonDeps & Record<string, unknown>, TsconfigSyncError, FileSystem.FileSystem> =>
  Effect.gen(function* () {
    const fs = yield* FileSystem.FileSystem;

    const content = yield* fs
      .readFileString(filePath)
      .pipe(Effect.mapError((cause) => new TsconfigSyncError({ filePath, operation: "read", cause })));

    return yield* Effect.try({
      try: () => JSON.parse(content) as PackageJsonDeps & Record<string, unknown>,
      catch: (cause) => new TsconfigSyncError({ filePath, operation: "parse", cause }),
    });
  }).pipe(Effect.withSpan($I`readPackageJson`));

/**
 * Computes diff between current and expected dependency order.
 *
 * @param currentDeps - Current dependencies object
 * @param sortedDeps - Expected sorted dependencies
 * @returns Diff object indicating if changes are needed
 *
 * @since 0.1.0
 * @category functions
 */
export const computeDependencyDiff = (currentDeps: Record<string, string>, sortedDeps: SortedDeps): PackageJsonDiff => {
  const currentKeys = F.pipe(R.keys(currentDeps), A.fromIterable);

  // Build expected order: workspace first, then external
  const expectedKeys = F.pipe(sortedDeps.workspace, A.appendAll(sortedDeps.external));

  // Check if order matches
  const hasChanges =
    A.length(currentKeys) !== A.length(expectedKeys) ||
    !F.pipe(
      A.zip(currentKeys, expectedKeys),
      A.every(([current, expected]) => current === expected)
    );

  return {
    hasChanges,
    current: currentKeys,
    expected: expectedKeys,
  };
};

/**
 * Merges sorted dependencies with current values, preserving version specifiers.
 *
 * @param currentDeps - Current dependencies with versions
 * @param sortedDeps - Expected sorted order
 * @returns New dependencies object in sorted order
 *
 * @since 0.1.0
 * @category functions
 */
export const mergeSortedDependencies = (
  currentDeps: Record<string, string>,
  sortedDeps: SortedDeps
): Record<string, string> => {
  // Build new object in sorted order
  const orderedKeys = F.pipe(sortedDeps.workspace, A.appendAll(sortedDeps.external));

  return F.pipe(
    orderedKeys,
    A.reduce(R.empty<string, string>(), (acc, key) => {
      const value = R.get(currentDeps, key);
      if (O.isSome(value)) {
        return { ...acc, [key]: value.value };
      }
      return acc;
    })
  );
};

/**
 * Writes sorted dependencies to a package.json file.
 *
 * @param filePath - Absolute path to the package.json file
 * @param sortedDeps - Sorted dependencies to write
 * @param depType - Which dependency field to update (dependencies, devDependencies, peerDependencies)
 * @returns Effect that writes the file and returns true if changes were made
 *
 * @example
 * ```ts
 * import { writePackageJsonDeps } from "./package-json-writer.js"
 * import * as Effect from "effect/Effect"
 *
 * const program = writePackageJsonDeps(
 *   "/path/to/package.json",
 *   { workspace: ["@beep/iam-domain"], external: ["effect"] },
 *   "dependencies"
 * )
 * ```
 *
 * @since 0.1.0
 * @category functions
 */
export const writePackageJsonDeps = (
  filePath: string,
  sortedDeps: SortedDeps,
  depType: "dependencies" | "devDependencies" | "peerDependencies" = "dependencies"
): Effect.Effect<boolean, TsconfigSyncError, FileSystem.FileSystem> =>
  Effect.gen(function* () {
    const fs = yield* FileSystem.FileSystem;

    // Read current content
    const pkg = yield* readPackageJson(filePath);
    const currentDeps = pkg[depType] ?? {};

    // Compute diff
    const diff = computeDependencyDiff(currentDeps, sortedDeps);

    // Skip if no changes needed
    if (!diff.hasChanges) {
      return false;
    }

    // Merge in sorted order
    const newDeps = mergeSortedDependencies(currentDeps, sortedDeps);

    // Update package.json
    const updated = {
      ...pkg,
      [depType]: newDeps,
    };

    // Write back with consistent formatting
    const newContent = `${JSON.stringify(updated, null, 2)}\n`;

    yield* fs
      .writeFileString(filePath, newContent)
      .pipe(Effect.mapError((cause) => new TsconfigSyncError({ filePath, operation: "write", cause })));

    return true;
  }).pipe(Effect.withSpan($I`writePackageJsonDeps`));

/**
 * Checks if package.json dependencies match expected order (for check mode).
 *
 * @param filePath - Absolute path to the package.json file
 * @param sortedDeps - Expected sorted dependencies
 * @param depType - Which dependency field to check
 * @returns Effect that yields true if in sync, false if drift detected
 *
 * @since 0.1.0
 * @category functions
 */
export const checkPackageJsonDeps = (
  filePath: string,
  sortedDeps: SortedDeps,
  depType: "dependencies" | "devDependencies" | "peerDependencies" = "dependencies"
): Effect.Effect<boolean, TsconfigSyncError, FileSystem.FileSystem> =>
  Effect.gen(function* () {
    const pkg = yield* readPackageJson(filePath);
    const currentDeps = pkg[depType] ?? {};
    const diff = computeDependencyDiff(currentDeps, sortedDeps);
    return !diff.hasChanges;
  }).pipe(Effect.withSpan($I`checkPackageJsonDeps`));
