/**
 * @file Reference Computation Module
 *
 * Computes tsconfig references for packages based on dependencies.
 * Handles transitive closure, path normalization, and reference merging.
 *
 * @module tsconfig-sync/references
 * @since 0.1.0
 */

import { buildRootRelativePath, computeTransitiveClosure, topologicalSort } from "@beep/tooling-utils";
import * as A from "effect/Array";
import * as Effect from "effect/Effect";
import * as F from "effect/Function";
import * as HashMap from "effect/HashMap";
import * as HashSet from "effect/HashSet";
import * as O from "effect/Option";
import * as Str from "effect/String";
import { findBuildConfig } from "./discover.js";
import type { RepoDepMapValueT, TsconfigType, WorkspaceContext } from "./types.js";
import { convertToPackageRootRefs, getExistingReferencePaths, mergeRefs } from "./utils/tsconfig-writer.js";

// ─────────────────────────────────────────────────────────────────────────────
// Direct Workspace Dependencies
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Get direct workspace dependencies for a package.
 * Combines dependencies, devDependencies, and peerDependencies.
 *
 * @since 0.1.0
 * @category utils
 */
export const getDirectWorkspaceDeps = (deps: RepoDepMapValueT): HashSet.HashSet<string> =>
  F.pipe(
    deps.dependencies.workspace,
    HashSet.union(deps.devDependencies.workspace),
    HashSet.union(deps.peerDependencies.workspace)
  ) as HashSet.HashSet<string>;

// ─────────────────────────────────────────────────────────────────────────────
// Transitive Closure
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Compute transitive dependencies for a package.
 * If noHoist is true, returns only direct dependencies.
 *
 * @since 0.1.0
 * @category references
 */
export const computeTransitiveDeps = (
  pkg: string,
  directDeps: HashSet.HashSet<string>,
  adjacencyList: HashMap.HashMap<string, HashSet.HashSet<string>>,
  noHoist: boolean
) =>
  Effect.gen(function* () {
    if (noHoist) {
      return directDeps;
    }

    const closure = yield* computeTransitiveClosure(adjacencyList, pkg);
    return HashSet.union(directDeps, closure);
  });

// ─────────────────────────────────────────────────────────────────────────────
// Reference Path Computation
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Build package-to-reference-path mapping.
 * Maps each dependency to its root-relative tsconfig.build.json path.
 *
 * @since 0.1.0
 * @category references
 */
