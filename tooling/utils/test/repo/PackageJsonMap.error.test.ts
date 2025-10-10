import { describe } from "bun:test";
import { deepStrictEqual, scoped } from "@beep/testkit";
import { FsUtilsLive } from "@beep/tooling-utils/FsUtils";
import { mapWorkspaceToPackageJsonPath } from "@beep/tooling-utils/repo/PackageJsonMap";
import * as FileSystem from "@effect/platform/FileSystem";
import * as BunFileSystem from "@effect/platform-bun/BunFileSystem";
import * as BunPath from "@effect/platform-bun/BunPath";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";

const mkMissingPkgJsonLayer = () =>
  Layer.effect(
    FileSystem.FileSystem,
    Effect.gen(function* () {
      const fs = yield* FileSystem.FileSystem;
      return {
        ...fs,
        exists: (p: string) => (p.endsWith("/tooling/utils/package.json") ? Effect.succeed(false) : fs.exists(p)),
      } as FileSystem.FileSystem;
    })
  ).pipe(Layer.provide(BunFileSystem.layer));

const BaseLayer = Layer.mergeAll(FsUtilsLive, BunFileSystem.layer, BunPath.layerPosix);

describe("Repo/PackageJsonMap error path", () => {
  scoped("fails when a workspace package.json is missing", () =>
    Effect.gen(function* () {
      const res = yield* Effect.either(mapWorkspaceToPackageJsonPath);
      deepStrictEqual(res._tag === "Left", true);
    }).pipe(Effect.provide(Layer.mergeAll(BaseLayer, FsUtilsLive, mkMissingPkgJsonLayer())))
  );
});
