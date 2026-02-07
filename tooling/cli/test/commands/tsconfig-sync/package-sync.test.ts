/**
 * @file Unit Tests for tsconfig-sync Package Sync Module
 *
 * Tests for package.json synchronization utilities including:
 * - computeDependencyDiff
 * - computeRecordDiff
 * - computeAllDependenciesDiff
 * - mergeSortedDependencies
 *
 * Note: Effect-based functions that require FileSystem are tested via integration.
 *
 * @module tsconfig-sync/test/package-sync
 * @since 0.1.0
 */

import {
  type AllPackageJsonDeps,
  computeAllDependenciesDiff,
  computeDependencyDiff,
  computeRecordDiff,
  mergeSortedDependencies,
  type PackageJsonDeps,
  type SortedDeps,
} from "@beep/repo-cli/commands/tsconfig-sync/utils/package-json-writer";
import { deepStrictEqual, describe, expect, it, strictEqual } from "@beep/testkit";

// -----------------------------------------------------------------------------
// computeDependencyDiff Tests
// -----------------------------------------------------------------------------

describe("computeDependencyDiff", () => {
  it("detects no changes when order matches", () => {
    const currentDeps: Record<string, string> = {
      "@beep/types": "workspace:^",
      "@beep/utils": "workspace:^",
      effect: "catalog:",
    };
    const sortedDeps: SortedDeps = {
      workspace: ["@beep/types", "@beep/utils"],
      external: ["effect"],
    };

    const result = computeDependencyDiff(currentDeps, sortedDeps);

    strictEqual(result.hasChanges, false);
  });

  it("detects changes when workspace deps are out of order", () => {
    const currentDeps: Record<string, string> = {
      "@beep/utils": "workspace:^",
      "@beep/types": "workspace:^",
      effect: "catalog:",
    };
    const sortedDeps: SortedDeps = {
      workspace: ["@beep/types", "@beep/utils"],
      external: ["effect"],
    };

    const result = computeDependencyDiff(currentDeps, sortedDeps);

    strictEqual(result.hasChanges, true);
  });

  it("detects changes when external deps come before workspace", () => {
    const currentDeps: Record<string, string> = {
      effect: "catalog:",
      "@beep/types": "workspace:^",
    };
    const sortedDeps: SortedDeps = {
      workspace: ["@beep/types"],
      external: ["effect"],
    };

    const result = computeDependencyDiff(currentDeps, sortedDeps);

    strictEqual(result.hasChanges, true);
  });

  it("detects changes when deps are missing", () => {
    const currentDeps: Record<string, string> = {
      "@beep/types": "workspace:^",
    };
    const sortedDeps: SortedDeps = {
      workspace: ["@beep/types", "@beep/utils"],
      external: ["effect"],
    };

    const result = computeDependencyDiff(currentDeps, sortedDeps);

    strictEqual(result.hasChanges, true);
  });

  it("handles empty dependencies", () => {
    const currentDeps: Record<string, string> = {};
    const sortedDeps: SortedDeps = {
      workspace: [],
      external: [],
    };

    const result = computeDependencyDiff(currentDeps, sortedDeps);

    strictEqual(result.hasChanges, false);
  });

  it("returns current and expected order in diff", () => {
    const currentDeps: Record<string, string> = {
      effect: "catalog:",
      "@beep/types": "workspace:^",
    };
    const sortedDeps: SortedDeps = {
      workspace: ["@beep/types"],
      external: ["effect"],
    };

    const result = computeDependencyDiff(currentDeps, sortedDeps);

    deepStrictEqual([...result.current], ["effect", "@beep/types"]);
    deepStrictEqual([...result.expected], ["@beep/types", "effect"]);
  });
});

// -----------------------------------------------------------------------------
// computeRecordDiff Tests
// -----------------------------------------------------------------------------

describe("computeRecordDiff", () => {
  it("detects no changes when both match exactly", () => {
    const current = { a: "1", b: "2" };
    const expected = { a: "1", b: "2" };

    const result = computeRecordDiff(current, expected);

    strictEqual(result.hasChanges, false);
    strictEqual(result.reordered, false);
  });

  it("detects reordering", () => {
    const current = { b: "2", a: "1" };
    const expected = { a: "1", b: "2" };

    const result = computeRecordDiff(current, expected);

    strictEqual(result.hasChanges, true);
    strictEqual(result.reordered, true);
  });

  it("detects value changes", () => {
    const current = { a: "1", b: "2" };
    const expected = { a: "1", b: "3" };

    const result = computeRecordDiff(current, expected);

    strictEqual(result.hasChanges, true);
  });

  it("handles empty records", () => {
    const result = computeRecordDiff({}, {});

    strictEqual(result.hasChanges, false);
    strictEqual(result.reordered, false);
  });

  it("detects missing keys", () => {
    const current = { a: "1" };
    const expected = { a: "1", b: "2" };

    const result = computeRecordDiff(current, expected);

    strictEqual(result.hasChanges, true);
  });

  it("detects extra keys", () => {
    const current = { a: "1", b: "2" };
    const expected = { a: "1" };

    const result = computeRecordDiff(current, expected);

    strictEqual(result.hasChanges, true);
  });
});

// -----------------------------------------------------------------------------
// computeAllDependenciesDiff Tests
// -----------------------------------------------------------------------------

