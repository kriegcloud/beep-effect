/**
 * Dependency sorting utilities for package.json dependencies.
 *
 * Provides functions to sort dependencies with workspace packages in
 * topological order and external packages in alphabetical order.
 *
 * @module @beep/tooling-utils/repo/DepSorter
 * @since 0.1.0
 * @category Utils
 */
import * as A from "effect/Array";
import * as Effect from "effect/Effect";
import * as F from "effect/Function";
import * as HashMap from "effect/HashMap";
import * as HashSet from "effect/HashSet";
import * as O from "effect/Option";
import * as Order from "effect/Order";
import * as R from "effect/Record";
import * as Str from "effect/String";

import { type CyclicDependencyError, topologicalSort } from "./Graph.js";

/**
 * Sorted dependencies split into workspace and external packages.
 *
 * @category Types
 * @since 0.1.0
 */
export interface SortedDeps {
  /**
   * Workspace dependencies in topological order.
   * Each tuple is [packageName, versionSpecifier].
   */
  readonly workspace: Array<readonly [string, string]>;
  /**
   * External dependencies in alphabetical order.
   * Each tuple is [packageName, versionSpecifier].
   */
  readonly external: Array<readonly [string, string]>;
}

/**
 * Alphabetical ordering for dependency tuples by package name.
 */
const tupleOrder = Order.mapInput(Order.string, (t: readonly [string, string]) => A.headNonEmpty(t));

/**
 * Check if a package name is a workspace package.
 */
const isWorkspacePackage = (name: string): boolean => Str.startsWith("@beep/")(name);

/**
 * Sort dependencies with workspace packages in topological order
 * and external packages in alphabetical order.
 *
 * @param deps - Record of dependencies from package.json
 * @param workspaceAdjacencyList - Adjacency list for workspace packages
 * @returns SortedDeps with workspace deps topologically sorted and external deps alphabetically sorted
 *
 * @example
 * ```typescript
 * import { sortDependencies } from "@beep/tooling-utils/repo/DepSorter"
 * import * as HashMap from "effect/HashMap"
 * import * as HashSet from "effect/HashSet"
 * import * as Effect from "effect/Effect"
 *
 * const deps = {
 *   "@beep/utils": "workspace:^",
 *   "@beep/schema": "workspace:^",
 *   "effect": "^3.0.0"
 * }
 *
 * const graph = HashMap.make(
 *   ["@beep/schema", HashSet.empty()],
 *   ["@beep/utils", HashSet.make("@beep/schema")]
 * )
 *
 * const sorted = Effect.runSync(sortDependencies(deps, graph))
 * // sorted.workspace => [["@beep/schema", "workspace:^"], ["@beep/utils", "workspace:^"]]
 * // sorted.external => [["effect", "^3.0.0"]]
 * ```
 *
 * @category Utils
 * @since 0.1.0
 */
export const sortDependencies = (
  deps: Record<string, string>,
  workspaceAdjacencyList: HashMap.HashMap<string, HashSet.HashSet<string>>
): Effect.Effect<SortedDeps, CyclicDependencyError> =>
  Effect.gen(function* () {
    const entries = R.toEntries(deps);

    // Separate workspace and external dependencies
    const workspaceDeps = F.pipe(
      entries,
      A.filter(([name]) => isWorkspacePackage(name))
    );
    const externalDeps = F.pipe(
      entries,
      A.filter(([name]) => !isWorkspacePackage(name))
    );

    // Get topological order for workspace packages
    const workspaceNames = F.pipe(
      workspaceDeps,
      A.map(([name]) => name)
    );

    // Build a subgraph containing only the deps we care about
    const subgraph = F.pipe(
      workspaceNames,
      A.reduce(HashMap.empty<string, HashSet.HashSet<string>>(), (acc, name) => {
        const fullDeps = F.pipe(
          HashMap.get(workspaceAdjacencyList, name),
          O.getOrElse(() => HashSet.empty<string>())
        );
        // Filter to only include deps that are in our workspaceDeps
        const relevantDeps = F.pipe(
          fullDeps,
          HashSet.filter((d) => A.some(workspaceDeps, ([n]) => n === d))
        );
        return HashMap.set(acc, name, relevantDeps);
      })
    );

    // Topologically sort if we have workspace deps
    let sortedWorkspaceNames = A.empty<string>();
    if (A.isNonEmptyArray(workspaceNames)) {
      sortedWorkspaceNames = yield* topologicalSort(subgraph);
    }

    // Build workspace deps in topological order
    const depsMap = HashMap.fromIterable(workspaceDeps);
    const sortedWorkspace = F.pipe(
      sortedWorkspaceNames,
      A.filterMap((name) =>
        F.pipe(
          HashMap.get(depsMap, name),
          O.map((version): readonly [string, string] => [name, version] as const)
        )
      )
    );

    // Sort external deps alphabetically
    const sortedExternal = A.sort(externalDeps, tupleOrder);

    return {
      workspace: sortedWorkspace,
      external: sortedExternal,
    };
  });

