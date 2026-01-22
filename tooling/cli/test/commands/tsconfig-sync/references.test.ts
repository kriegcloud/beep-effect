/**
 * @file Unit Tests for tsconfig-sync References Module
 *
 * Tests for reference computation utilities including:
 * - getDirectWorkspaceDeps
 * - computeTransitiveDeps
 * - buildPkgToPathMap
 * - buildSubsetAdjacency
 * - computeExpectedRefs
 * - normalizeExistingRefs
 * - mergeAndSortRefs
 * - computeRefsForConfigType
 *
 * @module tsconfig-sync/test/references
 * @since 1.0.0
 */

import {
  buildPkgToPathMap,
  buildSubsetAdjacency,
  computeExpectedRefs,
  computeRefsForConfigType,
  computeTransitiveDeps,
  getDirectWorkspaceDeps,
  mergeAndSortRefs,
  normalizeExistingRefs,
} from "@beep/repo-cli/commands/tsconfig-sync/references";
import type { RepoDepMapValueT, WorkspaceContext, WorkspacePkgKeyT } from "@beep/repo-cli/commands/tsconfig-sync/types";
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

const createMockDepsWithDevPeer = (
  deps: readonly WorkspacePkgKeyT[],
  devDeps: readonly WorkspacePkgKeyT[],
  peerDeps: readonly WorkspacePkgKeyT[]
): RepoDepMapValueT => ({
  dependencies: {
    workspace: workspaceSet(...deps),
    npm: HashSet.empty(),
  },
  devDependencies: {
    workspace: workspaceSet(...devDeps),
    npm: HashSet.empty(),
  },
  peerDependencies: {
    workspace: workspaceSet(...peerDeps),
    npm: HashSet.empty(),
  },
});

