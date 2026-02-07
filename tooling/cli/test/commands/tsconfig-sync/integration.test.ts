/**
 * @file Integration Tests for tsconfig-sync Command
 *
 * Tests the complete workflow combining all modules:
 * - Workspace discovery
 * - Reference computation
 * - Package.json sync
 * - Tsconfig file sync
 *
 * These tests verify the modules work together correctly.
 *
 * @module tsconfig-sync/test/integration
 * @since 0.1.0
 */

import { filterPackages, findBuildConfig, getPackageCount } from "@beep/repo-cli/commands/tsconfig-sync/discover";
import {
  buildPkgToPathMap,
  computeRefsForConfigType,
  computeTransitiveDeps,
  getDirectWorkspaceDeps,
  mergeAndSortRefs,
} from "@beep/repo-cli/commands/tsconfig-sync/references";
import type { RepoDepMapValueT, WorkspaceContext, WorkspacePkgKeyT } from "@beep/repo-cli/commands/tsconfig-sync/types";
import {
  computeAllDependenciesDiff,
  mergeSortedDependencies,
} from "@beep/repo-cli/commands/tsconfig-sync/utils/package-json-writer";
import { assertTrue, deepStrictEqual, describe, effect, expect, it, strictEqual } from "@beep/testkit";
import * as A from "effect/Array";
import * as Effect from "effect/Effect";
import * as HashMap from "effect/HashMap";
import * as HashSet from "effect/HashSet";
import * as O from "effect/Option";

// -----------------------------------------------------------------------------
// Test Fixtures
// -----------------------------------------------------------------------------

/** Type-safe workspace HashSet creation */
const workspaceSet = (...deps: WorkspacePkgKeyT[]): HashSet.HashSet<WorkspacePkgKeyT> => HashSet.fromIterable(deps);

const createMockDeps = (workspace: readonly WorkspacePkgKeyT[]): RepoDepMapValueT => ({
  dependencies: {
    workspace: workspaceSet(...workspace),
    npm: HashSet.empty(),
  },
  devDependencies: {
    workspace: HashSet.empty(),
    npm: HashSet.empty(),
  },
  peerDependencies: {
    workspace: HashSet.empty(),
    npm: HashSet.empty(),
  },
});

const createRealisticContext = (): WorkspaceContext => {
  // Simulating a realistic workspace with slices
  const packages: Record<WorkspacePkgKeyT, readonly WorkspacePkgKeyT[]> = {
    // Common packages (no deps)
    "@beep/types": [],
    "@beep/utils": ["@beep/types"],
    "@beep/schema": ["@beep/types", "@beep/utils"],

    // IAM slice
    "@beep/iam-domain": ["@beep/schema", "@beep/types"],
    "@beep/iam-tables": ["@beep/iam-domain"],
    "@beep/iam-server": ["@beep/iam-tables", "@beep/iam-domain"],
    "@beep/iam-client": ["@beep/iam-domain"],
    "@beep/iam-ui": ["@beep/iam-client", "@beep/iam-domain"],

    // Documents slice
    "@beep/documents-domain": ["@beep/schema", "@beep/types"],
    "@beep/documents-server": ["@beep/documents-domain"],
  };

  let depIndex = HashMap.empty<WorkspacePkgKeyT, RepoDepMapValueT>();
  let adjacencyList = HashMap.empty<string, HashSet.HashSet<string>>();
  let tsconfigPaths = HashMap.empty<string, A.NonEmptyReadonlyArray<string>>();
  let pkgDirMap = HashMap.empty<string, string>();
  const workspacePackages = HashSet.fromIterable(Object.keys(packages));

  for (const [pkg, deps] of Object.entries(packages) as [WorkspacePkgKeyT, readonly WorkspacePkgKeyT[]][]) {
    depIndex = HashMap.set(depIndex, pkg, createMockDeps(deps));
    adjacencyList = HashMap.set(adjacencyList, pkg, HashSet.fromIterable(deps));
    const pkgPath = pkg.replace("@beep/", "").replace("-", "/");
    tsconfigPaths = HashMap.set(tsconfigPaths, pkg, [
      `/repo/packages/${pkgPath}/tsconfig.build.json`,
    ] as A.NonEmptyReadonlyArray<string>);
    pkgDirMap = HashMap.set(pkgDirMap, pkg, `packages/${pkgPath}`);
  }

  return {
    depIndex,
    adjacencyList,
    tsconfigPaths,
    pkgDirMap,
    repoRoot: "/repo",
    workspacePackages,
  };
};

