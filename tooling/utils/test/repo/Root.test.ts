import { describe } from "bun:test";
import { deepStrictEqual, scoped } from "@beep/testkit";
import { findRepoRoot } from "@beep/tooling-utils/repo/Root";
import * as FileSystem from "@effect/platform/FileSystem";
import * as Path from "@effect/platform/Path";
import * as BunFileSystem from "@effect/platform-bun/BunFileSystem";
import * as BunPath from "@effect/platform-bun/BunPath";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";

const RealLayer = Layer.mergeAll(BunFileSystem.layer, BunPath.layerPosix);

// Layer that forces fs.exists to always return false, to exercise the failure path
const AlwaysMissingFsLayer = Layer.effect(
  FileSystem.FileSystem,
  Effect.gen(function* () {
    const fs = yield* FileSystem.FileSystem;
    return {
      ...fs,
      exists: (_: string) => Effect.succeed(false),
    } as FileSystem.FileSystem;
  })
).pipe(Layer.provide(BunFileSystem.layer));

const PathLayer = BunPath.layerPosix;

describe("Repo/Root.findRepoRoot", () => {
  scoped("finds repo root that contains .git or bun.lock", () =>
    Effect.gen(function* () {
      const path_ = yield* Path.Path;
      const fs = yield* FileSystem.FileSystem;
      const root = yield* findRepoRoot;
      deepStrictEqual(path_.isAbsolute(root), true);
      const hasGit = yield* fs.exists(path_.join(root, ".git"));
      const hasBunLock = yield* fs.exists(path_.join(root, "bun.lock"));
      deepStrictEqual(hasGit || hasBunLock, true);
    }).pipe(Effect.provide(RealLayer))
  );

  scoped("fails with NoSuchFileError when no marker dirs/files exist", () =>
    Effect.gen(function* () {
      const res = yield* Effect.either(findRepoRoot);
      deepStrictEqual(res._tag === "Left", true);
    }).pipe(Effect.provide(Layer.mergeAll(AlwaysMissingFsLayer, PathLayer)))
  );
});
