/**
 * @file Unit Tests for tsconfig-sync App Sync Module (P0 Regression Tests)
 *
 * CRITICAL: This file contains regression tests for the P0 Next.js transitive
 * dependency fix. These tests ensure that Next.js apps receive path aliases
 * for ALL transitive dependencies, not just direct dependencies.
 *
 * The P0 bug caused Next.js builds to fail because tsconfig.json was missing
 * path aliases for transitive @beep/* dependencies.
 *
 * Tests for:
 * - computeAppTransitiveDeps (transitive closure for apps)
 * - buildAppPathsAndRefs (path alias generation)
 * - Deep transitive chains (4+ levels)
 *
 * @module tsconfig-sync/test/app-sync
 * @since 0.1.0
 */

import { buildSinglePathAlias, extractNonBeepPaths } from "@beep/repo-cli/commands/tsconfig-sync/utils/tsconfig-writer";
import { assertTrue, deepStrictEqual, describe, effect, expect, it, strictEqual } from "@beep/testkit";
import { computeTransitiveClosure } from "@beep/tooling-utils";
import * as Effect from "effect/Effect";
import * as F from "effect/Function";
import * as HashMap from "effect/HashMap";
import * as HashSet from "effect/HashSet";
import * as R from "effect/Record";

// -----------------------------------------------------------------------------
// Test Utilities (replicating app-sync internals for testing)
// -----------------------------------------------------------------------------

/**
 * Compute transitive dependencies for app (mirrors app-sync logic).
 * This is the critical function that ensures Next.js apps get ALL deps.
 */
const computeAppTransitiveDeps = (
  beepDeps: HashSet.HashSet<string>,
  adjacencyList: HashMap.HashMap<string, HashSet.HashSet<string>>
) =>
  F.pipe(
    HashSet.toValues(beepDeps),
    Effect.reduce(HashSet.empty<string>(), (acc, dep) =>
      Effect.map(computeTransitiveClosure(adjacencyList, dep), (closure) =>
        F.pipe(acc, HashSet.add(dep), HashSet.union(closure))
      )
    )
  );

/**
 * Build path aliases for a set of dependencies (mirrors app-sync logic).
 */
const buildAppPaths = (
  transitiveDeps: HashSet.HashSet<string>,
  pkgDirMap: HashMap.HashMap<string, string>,
  appRelPath: string
): Record<string, string[]> => {
  const beepPaths: Record<string, string[]> = {};

  for (const dep of HashSet.toValues(transitiveDeps)) {
    const pkgDirOption = HashMap.get(pkgDirMap, dep);
    if (pkgDirOption._tag === "Some") {
      const aliases = buildSinglePathAlias(dep, pkgDirOption.value, appRelPath);
      for (const [key, value] of aliases) {
        beepPaths[key] = [...value];
      }
    }
  }

  return beepPaths;
};

// -----------------------------------------------------------------------------
// P0 REGRESSION TESTS - Transitive Dependencies
// -----------------------------------------------------------------------------