// -----------------------------------------------------------------------------
// Full Workflow Integration Tests
// -----------------------------------------------------------------------------

describe("Discovery + References Integration", () => {
  effect("computes complete reference set for slice package", () =>
    Effect.gen(function* () {
      const context = createRealisticContext();

      // Get deps for @beep/iam-server
      const deps = HashMap.get(context.depIndex, "@beep/iam-server");
      assertTrue(O.isSome(deps));

      // Extract direct workspace deps
      const directDeps = getDirectWorkspaceDeps(deps.value);
      strictEqual(HashSet.size(directDeps), 2); // iam-tables, iam-domain

      // Compute transitive closure
      const transitiveDeps = yield* computeTransitiveDeps("@beep/iam-server", directDeps, context.adjacencyList, false);

      // Should include: iam-tables, iam-domain, schema, types, utils
      assertTrue(HashSet.has(transitiveDeps, "@beep/iam-tables"));
      assertTrue(HashSet.has(transitiveDeps, "@beep/iam-domain"));
      assertTrue(HashSet.has(transitiveDeps, "@beep/schema"));
      assertTrue(HashSet.has(transitiveDeps, "@beep/types"));
      assertTrue(HashSet.has(transitiveDeps, "@beep/utils"));
    })
  );

  effect("no-hoist mode limits to direct deps only", () =>
    Effect.gen(function* () {
      const context = createRealisticContext();

      const deps = HashMap.get(context.depIndex, "@beep/iam-server");
      assertTrue(O.isSome(deps));

      const directDeps = getDirectWorkspaceDeps(deps.value);

      // With noHoist = true
      const transitiveDeps = yield* computeTransitiveDeps("@beep/iam-server", directDeps, context.adjacencyList, true);

      // Should ONLY include direct deps
      strictEqual(HashSet.size(transitiveDeps), 2);
      assertTrue(HashSet.has(transitiveDeps, "@beep/iam-tables"));
      assertTrue(HashSet.has(transitiveDeps, "@beep/iam-domain"));
    })
  );
});

describe("Package Filter Integration", () => {
  it("filters to single package", () => {
    const context = createRealisticContext();

    const filtered = filterPackages(context, "@beep/iam-server");

    strictEqual(A.length(filtered), 1);
    expect(filtered).toContain("@beep/iam-server");
  });

  it("returns all packages when no filter", () => {
    const context = createRealisticContext();

    const filtered = filterPackages(context);

    strictEqual(A.length(filtered), 10); // All packages in our mock
  });

  it("returns count matching filter results", () => {
    const context = createRealisticContext();

    const count = getPackageCount(context);
    const allPackages = filterPackages(context);

    strictEqual(count, A.length(allPackages));
  });
});

describe("Reference Generation Integration", () => {
  effect("generates topologically sorted references", () =>
    Effect.gen(function* () {
      const context = createRealisticContext();

      const deps = HashMap.get(context.depIndex, "@beep/iam-ui");
      assertTrue(O.isSome(deps));

      const directDeps = getDirectWorkspaceDeps(deps.value);
      const transitiveDeps = yield* computeTransitiveDeps("@beep/iam-ui", directDeps, context.adjacencyList, false);

      // Build package to path mapping
      const pkgToPathMap = buildPkgToPathMap(transitiveDeps, "@beep/iam-ui", context);

      // Verify mapping exists for transitive deps
      const hasSchemaPath = O.isSome(HashMap.get(pkgToPathMap, "@beep/schema"));
      const hasTypesPath = O.isSome(HashMap.get(pkgToPathMap, "@beep/types"));

      assertTrue(hasSchemaPath);
      assertTrue(hasTypesPath);
    })
  );

  it("generates correct refs for different config types", () => {
    const buildRefs = ["../../../packages/types/tsconfig.build.json", "../../../packages/schema/tsconfig.build.json"];
    const testkitRef = "../../../tooling/testkit/tsconfig.build.json";

    // Build config
    const buildResult = computeRefsForConfigType("build", buildRefs, testkitRef);
    deepStrictEqual([...buildResult], buildRefs);

    // Test config should prepend tsconfig.src.json and include testkit
    const testResult = computeRefsForConfigType("test", buildRefs, testkitRef);
    strictEqual(testResult[0], "tsconfig.src.json");
    assertTrue(A.some(testResult, (r) => r.includes("testkit")));
  });
});