/**
 * Merge sorted deps back into a single Record preserving order.
 * Workspace packages come first, then external packages.
 *
 * @param sorted - SortedDeps to merge
 * @returns Record with workspace deps first, then external deps
 *
 * @example
 * ```typescript
 * import { mergeSortedDeps } from "@beep/tooling-utils/repo/DepSorter"
 *
 * const sorted = {
 *   workspace: [["@beep/schema", "workspace:^"], ["@beep/utils", "workspace:^"]],
 *   external: [["effect", "^3.0.0"]]
 * }
 *
 * const merged = mergeSortedDeps(sorted)
 * // => { "@beep/schema": "workspace:^", "@beep/utils": "workspace:^", "effect": "^3.0.0" }
 * ```
 *
 * @category Utils
 * @since 0.1.0
 */
export const mergeSortedDeps = (sorted: SortedDeps): Record<string, string> => {
  const result = R.empty<string, string>();

  // Add workspace deps first (in topological order)
  for (const [name, version] of sorted.workspace) {
    result[name] = version;
  }

  // Then external deps (in alphabetical order)
  for (const [name, version] of sorted.external) {
    result[name] = version;
  }

  return result;
};

/**
 * Enforce version specifier conventions:
 * - @beep/* packages → "workspace:^"
 * - External packages → preserve existing (or "catalog:" if specified)
 *
 * @param deps - Record of dependencies from package.json
 * @param workspacePackages - HashSet of all workspace package names
 * @param useCatalogForExternal - If true, convert external deps to "catalog:"
 * @returns Record with enforced version specifiers
 *
 * @example
 * ```typescript
 * import { enforceVersionSpecifiers } from "@beep/tooling-utils/repo/DepSorter"
 * import * as HashSet from "effect/HashSet"
 *
 * const deps = {
 *   "@beep/schema": "^1.0.0",  // Wrong specifier
 *   "effect": "^3.0.0"
 * }
 *
 * const workspaces = HashSet.make("@beep/schema", "@beep/utils")
 *
 * const enforced = enforceVersionSpecifiers(deps, workspaces)
 * // => { "@beep/schema": "workspace:^", "effect": "^3.0.0" }
 * ```
 *
 * @category Utils
 * @since 0.1.0
 */
export const enforceVersionSpecifiers = (
  deps: Record<string, string>,
  workspacePackages: HashSet.HashSet<string>,
  useCatalogForExternal = false
): Record<string, string> => {
  const result = R.empty<string, string>();

  for (const [name, version] of R.toEntries(deps)) {
    if (HashSet.has(workspacePackages, name)) {
      // Workspace packages must use workspace:^
      result[name] = "workspace:^";
    } else if (useCatalogForExternal && !Str.startsWith("catalog:")(version)) {
      // Convert external deps to catalog: if requested
      result[name] = "catalog:";
    } else {
      // Preserve existing version specifier
      result[name] = version;
    }
  }

  return result;
};