export const buildPkgToPathMap = (
  transitiveDeps: HashSet.HashSet<string>,
  pkg: string,
  context: WorkspaceContext
): HashMap.HashMap<string, string> =>
  F.pipe(
    HashSet.toValues(transitiveDeps),
    A.filterMap((depPkg) => {
      const depTsconfigOption = HashMap.get(context.tsconfigPaths, depPkg);
      if (O.isNone(depTsconfigOption)) return O.none();

      const pkgTsconfigOption = HashMap.get(context.tsconfigPaths, pkg);
      if (O.isNone(pkgTsconfigOption)) return O.none();

      // Get build tsconfig paths
      const targetBuildPath = findBuildConfig(depTsconfigOption.value);
      const sourceBuildPath = findBuildConfig(pkgTsconfigOption.value);

      if (O.isNone(targetBuildPath) || O.isNone(sourceBuildPath)) return O.none();

      // Convert absolute paths to repo-relative paths
      const sourceRelative = F.pipe(
        sourceBuildPath.value,
        Str.replace(context.repoRoot, ""),
        Str.replace(/^\//, "") // Remove leading slash
      );
      const targetRelative = F.pipe(
        targetBuildPath.value,
        Str.replace(context.repoRoot, ""),
        Str.replace(/^\//, "") // Remove leading slash
      );

      // Calculate root-relative path from source tsconfig to target tsconfig
      const refPath = buildRootRelativePath(sourceRelative, targetRelative);
      return O.some([depPkg, refPath] as const);
    }),
    A.reduce(HashMap.empty<string, string>(), (acc, [depPkg, refPath]) => HashMap.set(acc, depPkg, refPath))
  );

/**
 * Build subset adjacency list for transitive deps only.
 * Used for topological sorting.
 *
 * @since 0.1.0
 * @category references
 */
export const buildSubsetAdjacency = (
  transitiveDeps: HashSet.HashSet<string>,
  adjacencyList: HashMap.HashMap<string, HashSet.HashSet<string>>
): HashMap.HashMap<string, HashSet.HashSet<string>> =>
  F.pipe(
    HashSet.toValues(transitiveDeps),
    A.reduce(HashMap.empty<string, HashSet.HashSet<string>>(), (acc, depPkg) => {
      const depDepsOption = HashMap.get(adjacencyList, depPkg);
      if (O.isNone(depDepsOption)) return HashMap.set(acc, depPkg, HashSet.empty());
      // Filter to only include deps that are in our transitiveDeps set
      const filteredDeps = F.pipe(
        HashSet.toValues(depDepsOption.value),
        A.filter((d) => HashSet.has(transitiveDeps, d)),
        HashSet.fromIterable
      );
      return HashMap.set(acc, depPkg, filteredDeps);
    })
  );

/**
 * Compute expected references for a package in topological order.
 *
 * @since 0.1.0
 * @category references
 */
export const computeExpectedRefs = (
  transitiveDeps: HashSet.HashSet<string>,
  adjacencyList: HashMap.HashMap<string, HashSet.HashSet<string>>,
  pkgToPathMap: HashMap.HashMap<string, string>
) =>
  Effect.gen(function* () {
    // Build subset adjacency list for transitive deps only
    const subsetAdjacency = buildSubsetAdjacency(transitiveDeps, adjacencyList);

    // Sort dependencies topologically (deps before dependents)
    const sortedDepPkgs = yield* topologicalSort(subsetAdjacency);

    // Map sorted package names to their reference paths
    return F.pipe(
      sortedDepPkgs,
      A.filterMap((depPkg) => HashMap.get(pkgToPathMap, depPkg))
    );
  });

// ─────────────────────────────────────────────────────────────────────────────
// Existing Reference Normalization
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Normalize existing reference paths to root-relative format.
 * Converts package-relative refs like ../types/tsconfig.build.json
 * to root-relative ../../../packages/common/types/tsconfig.build.json
 *
 * @since 0.1.0
 * @category references
 */
export const normalizeExistingRefs = (
  existingRefs: readonly string[],
  sourceRelative: string,
  context: WorkspaceContext
): readonly string[] =>
  F.pipe(
    existingRefs,
    A.filterMap((ref) => {
      // If already root-relative (starts with ../../../), keep if valid
      if (Str.startsWith("../../../")(ref)) {
        // Check if it points to packages or tooling directory
        if (Str.includes("packages/")(ref) || Str.includes("tooling/")(ref)) {
          return O.some(ref);
        }
        return O.none();
      }

      // If package-relative (like ../types/tsconfig.build.json or ../../common/types/tsconfig.build.json)
      // convert to root-relative by resolving the path and looking up in tsconfigPaths
      if (Str.startsWith("..")(ref) && Str.includes("tsconfig.build.json")(ref)) {
        // Resolve the package-relative path to an absolute path
        // sourceRelative is like "packages/common/identity/tsconfig.build.json"
        // Get the source directory: "packages/common/identity"
        const sourceDir = F.pipe(sourceRelative, Str.replace(/\/[^/]+$/, ""));

        // Navigate the relative path from source directory
        // e.g., ref = "../types/tsconfig.build.json", sourceDir = "packages/common/identity"
        // result: "packages/common/types/tsconfig.build.json"
        const refWithoutFilename = Str.replace(/\/tsconfig\.build\.json$/, "")(ref);
        const segments = F.pipe(sourceDir, Str.split("/"));
        const refSegments = F.pipe(refWithoutFilename, Str.split("/"));

        // Process relative path: for each "..", pop a segment from source path
        let resultSegments = [...segments];
        for (const seg of refSegments) {
          if (seg === "..") {
            resultSegments = A.dropRight(resultSegments, 1);
          } else if (seg !== ".") {
            resultSegments = [...resultSegments, seg];
          }
        }

        const resolvedDir = A.join(resultSegments, "/");
        const resolvedPath = `${resolvedDir}/tsconfig.build.json`;

        // Find the package that has this tsconfig path
        const matchingEntry = F.pipe(
          HashMap.entries(context.tsconfigPaths),
          A.fromIterable,
          A.findFirst(([, paths]) => {
            // Check if any of the package's tsconfig paths match the resolved path
            return F.pipe(
              paths,
              A.some((p) => {
                const pRelative = F.pipe(p, Str.replace(context.repoRoot, ""), Str.replace(/^\//, ""));
                return pRelative === resolvedPath;
              })
            );
          })
        );

        if (O.isSome(matchingEntry)) {
          const [, paths] = matchingEntry.value;
          const targetBuildPath = findBuildConfig(paths);
          if (O.isSome(targetBuildPath)) {
            // Convert absolute paths to repo-relative paths
            const targetRelative = F.pipe(
              targetBuildPath.value,
              Str.replace(context.repoRoot, ""),
              Str.replace(/^\//, "")
            );
            // Calculate root-relative path from source to target
            const rootRelativeRef = buildRootRelativePath(sourceRelative, targetRelative);
            return O.some(rootRelativeRef);
          }
        }
        return O.none();
      }

      return O.none();
    })
  );

// ─────────────────────────────────────────────────────────────────────────────
// Reference Merging
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Merge normalized existing refs with computed refs.
 * Maintains topological order with computed refs first,
 * then any extra refs from existing that weren't computed.
 *
 * @since 0.1.0
 * @category references
 */
export const mergeAndSortRefs = (
  expectedRefs: readonly string[],
  normalizedExistingRefs: readonly string[]
): readonly string[] => {
  // Merge normalized existing refs with computed refs (deduplicated)
  const mergedBuildRefs = mergeRefs(normalizedExistingRefs, expectedRefs);

  // Sort the merged refs to maintain topological order
  // First, collect all refs into a set, then order by the expectedRefs order (which is topologically sorted)
  // Add any existing refs that weren't in expectedRefs at the end
  const expectedRefsSet = HashSet.fromIterable(expectedRefs);
  const extraRefs = F.pipe(
    mergedBuildRefs,
    A.filter((ref) => !HashSet.has(expectedRefsSet, ref))
  );

  return [...expectedRefs, ...extraRefs];
};

// ─────────────────────────────────────────────────────────────────────────────
// Reference Computation for Config Types
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Compute final references for a specific tsconfig type.
 *
 * @since 0.1.0
 * @category references
 */
export const computeRefsForConfigType = (
  configType: TsconfigType,
  finalBuildRefs: readonly string[],
  testkitRefPath: string
): readonly string[] => {
  if (configType === "build") {
    return finalBuildRefs;
  }

  // For src and test, convert to package root refs (remove /tsconfig.build.json)
  let refs = convertToPackageRootRefs(finalBuildRefs);

  if (configType === "test") {
    // Prepend local src reference for test configs
    refs = ["tsconfig.src.json", ...refs];

    // Ensure testkit is included (keep tsconfig.build.json for testkit)
    const hasTestkit = F.pipe(refs, A.some(Str.includes("testkit")));
    if (!hasTestkit) {
      refs = [...refs, testkitRefPath];
    }
  }

  return refs;
};

// ─────────────────────────────────────────────────────────────────────────────
// Main Reference Computation Function
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Compute all references for a package.
 * Returns the final build refs array (topologically sorted with existing refs merged).
 *
 * @since 0.1.0
 * @category references
 */
export const computePackageReferences = (
  pkg: string,
  deps: RepoDepMapValueT,
  context: WorkspaceContext,
  buildTsconfigPath: string,
  noHoist: boolean
) =>
  Effect.gen(function* () {
    // Get direct workspace dependencies
    const directDeps = getDirectWorkspaceDeps(deps);

    // Compute transitive deps
    const transitiveDeps = yield* computeTransitiveDeps(pkg, directDeps, context.adjacencyList, noHoist);

    // Build package-to-path mapping
    const pkgToPathMap = buildPkgToPathMap(transitiveDeps, pkg, context);

    // Compute expected refs in topological order
    const expectedRefs = yield* computeExpectedRefs(transitiveDeps, context.adjacencyList, pkgToPathMap);

    // Calculate source relative path
    const sourceRelative = F.pipe(buildTsconfigPath, Str.replace(context.repoRoot, ""), Str.replace(/^\//, ""));

    // Get existing refs and normalize
    const existingBuildRefs = yield* getExistingReferencePaths(buildTsconfigPath).pipe(
      Effect.catchAll(() => Effect.succeed(A.empty<string>()))
    );

    const normalizedRefs = normalizeExistingRefs(existingBuildRefs, sourceRelative, context);

    // Merge and sort
    return mergeAndSortRefs(expectedRefs, normalizedRefs);
  });

/**
 * Compute the testkit reference path for a package.
 *
 * @since 0.1.0
 * @category references
 */
export const computeTestkitRefPath = (buildTsconfigPath: string, repoRoot: string): string => {
  const sourceRelative = F.pipe(buildTsconfigPath, Str.replace(repoRoot, ""), Str.replace(/^\//, ""));

  return buildRootRelativePath(
    Str.replace(/tsconfig\.build\.json$/, "tsconfig.test.json")(sourceRelative),
    "tooling/testkit/tsconfig.build.json"
  );
};
