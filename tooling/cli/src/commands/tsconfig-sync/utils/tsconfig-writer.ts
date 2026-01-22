/**
 * @file TSConfig Writer Utility
 *
 * Writes tsconfig.build.json references using jsonc-parser to preserve comments.
 * Handles reading existing content, computing necessary changes, and writing back.
 *
 * @module tsconfig-sync/utils/tsconfig-writer
 * @since 1.0.0
 */

import { $RepoCliId } from "@beep/identity/packages";
import * as FileSystem from "@effect/platform/FileSystem";
import * as A from "effect/Array";
import * as Effect from "effect/Effect";
import * as F from "effect/Function";
import * as HashSet from "effect/HashSet";
import * as O from "effect/Option";
import * as R from "effect/Record";
import * as Str from "effect/String";
import * as Struct from "effect/Struct";
import { TsconfigSyncError } from "../errors.js";

// -----------------------------------------------------------------------------
// Identity Composer
// -----------------------------------------------------------------------------

const $I = $RepoCliId.create("commands/tsconfig-sync/utils/tsconfig-writer");

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------

/**
 * Represents a tsconfig reference entry.
 *
 * @since 0.1.0
 * @category models
 */
export interface TsconfigReference {
  readonly path: string;
}

/**
 * Parsed tsconfig.json structure (partial).
 *
 * @since 0.1.0
 * @category models
 */
export interface TsconfigJson {
  readonly extends?: undefined | string;
  readonly include?: undefined | readonly string[];
  readonly exclude?: undefined | readonly string[];
  readonly references?: undefined | readonly TsconfigReference[];
  readonly compilerOptions?: undefined | Record<string, unknown>;
}

/**
 * Result of comparing current vs expected references.
 *
 * @since 0.1.0
 * @category models
 */
export interface TsconfigDiff {
  /** References that exist but shouldn't */
  readonly toRemove: readonly string[];
  /** References that should exist but don't */
  readonly toAdd: readonly string[];
  /** Whether any changes are needed */
  readonly hasChanges: boolean;
}

// -----------------------------------------------------------------------------
// jsonc-parser Effect wrapper
// -----------------------------------------------------------------------------

/**
 * Loads the jsonc-parser module dynamically.
 */
const loadJsoncParser = Effect.tryPromise({
  try: () => import("jsonc-parser"),
  catch: (cause) => new TsconfigSyncError({ filePath: "jsonc-parser", operation: "import", cause }),
});

// -----------------------------------------------------------------------------
// Core Functions
// -----------------------------------------------------------------------------

/**
 * Reads a tsconfig file and parses its references.
 *
 * @param filePath - Absolute path to the tsconfig file
 * @returns Effect that yields the parsed tsconfig or fails
 *
 * @since 0.1.0
 * @category functions
 */
export const readTsconfigReferences = (
  filePath: string
): Effect.Effect<readonly TsconfigReference[], TsconfigSyncError, FileSystem.FileSystem> =>
  Effect.gen(function* () {
    const fs = yield* FileSystem.FileSystem;
    const jsonc = yield* loadJsoncParser;

    const content = yield* fs
      .readFileString(filePath)
      .pipe(Effect.mapError((cause) => new TsconfigSyncError({ filePath, operation: "read", cause })));

    const parsed = jsonc.parse(content) as TsconfigJson;
    return parsed.references ?? [];
  }).pipe(Effect.withSpan($I`readTsconfigReferences`));

/**
 * Computes the diff between current and expected references.
 * Also detects order mismatches to ensure topological sorting is maintained.
 *
 * @param currentRefs - Current references in the file
 * @param expectedRefs - Expected reference paths (already topologically sorted)
 * @returns Diff object with toAdd, toRemove, and hasChanges
 *
 * @since 0.1.0
 * @category functions
 */
