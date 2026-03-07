/**
 * @file Unit tests for peer-deps-sync helpers.
 * @module peer-deps-sync.test
 */

import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { ReferenceRepoNotFoundError } from "@beep/repo-cli/commands/peer-deps-sync/errors";
import {
  computeManagedSections,
  type DependencySortContext,
  filterWorkspacePackages,
  type WorkspacePackageContext,
} from "@beep/repo-cli/commands/peer-deps-sync/package-sync";
import { loadReferencePolicy, type ReferencePolicy } from "@beep/repo-cli/commands/peer-deps-sync/policy";
import { resolveConfigSyncPreCommitScope } from "@beep/repo-cli/commands/tsconfig-sync/pre-commit";
import { deepStrictEqual, describe, effect, expect, it, strictEqual } from "@beep/testkit";
import { FsUtilsLive, PackageJson } from "@beep/tooling-utils";
import * as Effect from "effect/Effect";
import * as HashMap from "effect/HashMap";
import * as HashSet from "effect/HashSet";

const makeReferencePolicy = (overrides?: Partial<ReferencePolicy>): ReferencePolicy => ({
  referencePath: "/reference/effect-v4",
  defaultReferencePath: "/reference/default-effect-v4",
  packageCount: 5,
  peerOnlyNames: new Set(["effect", "next", "react", "react-dom", "scheduler"]),
  optionalPeerNames: new Set<string>(),
  requiredPeerNames: new Set(["effect", "next", "react", "react-dom", "scheduler"]),
  peerCounts: new Map<string, number>(),
  ...overrides,
});

const makeSortContext = (workspacePackages: ReadonlyArray<string> = []): DependencySortContext => ({
  workspacePackages: HashSet.fromIterable(workspacePackages),
  adjacencyList: HashMap.empty(),
  rootSpecifiers: new Map([
    ["effect", "catalog:"],
    ["next", "catalog:"],
    ["react", "catalog:"],
    ["react-dom", "catalog:"],
    ["scheduler", "catalog:"],
  ]),
});

const makeWorkspacePackage = (name: string, relativePackageJsonPath: string): WorkspacePackageContext => ({
  name,
  packageDir: join("/repo", relativePackageJsonPath.replace(/\/package\.json$/, "")),
  packageJsonPath: join("/repo", relativePackageJsonPath),
  relativePackageJsonPath,
  manifest: new PackageJson({ name }),
});

describe("peer-deps-sync policy classification", () => {
  it("enforces no overlap between dependencies and peerDependencies", () => {
    const result = computeManagedSections(
      {
        dependencies: {
          "@beep/schema": "workspace:^",
          effect: "catalog:",
          react: "catalog:",
        },
        devDependencies: {},
        peerDependencies: {
          "@beep/schema": "workspace:^",
          effect: "catalog:",
          react: "catalog:",
        },
        peerDependenciesMeta: {},
      },
      "framework-adapter",
      {
        sourceImports: new Set(["effect", "react"]),
        localImports: new Set(["effect", "react"]),
      },
      makeReferencePolicy(),
      makeSortContext(["@beep/schema"])
    );

    deepStrictEqual(result.dependencies, {
      "@beep/schema": "workspace:^",
    });
    deepStrictEqual(result.peerDependencies, {
      effect: "catalog:",
      react: "catalog:",
    });
    deepStrictEqual(result.devDependencies, {
      effect: "catalog:",
      react: "catalog:",
    });
  });

  it("adds optional peer metadata for reference-driven optional peers", () => {
    const result = computeManagedSections(
      {
        dependencies: {
          "@opentelemetry/sdk-logs": "^2.5.0",
        },
        devDependencies: {},
        peerDependencies: {},
        peerDependenciesMeta: {},
      },
      "internal-runtime",
      {
        sourceImports: new Set<string>(),
        localImports: new Set(["@opentelemetry/sdk-logs"]),
      },
      makeReferencePolicy({
        optionalPeerNames: new Set(["@opentelemetry/sdk-logs"]),
      }),
      makeSortContext()
    );

    deepStrictEqual(result.peerDependencies, {
      "@opentelemetry/sdk-logs": "^2.5.0",
    });
    deepStrictEqual(result.peerDependenciesMeta, {
      "@opentelemetry/sdk-logs": { optional: true },
    });
    deepStrictEqual(result.devDependencies, {
      "@opentelemetry/sdk-logs": "^2.5.0",
    });
    expect(result.dependencies).toBeUndefined();
  });

  it("duplicates locally used effect peers into devDependencies", () => {
    const result = computeManagedSections(
      {
        dependencies: {},
        devDependencies: {},
        peerDependencies: {
          effect: "catalog:",
        },
        peerDependenciesMeta: {},
      },
      "internal-runtime",
      {
        sourceImports: new Set(["effect"]),
        localImports: new Set(["effect"]),
      },
      makeReferencePolicy(),
      makeSortContext()
    );

    deepStrictEqual(result.peerDependencies, {
      effect: "catalog:",
    });
    deepStrictEqual(result.devDependencies, {
      effect: "catalog:",
    });
  });

  it("adds missing peer entries for policy-required source imports", () => {
    const result = computeManagedSections(
      {
        dependencies: {},
        devDependencies: {},
        peerDependencies: {},
        peerDependenciesMeta: {},
      },
      "framework-adapter",
      {
        sourceImports: new Set(["effect", "react"]),
        localImports: new Set(["effect", "react"]),
      },
      makeReferencePolicy(),
      makeSortContext()
    );

    deepStrictEqual(result.peerDependencies, {
      effect: "catalog:",
      react: "catalog:",
    });
    deepStrictEqual(result.devDependencies, {
      effect: "catalog:",
      react: "catalog:",
    });
    expect(result.dependencies).toBeUndefined();
  });
});

