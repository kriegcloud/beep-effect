import { describe } from "bun:test";
import { deepStrictEqual, scoped } from "@beep/testkit";
import { FsUtilsLive } from "@beep/tooling-utils/FsUtils";
import { collectTsConfigPaths } from "@beep/tooling-utils/repo/TsConfigIndex";
import * as FileSystem from "@effect/platform/FileSystem";
import * as Path from "@effect/platform/Path";
import * as BunFileSystem from "@effect/platform-bun/BunFileSystem";
import * as BunPath from "@effect/platform-bun/BunPath";
import * as Effect from "effect/Effect";
import * as HashMap from "effect/HashMap";
import * as Layer from "effect/Layer";
import * as O from "effect/Option";

const TestLayer = Layer.mergeAll(FsUtilsLive, BunFileSystem.layer, BunPath.layerPosix);

describe("Repo/TsConfigIndex.collectTsConfigPaths", () => {
  scoped("collects root and utils tsconfig paths including optional variants", () =>
    Effect.gen(function* () {
      const fs = yield* FileSystem.FileSystem;
      const path_ = yield* Path.Path;
      const map = yield* collectTsConfigPaths;

      const root = HashMap.get(map, "@beep/root");
      deepStrictEqual(O.isSome(root), true);
      if (O.isSome(root)) {
        const arr = root.value;
        deepStrictEqual(arr.length >= 3, true);
        deepStrictEqual(arr[0].endsWith(path_.join("tsconfig.json")), true);
        deepStrictEqual(arr[1]!.endsWith(path_.join("tsconfig.build.json")), true);
        deepStrictEqual(arr[2]!.endsWith(path_.join("tsconfig.base.jsonc")), true);
      }

      const utils = HashMap.get(map, "@beep/tooling-utils");
      deepStrictEqual(O.isSome(utils), true);
      if (O.isSome(utils)) {
        const arr = utils.value;
        const base = arr[0];
        deepStrictEqual(base.endsWith(path_.join("tooling", "utils", "tsconfig.json")), true);
        // Optional configs should be included when present
        const expectedOptionals = [
          path_.join("tooling", "utils", "tsconfig.build.json"),
          path_.join("tooling", "utils", "tsconfig.test.json"),
          path_.join("tooling", "utils", "tsconfig.src.json"),
          path_.join("tooling", "utils", "tsconfig.drizzle.json"),
          path_.join("tooling", "utils", "tsconfig.tsx.json"),
        ];
        for (const opt of expectedOptionals) {
          const abs = arr.find((p) => p.endsWith(opt));
          const exists = yield* fs.exists(path_.join(process.cwd(), "..", "..", opt));
          // if file exists, it must be present in the list
          if (exists) {
            deepStrictEqual(typeof abs === "string", true);
          }
        }
      }
    }).pipe(Effect.provide(TestLayer))
  );
});
