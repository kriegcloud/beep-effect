/**
 * Unique NPM dependency aggregation across the entire monorepo.
 *
 * Collects all external (non-workspace) dependencies from every workspace
 * package and the root, deduplicates them, and returns sorted arrays of
 * unique dependency names.
 *
 * @module
 * @since 0.0.0
 */
import { $RepoUtilsId } from "@beep/identity/packages";
import { Effect, MutableHashSet, Order, pipe, Struct } from "effect";
import * as A from "effect/Array";
import * as S from "effect/Schema";
import { buildRepoDependencyIndex } from "./DependencyIndex.js";
import type { DomainError, NoSuchFileError } from "./errors/index.js";
import type { FsUtils } from "./FsUtils.js";

const $I = $RepoUtilsId.create("UniqueDeps");

/**
 * Result of collecting unique NPM dependencies across the monorepo.
 *
 * @example
 * ```ts
 * import { UniqueNpmDeps } from "@beep/repo-utils/UniqueDeps"
 * const deps = new UniqueNpmDeps({
 *   dependencies: ["effect"],
 *   devDependencies: ["vitest"]
 * })
 * void deps.dependencies
 * ```
 * @category models
 * @since 0.0.0
 */
export class UniqueNpmDeps extends S.Class<UniqueNpmDeps>($I`UniqueNpmDeps`)(
  {
    dependencies: S.Array(S.String),
    devDependencies: S.Array(S.String),
  },
  $I.annote("UniqueNpmDeps", {
    description: "Sorted runtime and development dependency names aggregated across the monorepo.",
  })
) {}

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
 * @returns An object with sorted, deduplicated dependencies and devDependencies.
 * @example
 * ```ts
 * import { collectUniqueNpmDependencies } from "@beep/repo-utils/UniqueDeps"
 * const program = collectUniqueNpmDependencies(process.cwd())
 * void program
 * ```
 * @category utilities
 * @since 0.0.0
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

  return new UniqueNpmDeps({
    dependencies: sortHashSet(depsSet),
    devDependencies: sortHashSet(devDepsSet),
  });
});

const sortHashSet = (set: MutableHashSet.MutableHashSet<string>) => pipe(set, A.fromIterable, A.sort(Order.String));
// bench
