import * as path from "node:path";
import * as NodeFileSystem from "@effect/platform-node/NodeFileSystem";
import * as NodePath from "@effect/platform-node/NodePath";
import { describe, expect, layer } from "@effect/vitest";
import { Effect, Layer } from "effect";
import { FsUtilsLive } from "../src/FsUtils.js";
import { collectUniqueNpmDependencies } from "../src/UniqueDeps.js";

const PlatformLayer = Layer.mergeAll(NodeFileSystem.layer, NodePath.layer);
const TestLayer = FsUtilsLive.pipe(Layer.provideMerge(PlatformLayer));

const MOCK_ROOT = path.resolve(__dirname, "fixtures/mock-monorepo");

layer(TestLayer)("UniqueDeps", (it) => {
  describe("collectUniqueNpmDependencies", () => {
    it.effect("should collect all unique runtime npm dependencies", () =>
      Effect.gen(function* () {
        const result = yield* collectUniqueNpmDependencies(MOCK_ROOT);
        // From our mock monorepo:
        // Root: dependencies = { typescript }
        // pkg-a: dependencies = { effect }
        // pkg-b: dependencies = { effect }
        // pkg-c: dependencies = { zod }, peerDependencies = { effect }
        // Unique: effect, typescript, zod (sorted)
        expect(result.dependencies).toContain("effect");
        expect(result.dependencies).toContain("typescript");
        expect(result.dependencies).toContain("zod");
      })
    );

    it.effect("should collect all unique dev npm dependencies", () =>
      Effect.gen(function* () {
        const result = yield* collectUniqueNpmDependencies(MOCK_ROOT);
        // Root: devDependencies = { vitest }
        // pkg-a: devDependencies = { @types/node }
        // pkg-b: devDependencies = { vitest }
        // pkg-c: no devDependencies
        // Unique: @types/node, vitest (sorted)
        expect(result.devDependencies).toContain("@types/node");
        expect(result.devDependencies).toContain("vitest");
      })
    );

    it.effect("should deduplicate dependencies that appear in multiple packages", () =>
      Effect.gen(function* () {
        const result = yield* collectUniqueNpmDependencies(MOCK_ROOT);
        // "effect" appears in pkg-a deps, pkg-b deps, and pkg-c peerDeps
        // but should only appear once
        const effectCount = result.dependencies.filter((d) => d === "effect").length;
        expect(effectCount).toBe(1);

        // "vitest" appears in root and pkg-b devDeps
        const vitestCount = result.devDependencies.filter((d) => d === "vitest").length;
        expect(vitestCount).toBe(1);
      })
    );

    it.effect("should return sorted arrays", () =>
      Effect.gen(function* () {
        const result = yield* collectUniqueNpmDependencies(MOCK_ROOT);
        const sortedDeps = [...result.dependencies].sort();
        const sortedDevDeps = [...result.devDependencies].sort();
        expect(result.dependencies).toEqual(sortedDeps);
        expect(result.devDependencies).toEqual(sortedDevDeps);
      })
    );

    it.effect("should not include workspace package names in results", () =>
      Effect.gen(function* () {
        const result = yield* collectUniqueNpmDependencies(MOCK_ROOT);
        expect(result.dependencies).not.toContain("@mock/pkg-a");
        expect(result.dependencies).not.toContain("@mock/pkg-b");
        expect(result.dependencies).not.toContain("@mock/pkg-c");
        expect(result.devDependencies).not.toContain("@mock/pkg-a");
        expect(result.devDependencies).not.toContain("@mock/pkg-b");
        expect(result.devDependencies).not.toContain("@mock/pkg-c");
      })
    );

    it.effect("should include peer dependencies as runtime dependencies", () =>
      Effect.gen(function* () {
        const result = yield* collectUniqueNpmDependencies(MOCK_ROOT);
        // pkg-c has effect as peerDependency, should appear in runtime deps
        expect(result.dependencies).toContain("effect");
      })
    );
  });
});
