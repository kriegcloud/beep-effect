/**
 * Workspace discovery for monorepo projects.
 *
 * Expands glob patterns from the root `package.json` `workspaces` field
 * into a mapping of package names to their absolute directory paths.
 *
 * @module
 * @since 0.0.0
 */
import { normalizePath } from "@beep/schema";
import { thunkEffectSucceedNull } from "@beep/utils";
import { Effect, HashMap, pipe } from "effect";
import * as A from "effect/Array";
import * as Eq from "effect/Equal";
import { dual } from "effect/Function";
import * as O from "effect/Option";
import * as P from "effect/Predicate";
import * as Str from "effect/String";
import { DomainError, type NoSuchFileError } from "./errors/index.js";
import { FsUtils } from "./FsUtils.js";
import {
  decodePackageJsonEffect,
  type PackageJson,
  type Workspaces as PackageJsonWorkspaces,
} from "./schemas/PackageJson.js";

/**
 * Directories to exclude when scanning workspace globs.
 *
 * @category Configuration
 * @since 0.0.0
 */
const IGNORED_DIRS = ["**/node_modules/**", "**/dist/**", "**/build/**", "**/.turbo/**"];
const absoluteWorkspacePattern = /^(?:[A-Za-z]:\/|\/\/|\/)/;

const isWorkspacePatternArray = (value: PackageJsonWorkspaces): value is ReadonlyArray<string> => A.isArray(value);

const workspaceGlobsFrom = (workspaces: PackageJson["workspaces"]): ReadonlyArray<string> => {
  if (P.isUndefined(workspaces) || O.isNone(workspaces)) {
    return [];
  }

  const presentWorkspaces = workspaces.value;
  return isWorkspacePatternArray(presentWorkspaces) ? presentWorkspaces : (presentWorkspaces.packages ?? A.empty());
};

const isSafeWorkspacePattern = (pattern: string): boolean => {
  const normalized = normalizePath(pattern);
  const segments = pipe(normalized, Str.split("/"), A.filter(Str.isNonEmpty));

  return Str.isNonEmpty(normalized) && !absoluteWorkspacePattern.test(normalized) && !A.some(segments, Eq.equals(".."));
};

const isContainedCanonicalPath: {
  (rootDir: string, candidateDir: string): boolean;
  (candidateDir: string): (rootDir: string) => boolean;
} = dual(2, (rootDir: string, candidateDir: string): boolean => {
  const normalizedRootDir = normalizePath(rootDir);
  const normalizedCandidateDir = normalizePath(candidateDir);
  return (
    normalizedCandidateDir === normalizedRootDir ||
    pipe(normalizedRootDir, Str.endsWith("/"), (hasSuffix) =>
      Str.startsWith(hasSuffix ? normalizedRootDir : `${normalizedRootDir}/`)(normalizedCandidateDir)
    )
  );
});

/**
 * Resolve all workspace directories declared in the root `package.json`.
 *
 * Reads the `workspaces` array from the root `package.json`, expands each
 * glob pattern, reads each matching directory's `package.json` to extract
 * the package name, and returns a `HashMap<PackageName, AbsoluteDirectory>`.
 *
 * @param rootDir - Absolute path to the monorepo root directory.
 * @returns A HashMap mapping package names to their absolute directory paths.
 * @example
 * ```typescript
 * import { Effect } from "effect"
 * import { resolveWorkspaceDirs } from "@beep/repo-utils/Workspaces"
 *
 * const program = Effect.gen(function*() {
 * 
 * 
 * 
 * })
 * void program
 * ```
 * @category Utility
 * @since 0.0.0
 */
