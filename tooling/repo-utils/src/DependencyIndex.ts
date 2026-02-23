/**
 * Dependency index for the entire monorepo.
 *
 * Builds a complete mapping of every workspace package (plus the root)
 * to its classified dependencies (workspace vs NPM).
 *
 * @since 0.0.0
 * @module
 */
import { Effect, HashMap, HashSet } from "effect";
import { extractWorkspaceDependencies } from "./Dependencies.js";
import { DomainError, type NoSuchFileError } from "./errors/index.js";
import { FsUtils } from "./FsUtils.js";
import { decodePackageJsonEffect } from "./schemas/PackageJson.js";
import type { WorkspaceDeps } from "./schemas/WorkspaceDeps.js";
import { resolveWorkspaceDirs } from "./Workspaces.js";

/**
 * The root package identifier used in the returned HashMap.
 *
 * @since 0.0.0
 * @category constants
 */
const ROOT_KEY = "@beep/root";

/**
 * Build a complete dependency index for the entire monorepo.
 *
 * For every workspace package and the root, reads its `package.json`,
 * classifies each dependency as workspace-internal or external NPM,
 * and returns a HashMap mapping each package name to its `WorkspaceDeps`.
 *
 * The root directory is indexed under `"@beep/root"`.
 *
 * @param rootDir - Absolute path to the monorepo root directory.
 * @returns A HashMap mapping package names to their classified dependencies.
 * @example
 * ```ts
 * import { Effect } from "effect"
 * import { buildRepoDependencyIndex } from "@beep/repo-utils/DependencyIndex"
 *
 * const program = Effect.gen(function*() {
 *   const index = yield* buildRepoDependencyIndex("/path/to/repo")
 *   // HashMap<string, WorkspaceDeps>
 * })
 * ```
 * @since 0.0.0
 * @category functions
 */
export const buildRepoDependencyIndex: (
  rootDir: string
) => Effect.Effect<HashMap.HashMap<string, WorkspaceDeps>, NoSuchFileError | DomainError, FsUtils> = Effect.fn(
  function* (rootDir) {
    const fsUtils = yield* FsUtils;
    const workspaces = yield* resolveWorkspaceDirs(rootDir);

    // Build a HashSet of all workspace package names
    let workspaceNames = HashSet.empty<string>();
    for (const [name] of workspaces) {
      workspaceNames = HashSet.add(workspaceNames, name);
    }

    let result = HashMap.empty<string, WorkspaceDeps>();

    // Process root package.json
    const rootPkgPath = `${rootDir}/package.json`;
    const rawRootPkg = yield* fsUtils.readJson(rootPkgPath);
    const rootPkg = yield* decodePackageJsonEffect(rawRootPkg).pipe(
      Effect.mapError(
        (error) =>
          new DomainError({
            message: `Failed to decode root package.json at "${rootPkgPath}"`,
            cause: error,
          })
      )
    );
    const rootDeps = extractWorkspaceDependencies(rootPkg, workspaceNames);
    result = HashMap.set(result, ROOT_KEY, { ...rootDeps, packageName: ROOT_KEY });

    // Process each workspace package.json
    for (const [name, dir] of workspaces) {
      const pkgPath = `${dir}/package.json`;
      const rawPkg = yield* fsUtils
        .readJson(pkgPath)
        .pipe(Effect.catchTag("NoSuchFileError", () => Effect.succeed(null)));
      if (rawPkg === null) {
        continue;
      }
      const pkg = yield* decodePackageJsonEffect(rawPkg).pipe(
        Effect.mapError(
          (error) =>
            new DomainError({
              message: `Failed to decode package.json at "${pkgPath}"`,
              cause: error,
            })
        )
      );
      const deps = extractWorkspaceDependencies(pkg, workspaceNames);
      result = HashMap.set(result, name, deps);
    }

    return result;
  }
);