describe("computeAllDependenciesDiff", () => {
  it("detects no changes when all match", () => {
    const current: PackageJsonDeps = {
      dependencies: { "@beep/types": "workspace:^" },
      devDependencies: { "@beep/testkit": "workspace:^" },
      peerDependencies: { effect: "^3.0.0" },
    };
    const expected: AllPackageJsonDeps = {
      dependencies: { "@beep/types": "workspace:^" },
      devDependencies: { "@beep/testkit": "workspace:^" },
      peerDependencies: { effect: "^3.0.0" },
    };

    const result = computeAllDependenciesDiff(current, expected);

    strictEqual(result.hasChanges, false);
    strictEqual(result.dependencies.hasChanges, false);
    strictEqual(result.devDependencies.hasChanges, false);
    strictEqual(result.peerDependencies.hasChanges, false);
  });

  it("detects changes in dependencies only", () => {
    const current: PackageJsonDeps = {
      dependencies: { b: "1", a: "2" },
      devDependencies: { c: "3" },
    };
    const expected: AllPackageJsonDeps = {
      dependencies: { a: "2", b: "1" },
      devDependencies: { c: "3" },
    };

    const result = computeAllDependenciesDiff(current, expected);

    strictEqual(result.hasChanges, true);
    strictEqual(result.dependencies.hasChanges, true);
    strictEqual(result.devDependencies.hasChanges, false);
  });

  it("detects changes in devDependencies only", () => {
    const current: PackageJsonDeps = {
      dependencies: { a: "1" },
      devDependencies: { c: "3", d: "4" },
    };
    const expected: AllPackageJsonDeps = {
      dependencies: { a: "1" },
      devDependencies: { d: "4", c: "3" },
    };

    const result = computeAllDependenciesDiff(current, expected);

    strictEqual(result.hasChanges, true);
    strictEqual(result.dependencies.hasChanges, false);
    strictEqual(result.devDependencies.hasChanges, true);
  });

  it("handles undefined fields", () => {
    const current: PackageJsonDeps = {
      dependencies: { a: "1" },
    };
    const expected: AllPackageJsonDeps = {
      dependencies: { a: "1" },
    };

    const result = computeAllDependenciesDiff(current, expected);

    strictEqual(result.hasChanges, false);
  });

  it("handles all undefined fields", () => {
    const current: PackageJsonDeps = {};
    const expected: AllPackageJsonDeps = {};

    const result = computeAllDependenciesDiff(current, expected);

    strictEqual(result.hasChanges, false);
  });
});

// -----------------------------------------------------------------------------
// mergeSortedDependencies Tests
// -----------------------------------------------------------------------------

describe("mergeSortedDependencies", () => {
  it("merges dependencies in sorted order", () => {
    const currentDeps: Record<string, string> = {
      effect: "catalog:",
      "@beep/utils": "workspace:^",
      "@beep/types": "workspace:^",
    };
    const sortedDeps: SortedDeps = {
      workspace: ["@beep/types", "@beep/utils"],
      external: ["effect"],
    };

    const result = mergeSortedDependencies(currentDeps, sortedDeps);
    const keys = Object.keys(result);

    deepStrictEqual(keys, ["@beep/types", "@beep/utils", "effect"]);
  });

  it("preserves version specifiers", () => {
    const currentDeps: Record<string, string> = {
      "@beep/types": "workspace:^",
      effect: "catalog:",
      zod: "^3.22.0",
    };
    const sortedDeps: SortedDeps = {
      workspace: ["@beep/types"],
      external: ["effect", "zod"],
    };

    const result = mergeSortedDependencies(currentDeps, sortedDeps);

    strictEqual(result["@beep/types"], "workspace:^");
    strictEqual(result.effect, "catalog:");
    strictEqual(result.zod, "^3.22.0");
  });

  it("omits dependencies not in current", () => {
    const currentDeps: Record<string, string> = {
      "@beep/types": "workspace:^",
    };
    const sortedDeps: SortedDeps = {
      workspace: ["@beep/types", "@beep/utils"],
      external: ["effect"],
    };

    const result = mergeSortedDependencies(currentDeps, sortedDeps);
    const keys = Object.keys(result);

    deepStrictEqual(keys, ["@beep/types"]);
    expect(result["@beep/utils"]).toBeUndefined();
    expect(result.effect).toBeUndefined();
  });

  it("handles empty inputs", () => {
    const currentDeps: Record<string, string> = {};
    const sortedDeps: SortedDeps = {
      workspace: [],
      external: [],
    };

    const result = mergeSortedDependencies(currentDeps, sortedDeps);

    deepStrictEqual(Object.keys(result), []);
  });

  it("puts workspace deps before external deps", () => {
    const currentDeps: Record<string, string> = {
      axios: "^1.0.0",
      "@beep/schema": "workspace:^",
      zod: "^3.0.0",
      "@beep/types": "workspace:^",
    };
    const sortedDeps: SortedDeps = {
      workspace: ["@beep/schema", "@beep/types"],
      external: ["axios", "zod"],
    };

    const result = mergeSortedDependencies(currentDeps, sortedDeps);
    const keys = Object.keys(result);

    // Workspace deps first, then external
    strictEqual(keys[0], "@beep/schema");
    strictEqual(keys[1], "@beep/types");
    strictEqual(keys[2], "axios");
    strictEqual(keys[3], "zod");
  });
});