describe("Reference Merging Integration", () => {
  it("preserves manual refs while adding computed", () => {
    const computedRefs = [
      "../../../packages/types/tsconfig.build.json",
      "../../../packages/schema/tsconfig.build.json",
    ];
    const existingManualRefs = [
      "../../../packages/types/tsconfig.build.json", // Duplicate
      "../../../packages/custom/tsconfig.build.json", // Manual addition
    ];

    const merged = mergeAndSortRefs(computedRefs, existingManualRefs);

    // Should have computed refs first, then manual extras
    strictEqual(merged[0], "../../../packages/types/tsconfig.build.json");
    strictEqual(merged[1], "../../../packages/schema/tsconfig.build.json");
    strictEqual(merged[2], "../../../packages/custom/tsconfig.build.json");
    strictEqual(A.length(merged), 3); // Deduplicated
  });
});

describe("Package.json Sync Integration", () => {
  it("detects no drift when deps are correctly sorted", () => {
    const current = {
      dependencies: { "@beep/types": "workspace:^", "@beep/utils": "workspace:^", effect: "catalog:" },
    };
    const expected = {
      dependencies: { "@beep/types": "workspace:^", "@beep/utils": "workspace:^", effect: "catalog:" },
    };

    const diff = computeAllDependenciesDiff(current, expected);

    strictEqual(diff.hasChanges, false);
  });

  it("detects drift when deps are out of order", () => {
    const current = {
      dependencies: { effect: "catalog:", "@beep/utils": "workspace:^", "@beep/types": "workspace:^" },
    };
    const expected = {
      dependencies: { "@beep/types": "workspace:^", "@beep/utils": "workspace:^", effect: "catalog:" },
    };

    const diff = computeAllDependenciesDiff(current, expected);

    strictEqual(diff.hasChanges, true);
    strictEqual(diff.dependencies.reordered, true);
  });

  it("merges deps preserving versions", () => {
    const current = {
      effect: "^3.14.0",
      "@beep/utils": "workspace:^",
      "@beep/types": "workspace:^",
    };
    const sorted = {
      workspace: ["@beep/types", "@beep/utils"],
      external: ["effect"],
    };

    const result = mergeSortedDependencies(current, sorted);

    // Order should be correct
    const keys = Object.keys(result);
    strictEqual(keys[0], "@beep/types");
    strictEqual(keys[1], "@beep/utils");
    strictEqual(keys[2], "effect");

    // Versions preserved
    strictEqual(result.effect, "^3.14.0");
    strictEqual(result["@beep/types"], "workspace:^");
  });
});

describe("End-to-End Workflow Simulation", () => {
  effect("complete sync workflow for single package", () =>
    Effect.gen(function* () {
      const context = createRealisticContext();
      const pkg = "@beep/iam-server";

      // Step 1: Get package deps
      const depsOption = HashMap.get(context.depIndex, pkg);
      assertTrue(O.isSome(depsOption));
      const deps = depsOption.value;

      // Step 2: Find build tsconfig
      const tsconfigPathsOption = HashMap.get(context.tsconfigPaths, pkg);
      assertTrue(O.isSome(tsconfigPathsOption));
      const buildConfig = findBuildConfig(tsconfigPathsOption.value);
      assertTrue(O.isSome(buildConfig));

      // Step 3: Get direct workspace deps
      const directDeps = getDirectWorkspaceDeps(deps);
      strictEqual(HashSet.size(directDeps), 2);

      // Step 4: Compute transitive deps
      const transitiveDeps = yield* computeTransitiveDeps(pkg, directDeps, context.adjacencyList, false);
      assertTrue(HashSet.size(transitiveDeps) >= 5); // At least 5 transitive deps

      // Step 5: Build reference paths
      const pkgToPathMap = buildPkgToPathMap(transitiveDeps, pkg, context);
      assertTrue(HashMap.size(pkgToPathMap) >= 5);

      // Workflow completes successfully
      strictEqual(true, true);
    })
  );
});
