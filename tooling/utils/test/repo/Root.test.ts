import { findRepoRoot } from "@beep/tooling-utils/repo/Root";
import * as FileSystem from "@effect/platform/FileSystem";
import * as Path from "@effect/platform/Path";
import * as NodeFileSystem from "@effect/platform-node/NodeFileSystem";
import * as NodePath from "@effect/platform-node/NodePath";
import { describe, it } from "@effect/vitest";
import { deepStrictEqual } from "@effect/vitest/utils";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";

const RealLayer = Layer.mergeAll(NodeFileSystem.layer, NodePath.layerPosix);

// Layer that forces fs.exists to always return false, to exercise the failure path
const AlwaysMissingFsLayer = Layer.effect(
  FileSystem.FileSystem,
  Effect.gen(function* () {
    const fs = yield* FileSystem.FileSystem;
    return {
      ...fs,
      exists: (_: string) => Effect.succeed(false),
    } as FileSystem.FileSystem;
  }),
).pipe(Layer.provide(NodeFileSystem.layer));

const PathLayer = NodePath.layerPosix;

describe("Repo/Root.findRepoRoot", () => {
  it.scoped("finds repo root that contains .git or pnpm-workspace.yaml", () =>
    Effect.gen(function* () {
      const path_ = yield* Path.Path;
      const fs = yield* FileSystem.FileSystem;
      const root = yield* findRepoRoot;
      deepStrictEqual(path_.isAbsolute(root), true);
      const hasGit = yield* fs.exists(path_.join(root, ".git"));
      const hasPnpm = yield* fs.exists(path_.join(root, "pnpm-workspace.yaml"));
      deepStrictEqual(hasGit || hasPnpm, true);
    }).pipe(Effect.provide(RealLayer)),
  );

  it.scoped("fails with NoSuchFileError when no marker dirs/files exist", () =>
    Effect.gen(function* () {
      const res = yield* Effect.either(findRepoRoot);
      deepStrictEqual(res._tag === "Left", true);
    }).pipe(Effect.provide(Layer.mergeAll(AlwaysMissingFsLayer, PathLayer))),
  );
});