export const resolveWorkspaceDirs: (
  rootDir: string
) => Effect.Effect<HashMap.HashMap<string, string>, NoSuchFileError | DomainError, FsUtils> = Effect.fn(
  function* (rootDir) {
    const fsUtils = yield* FsUtils;

    // Read and decode root package.json
    const rootPkgPath = `${rootDir}/package.json`;
    const rawPkg = yield* fsUtils.readJson(rootPkgPath);
    if (O.isNone(rawPkg)) {
      return yield* new DomainError({
        message: `Failed to parse JSON at "${rootPkgPath}"`,
      });
    }
    const rootPkg = yield* decodePackageJsonEffect(rawPkg.value).pipe(
      Effect.mapError(
        (error) => new DomainError({ cause: error, message: `Failed to decode root package.json at "${rootPkgPath}"` })
      )
    );

    const workspaceGlobs = workspaceGlobsFrom(rootPkg.workspaces);
    if (A.isReadonlyArrayEmpty(workspaceGlobs)) {
      return HashMap.empty<string, string>();
    }

    for (const workspaceGlob of workspaceGlobs) {
      if (!isSafeWorkspacePattern(workspaceGlob)) {
        return yield* new DomainError({
          message: `Unsafe workspace glob "${workspaceGlob}" escapes the repository root.`,
        });
      }
    }

    const canonicalRootDir = yield* fsUtils
      .realPath(rootDir)
      .pipe(Effect.mapError(DomainError.newCause(`Failed to resolve repository root "${rootDir}"`)));

    // Expand all workspace globs
    const dirs = yield* fsUtils.glob(workspaceGlobs, {
      cwd: rootDir,
      absolute: true,
      ignore: IGNORED_DIRS,
    });

    // For each directory, read package.json and extract name
    let result = HashMap.empty<string, string>();

    for (const dir of dirs) {
      const canonicalDir = yield* fsUtils
        .realPath(dir)
        .pipe(Effect.mapError(DomainError.newCause(`Failed to resolve workspace path "${dir}"`)));

      if (!isContainedCanonicalPath(canonicalRootDir, canonicalDir)) {
        return yield* new DomainError({
          message: `Workspace path escapes repository root: "${dir}" -> "${canonicalDir}"`,
        });
      }

      const pkgJsonPath = `${dir}/package.json`;
      const rawChildPkg = yield* fsUtils
        .readJson(pkgJsonPath)
        .pipe(Effect.catchTag("NoSuchFileError", thunkEffectSucceedNull));
      if (P.isNull(rawChildPkg)) {
        continue;
      }
      if (O.isNone(rawChildPkg)) {
        return yield* new DomainError({
          message: `Failed to parse JSON at "${pkgJsonPath}"`,
        });
      }

      const childPkg = yield* decodePackageJsonEffect(rawChildPkg.value).pipe(
        Effect.mapError(DomainError.newCause(`Failed to decode package.json at "${pkgJsonPath}"`))
      );

      result = HashMap.set(result, childPkg.name, canonicalDir);
    }

    return result;
  }
);

/**
 * Look up the absolute directory for a single workspace by package name.
 *
 * Resolves all workspaces and returns the path for the given name,
 * or `None` if the workspace is not found.
 *
 * @param rootDir - Absolute path to the monorepo root directory.
 * @param name - The package name to look up.
 * @returns An Option containing the absolute directory path, or None.
 * @example
 * ```typescript
 * import { Effect } from "effect"
 * import * as O from "effect/Option"
 * import { getWorkspaceDir } from "@beep/repo-utils/Workspaces"
 *
 * const program = Effect.gen(function*() {
 * 
 * 
 * 
 * 
 * })
 * void program
 * ```
 * @category Utility
 * @since 0.0.0
 */
export const getWorkspaceDir: {
  (rootDir: string, name: string): Effect.Effect<O.Option<string>, NoSuchFileError | DomainError, FsUtils>;
  (name: string): (rootDir: string) => Effect.Effect<O.Option<string>, NoSuchFileError | DomainError, FsUtils>;
} = dual(
  2,
  Effect.fn(function* (rootDir, name) {
    const workspaces = yield* resolveWorkspaceDirs(rootDir);
    return HashMap.get(workspaces, name);
  })
);
// bench
