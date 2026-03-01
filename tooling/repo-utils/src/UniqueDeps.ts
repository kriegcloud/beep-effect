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
import { Effect, MutableHashSet, Order, pipe, Struct } from "effect";
import * as A from "effect/Array";
import { buildRepoDependencyIndex } from "./DependencyIndex.js";
import type { DomainError, NoSuchFileError } from "./errors/index.js";
import type { FsUtils } from "./FsUtils.js";

/**
 * Result of collecting unique NPM dependencies across the monorepo.
 *
 * @since 0.0.0
 * @category types
 */
export interface UniqueNpmDeps {
  /** Sorted array of unique runtime dependency names. */
  readonly dependencies: ReadonlyArray<string>;
  /** Sorted array of unique dev dependency names. */
  readonly devDependencies: ReadonlyArray<string>;
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
 * @example
 * ```ts-morph
 * import { Effect } from "effect"
 * import { collectUniqueNpmDependencies } from "@beep/repo-utils/UniqueDeps"
 *
 * const program = Effect.gen(function*() {
 *   const unique = yield* collectUniqueNpmDependencies("/path/to/repo")
 *   console.log("Runtime deps:", unique.dependencies)
 *   console.log("Dev deps:", unique.devDependencies)
 * })
 * ```
 * @since 0.0.0
 * @category functions
 */
export const collectUniqueNpmDependencies: (
  rootDir: string
) => Effect.Effect<UniqueNpmDeps, NoSuchFileError | DomainError, FsUtils> = Effect.fn(function* (rootDir) {
  const index = yield* buildRepoDependencyIndex(rootDir);

  const depsSet = MutableHashSet.empty<string>();
  const devDepsSet = MutableHashSet.empty<string>();

  for (const [_name, workspaceDeps] of index) {
    // Runtime dependencies
    for (const depName of Struct.keys(workspaceDeps.npm.dependencies)) {
      MutableHashSet.add(depsSet, depName);
    }
    // Peer dependencies count as runtime
    for (const depName of Struct.keys(workspaceDeps.npm.peerDependencies)) {
      MutableHashSet.add(depsSet, depName);
    }
    // Optional dependencies count as runtime
    for (const depName of Struct.keys(workspaceDeps.npm.optionalDependencies)) {
      MutableHashSet.add(depsSet, depName);
    }
    // Dev dependencies
    for (const depName of Struct.keys(workspaceDeps.npm.devDependencies)) {
      MutableHashSet.add(devDepsSet, depName);
    }
  }

  return {
    dependencies: sortHashSet(depsSet),
    devDependencies: sortHashSet(devDepsSet),
  };
});

const sortHashSet = (set: MutableHashSet.MutableHashSet<string>) => pipe(set, A.fromIterable, A.sort(Order.String));
// bench
