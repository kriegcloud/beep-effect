/**
 * Workspace discovery for monorepo projects.
 *
 * Expands glob patterns from the root `package.json` `workspaces` field
 * into a mapping of package names to their absolute directory paths.
 *
 * @since 0.0.0
 * @module
 */
import { Effect, HashMap } from "effect";
import type * as O from "effect/Option";
import { DomainError, type NoSuchFileError } from "./errors/index.js";
import { FsUtils } from "./FsUtils.js";
import { decodePackageJsonEffect } from "./schemas/PackageJson.js";

/**
 * Directories to exclude when scanning workspace globs.
 *
 * @since 0.0.0
 * @category Configuration
 */
const IGNORED_DIRS = ["**/node_modules/**", "**/dist/**", "**/build/**", "**/.turbo/**"];

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
 * ```ts-morph
 * import { Effect } from "effect"
 * import { resolveWorkspaceDirs } from "@beep/repo-utils/Workspaces"
 *
 * const program = Effect.gen(function*() {
 *   const workspaces = yield* resolveWorkspaceDirs("/path/to/repo")
 *   // HashMap<string, string> e.g. { "@mock/pkg-a" => "/path/to/repo/packages/pkg-a" }
 * })
 * ```
 * @since 0.0.0
 * @category Utility
 */
export const resolveWorkspaceDirs: (
  rootDir: string
) => Effect.Effect<HashMap.HashMap<string, string>, NoSuchFileError | DomainError, FsUtils> = Effect.fn(
  function* (rootDir) {
    const fsUtils = yield* FsUtils;

    // Read and decode root package.json
    const rootPkgPath = `${rootDir}/package.json`;
    const rawPkg = yield* fsUtils.readJson(rootPkgPath);
    const rootPkg = yield* decodePackageJsonEffect(rawPkg).pipe(
      Effect.mapError(
        (error) =>
          new DomainError({
            message: `Failed to decode root package.json at "${rootPkgPath}"`,
            cause: error,
          })
      )
    );

    const workspaceGlobs: ReadonlyArray<string> = rootPkg.workspaces ?? [];
    if (workspaceGlobs.length === 0) {
      return HashMap.empty<string, string>();
    }

    // Expand all workspace globs
    const dirs = yield* fsUtils.glob(workspaceGlobs, {
      cwd: rootDir,
      absolute: true,
      ignore: IGNORED_DIRS,
    });

    // For each directory, read package.json and extract name
    let result = HashMap.empty<string, string>();

    for (const dir of dirs) {
      const pkgJsonPath = `${dir}/package.json`;
      const rawChildPkg = yield* fsUtils
        .readJson(pkgJsonPath)
        .pipe(Effect.catchTag("NoSuchFileError", () => Effect.succeed(null)));
      if (rawChildPkg === null) {
        continue;
      }

      const childPkg = yield* decodePackageJsonEffect(rawChildPkg).pipe(
        Effect.mapError(
          (error) =>
            new DomainError({
              message: `Failed to decode package.json at "${pkgJsonPath}"`,
              cause: error,
            })
        )
      );

      result = HashMap.set(result, childPkg.name, dir);
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
 * ```ts-morph
 * import { Effect } from "effect"
 * import * as O from "effect/Option"
 * import { getWorkspaceDir } from "@beep/repo-utils/Workspaces"
 *
 * const program = Effect.gen(function*() {
 *   const dir = yield* getWorkspaceDir("/path/to/repo", "@mock/pkg-a")
 *   if (O.isSome(dir)) {
 *     console.log("Found:", dir.value)
 *   }
 * })
 * ```
 * @since 0.0.0
 * @category Utility
 */
export const getWorkspaceDir: (
  rootDir: string,
  name: string
) => Effect.Effect<O.Option<string>, NoSuchFileError | DomainError, FsUtils> = Effect.fn(function* (rootDir, name) {
  const workspaces = yield* resolveWorkspaceDirs(rootDir);
  return HashMap.get(workspaces, name);
});
// bench