const createMockContext = (packages: Record<WorkspacePkgKeyT, readonly WorkspacePkgKeyT[]>): WorkspaceContext => {
  let depIndex = HashMap.empty<WorkspacePkgKeyT, RepoDepMapValueT>();
  let adjacencyList = HashMap.empty<string, HashSet.HashSet<string>>();
  let tsconfigPaths = HashMap.empty<string, A.NonEmptyReadonlyArray<string>>();
  let pkgDirMap = HashMap.empty<string, string>();
  const workspacePackages = HashSet.fromIterable(Object.keys(packages));

  for (const [pkg, deps] of Object.entries(packages) as [WorkspacePkgKeyT, readonly WorkspacePkgKeyT[]][]) {
    depIndex = HashMap.set(depIndex, pkg, createMockDeps(deps));
    adjacencyList = HashMap.set(adjacencyList, pkg, HashSet.fromIterable(deps));
    const pkgPath = pkg.replace("@beep/", "");
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
// getDirectWorkspaceDeps Tests
// -----------------------------------------------------------------------------

describe("getDirectWorkspaceDeps", () => {
  it("returns dependencies workspace deps", () => {
    const deps = createMockDeps(["@beep/types", "@beep/utils"]);

    const result = getDirectWorkspaceDeps(deps);

    expect(HashSet.has(result, "@beep/types")).toBe(true);
    expect(HashSet.has(result, "@beep/utils")).toBe(true);
  });

  it("combines all dependency types", () => {
    const deps = createMockDepsWithDevPeer(["@beep/types"], ["@beep/testkit"], ["@beep/shared"]);

    const result = getDirectWorkspaceDeps(deps);

    expect(HashSet.size(result)).toBe(3);
    expect(HashSet.has(result, "@beep/types")).toBe(true);
    expect(HashSet.has(result, "@beep/testkit")).toBe(true);
    expect(HashSet.has(result, "@beep/shared")).toBe(true);
  });

  it("returns empty set when no workspace deps", () => {
    const deps = createMockDeps([]);

    const result = getDirectWorkspaceDeps(deps);

    expect(HashSet.size(result)).toBe(0);
  });

  it("deduplicates across dependency types", () => {
    const deps = createMockDepsWithDevPeer(["@beep/types"], ["@beep/types"], []);

    const result = getDirectWorkspaceDeps(deps);

    expect(HashSet.size(result)).toBe(1);
  });
});

// -----------------------------------------------------------------------------
// computeTransitiveDeps Tests
// -----------------------------------------------------------------------------

describe("computeTransitiveDeps", () => {
  effect("returns direct deps when noHoist is true", () =>
    Effect.gen(function* () {
      const directDeps = HashSet.make("@beep/types");
      let adjacencyList = HashMap.empty<string, HashSet.HashSet<string>>();
      adjacencyList = HashMap.set(adjacencyList, "@beep/schema", HashSet.make("@beep/types"));
      adjacencyList = HashMap.set(adjacencyList, "@beep/types", HashSet.make("@beep/utils"));

      const result = yield* computeTransitiveDeps("@beep/schema", directDeps, adjacencyList, true);

      strictEqual(HashSet.size(result), 1);
      assertTrue(HashSet.has(result, "@beep/types"));
    })
  );

  effect("returns transitive deps when noHoist is false", () =>
    Effect.gen(function* () {
      const directDeps = HashSet.make("@beep/types");
      let adjacencyList = HashMap.empty<string, HashSet.HashSet<string>>();
      adjacencyList = HashMap.set(adjacencyList, "@beep/schema", HashSet.make("@beep/types"));
      adjacencyList = HashMap.set(adjacencyList, "@beep/types", HashSet.make("@beep/utils"));
      adjacencyList = HashMap.set(adjacencyList, "@beep/utils", HashSet.empty());

      const result = yield* computeTransitiveDeps("@beep/schema", directDeps, adjacencyList, false);

      // Should include types (direct) and utils (transitive)
      assertTrue(HashSet.has(result, "@beep/types"));
      assertTrue(HashSet.has(result, "@beep/utils"));
    })
  );

  effect("handles deep transitive chain", () =>
    Effect.gen(function* () {
      const directDeps = HashSet.make("A");
      let adjacencyList = HashMap.empty<string, HashSet.HashSet<string>>();
      adjacencyList = HashMap.set(adjacencyList, "pkg", HashSet.make("A"));
      adjacencyList = HashMap.set(adjacencyList, "A", HashSet.make("B"));
      adjacencyList = HashMap.set(adjacencyList, "B", HashSet.make("C"));
      adjacencyList = HashMap.set(adjacencyList, "C", HashSet.make("D"));
      adjacencyList = HashMap.set(adjacencyList, "D", HashSet.empty());

      const result = yield* computeTransitiveDeps("pkg", directDeps, adjacencyList, false);

      assertTrue(HashSet.has(result, "A"));
      assertTrue(HashSet.has(result, "B"));
      assertTrue(HashSet.has(result, "C"));
      assertTrue(HashSet.has(result, "D"));
    })
  );
});

// -----------------------------------------------------------------------------
// buildPkgToPathMap Tests
// -----------------------------------------------------------------------------

describe("buildPkgToPathMap", () => {
  it("maps packages to root-relative paths", () => {
    const transitiveDeps = HashSet.make("@beep/types");
    const context = createMockContext({
      "@beep/schema": ["@beep/types"],
      "@beep/types": [],
    });

    const result = buildPkgToPathMap(transitiveDeps, "@beep/schema", context);

    const typesPath = HashMap.get(result, "@beep/types");
    expect(O.isSome(typesPath)).toBe(true);
  });

  it("returns empty map when no tsconfig paths found", () => {
    const transitiveDeps = HashSet.make("@beep/nonexistent");
    const context = createMockContext({
      "@beep/schema": [],
    });

    const result = buildPkgToPathMap(transitiveDeps, "@beep/schema", context);

    expect(HashMap.size(result)).toBe(0);
  });

  it("handles multiple dependencies", () => {
    const transitiveDeps = HashSet.make("@beep/types", "@beep/utils");
    const context = createMockContext({
      "@beep/schema": ["@beep/types", "@beep/utils"],
      "@beep/types": [],
      "@beep/utils": [],
    });

    const result = buildPkgToPathMap(transitiveDeps, "@beep/schema", context);

    expect(HashMap.size(result)).toBe(2);
  });
});

// -----------------------------------------------------------------------------
// buildSubsetAdjacency Tests
// -----------------------------------------------------------------------------

describe("buildSubsetAdjacency", () => {
  it("filters adjacency to subset of deps", () => {
    const transitiveDeps = HashSet.make("@beep/types", "@beep/utils");
    let adjacencyList = HashMap.empty<string, HashSet.HashSet<string>>();
    adjacencyList = HashMap.set(adjacencyList, "@beep/types", HashSet.make("@beep/utils"));
    adjacencyList = HashMap.set(adjacencyList, "@beep/utils", HashSet.empty());
    adjacencyList = HashMap.set(adjacencyList, "@beep/other", HashSet.make("@beep/types")); // not in subset

    const result = buildSubsetAdjacency(transitiveDeps, adjacencyList);

    expect(HashMap.size(result)).toBe(2);
    expect(HashMap.has(result, "@beep/other")).toBe(false);
  });

  it("filters deps within nodes to subset only", () => {
    const transitiveDeps = HashSet.make("@beep/types");
    let adjacencyList = HashMap.empty<string, HashSet.HashSet<string>>();
    adjacencyList = HashMap.set(adjacencyList, "@beep/types", HashSet.make("@beep/utils", "@beep/other"));

    const result = buildSubsetAdjacency(transitiveDeps, adjacencyList);

    const typesDeps = HashMap.get(result, "@beep/types");
    expect(O.isSome(typesDeps)).toBe(true);
    if (O.isSome(typesDeps)) {
      // utils and other are filtered out because they're not in transitiveDeps
      expect(HashSet.size(typesDeps.value)).toBe(0);
    }
  });

  it("returns empty set for missing nodes", () => {
    const transitiveDeps = HashSet.make("@beep/missing");
    const adjacencyList = HashMap.empty<string, HashSet.HashSet<string>>();

    const result = buildSubsetAdjacency(transitiveDeps, adjacencyList);

    const missingDeps = HashMap.get(result, "@beep/missing");
    expect(O.isSome(missingDeps)).toBe(true);
    if (O.isSome(missingDeps)) {
      expect(HashSet.size(missingDeps.value)).toBe(0);
    }
  });
});

// -----------------------------------------------------------------------------
// computeExpectedRefs Tests
// -----------------------------------------------------------------------------

describe("computeExpectedRefs", () => {
  effect("returns refs in topological order", () =>
    Effect.gen(function* () {
      const transitiveDeps = HashSet.make("@beep/types", "@beep/utils");
      let adjacencyList = HashMap.empty<string, HashSet.HashSet<string>>();
      adjacencyList = HashMap.set(adjacencyList, "@beep/types", HashSet.make("@beep/utils"));
      adjacencyList = HashMap.set(adjacencyList, "@beep/utils", HashSet.empty());

      let pkgToPathMap = HashMap.empty<string, string>();
      pkgToPathMap = HashMap.set(pkgToPathMap, "@beep/types", "../../../packages/types/tsconfig.build.json");
      pkgToPathMap = HashMap.set(pkgToPathMap, "@beep/utils", "../../../packages/utils/tsconfig.build.json");

      const result = yield* computeExpectedRefs(transitiveDeps, adjacencyList, pkgToPathMap);

      // utils should come before types (topo order)
      strictEqual(A.length(result), 2);
      // First should be utils (no deps), then types (depends on utils)
      strictEqual(result[0], "../../../packages/utils/tsconfig.build.json");
      strictEqual(result[1], "../../../packages/types/tsconfig.build.json");
    })
  );

  effect("handles empty deps", () =>
    Effect.gen(function* () {
      const transitiveDeps = HashSet.empty<string>();
      const adjacencyList = HashMap.empty<string, HashSet.HashSet<string>>();
      const pkgToPathMap = HashMap.empty<string, string>();

      const result = yield* computeExpectedRefs(transitiveDeps, adjacencyList, pkgToPathMap);

      strictEqual(A.length(result), 0);
    })
  );
});

// -----------------------------------------------------------------------------
// normalizeExistingRefs Tests
// -----------------------------------------------------------------------------

describe("normalizeExistingRefs", () => {
  it("keeps root-relative refs for packages", () => {
    const context = createMockContext({
      "@beep/schema": ["@beep/types"],
      "@beep/types": [],
    });

    const existingRefs = ["../../../packages/types/tsconfig.build.json"];

    const result = normalizeExistingRefs(existingRefs, "packages/schema/tsconfig.build.json", context);

    expect(A.length(result)).toBe(1);
    expect(result[0]).toBe("../../../packages/types/tsconfig.build.json");
  });

  it("keeps tooling refs", () => {
    const context = createMockContext({
      "@beep/schema": [],
    });

    const existingRefs = ["../../../tooling/testkit/tsconfig.build.json"];

    const result = normalizeExistingRefs(existingRefs, "packages/schema/tsconfig.build.json", context);

    expect(A.length(result)).toBe(1);
  });

  it("filters invalid refs", () => {
    const context = createMockContext({
      "@beep/schema": [],
    });

    const existingRefs = ["../../../invalid/path/tsconfig.build.json"];

    const result = normalizeExistingRefs(existingRefs, "packages/schema/tsconfig.build.json", context);

    expect(A.length(result)).toBe(0);
  });
});

// -----------------------------------------------------------------------------
// mergeAndSortRefs Tests
// -----------------------------------------------------------------------------

describe("mergeAndSortRefs", () => {
  it("maintains expected refs order", () => {
    const expectedRefs = ["../../../a/tsconfig.build.json", "../../../b/tsconfig.build.json"];
    const normalizedExistingRefs = ["../../../b/tsconfig.build.json"];

    const result = mergeAndSortRefs(expectedRefs, normalizedExistingRefs);

    deepStrictEqual([...result], expectedRefs);
  });

  it("adds extra refs from existing at end", () => {
    const expectedRefs = ["../../../a/tsconfig.build.json"];
    const normalizedExistingRefs = ["../../../a/tsconfig.build.json", "../../../extra/tsconfig.build.json"];

    const result = mergeAndSortRefs(expectedRefs, normalizedExistingRefs);

    expect(A.length(result)).toBe(2);
    expect(result[0]).toBe("../../../a/tsconfig.build.json");
    expect(result[1]).toBe("../../../extra/tsconfig.build.json");
  });

  it("deduplicates refs", () => {
    const expectedRefs = ["../../../a/tsconfig.build.json"];
    const normalizedExistingRefs = ["../../../a/tsconfig.build.json"];

    const result = mergeAndSortRefs(expectedRefs, normalizedExistingRefs);

    expect(A.length(result)).toBe(1);
  });
});

// -----------------------------------------------------------------------------
// computeRefsForConfigType Tests
// -----------------------------------------------------------------------------

describe("computeRefsForConfigType", () => {
  it("returns build refs unchanged for build config", () => {
    const buildRefs = ["../../../packages/types/tsconfig.build.json"];
    const testkitRefPath = "../../../tooling/testkit/tsconfig.build.json";

    const result = computeRefsForConfigType("build", buildRefs, testkitRefPath);

    deepStrictEqual([...result], buildRefs);
  });

  it("converts to package root refs for src config", () => {
    const buildRefs = ["../../../packages/types/tsconfig.build.json"];
    const testkitRefPath = "../../../tooling/testkit/tsconfig.build.json";

    const result = computeRefsForConfigType("src", buildRefs, testkitRefPath);

    // Should remove /tsconfig.build.json
    expect(result[0]).toBe("../../../packages/types");
  });

  it("prepends tsconfig.src.json for test config", () => {
    const buildRefs = ["../../../packages/types/tsconfig.build.json"];
    const testkitRefPath = "../../../tooling/testkit/tsconfig.build.json";

    const result = computeRefsForConfigType("test", buildRefs, testkitRefPath);

    expect(result[0]).toBe("tsconfig.src.json");
  });

  it("includes testkit for test config", () => {
    const buildRefs = ["../../../packages/types/tsconfig.build.json"];
    const testkitRefPath = "../../../tooling/testkit/tsconfig.build.json";

    const result = computeRefsForConfigType("test", buildRefs, testkitRefPath);

    const hasTestkit = A.some(result, (r) => r.includes("testkit"));
    expect(hasTestkit).toBe(true);
  });

  it("does not duplicate testkit if already present", () => {
    const buildRefs = ["../../../tooling/testkit/tsconfig.build.json"];
    const testkitRefPath = "../../../tooling/testkit/tsconfig.build.json";

    const result = computeRefsForConfigType("test", buildRefs, testkitRefPath);

    const testkitCount = A.filter(result, (r) => r.includes("testkit")).length;
    expect(testkitCount).toBe(1);
  });
});
