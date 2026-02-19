/**
 * @file Unit Tests for tsconfig-sync Utilities
 *
 * Tests for tsconfig-writer and package-json-writer utilities.
 *
 * @module tsconfig-sync/test/utils
 * @since 0.1.0
 */

import {
  computeDependencyDiff,
  computeReferenceDiff,
  mergeSortedDependencies,
  type SortedDeps,
  type TsconfigReference,
} from "@beep/repo-cli/commands/tsconfig-sync/utils";
import { describe, expect, it } from "@beep/testkit";
import * as A from "effect/Array";

// -----------------------------------------------------------------------------
// computeReferenceDiff Tests
// -----------------------------------------------------------------------------

describe("computeReferenceDiff", () => {
  it("detects no changes when current matches expected", () => {
    const currentRefs: readonly TsconfigReference[] = [
      { path: "../../iam/domain/tsconfig.build.json" },
      { path: "../../iam/tables/tsconfig.build.json" },
    ];
    const expectedRefs = ["../../iam/domain/tsconfig.build.json", "../../iam/tables/tsconfig.build.json"];

    const diff = computeReferenceDiff(currentRefs, expectedRefs);

    expect(diff.hasChanges).toBe(false);
    expect(A.length(diff.toAdd)).toBe(0);
    expect(A.length(diff.toRemove)).toBe(0);
  });

  it("detects references to add", () => {
    const currentRefs: readonly TsconfigReference[] = [{ path: "../../iam/domain/tsconfig.build.json" }];
    const expectedRefs = ["../../iam/domain/tsconfig.build.json", "../../iam/tables/tsconfig.build.json"];

    const diff = computeReferenceDiff(currentRefs, expectedRefs);

    expect(diff.hasChanges).toBe(true);
    expect(A.length(diff.toAdd)).toBe(1);
    expect(diff.toAdd).toContain("../../iam/tables/tsconfig.build.json");
    expect(A.length(diff.toRemove)).toBe(0);
  });

  it("detects references to remove", () => {
    const currentRefs: readonly TsconfigReference[] = [
      { path: "../../iam/domain/tsconfig.build.json" },
      { path: "../../iam/tables/tsconfig.build.json" },
      { path: "../../old/package/tsconfig.build.json" },
    ];
    const expectedRefs = ["../../iam/domain/tsconfig.build.json", "../../iam/tables/tsconfig.build.json"];

    const diff = computeReferenceDiff(currentRefs, expectedRefs);

    expect(diff.hasChanges).toBe(true);
    expect(A.length(diff.toAdd)).toBe(0);
    expect(A.length(diff.toRemove)).toBe(1);
    expect(diff.toRemove).toContain("../../old/package/tsconfig.build.json");
  });

  it("detects both additions and removals", () => {
    const currentRefs: readonly TsconfigReference[] = [
      { path: "../../iam/domain/tsconfig.build.json" },
      { path: "../../old/package/tsconfig.build.json" },
    ];
    const expectedRefs = ["../../iam/domain/tsconfig.build.json", "../../iam/tables/tsconfig.build.json"];

    const diff = computeReferenceDiff(currentRefs, expectedRefs);

    expect(diff.hasChanges).toBe(true);
    expect(A.length(diff.toAdd)).toBe(1);
    expect(diff.toAdd).toContain("../../iam/tables/tsconfig.build.json");
    expect(A.length(diff.toRemove)).toBe(1);
    expect(diff.toRemove).toContain("../../old/package/tsconfig.build.json");
  });

  it("handles empty current references", () => {
    const currentRefs: readonly TsconfigReference[] = [];
    const expectedRefs = ["../../iam/domain/tsconfig.build.json", "../../iam/tables/tsconfig.build.json"];

    const diff = computeReferenceDiff(currentRefs, expectedRefs);

    expect(diff.hasChanges).toBe(true);
    expect(A.length(diff.toAdd)).toBe(2);
    expect(A.length(diff.toRemove)).toBe(0);
  });

  it("handles empty expected references", () => {
    const currentRefs: readonly TsconfigReference[] = [
      { path: "../../iam/domain/tsconfig.build.json" },
      { path: "../../iam/tables/tsconfig.build.json" },
    ];
    const expectedRefs: string[] = [];

    const diff = computeReferenceDiff(currentRefs, expectedRefs);

    expect(diff.hasChanges).toBe(true);
    expect(A.length(diff.toAdd)).toBe(0);
    expect(A.length(diff.toRemove)).toBe(2);
  });

  it("handles both empty", () => {
    const currentRefs: readonly TsconfigReference[] = [];
    const expectedRefs: string[] = [];

    const diff = computeReferenceDiff(currentRefs, expectedRefs);

    expect(diff.hasChanges).toBe(false);
    expect(A.length(diff.toAdd)).toBe(0);
    expect(A.length(diff.toRemove)).toBe(0);
  });
});