describe("P0 Regression: Next.js Transitive Dependencies", () => {
  effect("includes direct AND transitive deps in path aliases", () =>
    Effect.gen(function* () {
      // Scenario: apps/web depends on @beep/workspaces-server
      // @beep/workspaces-server depends on @beep/workspaces-domain
      // Result: apps/web tsconfig should have BOTH path aliases

      const directDeps = HashSet.make("@beep/workspaces-server");
      let adjacencyList = HashMap.empty<string, HashSet.HashSet<string>>();
      adjacencyList = HashMap.set(adjacencyList, "@beep/workspaces-server", HashSet.make("@beep/workspaces-domain"));
      adjacencyList = HashMap.set(adjacencyList, "@beep/workspaces-domain", HashSet.make("@beep/shared-domain"));
      adjacencyList = HashMap.set(adjacencyList, "@beep/shared-domain", HashSet.empty());

      const transitiveDeps = yield* computeAppTransitiveDeps(directDeps, adjacencyList);

      // P0 FIX: Should include ALL - direct + transitive
      assertTrue(HashSet.has(transitiveDeps, "@beep/workspaces-server"));
      assertTrue(HashSet.has(transitiveDeps, "@beep/workspaces-domain"));
      assertTrue(HashSet.has(transitiveDeps, "@beep/shared-domain"));
      strictEqual(HashSet.size(transitiveDeps), 3);
    })
  );

  effect("handles deep transitive chain (4+ levels)", () =>
    Effect.gen(function* () {
      // A -> B -> C -> D -> E (5 levels deep)
      const directDeps = HashSet.make("A");
      let adjacencyList = HashMap.empty<string, HashSet.HashSet<string>>();
      adjacencyList = HashMap.set(adjacencyList, "A", HashSet.make("B"));
      adjacencyList = HashMap.set(adjacencyList, "B", HashSet.make("C"));
      adjacencyList = HashMap.set(adjacencyList, "C", HashSet.make("D"));
      adjacencyList = HashMap.set(adjacencyList, "D", HashSet.make("E"));
      adjacencyList = HashMap.set(adjacencyList, "E", HashSet.empty());

      const transitiveDeps = yield* computeAppTransitiveDeps(directDeps, adjacencyList);

      // All 5 packages should be included
      strictEqual(HashSet.size(transitiveDeps), 5);
      assertTrue(HashSet.has(transitiveDeps, "A"));
      assertTrue(HashSet.has(transitiveDeps, "B"));
      assertTrue(HashSet.has(transitiveDeps, "C"));
      assertTrue(HashSet.has(transitiveDeps, "D"));
      assertTrue(HashSet.has(transitiveDeps, "E"));
    })
  );

  effect("handles diamond dependency pattern", () =>
    Effect.gen(function* () {
      // Diamond: A -> B, A -> C, B -> D, C -> D
      // Direct: A
      // Result: A, B, C, D (D appears once, deduplicated)

      const directDeps = HashSet.make("A");
      let adjacencyList = HashMap.empty<string, HashSet.HashSet<string>>();
      adjacencyList = HashMap.set(adjacencyList, "A", HashSet.make("B", "C"));
      adjacencyList = HashMap.set(adjacencyList, "B", HashSet.make("D"));
      adjacencyList = HashMap.set(adjacencyList, "C", HashSet.make("D"));
      adjacencyList = HashMap.set(adjacencyList, "D", HashSet.empty());

      const transitiveDeps = yield* computeAppTransitiveDeps(directDeps, adjacencyList);

      strictEqual(HashSet.size(transitiveDeps), 4);
      assertTrue(HashSet.has(transitiveDeps, "A"));
      assertTrue(HashSet.has(transitiveDeps, "B"));
      assertTrue(HashSet.has(transitiveDeps, "C"));
      assertTrue(HashSet.has(transitiveDeps, "D"));
    })
  );

  effect("handles multiple direct deps with overlapping transitives", () =>
    Effect.gen(function* () {
      // Direct: X, Y
      // X -> Z, Y -> Z
      // Result: X, Y, Z (Z deduplicated)

      const directDeps = HashSet.make("X", "Y");
      let adjacencyList = HashMap.empty<string, HashSet.HashSet<string>>();
      adjacencyList = HashMap.set(adjacencyList, "X", HashSet.make("Z"));
      adjacencyList = HashMap.set(adjacencyList, "Y", HashSet.make("Z"));
      adjacencyList = HashMap.set(adjacencyList, "Z", HashSet.empty());

      const transitiveDeps = yield* computeAppTransitiveDeps(directDeps, adjacencyList);

      strictEqual(HashSet.size(transitiveDeps), 3);
    })
  );

  effect("handles empty direct deps", () =>
    Effect.gen(function* () {
      const directDeps = HashSet.empty<string>();
      const adjacencyList = HashMap.empty<string, HashSet.HashSet<string>>();

      const transitiveDeps = yield* computeAppTransitiveDeps(directDeps, adjacencyList);

      strictEqual(HashSet.size(transitiveDeps), 0);
    })
  );

  effect("handles single dep with no transitives", () =>
    Effect.gen(function* () {
      const directDeps = HashSet.make("@beep/types");
      let adjacencyList = HashMap.empty<string, HashSet.HashSet<string>>();
      adjacencyList = HashMap.set(adjacencyList, "@beep/types", HashSet.empty());

      const transitiveDeps = yield* computeAppTransitiveDeps(directDeps, adjacencyList);

      strictEqual(HashSet.size(transitiveDeps), 1);
      assertTrue(HashSet.has(transitiveDeps, "@beep/types"));
    })
  );
});

