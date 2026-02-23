import * as path from "node:path";
import * as NodeFileSystem from "@effect/platform-node/NodeFileSystem";
import * as NodePath from "@effect/platform-node/NodePath";
import { describe, expect, layer } from "@effect/vitest";
import { Effect, HashMap, Layer, Option } from "effect";
import { FsUtilsLive } from "../src/FsUtils.js";
import { getWorkspaceDir, resolveWorkspaceDirs } from "../src/Workspaces.js";

const PlatformLayer = Layer.mergeAll(NodeFileSystem.layer, NodePath.layer);
const TestLayer = FsUtilsLive.pipe(Layer.provideMerge(PlatformLayer));

const MOCK_ROOT = path.resolve(__dirname, "fixtures/mock-monorepo");

layer(TestLayer)("Workspaces", (it) => {
  describe("resolveWorkspaceDirs", () => {
    it.effect(
      "should resolve all workspace packages",
      Effect.fn(function* () {
        const workspaces = yield* resolveWorkspaceDirs(MOCK_ROOT);
        expect(HashMap.size(workspaces)).toBe(3);
        expect(HashMap.has(workspaces, "@mock/pkg-a")).toBe(true);
        expect(HashMap.has(workspaces, "@mock/pkg-b")).toBe(true);
        expect(HashMap.has(workspaces, "@mock/pkg-c")).toBe(true);
      })
    );

    it.effect(
      "should map names to absolute directory paths",
      Effect.fn(function* () {
        const workspaces = yield* resolveWorkspaceDirs(MOCK_ROOT);
        const dirA = HashMap.get(workspaces, "@mock/pkg-a");
        expect(Option.isSome(dirA)).toBe(true);
        if (Option.isSome(dirA)) {
          expect(dirA.value).toContain("packages/pkg-a");
          expect(path.isAbsolute(dirA.value)).toBe(true);
        }
      })
    );

    it.effect(
      "should return empty HashMap when no workspaces defined",
      Effect.fn(function* () {
        // pkg-a has no workspaces field
        const workspaces = yield* resolveWorkspaceDirs(path.resolve(MOCK_ROOT, "packages/pkg-a"));
        expect(HashMap.size(workspaces)).toBe(0);
      })
    );

    it.effect(
      "should fail with NoSuchFileError for missing root",
      Effect.fn(function* () {
        const result = yield* resolveWorkspaceDirs("/nonexistent/root").pipe(
          Effect.catchTag("NoSuchFileError", (e) => Effect.succeed(`caught: ${e._tag}`))
        );
        expect(result).toBe("caught: NoSuchFileError");
      })
    );
  });

  describe("getWorkspaceDir", () => {
    it.effect(
      "should find an existing workspace by name",
      Effect.fn(function* () {
        const dir = yield* getWorkspaceDir(MOCK_ROOT, "@mock/pkg-b");
        expect(Option.isSome(dir)).toBe(true);
        if (Option.isSome(dir)) {
          expect(dir.value).toContain("packages/pkg-b");
        }
      })
    );

    it.effect(
      "should return None for a non-existent workspace",
      Effect.fn(function* () {
        const dir = yield* getWorkspaceDir(MOCK_ROOT, "@mock/nonexistent");
        expect(Option.isNone(dir)).toBe(true);
      })
    );
  });
});
// bench