export const computeReferenceDiff = (
  currentRefs: readonly TsconfigReference[],
  expectedRefs: readonly string[]
): TsconfigDiff => {
  const currentPaths = F.pipe(
    currentRefs,
    A.map((ref) => ref.path),
    HashSet.fromIterable
  );
  const expectedPaths = HashSet.fromIterable(expectedRefs);

  const toRemove = F.pipe(
    HashSet.toValues(currentPaths),
    A.filter((path) => !HashSet.has(expectedPaths, path))
  );

  const toAdd = F.pipe(
    HashSet.toValues(expectedPaths),
    A.filter((path) => !HashSet.has(currentPaths, path))
  );

  // Also check for order mismatch (spec requires topological sorting)
  const currentPathsArray = F.pipe(
    currentRefs,
    A.map((ref) => ref.path)
  );
  const orderMismatch = !F.pipe(
    A.zip(currentPathsArray, expectedRefs),
    A.every(([current, expected]) => current === expected)
  );

  return {
    toRemove,
    toAdd,
    hasChanges:
      A.isNonEmptyArray(toRemove) || A.isNonEmptyArray(toAdd) || (A.length(currentPathsArray) > 0 && orderMismatch),
  };
};

/**
 * Writes tsconfig references to a file using jsonc-parser to preserve comments.
 *
 * @param filePath - Absolute path to the tsconfig file
 * @param expectedRefs - Expected reference paths to write
 * @returns Effect that writes the file or fails
 *
 * @example
 * ```ts
 * import { writeTsconfigReferences } from "./tsconfig-writer.js"
 * import * as Effect from "effect/Effect"
 *
 * const program = writeTsconfigReferences(
 *   "/path/to/tsconfig.build.json",
 *   [
 *     "../../iam/domain/tsconfig.build.json",
 *     "../../iam/tables/tsconfig.build.json"
 *   ]
 * )
 * ```
 *
 * @since 0.1.0
 * @category functions
 */
export const writeTsconfigReferences = (
  filePath: string,
  expectedRefs: readonly string[]
): Effect.Effect<boolean, TsconfigSyncError, FileSystem.FileSystem> =>
  Effect.gen(function* () {
    const fs = yield* FileSystem.FileSystem;
    const jsonc = yield* loadJsoncParser;

    // Read current content
    const content = yield* fs
      .readFileString(filePath)
      .pipe(Effect.mapError((cause) => new TsconfigSyncError({ filePath, operation: "read", cause })));

    // Parse current state
    const parsed = jsonc.parse(content) as TsconfigJson;
    const currentRefs = parsed.references ?? [];

    // Compute diff
    const diff = computeReferenceDiff(currentRefs, expectedRefs);

    // Skip if no changes needed
    if (!diff.hasChanges) {
      return false;
    }

    // Build new references array in sorted order
    const newRefs = F.pipe(
      expectedRefs,
      A.map((path): TsconfigReference => ({ path }))
    );

    // Use jsonc.modify to update while preserving comments and formatting
    const edits = jsonc.modify(content, ["references"], newRefs, {
      formattingOptions: { tabSize: 2, insertSpaces: true },
    });

    const newContent = jsonc.applyEdits(content, edits);

    // Write back
    yield* fs
      .writeFileString(filePath, newContent)
      .pipe(Effect.mapError((cause) => new TsconfigSyncError({ filePath, operation: "write", cause })));

    return true;
  }).pipe(Effect.withSpan($I`writeTsconfigReferences`));

/**
 * Checks if tsconfig references match expected state (for check mode).
 *
 * @param filePath - Absolute path to the tsconfig file
 * @param expectedRefs - Expected reference paths
 * @returns Effect that yields true if in sync, false if drift detected
 *
 * @since 0.1.0
 * @category functions
 */
export const checkTsconfigReferences = (
  filePath: string,
  expectedRefs: readonly string[]
): Effect.Effect<boolean, TsconfigSyncError, FileSystem.FileSystem> =>
  Effect.gen(function* () {
    const currentRefs = yield* readTsconfigReferences(filePath);
    const diff = computeReferenceDiff(currentRefs, expectedRefs);
    return !diff.hasChanges;
  }).pipe(Effect.withSpan($I`checkTsconfigReferences`));