// -----------------------------------------------------------------------------
// computeDependencyDiff Tests
// -----------------------------------------------------------------------------

describe("computeDependencyDiff", () => {
  it("detects no changes when order matches", () => {
    const currentDeps: Record<string, string> = {
      "@beep/iam-domain": "workspace:^",
      "@beep/schema": "workspace:^",
      effect: "catalog:",
    };
    const sortedDeps: SortedDeps = {
      workspace: ["@beep/iam-domain", "@beep/schema"],
      external: ["effect"],
    };

    const diff = computeDependencyDiff(currentDeps, sortedDeps);

    expect(diff.hasChanges).toBe(false);
  });

  it("detects order changes", () => {
    const currentDeps: Record<string, string> = {
      effect: "catalog:",
      "@beep/schema": "workspace:^",
      "@beep/iam-domain": "workspace:^",
    };
    const sortedDeps: SortedDeps = {
      workspace: ["@beep/iam-domain", "@beep/schema"],
      external: ["effect"],
    };

    const diff = computeDependencyDiff(currentDeps, sortedDeps);

    expect(diff.hasChanges).toBe(true);
  });

  it("handles empty dependencies", () => {
    const currentDeps: Record<string, string> = {};
    const sortedDeps: SortedDeps = {
      workspace: [],
      external: [],
    };

    const diff = computeDependencyDiff(currentDeps, sortedDeps);

    expect(diff.hasChanges).toBe(false);
  });

  it("detects missing dependencies", () => {
    const currentDeps: Record<string, string> = {
      "@beep/iam-domain": "workspace:^",
    };
    const sortedDeps: SortedDeps = {
      workspace: ["@beep/iam-domain", "@beep/schema"],
      external: ["effect"],
    };

    const diff = computeDependencyDiff(currentDeps, sortedDeps);

    expect(diff.hasChanges).toBe(true);
  });
});

// -----------------------------------------------------------------------------
// mergeSortedDependencies Tests
// -----------------------------------------------------------------------------

describe("mergeSortedDependencies", () => {
  it("merges dependencies in sorted order", () => {
    const currentDeps: Record<string, string> = {
      effect: "catalog:",
      "@beep/schema": "workspace:^",
      "@beep/iam-domain": "workspace:^",
    };
    const sortedDeps: SortedDeps = {
      workspace: ["@beep/iam-domain", "@beep/schema"],
      external: ["effect"],
    };

    const result = mergeSortedDependencies(currentDeps, sortedDeps);
    const keys = Object.keys(result);

    expect(keys).toEqual(["@beep/iam-domain", "@beep/schema", "effect"]);
    expect(result["@beep/iam-domain"]).toBe("workspace:^");
    expect(result["@beep/schema"]).toBe("workspace:^");
    expect(result.effect).toBe("catalog:");
  });

  it("preserves version specifiers", () => {
    const currentDeps: Record<string, string> = {
      "@beep/iam-domain": "workspace:^",
      effect: "^3.0.0",
      zod: "^3.22.0",
    };
    const sortedDeps: SortedDeps = {
      workspace: ["@beep/iam-domain"],
      external: ["effect", "zod"],
    };

    const result = mergeSortedDependencies(currentDeps, sortedDeps);

    expect(result["@beep/iam-domain"]).toBe("workspace:^");
    expect(result.effect).toBe("^3.0.0");
    expect(result.zod).toBe("^3.22.0");
  });

  it("omits dependencies not in current", () => {
    const currentDeps: Record<string, string> = {
      "@beep/iam-domain": "workspace:^",
    };
    const sortedDeps: SortedDeps = {
      workspace: ["@beep/iam-domain", "@beep/schema"],
      external: ["effect"],
    };

    const result = mergeSortedDependencies(currentDeps, sortedDeps);
    const keys = Object.keys(result);

    expect(keys).toEqual(["@beep/iam-domain"]);
    expect(result["@beep/schema"]).toBeUndefined();
    expect(result.effect).toBeUndefined();
  });

  it("handles empty inputs", () => {
    const currentDeps: Record<string, string> = {};
    const sortedDeps: SortedDeps = {
      workspace: [],
      external: [],
    };

    const result = mergeSortedDependencies(currentDeps, sortedDeps);

    expect(Object.keys(result)).toEqual([]);
  });
});
