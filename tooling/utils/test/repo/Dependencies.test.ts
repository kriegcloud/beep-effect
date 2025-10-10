import { describe } from "bun:test";
import { deepStrictEqual, scoped } from "@beep/testkit";
import { FsUtilsLive } from "@beep/tooling-utils/FsUtils";
import { extractWorkspaceDependencies } from "@beep/tooling-utils/repo/Dependencies";
import * as FileSystem from "@effect/platform/FileSystem";
import * as Path from "@effect/platform/Path";
import * as BunFileSystem from "@effect/platform-bun/BunFileSystem";
import * as BunPath from "@effect/platform-bun/BunPath";
import * as Effect from "effect/Effect";
import * as HashSet from "effect/HashSet";
import * as Layer from "effect/Layer";

const TestLayer = Layer.mergeAll(FsUtilsLive, BunFileSystem.layer, BunPath.layerPosix);

const mkTestDirScoped = Effect.gen(function* () {
  const fs = yield* FileSystem.FileSystem;
  const path_ = yield* Path.Path;
  const base = path_.join(
    process.cwd(),
    ".tmp-FsUtils-tests",
    `deps-${Date.now()}-${Math.random().toString(16).slice(2)}`
  );
  yield* fs.makeDirectory(base, { recursive: true });
  yield* Effect.addFinalizer(() => fs.remove(base, { recursive: true }).pipe(Effect.ignore));
  return base;
});

describe("Repo/Dependencies.extractWorkspaceDependencies", () => {
  scoped("splits workspace and npm deps in dev and prod", () =>
    Effect.gen(function* () {
      const fs = yield* FileSystem.FileSystem;
      const path_ = yield* Path.Path;
      const base = yield* mkTestDirScoped;
      const pkgJsonPath = path_.join(base, "package.json");
      const pkg = {
        name: "@beep/tmp",
        devDependencies: {
          "@beep/foo": "workspace:^",
          depA: "^1.2.3",
        },
        dependencies: {
          "@beep/bar": "workspace:^",
          depB: "^4.5.6",
        },
      } as const;
      yield* fs.writeFileString(pkgJsonPath, JSON.stringify(pkg));

      const got = yield* extractWorkspaceDependencies(pkgJsonPath);

      deepStrictEqual(HashSet.has(got.devDependencies.workspace, "@beep/foo"), true);
      deepStrictEqual(HashSet.has(got.dependencies.workspace, "@beep/bar"), true);
      deepStrictEqual(HashSet.has(got.devDependencies.npm, "depA"), true);
      deepStrictEqual(HashSet.has(got.dependencies.npm, "depB"), true);
    }).pipe(Effect.provide(TestLayer))
  );

  scoped("handles missing deps maps by defaulting to empty", () =>
    Effect.gen(function* () {
      const fs = yield* FileSystem.FileSystem;
      const path_ = yield* Path.Path;
      const base = yield* mkTestDirScoped;
      const pkgJsonPath = path_.join(base, "package.json");
      const pkg = {
        name: "@beep/tmp",
      } as const;
      yield* fs.writeFileString(pkgJsonPath, JSON.stringify(pkg));

      const got = yield* extractWorkspaceDependencies(pkgJsonPath);

      deepStrictEqual(HashSet.size(got.devDependencies.workspace), 0);
      deepStrictEqual(HashSet.size(got.devDependencies.npm), 0);
      deepStrictEqual(HashSet.size(got.dependencies.workspace), 0);
      deepStrictEqual(HashSet.size(got.dependencies.npm), 0);
    }).pipe(Effect.provide(TestLayer))
  );
});