/**
 * Extracts the reference paths from an existing tsconfig file.
 * Used to preserve manually-added references that may not be in package.json
 * (e.g., type-only imports).
 *
 * @param filePath - Absolute path to the tsconfig file
 * @returns Effect that yields array of reference paths
 *
 * @since 0.1.0
 * @category functions
 */
export const getExistingReferencePaths = (
  filePath: string
): Effect.Effect<readonly string[], TsconfigSyncError, FileSystem.FileSystem> =>
  Effect.gen(function* () {
    const refs = yield* readTsconfigReferences(filePath);
    return F.pipe(
      refs,
      A.map((ref) => ref.path)
    );
  }).pipe(Effect.withSpan($I`getExistingReferencePaths`));

/**
 * Normalizes existing package-relative refs to root-relative format.
 *
 * Converts refs like `../types/tsconfig.build.json` to
 * `../../../packages/common/types/tsconfig.build.json` (root-relative).
 *
 * @param existingRefs - Existing reference paths from tsconfig
 * @param _sourceTsconfigPath - Path of the source tsconfig (relative to repo root, e.g., "packages/common/identity/tsconfig.build.json") - reserved for future use
 * @param pkgToPathMap - Map of package names to their root-relative tsconfig paths
 * @returns Normalized refs in root-relative format, filtering out refs that can't be mapped
 *
 * @since 0.1.0
 * @category functions
 */
