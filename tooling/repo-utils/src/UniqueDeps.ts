/**
 * Unique NPM dependency aggregation across the entire monorepo.
 *
 * Collects all external (non-workspace) dependencies from every workspace
 * package and the root, deduplicates them, and returns sorted arrays of
 * unique dependency names.
 *
 * @since 0.0.0
 * @module
 */
import { Effect } from "effect"
import { FsUtils } from "./FsUtils.js"
import { buildRepoDependencyIndex } from "./DependencyIndex.js"
import { DomainError, NoSuchFileError } from "./errors/index.js"

/**
 * Result of collecting unique NPM dependencies across the monorepo.
 *
 * @since 0.0.0
 * @category types
 */
export interface UniqueNpmDeps {
  /** Sorted array of unique runtime dependency names. */
  readonly dependencies: ReadonlyArray<string>
  /** Sorted array of unique dev dependency names. */
  readonly devDependencies: ReadonlyArray<string>
}

/**
 * Collect all unique external NPM dependency names from every package
 * in the monorepo.
 *
 * Scans all workspace packages plus the root, extracts their NPM
 * (non-workspace) dependencies and devDependencies, deduplicates,
 * and returns sorted arrays.
 *
 * Peer and optional dependencies are folded into their respective
 * categories: peerDependencies are counted as runtime `dependencies`
 * and optionalDependencies are also counted as runtime `dependencies`.
 *
 * @param rootDir - Absolute path to the monorepo root directory.
 * @returns An object with sorted, deduplicated `dependencies` and
 *   `devDependencies` arrays.
 *
 * @example
 * ```ts
 * import { Effect } from "effect"
 * import { collectUniqueNpmDependencies } from "@beep/repo-utils/UniqueDeps"
 *
 * const program = Effect.gen(function*() {
 *   const unique = yield* collectUniqueNpmDependencies("/path/to/repo")
 *   console.log("Runtime deps:", unique.dependencies)
 *   console.log("Dev deps:", unique.devDependencies)
 * })
 * ```
 *
 * @since 0.0.0
 * @category functions
 */
export const collectUniqueNpmDependencies = (
  rootDir: string
): Effect.Effect<UniqueNpmDeps, NoSuchFileError | DomainError, FsUtils> =>
  Effect.gen(function* () {
    const index = yield* buildRepoDependencyIndex(rootDir)

    const depsSet = new Set<string>()
    const devDepsSet = new Set<string>()

    for (const [_name, workspaceDeps] of index) {
      // Runtime dependencies
      for (const depName of Object.keys(workspaceDeps.npm.dependencies)) {
        depsSet.add(depName)
      }
      // Peer dependencies count as runtime
      for (const depName of Object.keys(workspaceDeps.npm.peerDependencies)) {
        depsSet.add(depName)
      }
      // Optional dependencies count as runtime
      for (const depName of Object.keys(workspaceDeps.npm.optionalDependencies)) {
        depsSet.add(depName)
      }
      // Dev dependencies
      for (const depName of Object.keys(workspaceDeps.npm.devDependencies)) {
        devDepsSet.add(depName)
      }
    }

    return {
      dependencies: Array.from(depsSet).sort(),
      devDependencies: Array.from(devDepsSet).sort(),
    }
  })
