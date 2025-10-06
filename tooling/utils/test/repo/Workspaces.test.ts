import { FsUtilsLive } from "@beep/tooling-utils/FsUtils";
import { getWorkspaceDir, resolveWorkspaceDirs } from "@beep/tooling-utils/repo/Workspaces";
import * as FileSystem from "@effect/platform/FileSystem";
import * as Path from "@effect/platform/Path";
import * as NodeFileSystem from "@effect/platform-node/NodeFileSystem";
import * as NodePath from "@effect/platform-node/NodePath";
import { describe, it } from "@effect/vitest";
import { deepStrictEqual } from "@effect/vitest/utils";
import * as Effect from "effect/Effect";
import * as HashMap from "effect/HashMap";
import * as Layer from "effect/Layer";
import * as O from "effect/Option";

const TestLayer = Layer.mergeAll(FsUtilsLive, NodeFileSystem.layer, NodePath.layerPosix);

describe("Repo/Workspaces", () => {
  it.scoped("resolveWorkspaceDirs includes @beep/tooling-utils", () =>
    Effect.gen(function* () {
      const path_ = yield* Path.Path;
      const fs = yield* FileSystem.FileSystem;
      const map = yield* resolveWorkspaceDirs;
      const entry = HashMap.get(map, "@beep/tooling-utils");
      deepStrictEqual(O.isSome(entry), true);
      if (O.isSome(entry)) {
        // directory exists and ends with tooling/utils
        const exists = yield* fs.exists(entry.value);
        deepStrictEqual(exists, true);
        deepStrictEqual(entry.value.endsWith(path_.join("tooling", "utils")), true);
      }
    }).pipe(Effect.provide(TestLayer))
  );

  it.scoped("getWorkspaceDir returns an absolute dir for utils", () =>
    Effect.gen(function* () {
      const path_ = yield* Path.Path;
      const dir = yield* getWorkspaceDir("@beep/tooling-utils");
      // Should end with tooling/utils and be absolute
      deepStrictEqual(path_.isAbsolute(dir), true);
      deepStrictEqual(dir.endsWith(path_.join("tooling", "utils")), true);
    }).pipe(Effect.provide(TestLayer))
  );

  it.scoped("getWorkspaceDir fails for missing workspace", () =>
    Effect.gen(function* () {
      const res = yield* Effect.either(getWorkspaceDir("@beep/__missing__"));
      deepStrictEqual(res._tag === "Left", true);
    }).pipe(Effect.provide(TestLayer))
  );
});
