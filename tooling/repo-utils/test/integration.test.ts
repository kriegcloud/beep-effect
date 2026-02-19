/**
 * Integration tests that exercise @beep/repo-utils against the real
 * beep-effect2 monorepo on disk.
 *
 * These are intentionally loose assertions: they verify structural
 * invariants (non-empty results, expected keys) without hard-coding
 * counts that would break every time a workspace is added or removed.
 */

import * as NodeFileSystem from "@effect/platform-node/NodeFileSystem";
import * as NodePath from "@effect/platform-node/NodePath";
import { describe, expect, layer } from "@effect/vitest";
import { Effect, HashMap, Layer } from "effect";
import { buildRepoDependencyIndex } from "../src/DependencyIndex.js";
import { FsUtilsLive } from "../src/FsUtils.js";
import { findRepoRoot } from "../src/Root.js";
import { collectTsConfigPaths } from "../src/TsConfig.js";
import { collectUniqueNpmDependencies } from "../src/UniqueDeps.js";
import { resolveWorkspaceDirs } from "../src/Workspaces.js";

const PlatformLayer = Layer.mergeAll(NodeFileSystem.layer, NodePath.layer);
const TestLayer = FsUtilsLive.pipe(Layer.provideMerge(PlatformLayer));

layer(TestLayer)("integration (real monorepo)", (it) => {
  // ── findRepoRoot ─────────────────────────────────────────────────────
  describe("findRepoRoot", () => {
    it.effect("should find the beep-effect2 root directory", Effect.fn(function* () {
        const root = yield* findRepoRoot();
        expect(root).toMatch(/beep-effect2$/);
        // The root must contain the monorepo's root package.json
        expect(root.endsWith("/")).toBe(false);
      })
    );
  });

  // ── resolveWorkspaceDirs ─────────────────────────────────────────────
  describe("resolveWorkspaceDirs", () => {
    it.effect("should discover @beep/repo-cli and @beep/repo-utils", Effect.fn(function* () {
        const root = yield* findRepoRoot();
        const workspaces = yield* resolveWorkspaceDirs(root);

        expect(HashMap.has(workspaces, "@beep/repo-cli")).toBe(true);
        expect(HashMap.has(workspaces, "@beep/repo-utils")).toBe(true);

        // At least 2 workspaces (could be more as repo grows)
        expect(HashMap.size(workspaces)).toBeGreaterThanOrEqual(2);
      })
    );
  });

  // ── collectTsConfigPaths ─────────────────────────────────────────────
  describe("collectTsConfigPaths", () => {
    it.effect("should find tsconfig files in workspaces", Effect.fn(function* () {
        const root = yield* findRepoRoot();
        const configs = yield* collectTsConfigPaths(root);

        // The root (@beep/root) must have at least one tsconfig
        expect(HashMap.has(configs, "@beep/root")).toBe(true);

        // @beep/repo-utils should have at least one tsconfig
        expect(HashMap.has(configs, "@beep/repo-utils")).toBe(true);

        // Every entry should be a non-empty array of absolute paths
        for (const [_name, paths] of configs) {
          expect(paths.length).toBeGreaterThan(0);
          for (const p of paths) {
            expect(p.startsWith("/")).toBe(true);
            expect(p).toMatch(/tsconfig.*\.json$/);
          }
        }
      })
    );
  });

  // ── buildRepoDependencyIndex ─────────────────────────────────────────
  describe("buildRepoDependencyIndex", () => {
    it.effect("should build the dependency map for the monorepo", Effect.fn(function* () {
        const root = yield* findRepoRoot();
        const index = yield* buildRepoDependencyIndex(root);

        // Must contain root and at least @beep/repo-utils
        expect(HashMap.has(index, "@beep/root")).toBe(true);
        expect(HashMap.has(index, "@beep/repo-utils")).toBe(true);

        // Each entry must have the workspace/npm structure
        for (const [_name, deps] of index) {
          expect(deps).toHaveProperty("workspace");
          expect(deps).toHaveProperty("npm");
          expect(deps.workspace).toHaveProperty("dependencies");
          expect(deps.npm).toHaveProperty("dependencies");
          expect(deps.npm).toHaveProperty("devDependencies");
        }
      })
    );
  });

  // ── collectUniqueNpmDependencies ─────────────────────────────────────
  describe("collectUniqueNpmDependencies", () => {
    it.effect("should list all NPM deps across the monorepo", Effect.fn(function* () {
        const root = yield* findRepoRoot();
        const unique = yield* collectUniqueNpmDependencies(root);

        // "effect" must be present as a runtime dependency
        expect(unique.dependencies).toContain("effect");

        // Both arrays must be sorted
        const sortedDeps = [...unique.dependencies].sort();
        expect(unique.dependencies).toEqual(sortedDeps);

        const sortedDevDeps = [...unique.devDependencies].sort();
        expect(unique.devDependencies).toEqual(sortedDevDeps);

        // No duplicates within each array
        expect(new Set(unique.dependencies).size).toBe(unique.dependencies.length);
        expect(new Set(unique.devDependencies).size).toBe(unique.devDependencies.length);
      })
    );
  });
});