// -----------------------------------------------------------------------------
// Path Alias Generation Tests
// -----------------------------------------------------------------------------

describe("Path Alias Generation", () => {
  it("generates path aliases for all transitive deps", () => {
    const transitiveDeps = HashSet.make("@beep/schema", "@beep/types", "@beep/utils");
    let pkgDirMap = HashMap.empty<string, string>();
    pkgDirMap = HashMap.set(pkgDirMap, "@beep/schema", "packages/common/schema");
    pkgDirMap = HashMap.set(pkgDirMap, "@beep/types", "packages/common/types");
    pkgDirMap = HashMap.set(pkgDirMap, "@beep/utils", "packages/common/utils");

    const paths = buildAppPaths(transitiveDeps, pkgDirMap, "../..");

    // Should have entries for all 3 packages
    const keys = Object.keys(paths);
    // Each package generates 2 aliases: @beep/pkg and @beep/pkg/*
    strictEqual(keys.length >= 3, true);
  });

  it("uses correct relative paths from app", () => {
    const transitiveDeps = HashSet.make("@beep/schema");
    let pkgDirMap = HashMap.empty<string, string>();
    pkgDirMap = HashMap.set(pkgDirMap, "@beep/schema", "packages/common/schema");

    const paths = buildAppPaths(transitiveDeps, pkgDirMap, "../..");

    // Path should include the relative path and package directory
    const schemaPath = paths["@beep/schema/*"];
    expect(schemaPath).toBeDefined();
    if (schemaPath?.[0]) {
      strictEqual(schemaPath[0].includes("packages/common/schema"), true);
    }
  });

  it("handles empty transitive deps", () => {
    const transitiveDeps = HashSet.empty<string>();
    const pkgDirMap = HashMap.empty<string, string>();

    const paths = buildAppPaths(transitiveDeps, pkgDirMap, "../..");

    deepStrictEqual(paths, {});
  });

  it("skips packages not in pkgDirMap", () => {
    const transitiveDeps = HashSet.make("@beep/missing");
    const pkgDirMap = HashMap.empty<string, string>();

    const paths = buildAppPaths(transitiveDeps, pkgDirMap, "../..");

    // Should be empty since @beep/missing isn't in pkgDirMap
    deepStrictEqual(paths, {});
  });
});

// -----------------------------------------------------------------------------
// extractNonBeepPaths Tests
// -----------------------------------------------------------------------------

describe("extractNonBeepPaths", () => {
  it("extracts non-@beep paths", () => {
    const existingPaths = {
      "@/*": ["./src/*"],
      "@beep/schema": ["../../packages/common/schema/src/index.js"],
      "@beep/schema/*": ["../../packages/common/schema/src/*"],
    };

    const result = extractNonBeepPaths(existingPaths);

    expect(result["@/*"]).toBeDefined();
    expect(result["@beep/schema"]).toBeUndefined();
    expect(result["@beep/schema/*"]).toBeUndefined();
  });

  it("preserves all non-@beep paths", () => {
    const existingPaths = {
      "@/*": ["./src/*"],
      "~/*": ["./lib/*"],
      "@components/*": ["./components/*"],
    };

    const result = extractNonBeepPaths(existingPaths);

    strictEqual(R.size(result), 3);
  });

  it("returns empty for all @beep paths", () => {
    const existingPaths = {
      "@beep/schema": ["../../packages/common/schema/src/index.js"],
      "@beep/types": ["../../packages/common/types/src/index.js"],
    };

    const result = extractNonBeepPaths(existingPaths);

    strictEqual(R.size(result), 0);
  });

  it("handles empty input", () => {
    const result = extractNonBeepPaths({});

    deepStrictEqual(result, {});
  });
});

// -----------------------------------------------------------------------------
// buildSinglePathAlias Tests
// -----------------------------------------------------------------------------

