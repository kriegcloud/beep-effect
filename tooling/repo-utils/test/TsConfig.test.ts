import * as path from "node:path";
import * as NodeFileSystem from "@effect/platform-node/NodeFileSystem";
import * as NodePath from "@effect/platform-node/NodePath";
import { describe, expect, layer } from "@effect/vitest";
import { Effect, HashMap, Layer, Option } from "effect";
import { FsUtilsLive } from "../src/FsUtils.js";
import { collectTsConfigPaths } from "../src/TsConfig.js";

const PlatformLayer = Layer.mergeAll(NodeFileSystem.layer, NodePath.layer);
const TestLayer = FsUtilsLive.pipe(Layer.provideMerge(PlatformLayer));

const MOCK_ROOT = path.resolve(__dirname, "fixtures/mock-monorepo");

layer(TestLayer)("TsConfig", (it) => {
  describe("collectTsConfigPaths", () => {
    it.effect(
      "should collect tsconfig files for root and workspaces",
      Effect.fn(function* () {
        const configs = yield* collectTsConfigPaths(MOCK_ROOT);
        // Root should have tsconfig.json and tsconfig.build.json
        const rootConfigs = HashMap.get(configs, "@beep/root");
        expect(Option.isSome(rootConfigs)).toBe(true);
        if (Option.isSome(rootConfigs)) {
          expect(rootConfigs.value.length).toBe(2);
          expect(rootConfigs.value.some((p) => p.endsWith("tsconfig.json"))).toBe(true);
          expect(rootConfigs.value.some((p) => p.endsWith("tsconfig.build.json"))).toBe(true);
        }
      })
    );

    it.effect(
      "should find tsconfig files in workspace packages",
      Effect.fn(function* () {
        const configs = yield* collectTsConfigPaths(MOCK_ROOT);
        // pkg-a has tsconfig.json and tsconfig.test.json
        const pkgAConfigs = HashMap.get(configs, "@mock/pkg-a");
        expect(Option.isSome(pkgAConfigs)).toBe(true);
        if (Option.isSome(pkgAConfigs)) {
          expect(pkgAConfigs.value.length).toBe(2);
          expect(pkgAConfigs.value.some((p) => p.endsWith("tsconfig.json"))).toBe(true);
          expect(pkgAConfigs.value.some((p) => p.endsWith("tsconfig.test.json"))).toBe(true);
        }
      })
    );

    it.effect(
      "should find single tsconfig in packages with one config",
      Effect.fn(function* () {
        const configs = yield* collectTsConfigPaths(MOCK_ROOT);
        // pkg-b and pkg-c each have only tsconfig.json
        const pkgBConfigs = HashMap.get(configs, "@mock/pkg-b");
        expect(Option.isSome(pkgBConfigs)).toBe(true);
        if (Option.isSome(pkgBConfigs)) {
          expect(pkgBConfigs.value.length).toBe(1);
        }
      })
    );

    it.effect(
      "should return absolute paths",
      Effect.fn(function* () {
        const configs = yield* collectTsConfigPaths(MOCK_ROOT);
        for (const [_name, paths] of configs) {
          for (const p of paths) {
            expect(path.isAbsolute(p)).toBe(true);
          }
        }
      })
    );

    it.effect(
      "should include all workspace packages",
      Effect.fn(function* () {
        const configs = yield* collectTsConfigPaths(MOCK_ROOT);
        // Root + 3 packages = 4 entries
        expect(HashMap.size(configs)).toBe(4);
      })
    );
  });
});
