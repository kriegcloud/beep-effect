/**
 * TypeScript configuration file discovery for monorepo workspaces.
 *
 * Scans each workspace (and the root) for `tsconfig*.json` files and
 * returns a mapping of package names to their tsconfig file paths.
 *
 * @since 0.0.0
 * @module
 */
import { Effect, HashMap } from "effect";
import type { DomainError, NoSuchFileError } from "./errors/index.js";
import { FsUtils } from "./FsUtils.js";
import { resolveWorkspaceDirs } from "./Workspaces.js";

/**
 * The root package identifier used in the returned HashMap.
 *
 * @since 0.0.0
 * @category constants
 */
const ROOT_KEY = "@beep/root";

/**
 * Collect all `tsconfig*.json` file paths for each workspace and the root.
 *
 * For every workspace package (plus the monorepo root), this function
 * globs for files matching `tsconfig*.json` and returns a HashMap
 * mapping each package name to its array of tsconfig paths.
 *
 * The root directory is indexed under `"@beep/root"`.
 *
 * @param rootDir - Absolute path to the monorepo root directory.
 * @returns A HashMap mapping package names to arrays of tsconfig file paths.
 * @example
 * ```ts
 * import { Effect } from "effect"
 * import { collectTsConfigPaths } from "@beep/repo-utils/TsConfig"
 *
 * const program = Effect.gen(function*() {
 *   const configs = yield* collectTsConfigPaths("/path/to/repo")
 *   // HashMap<string, string[]>
 * })
 * ```
 * @since 0.0.0
 * @category functions
 */
export const collectTsConfigPaths: (
  rootDir: string
) => Effect.Effect<HashMap.HashMap<string, ReadonlyArray<string>>, NoSuchFileError | DomainError, FsUtils> = Effect.fn(
  function* (rootDir) {
    const fsUtils = yield* FsUtils;
    const workspaces = yield* resolveWorkspaceDirs(rootDir);

    let result = HashMap.empty<string, ReadonlyArray<string>>();

    // Collect tsconfig files for root
    const rootConfigs = yield* fsUtils.globFiles("tsconfig*.json", {
      cwd: rootDir,
      absolute: true,
    });
    if (rootConfigs.length > 0) {
      result = HashMap.set(result, ROOT_KEY, rootConfigs);
    }

    // Collect tsconfig files for each workspace
    for (const [name, dir] of workspaces) {
      const configs = yield* fsUtils.globFiles("tsconfig*.json", {
        cwd: dir,
        absolute: true,
      });
      if (configs.length > 0) {
        result = HashMap.set(result, name, configs);
      }
    }

    return result;
  }
);
// bench