export const normalizeExistingRefs = (
  existingRefs: readonly string[],
  _sourceTsconfigPath: string,
  pkgToPathMap: Map<string, string>
): readonly string[] => {
  // Create a reverse lookup: map from tsconfig.build.json filename patterns to root-relative paths
  const pkgPaths = Array.from(pkgToPathMap.values());

  return F.pipe(
    existingRefs,
    A.filterMap((ref) => {
      // If already root-relative (starts with ../../../), keep as-is if it matches a known path
      if (Str.startsWith("../../../")(ref)) {
        // Check if this ref matches any known package path
        const matchesKnown = F.pipe(
          pkgPaths,
          A.some((knownPath) => ref === knownPath || ref === knownPath.replace(/\/tsconfig\.build\.json$/, ""))
        );
        return matchesKnown ? O.some(ref) : O.none();
      }

      // If it's a local ref (like tsconfig.src.json), keep it
      if (!Str.startsWith("..")(ref)) {
        return O.some(ref);
      }

      // Try to match package-relative refs like ../types/tsconfig.build.json
      // Extract the package path segment from the ref
      const refWithoutBuild = Str.replace(/\/tsconfig\.build\.json$/, "")(ref);

      // Find matching root-relative path in pkgPaths
      return F.pipe(
        pkgPaths,
        A.findFirst((rootRelPath) => {
          // Extract package directory from root-relative path
          // e.g., ../../../packages/common/types/tsconfig.build.json -> packages/common/types
          const pathWithoutBuild = Str.replace(/\/tsconfig\.build\.json$/, "")(rootRelPath);
          const pkgDir = F.pipe(pathWithoutBuild, Str.replace(/^\.\.\/+/, ""), Str.replace(/^packages\//, ""));

          // Check if the existing ref ends with this package dir
          // e.g., ../types matches common/types
          const refDir = refWithoutBuild.replace(/^\.\.\/+/, "");
          return Str.endsWith(refDir)(pkgDir) || Str.endsWith(Str.split("/")(pkgDir).pop() ?? "")(refDir);
        })
      );
    })
  );
};

/**
 * Merges existing refs with computed refs, deduplicating and preserving both.
 *
 * @param existingRefs - Existing refs (normalized to root-relative)
 * @param computedRefs - Computed refs from package.json deps
 * @returns Merged array with duplicates removed
 *
 * @since 0.1.0
 * @category functions
 */
export const mergeRefs = (existingRefs: readonly string[], computedRefs: readonly string[]): readonly string[] => {
  const refSet = HashSet.fromIterable([...existingRefs, ...computedRefs]);
  return HashSet.toValues(refSet);
};

/**
 * Transforms build refs to package-root refs for src/test configs.
 *
 * Converts refs like `../../../packages/common/types/tsconfig.build.json`
 * to `../../../packages/common/types` (package root without tsconfig.build.json).
 *
 * @param buildRefs - References pointing to tsconfig.build.json
 * @returns References pointing to package root
 *
 * @since 0.1.0
 * @category functions
 */
export const convertToPackageRootRefs = (buildRefs: readonly string[]): readonly string[] =>
  F.pipe(buildRefs, A.map(Str.replace(/\/tsconfig\.build\.json$/, "")));

/**
 * Checks if a tsconfig file exists.
 *
 * @param filePath - Absolute path to check
 * @returns Effect that yields true if file exists
 *
 * @since 0.1.0
 * @category functions
 */
export const tsconfigExists = (filePath: string): Effect.Effect<boolean, TsconfigSyncError, FileSystem.FileSystem> =>
  Effect.gen(function* () {
    const fs = yield* FileSystem.FileSystem;
    return yield* fs
      .exists(filePath)
      .pipe(Effect.mapError((cause) => new TsconfigSyncError({ filePath, operation: "exists", cause })));
  }).pipe(Effect.withSpan($I`tsconfigExists`));

// -----------------------------------------------------------------------------
// Next.js App Support
// -----------------------------------------------------------------------------

/**
 * Detects if a package is a Next.js app.
 *
 * Checks for presence of next.config.mjs, next.config.ts, or next.config.js.
 *
 * @param pkgDir - Absolute path to the package directory
 * @returns Effect that yields true if the package is a Next.js app
 *
 * @since 0.1.0
 * @category functions
 */
export const isNextJsApp = (pkgDir: string): Effect.Effect<boolean, TsconfigSyncError, FileSystem.FileSystem> =>
  Effect.gen(function* () {
    const fs = yield* FileSystem.FileSystem;

    // Check for common Next.js config files
    const configFiles = ["next.config.mjs", "next.config.ts", "next.config.js"];

    for (const configFile of configFiles) {
      const exists = yield* fs
        .exists(`${pkgDir}/${configFile}`)
        .pipe(Effect.mapError((cause) => new TsconfigSyncError({ filePath: pkgDir, operation: "exists", cause })));

      if (exists) {
        return true;
      }
    }

    return false;
  }).pipe(Effect.withSpan($I`isNextJsApp`));

/**
 * Special packages that require custom path alias handling.
 *
 * @since 0.1.0
 * @category constants
 */
export const SPECIAL_PATH_PACKAGES = {
  /** @beep/errors uses subpath exports without a barrel */
  "@beep/errors": {
    type: "subpaths" as const,
    subpaths: ["/client", "/shared", "/server"],
  },
  /** @beep/ui uses glob-only pattern */
  "@beep/ui": {
    type: "glob-only" as const,
  },
  /** @beep/ui-core uses glob-only pattern */
  "@beep/ui-core": {
    type: "glob-only" as const,
  },
} as const;

/**
 * Builds a single path alias entry for a dependency.
 *
 * @param depName - Package name (e.g., "@beep/iam-domain")
 * @param pkgDir - Package directory relative to repo root (e.g., "packages/iam/domain")
 * @param appRelPath - Relative path prefix from app to repo root (e.g., "../..")
 * @returns Array of path alias entries
 *
 * @since 0.1.0
 * @category functions
 */
export const buildSinglePathAlias = (
  depName: string,
  pkgDir: string,
  appRelPath: string
): Array<readonly [string, readonly string[]]> => {
  const relativePath = `${appRelPath}/${pkgDir}`;

  // Check for special packages
  const specialConfig = SPECIAL_PATH_PACKAGES[depName as keyof typeof SPECIAL_PATH_PACKAGES];

  if (specialConfig) {
    if (specialConfig.type === "subpaths") {
      // For @beep/errors, generate subpath exports
      return F.pipe(
        specialConfig.subpaths,
        A.map((subpath): readonly [string, readonly string[]] => [
          `${depName}${subpath}`,
          [`${relativePath}/src${subpath}`] as const,
        ])
      );
    }
    if (specialConfig.type === "glob-only") {
      // For @beep/ui and @beep/ui-core, only glob pattern
      return [[`${depName}/*`, [`${relativePath}/src/*`] as const]];
    }
  }

  // Standard package: both bare import and glob
  return [
    [depName, [`${relativePath}/src/index`] as const],
    [`${depName}/*`, [`${relativePath}/src/*`] as const],
  ];
};

/**
 * Reads the existing tsconfig.json and extracts compilerOptions.paths
 *
 * @param tsconfigPath - Absolute path to tsconfig.json
 * @returns Effect that yields the current paths or empty record if not found
 *
 * @since 0.1.0
 * @category functions
 */
export const readAppTsconfigPaths = (
  tsconfigPath: string
): Effect.Effect<Record<string, string[]>, TsconfigSyncError, FileSystem.FileSystem> =>
  Effect.gen(function* () {
    const fs = yield* FileSystem.FileSystem;
    const jsonc = yield* loadJsoncParser;

    const content = yield* fs
      .readFileString(tsconfigPath)
      .pipe(Effect.mapError((cause) => new TsconfigSyncError({ filePath: tsconfigPath, operation: "read", cause })));

    const parsed = jsonc.parse(content) as TsconfigJson & {
      compilerOptions?: { paths?: Record<string, string[]> };
    };

    return parsed.compilerOptions?.paths ?? {};
  }).pipe(Effect.withSpan($I`readAppTsconfigPaths`));

/**
 * Extracts non-@beep paths from existing tsconfig (e.g., "@/*", "*")
 *
 * @param existingPaths - Current paths from tsconfig
 * @returns Paths that should be preserved (not @beep/*)
 *
 * @since 0.1.0
 * @category functions
 */
export const extractNonBeepPaths = (existingPaths: Record<string, string[]>): Record<string, string[]> => {
  const result = R.empty<string, string[]>();

  for (const [key, value] of Struct.entries(existingPaths)) {
    if (!Str.startsWith("@beep/")(key)) {
      result[key] = value;
    }
  }

  return result;
};

/**
 * Computes the diff between current and expected app tsconfig state.
 *
 * @param currentPaths - Current paths in tsconfig.json
 * @param expectedPaths - Expected paths based on package.json deps
 * @param currentRefs - Current references in tsconfig.json
 * @param expectedRefs - Expected references based on package.json deps
 * @returns Object with hasChanges boolean
 *
 * @since 0.1.0
 * @category functions
 */
export const computeAppTsconfigDiff = (
  currentPaths: Record<string, string[]>,
  expectedPaths: Record<string, string[]>,
  currentRefs: readonly TsconfigReference[],
  expectedRefs: readonly string[]
): { hasChanges: boolean } => {
  // Check paths diff
  const currentPathKeys = Struct.keys(currentPaths).sort();
  const expectedPathKeys = Struct.keys(expectedPaths).sort();

  const pathsChanged =
    currentPathKeys.length !== expectedPathKeys.length ||
    A.some(currentPathKeys, (key, i) => key !== expectedPathKeys[i]) ||
    A.some(Struct.entries(expectedPaths), ([key, value]) => {
      const current = currentPaths[key];
      if (!current) return true;
      if (current.length !== value.length) return true;
      return A.some(current, (v, i) => v !== value[i]);
    });

  // Check refs diff
  const currentRefPaths = F.pipe(
    currentRefs,
    A.map((ref) => ref.path)
  );

  const refsChanged =
    currentRefPaths.length !== expectedRefs.length || A.some(currentRefPaths, (path, i) => path !== expectedRefs[i]);

  return { hasChanges: pathsChanged || refsChanged };
};

/**
 * Writes updated paths and references to app tsconfig.json.
 * Preserves all other sections (extends, compilerOptions except paths, include, exclude, plugins).
 *
 * @param tsconfigPath - Absolute path to tsconfig.json
 * @param newPaths - New paths to write
 * @param newReferences - New references to write
 * @returns Effect that writes the file, yields true if changes were made
 *
 * @since 0.1.0
 * @category functions
 */
export const writeAppTsconfig = (
  tsconfigPath: string,
  newPaths: Record<string, string[]>,
  newReferences: readonly string[]
): Effect.Effect<boolean, TsconfigSyncError, FileSystem.FileSystem> =>
  Effect.gen(function* () {
    const fs = yield* FileSystem.FileSystem;
    const jsonc = yield* loadJsoncParser;

    // Read current content
    const content = yield* fs
      .readFileString(tsconfigPath)
      .pipe(Effect.mapError((cause) => new TsconfigSyncError({ filePath: tsconfigPath, operation: "read", cause })));

    // Parse current state
    const parsed = jsonc.parse(content) as TsconfigJson & {
      compilerOptions?: { paths?: Record<string, string[]> };
    };

    const currentPaths = parsed.compilerOptions?.paths ?? R.empty<string, string[]>();
    const currentRefs = parsed.references ?? [];

    // Compute diff
    const diff = computeAppTsconfigDiff(currentPaths, newPaths, currentRefs, newReferences);

    if (!diff.hasChanges) {
      return false;
    }

    // Build new references array
    const newRefs = F.pipe(
      newReferences,
      A.map((path): TsconfigReference => ({ path }))
    );

    // Use jsonc.modify to update paths while preserving comments
    let newContent = content;
    const pathEdits = jsonc.modify(newContent, ["compilerOptions", "paths"], newPaths, {
      formattingOptions: { tabSize: 2, insertSpaces: true },
    });
    newContent = jsonc.applyEdits(newContent, pathEdits);

    // Update references
    const refEdits = jsonc.modify(newContent, ["references"], newRefs, {
      formattingOptions: { tabSize: 2, insertSpaces: true },
    });
    newContent = jsonc.applyEdits(newContent, refEdits);

    // Write back
    yield* fs
      .writeFileString(tsconfigPath, newContent)
      .pipe(Effect.mapError((cause) => new TsconfigSyncError({ filePath: tsconfigPath, operation: "write", cause })));

    return true;
  }).pipe(Effect.withSpan($I`writeAppTsconfig`));

/**
 * Checks if app tsconfig.json matches expected state (for check mode).
 *
 * @param tsconfigPath - Absolute path to tsconfig.json
 * @param expectedPaths - Expected paths
 * @param expectedRefs - Expected references
 * @returns Effect that yields true if in sync, false if drift detected
 *
 * @since 0.1.0
 * @category functions
 */
export const checkAppTsconfig = (
  tsconfigPath: string,
  expectedPaths: Record<string, string[]>,
  expectedRefs: readonly string[]
): Effect.Effect<boolean, TsconfigSyncError, FileSystem.FileSystem> =>
  Effect.gen(function* () {
    const fs = yield* FileSystem.FileSystem;
    const jsonc = yield* loadJsoncParser;

    const content = yield* fs
      .readFileString(tsconfigPath)
      .pipe(Effect.mapError((cause) => new TsconfigSyncError({ filePath: tsconfigPath, operation: "read", cause })));

    const parsed = jsonc.parse(content) as TsconfigJson & {
      compilerOptions?: { paths?: Record<string, string[]> };
    };

    const currentPaths = parsed.compilerOptions?.paths ?? {};
    const currentRefs = parsed.references ?? [];

    const diff = computeAppTsconfigDiff(currentPaths, expectedPaths, currentRefs, expectedRefs);
    return !diff.hasChanges;
  }).pipe(Effect.withSpan($I`checkAppTsconfig`));
