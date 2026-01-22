/**
 * @file Unit Tests for tsconfig-sync Discover Module
 *
 * Tests for workspace discovery utilities including:
 * - findBuildConfig
 * - buildAdjacencyList
 * - buildPkgDirMap
 * - filterPackages
 * - checkForCycles
 *
 * @module tsconfig-sync/test/discover
 * @since 1.0.0
 */

import {
  buildAdjacencyList,
  buildPkgDirMap,
  checkForCycles,
  filterPackages,
  findBuildConfig,
  getPackageCount,
  getPackageDeps,
  packageExists,
} from "@beep/repo-cli/commands/tsconfig-sync/discover";
import type { RepoDepMapValueT, WorkspaceContext, WorkspacePkgKeyT } from "@beep/repo-cli/commands/tsconfig-sync/types";
import { assertTrue, describe, effect, expect, it, strictEqual } from "@beep/testkit";
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

const createMockDepsWithAllTypes = (
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
    tsconfigPaths = HashMap.set(tsconfigPaths, pkg, [
      `/repo/packages/${pkg.replace("@beep/", "")}/tsconfig.build.json`,
    ] as A.NonEmptyReadonlyArray<string>);
    pkgDirMap = HashMap.set(pkgDirMap, pkg, `packages/${pkg.replace("@beep/", "")}`);
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
// findBuildConfig Tests
// -----------------------------------------------------------------------------

describe("findBuildConfig", () => {
  it("finds tsconfig.build.json in array", () => {
    const paths = [
      "/repo/packages/schema/tsconfig.json",
      "/repo/packages/schema/tsconfig.build.json",
      "/repo/packages/schema/tsconfig.test.json",
    ] as A.NonEmptyReadonlyArray<string>;

    const result = findBuildConfig(paths);

    expect(O.isSome(result)).toBe(true);
    if (O.isSome(result)) {
      expect(result.value).toBe("/repo/packages/schema/tsconfig.build.json");
    }
  });

  it("returns None when no build config exists", () => {
    const paths = [
      "/repo/packages/schema/tsconfig.json",
      "/repo/packages/schema/tsconfig.test.json",
    ] as A.NonEmptyReadonlyArray<string>;

    const result = findBuildConfig(paths);

    expect(O.isNone(result)).toBe(true);
  });

  it("handles single build config path", () => {
    const paths = ["/repo/packages/schema/tsconfig.build.json"] as A.NonEmptyReadonlyArray<string>;

    const result = findBuildConfig(paths);

    expect(O.isSome(result)).toBe(true);
  });
});

// -----------------------------------------------------------------------------
// buildAdjacencyList Tests
// -----------------------------------------------------------------------------

describe("buildAdjacencyList", () => {
  it("builds adjacency list from dependency index", () => {
    let depIndex = HashMap.empty<WorkspacePkgKeyT, RepoDepMapValueT>();
    depIndex = HashMap.set(depIndex, "@beep/schema", createMockDeps(["@beep/types"]));
    depIndex = HashMap.set(depIndex, "@beep/types", createMockDeps([]));

    const result = buildAdjacencyList(depIndex);

    expect(HashMap.size(result)).toBe(2);
    const schemaDeps = HashMap.get(result, "@beep/schema");
    expect(O.isSome(schemaDeps)).toBe(true);
    if (O.isSome(schemaDeps)) {
      expect(HashSet.has(schemaDeps.value, "@beep/types")).toBe(true);
    }
  });

  it("skips @beep/root package", () => {
    let depIndex = HashMap.empty<WorkspacePkgKeyT, RepoDepMapValueT>();
    depIndex = HashMap.set(depIndex, "@beep/root", createMockDeps(["@beep/schema"]));
    depIndex = HashMap.set(depIndex, "@beep/schema", createMockDeps([]));

    const result = buildAdjacencyList(depIndex);

    expect(HashMap.has(result, "@beep/root")).toBe(false);
    expect(HashMap.has(result, "@beep/schema")).toBe(true);
  });

  it("combines workspace deps from all dependency types", () => {
    const deps = createMockDepsWithAllTypes(["@beep/types"], ["@beep/testkit"], ["@beep/shared"]);

    let depIndex = HashMap.empty<WorkspacePkgKeyT, RepoDepMapValueT>();
    depIndex = HashMap.set(depIndex, "@beep/schema", deps);

    const result = buildAdjacencyList(depIndex);
    const schemaDeps = HashMap.get(result, "@beep/schema");

    expect(O.isSome(schemaDeps)).toBe(true);
    if (O.isSome(schemaDeps)) {
      expect(HashSet.has(schemaDeps.value, "@beep/types")).toBe(true);
      expect(HashSet.has(schemaDeps.value, "@beep/testkit")).toBe(true);
      expect(HashSet.has(schemaDeps.value, "@beep/shared")).toBe(true);
    }
  });

  it("handles empty dependency index", () => {
    const depIndex = HashMap.empty<WorkspacePkgKeyT, RepoDepMapValueT>();

    const result = buildAdjacencyList(depIndex);

    expect(HashMap.size(result)).toBe(0);
  });
});

// -----------------------------------------------------------------------------
// buildPkgDirMap Tests
// -----------------------------------------------------------------------------

describe("buildPkgDirMap", () => {
  it("maps packages to their directories", () => {
    let tsconfigPaths = HashMap.empty<string, A.NonEmptyReadonlyArray<string>>();
    tsconfigPaths = HashMap.set(tsconfigPaths, "@beep/schema", [
      "/repo/packages/common/schema/tsconfig.build.json",
    ] as A.NonEmptyReadonlyArray<string>);

    const result = buildPkgDirMap(tsconfigPaths, "/repo");

    const pkgDir = HashMap.get(result, "@beep/schema");
    expect(O.isSome(pkgDir)).toBe(true);
    if (O.isSome(pkgDir)) {
      expect(pkgDir.value).toBe("packages/common/schema");
    }
  });

  it("handles multiple tsconfig files per package", () => {
    let tsconfigPaths = HashMap.empty<string, A.NonEmptyReadonlyArray<string>>();
    tsconfigPaths = HashMap.set(tsconfigPaths, "@beep/schema", [
      "/repo/packages/common/schema/tsconfig.json",
      "/repo/packages/common/schema/tsconfig.build.json",
      "/repo/packages/common/schema/tsconfig.test.json",
    ] as A.NonEmptyReadonlyArray<string>);

    const result = buildPkgDirMap(tsconfigPaths, "/repo");

    const pkgDir = HashMap.get(result, "@beep/schema");
    expect(O.isSome(pkgDir)).toBe(true);
    if (O.isSome(pkgDir)) {
      expect(pkgDir.value).toBe("packages/common/schema");
    }
  });

  it("skips packages without build config", () => {
    let tsconfigPaths = HashMap.empty<string, A.NonEmptyReadonlyArray<string>>();
    tsconfigPaths = HashMap.set(tsconfigPaths, "@beep/schema", [
      "/repo/packages/common/schema/tsconfig.json",
    ] as A.NonEmptyReadonlyArray<string>);

    const result = buildPkgDirMap(tsconfigPaths, "/repo");

    expect(HashMap.has(result, "@beep/schema")).toBe(false);
  });
});

// -----------------------------------------------------------------------------
// filterPackages Tests
// -----------------------------------------------------------------------------

describe("filterPackages", () => {
  it("returns all packages when no filter", () => {
    const context = createMockContext({
      "@beep/schema": [],
      "@beep/types": [],
      "@beep/utils": [],
    });

    const result = filterPackages(context, undefined);

    expect(A.length(result)).toBe(3);
  });

  it("filters to specific package", () => {
    const context = createMockContext({
      "@beep/schema": [],
      "@beep/types": [],
      "@beep/utils": [],
    });

    const result = filterPackages(context, "@beep/schema");

    expect(A.length(result)).toBe(1);
    expect(result).toContain("@beep/schema");
  });

  it("returns empty when filter not found", () => {
    const context = createMockContext({
      "@beep/schema": [],
      "@beep/types": [],
    });

    const result = filterPackages(context, "@beep/nonexistent");

    expect(A.length(result)).toBe(0);
  });

  it("excludes @beep/root from results", () => {
    let context = createMockContext({
      "@beep/schema": [],
      "@beep/types": [],
    });
    // Add root package to depIndex
    context = {
      ...context,
      depIndex: HashMap.set(context.depIndex, "@beep/root", createMockDeps([])),
    };

    const result = filterPackages(context, undefined);

    expect(result).not.toContain("@beep/root");
  });
});

// -----------------------------------------------------------------------------
// getPackageCount Tests
// -----------------------------------------------------------------------------

describe("getPackageCount", () => {
  it("returns correct count", () => {
    const context = createMockContext({
      "@beep/schema": [],
      "@beep/types": [],
      "@beep/utils": [],
    });

    const result = getPackageCount(context);

    expect(result).toBe(3);
  });

  it("returns 0 for empty context", () => {
    const context = createMockContext({});

    const result = getPackageCount(context);

    expect(result).toBe(0);
  });
});

// -----------------------------------------------------------------------------
// packageExists Tests
// -----------------------------------------------------------------------------

describe("packageExists", () => {
  it("returns true for existing package", () => {
    const context = createMockContext({
      "@beep/schema": [],
    });

    const result = packageExists(context, "@beep/schema");

    expect(result).toBe(true);
  });

  it("returns false for non-existing package", () => {
    const context = createMockContext({
      "@beep/schema": [],
    });

    const result = packageExists(context, "@beep/nonexistent");

    expect(result).toBe(false);
  });
});

// -----------------------------------------------------------------------------
// getPackageDeps Tests
// -----------------------------------------------------------------------------

describe("getPackageDeps", () => {
  it("returns Some for existing package", () => {
    const context = createMockContext({
      "@beep/schema": ["@beep/types"],
    });

    const result = getPackageDeps(context, "@beep/schema");

    expect(O.isSome(result)).toBe(true);
  });

  it("returns None for non-existing package", () => {
    const context = createMockContext({
      "@beep/schema": [],
    });

    const result = getPackageDeps(context, "@beep/nonexistent");

    expect(O.isNone(result)).toBe(true);
  });
});

// -----------------------------------------------------------------------------
// checkForCycles Tests
// -----------------------------------------------------------------------------

describe("checkForCycles", () => {
  effect("returns empty array for acyclic graph", () =>
    Effect.gen(function* () {
      let adjacencyList = HashMap.empty<string, HashSet.HashSet<string>>();
      adjacencyList = HashMap.set(adjacencyList, "A", HashSet.make("B"));
      adjacencyList = HashMap.set(adjacencyList, "B", HashSet.make("C"));
      adjacencyList = HashMap.set(adjacencyList, "C", HashSet.empty());

      const cycles = yield* checkForCycles(adjacencyList);

      strictEqual(A.length(cycles), 0);
    })
  );

  effect("detects simple cycle", () =>
    Effect.gen(function* () {
      let adjacencyList = HashMap.empty<string, HashSet.HashSet<string>>();
      adjacencyList = HashMap.set(adjacencyList, "A", HashSet.make("B"));
      adjacencyList = HashMap.set(adjacencyList, "B", HashSet.make("A"));

      const cycles = yield* checkForCycles(adjacencyList);

      assertTrue(A.length(cycles) > 0);
    })
  );

  effect("detects longer cycle", () =>
    Effect.gen(function* () {
      let adjacencyList = HashMap.empty<string, HashSet.HashSet<string>>();
      adjacencyList = HashMap.set(adjacencyList, "A", HashSet.make("B"));
      adjacencyList = HashMap.set(adjacencyList, "B", HashSet.make("C"));
      adjacencyList = HashMap.set(adjacencyList, "C", HashSet.make("A")); // cycle back

      const cycles = yield* checkForCycles(adjacencyList);

      assertTrue(A.length(cycles) > 0);
    })
  );

  effect("handles empty graph", () =>
    Effect.gen(function* () {
      const adjacencyList = HashMap.empty<string, HashSet.HashSet<string>>();

      const cycles = yield* checkForCycles(adjacencyList);

      strictEqual(A.length(cycles), 0);
    })
  );

  effect("handles self-referential node", () =>
    Effect.gen(function* () {
      let adjacencyList = HashMap.empty<string, HashSet.HashSet<string>>();
      adjacencyList = HashMap.set(adjacencyList, "A", HashSet.make("A")); // self-cycle

      const cycles = yield* checkForCycles(adjacencyList);

      assertTrue(A.length(cycles) > 0);
    })
  );
});
