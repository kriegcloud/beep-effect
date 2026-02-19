import * as path from "node:path";
import * as NodeFileSystem from "@effect/platform-node/NodeFileSystem";
import * as NodePath from "@effect/platform-node/NodePath";
import { describe, expect, layer } from "@effect/vitest";
import { Effect, HashMap, Layer, Option } from "effect";
import { buildRepoDependencyIndex } from "../src/DependencyIndex.js";
import { FsUtilsLive } from "../src/FsUtils.js";

const PlatformLayer = Layer.mergeAll(NodeFileSystem.layer, NodePath.layer);
const TestLayer = FsUtilsLive.pipe(Layer.provideMerge(PlatformLayer));

const MOCK_ROOT = path.resolve(__dirname, "fixtures/mock-monorepo");

layer(TestLayer)("DependencyIndex", (it) => {
  describe("buildRepoDependencyIndex", () => {
    it.effect("should include root and all workspace packages", () =>
      Effect.gen(function* () {
        const index = yield* buildRepoDependencyIndex(MOCK_ROOT);
        // Root + 3 packages = 4 entries
        expect(HashMap.size(index)).toBe(4);
        expect(HashMap.has(index, "@beep/root")).toBe(true);
        expect(HashMap.has(index, "@mock/pkg-a")).toBe(true);
        expect(HashMap.has(index, "@mock/pkg-b")).toBe(true);
        expect(HashMap.has(index, "@mock/pkg-c")).toBe(true);
      })
    );

    it.effect("should classify workspace deps for pkg-a", () =>
      Effect.gen(function* () {
        const index = yield* buildRepoDependencyIndex(MOCK_ROOT);
        const pkgADeps = HashMap.get(index, "@mock/pkg-a");
        expect(Option.isSome(pkgADeps)).toBe(true);
        if (Option.isSome(pkgADeps)) {
          const deps = pkgADeps.value;
          // @mock/pkg-b is a workspace dep
          expect(deps.workspace.dependencies).toHaveProperty("@mock/pkg-b");
          // effect is an npm dep
          expect(deps.npm.dependencies).toHaveProperty("effect");
        }
      })
    );

    it.effect("should classify workspace devDeps for pkg-b", () =>
      Effect.gen(function* () {
        const index = yield* buildRepoDependencyIndex(MOCK_ROOT);
        const pkgBDeps = HashMap.get(index, "@mock/pkg-b");
        expect(Option.isSome(pkgBDeps)).toBe(true);
        if (Option.isSome(pkgBDeps)) {
          const deps = pkgBDeps.value;
          // @mock/pkg-c is a workspace devDep
          expect(deps.workspace.devDependencies).toHaveProperty("@mock/pkg-c");
          // vitest is an npm devDep
          expect(deps.npm.devDependencies).toHaveProperty("vitest");
        }
      })
    );

    it.effect("should handle pkg-c with only npm deps", () =>
      Effect.gen(function* () {
        const index = yield* buildRepoDependencyIndex(MOCK_ROOT);
        const pkgCDeps = HashMap.get(index, "@mock/pkg-c");
        expect(Option.isSome(pkgCDeps)).toBe(true);
        if (Option.isSome(pkgCDeps)) {
          const deps = pkgCDeps.value;
          // No workspace deps
          expect(Object.keys(deps.workspace.dependencies)).toHaveLength(0);
          expect(Object.keys(deps.workspace.devDependencies)).toHaveLength(0);
          // zod is npm dep
          expect(deps.npm.dependencies).toHaveProperty("zod");
          // effect is an npm peerDep
          expect(deps.npm.peerDependencies).toHaveProperty("effect");
        }
      })
    );

    it.effect("should classify root package deps as npm", () =>
      Effect.gen(function* () {
        const index = yield* buildRepoDependencyIndex(MOCK_ROOT);
        const rootDeps = HashMap.get(index, "@beep/root");
        expect(Option.isSome(rootDeps)).toBe(true);
        if (Option.isSome(rootDeps)) {
          const deps = rootDeps.value;
          expect(deps.packageName).toBe("@beep/root");
          // Root has typescript as a dep and vitest as devDep, both npm
          expect(deps.npm.dependencies).toHaveProperty("typescript");
          expect(deps.npm.devDependencies).toHaveProperty("vitest");
        }
      })
    );
  });
});
