import { describe } from "bun:test";
import { deepStrictEqual, scoped } from "@beep/testkit";
import * as FileSystem from "@effect/platform/FileSystem";
import * as BunFileSystem from "@effect/platform-bun/BunFileSystem";
import * as BunPath from "@effect/platform-bun/BunPath";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import { FsUtilsLive } from "../../src/FsUtils";
import { buildRepoDependencyIndex } from "../../src/repo/DependencyIndex";

// Override exists to make root package.json appear missing
const MissingRootPkgLayer = Layer.effect(
  FileSystem.FileSystem,
  Effect.gen(function* () {
    const fs = yield* FileSystem.FileSystem;
    return {
      ...fs,
      exists: (p: string) =>
        p.endsWith("/package.json") || p.endsWith("\\package.json") ? Effect.succeed(false) : fs.exists(p),
    } as FileSystem.FileSystem;
  })
).pipe(Layer.provide(BunFileSystem.layer));

const BaseLayer = Layer.mergeAll(FsUtilsLive, BunFileSystem.layer, BunPath.layerPosix);

describe("Repo/DependencyIndex error path", () => {
  scoped("fails when root package.json is missing", () =>
    Effect.gen(function* () {
      const res = yield* Effect.either(buildRepoDependencyIndex);
      deepStrictEqual(res._tag === "Left", true);
    }).pipe(Effect.provide(Layer.mergeAll(BaseLayer, MissingRootPkgLayer)))
  );
});