describe("peer-deps-sync package selection", () => {
  it("supports --filter package selection", () => {
    const packages = [
      makeWorkspacePackage("@beep/foo", "packages/common/foo/package.json"),
      makeWorkspacePackage("@beep/bar", "packages/common/bar/package.json"),
    ];

    const filtered = filterWorkspacePackages(packages, { filter: "@beep/bar" });

    strictEqual(filtered.length, 1);
    strictEqual(filtered[0]?.name, "@beep/bar");
  });
});

describe("peer-deps-sync pre-commit scoping", () => {
  const workspacePackages = [
    makeWorkspacePackage("@beep/foo", "packages/common/foo/package.json"),
    makeWorkspacePackage("@beep/bar", "packages/common/bar/package.json"),
  ];
  const workspaceEntries = workspacePackages.map((pkg) => ({
    name: pkg.name,
    relativeDir: pkg.relativePackageJsonPath.replace(/\/package\.json$/, ""),
  }));

  it("scopes to staged package manifests when only manifests changed", () => {
    const scope = resolveConfigSyncPreCommitScope(
      ["packages/common/foo/package.json", "README.md"],
      workspaceEntries,
      workspaceEntries,
      []
    );

    strictEqual(scope.mode, "subset");
    deepStrictEqual(Array.from(scope.manifestPackageNames), ["@beep/foo"]);
  });

  it("falls back to a full scan when policy code changes are staged", () => {
    const scope = resolveConfigSyncPreCommitScope(
      ["tooling/cli/src/commands/peer-deps-sync/handler.ts", "packages/common/foo/package.json"],
      workspaceEntries,
      workspaceEntries,
      []
    );

    strictEqual(scope.mode, "full");
    deepStrictEqual(Array.from(scope.manifestPackageNames), ["@beep/foo", "@beep/bar"]);
  });

  it("does not schedule manifest work for package tsconfig-only changes", () => {
    const scope = resolveConfigSyncPreCommitScope(
      ["packages/common/foo/tsconfig.build.json"],
      workspaceEntries,
      workspaceEntries,
      []
    );

    strictEqual(scope.mode, "subset");
    deepStrictEqual(Array.from(scope.manifestPackageNames), []);
    deepStrictEqual(Array.from(scope.packageNames), ["@beep/foo"]);
  });
});

describe("peer-deps-sync reference policy loading", () => {
  effect("fails clearly when the reference repo path is missing", () =>
    Effect.gen(function* () {
      const repoRoot = yield* Effect.promise(() => mkdtemp(join(tmpdir(), "peer-deps-sync-missing-ref-")));
      const previousOverride = process.env.BEEP_EFFECT_V4_PATH;
      process.env.BEEP_EFFECT_V4_PATH = join(repoRoot, "missing-effect-v4");

      try {
        const result = yield* loadReferencePolicy(repoRoot).pipe(Effect.either, Effect.provide(FsUtilsLive));
        expect(result._tag).toBe("Left");
        if (result._tag === "Left") {
          expect(result.left).toBeInstanceOf(ReferenceRepoNotFoundError);
          expect(result.left._tag.endsWith("ReferenceRepoNotFoundError")).toBe(true);
          expect(result.left.referencePath).toContain("missing-effect-v4");
        }
      } finally {
        if (previousOverride === undefined) {
          delete process.env.BEEP_EFFECT_V4_PATH;
        } else {
          process.env.BEEP_EFFECT_V4_PATH = previousOverride;
        }
        yield* Effect.promise(() => rm(repoRoot, { recursive: true, force: true }));
      }
    })
  );
});
