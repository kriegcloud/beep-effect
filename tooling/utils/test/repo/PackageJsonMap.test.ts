import { FsUtilsLive } from "@beep/tooling-utils/FsUtils";
import { mapWorkspaceToPackageJsonPath } from "@beep/tooling-utils/repo/PackageJsonMap";
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

describe("Repo/PackageJsonMap.mapWorkspaceToPackageJsonPath", () => {
  it.scoped("returns absolute package.json path for @beep/tooling-utils", () =>
    Effect.gen(function* () {
      const path_ = yield* Path.Path;
      const fs = yield* FileSystem.FileSystem;
      const map = yield* mapWorkspaceToPackageJsonPath;
      const entry = HashMap.get(map, "@beep/tooling-utils");
      deepStrictEqual(O.isSome(entry), true);
      if (O.isSome(entry)) {
        const pkgPath = entry.value;
        deepStrictEqual(path_.isAbsolute(pkgPath), true);
        deepStrictEqual(pkgPath.endsWith(path_.join("tooling", "utils", "package.json")), true);
        const exists = yield* fs.exists(pkgPath);
        deepStrictEqual(exists, true);
      }
    }).pipe(Effect.provide(TestLayer))
  );
});
