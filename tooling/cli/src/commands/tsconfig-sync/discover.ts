/**
 * @file Workspace Discovery Module
 *
 * Discovers workspace packages and builds dependency graphs.
 * Extracted from handler.ts for modularity.
 *
 * @module tsconfig-sync/discover
 * @since 1.0.0
 */

import { buildRepoDependencyIndex, collectTsConfigPaths, detectCycles, findRepoRoot } from "@beep/tooling-utils";
import * as A from "effect/Array";
import * as Effect from "effect/Effect";
import * as F from "effect/Function";
import * as HashMap from "effect/HashMap";
import * as HashSet from "effect/HashSet";
import * as O from "effect/Option";
import * as Str from "effect/String";
import type { RepoDepMapValueT, WorkspaceContext, WorkspacePkgKeyT } from "./types.js";

// ─────────────────────────────────────────────────────────────────────────────
// Internal Utilities
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Find the build tsconfig path from the array of paths.
 *
 * @since 0.1.0
 * @category utils
 */
export const findBuildConfig = (paths: A.NonEmptyReadonlyArray<string>): O.Option<string> =>
  F.pipe(paths, A.findFirst(Str.endsWith("tsconfig.build.json")));

/**
 * Build adjacency list from dependency index for graph operations.
 *
 * @since 0.1.0
 * @category utils
 */
export const buildAdjacencyList = (
  depIndex: HashMap.HashMap<WorkspacePkgKeyT, RepoDepMapValueT>
): HashMap.HashMap<string, HashSet.HashSet<string>> => {
  let adjacency = HashMap.empty<string, HashSet.HashSet<string>>();

  for (const [pkg, deps] of HashMap.entries(depIndex)) {
    // Skip synthetic root package
    if (pkg === "@beep/root") continue;

    // Combine workspace dependencies from prod, dev, and peer
    const workspaceDeps = F.pipe(
      deps.dependencies.workspace,
      HashSet.union(deps.devDependencies.workspace),
      HashSet.union(deps.peerDependencies.workspace)
    );

    adjacency = HashMap.set(adjacency, pkg, workspaceDeps as HashSet.HashSet<string>);
  }

  return adjacency;
};

/**
 * Build package directory map from tsconfig paths.
 * Maps package names to their directory paths relative to repo root.
 *
 * @since 0.1.0
 * @category utils
 */
export const buildPkgDirMap = (
  tsconfigPaths: HashMap.HashMap<string, A.NonEmptyReadonlyArray<string>>,
  repoRoot: string
): HashMap.HashMap<string, string> => {
  let pkgDirMap = HashMap.empty<string, string>();

  for (const [pkgName, paths] of HashMap.entries(tsconfigPaths)) {
    const buildConfig = findBuildConfig(paths);
    if (O.isSome(buildConfig)) {
      // Extract package directory from build config path
      // e.g., /repo/packages/iam/domain/tsconfig.build.json -> packages/iam/domain
      const pkgDir = F.pipe(
        buildConfig.value,
        Str.replace(repoRoot, ""),
        Str.replace(/^\//, ""),
        Str.replace(/\/tsconfig\.build\.json$/, "")
      );
      pkgDirMap = HashMap.set(pkgDirMap, pkgName, pkgDir);
    }
  }

  return pkgDirMap;
};

// ─────────────────────────────────────────────────────────────────────────────
// Main Discovery Function
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Discover workspace packages and build the workspace context.
 * Combines all discovery operations into a single context object.
 *
 * @since 0.1.0
 * @category discovery
 */
export const discoverWorkspace = Effect.gen(function* () {
  // Get repo root for path calculations
  const repoRoot = yield* findRepoRoot;

  // Build dependency index and collect tsconfig paths
  const depIndex = yield* buildRepoDependencyIndex;
  const tsconfigPaths = yield* collectTsConfigPaths;

  // Build adjacency list for graph operations
  const adjacencyList = buildAdjacencyList(depIndex);

  // Build workspace packages set
  const workspacePackages = F.pipe(HashMap.keys(adjacencyList), HashSet.fromIterable);

  // Build package directory map
  const pkgDirMap = buildPkgDirMap(tsconfigPaths, repoRoot);

  return {
    depIndex,
    adjacencyList,
    tsconfigPaths,
    pkgDirMap,
    repoRoot,
    workspacePackages,
  };
});

/**
 * Detect cycles in the dependency graph.
 * Returns an array of cycle paths if cycles exist, empty array otherwise.
 *
 * @since 0.1.0
 * @category discovery
 */
export const checkForCycles = (
  adjacencyList: HashMap.HashMap<string, HashSet.HashSet<string>>
): Effect.Effect<readonly (readonly string[])[], never, never> => detectCycles(adjacencyList);

/**
 * Get the number of packages in the workspace.
 *
 * @since 0.1.0
 * @category utils
 */
export const getPackageCount = (context: WorkspaceContext): number =>
  F.pipe(HashMap.entries(context.depIndex), A.fromIterable, A.length);

/**
 * Filter packages based on input options.
 *
 * @since 0.1.0
 * @category utils
 */
export const filterPackages = (context: WorkspaceContext, filter?: string): readonly string[] => {
  if (filter) {
    return F.pipe(
      HashMap.entries(context.depIndex),
      A.fromIterable,
      A.filter(([pkg]) => pkg === filter),
      A.map(([pkg]) => pkg)
    );
  }

  return F.pipe(
    HashMap.entries(context.depIndex),
    A.fromIterable,
    A.filter(([pkg]) => pkg !== "@beep/root"),
    A.map(([pkg]) => pkg)
  );
};

/**
 * Check if a package exists in the workspace.
 *
 * @since 0.1.0
 * @category utils
 */
export const packageExists = (context: WorkspaceContext, pkg: string): boolean =>
  O.isSome(HashMap.get(context.depIndex, pkg as WorkspacePkgKeyT));

/**
 * Get package dependencies from the context.
 *
 * @since 0.1.0
 * @category utils
 */
export const getPackageDeps = (context: WorkspaceContext, pkg: string): O.Option<RepoDepMapValueT> =>
  HashMap.get(context.depIndex, pkg as WorkspacePkgKeyT);