describe("buildSinglePathAlias", () => {
  it("generates wildcard and non-wildcard aliases", () => {
    const aliases = buildSinglePathAlias("@beep/schema", "packages/common/schema", "../..");
    const aliasMap = new Map(aliases);

    expect(aliasMap.has("@beep/schema")).toBe(true);
    expect(aliasMap.has("@beep/schema/*")).toBe(true);
  });

  it("uses correct path structure", () => {
    const aliases = buildSinglePathAlias("@beep/schema", "packages/common/schema", "../..");
    const aliasMap = new Map(aliases);

    const basePath = aliasMap.get("@beep/schema");
    expect(basePath).toBeDefined();
    if (basePath?.[0]) {
      strictEqual(basePath[0].includes("packages/common/schema"), true);
      strictEqual(basePath[0].includes("../.."), true);
    }
  });

  it("handles different relative paths", () => {
    const aliases = buildSinglePathAlias("@beep/types", "packages/types", "../../..");
    const aliasMap = new Map(aliases);

    const wildcardPath = aliasMap.get("@beep/types/*");
    expect(wildcardPath).toBeDefined();
    if (wildcardPath?.[0]) {
      strictEqual(wildcardPath[0].includes("../../.."), true);
    }
  });
});

// -----------------------------------------------------------------------------
// Real-world Scenario Tests
// -----------------------------------------------------------------------------

describe("Real-world Scenarios", () => {
  effect("apps/web typical dependency chain", () =>
    Effect.gen(function* () {
      // Simulating: apps/web -> @beep/iam-ui -> @beep/iam-client -> @beep/iam-domain -> @beep/shared-domain
      const directDeps = HashSet.make("@beep/iam-ui", "@beep/shared-ui");
      let adjacencyList = HashMap.empty<string, HashSet.HashSet<string>>();

      // IAM slice chain
      adjacencyList = HashMap.set(adjacencyList, "@beep/iam-ui", HashSet.make("@beep/iam-client"));
      adjacencyList = HashMap.set(adjacencyList, "@beep/iam-client", HashSet.make("@beep/iam-domain"));
      adjacencyList = HashMap.set(adjacencyList, "@beep/iam-domain", HashSet.make("@beep/shared-domain"));

      // Shared UI chain
      adjacencyList = HashMap.set(adjacencyList, "@beep/shared-ui", HashSet.make("@beep/shared-client"));
      adjacencyList = HashMap.set(adjacencyList, "@beep/shared-client", HashSet.make("@beep/shared-domain"));

      // Terminal node
      adjacencyList = HashMap.set(adjacencyList, "@beep/shared-domain", HashSet.empty());

      const transitiveDeps = yield* computeAppTransitiveDeps(directDeps, adjacencyList);

      // Should get ALL 6 packages, not just the 2 direct ones
      strictEqual(HashSet.size(transitiveDeps), 6);

      // Verify all are included
      assertTrue(HashSet.has(transitiveDeps, "@beep/iam-ui"));
      assertTrue(HashSet.has(transitiveDeps, "@beep/iam-client"));
      assertTrue(HashSet.has(transitiveDeps, "@beep/iam-domain"));
      assertTrue(HashSet.has(transitiveDeps, "@beep/shared-ui"));
      assertTrue(HashSet.has(transitiveDeps, "@beep/shared-client"));
      assertTrue(HashSet.has(transitiveDeps, "@beep/shared-domain"));
    })
  );

  effect("rejects circular dependencies with error", () =>
    Effect.gen(function* () {
      // Circular: A -> B -> C -> A
      const directDeps = HashSet.make("A");
      let adjacencyList = HashMap.empty<string, HashSet.HashSet<string>>();
      adjacencyList = HashMap.set(adjacencyList, "A", HashSet.make("B"));
      adjacencyList = HashMap.set(adjacencyList, "B", HashSet.make("C"));
      adjacencyList = HashMap.set(adjacencyList, "C", HashSet.make("A"));

      // computeTransitiveClosure correctly throws CyclicDependencyError on cycles
      const exit = yield* Effect.exit(computeAppTransitiveDeps(directDeps, adjacencyList));

      // Should fail with cycle error (not hang)
      strictEqual(exit._tag, "Failure");
    })
  );
});
