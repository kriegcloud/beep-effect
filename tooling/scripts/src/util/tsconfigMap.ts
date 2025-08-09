import * as FileSystem from "@effect/platform/FileSystem";
import * as Path from "@effect/platform/Path";
import * as A from "effect/Array";
import * as Effect from "effect/Effect";
import * as HashMap from "effect/HashMap";
import * as O from "effect/Option";
import { NoSuchFileError } from "./errors";
import { getRepoRoot } from "./getRepoRoot";
import { repoWorkspaceMap } from "./repoWorkspaceMap";

export const TsconfigMap = Effect.gen(function* () {
  const fs = yield* FileSystem.FileSystem;
  const path = yield* Path.Path;

  const repoRoot = yield* getRepoRoot;
  const workspaceMap = yield* repoWorkspaceMap;

  const rootTsConfigPath = path.join(repoRoot, "tsconfig.json");
  const rootBuildTsConfigPath = path.join(repoRoot, "tsconfig.build.json");
  const rootBaseTsConfigPath = path.join(repoRoot, "tsconfig.base.json");

  for (const rootTsConfig of [
    rootTsConfigPath,
    rootBuildTsConfigPath,
    rootBaseTsConfigPath,
  ]) {
    const exists = yield* fs.exists(rootTsConfig);
    if (!exists) {
      return yield* Effect.fail(
        new NoSuchFileError({
          path: rootTsConfig,
          message: "[tsconfigMap] Invalid file path",
        }),
      );
    }
  }
  let tsconfigMap = HashMap.empty<string, A.NonEmptyReadonlyArray<string>>();

  tsconfigMap = HashMap.set(
    tsconfigMap,
    "@beep/root",
    A.make(rootTsConfigPath, rootBuildTsConfigPath, rootBaseTsConfigPath),
  );
  for (const [workspace, dir] of HashMap.entries(workspaceMap)) {
    const baseTsConfigPath = path.join(dir, "tsconfig.json");

    const baseExists = yield* fs.exists(baseTsConfigPath);
    if (!baseExists) {
      return yield* Effect.fail(
        new NoSuchFileError({
          path: baseTsConfigPath,
          message: "[tsconfigMap] Invalid file path",
        }),
      );
    }

    const optionalConfigs = A.make(
      path.join(dir, "tsconfig.build.json"),
      path.join(dir, "tsconfig.test.json"),
      path.join(dir, "tsconfig.src.json"),
      path.join(dir, "tsconfig.drizzle.json"),
      path.join(dir, "tsconfig.tsx.json"),
    );

    tsconfigMap = HashMap.set(tsconfigMap, workspace, A.make(baseTsConfigPath));
    for (const optionalConfig of optionalConfigs) {
      const exists = yield* fs.exists(optionalConfig);
      if (exists) {
        const existing = HashMap.get(tsconfigMap, workspace);

        if (O.isSome(existing)) {
          tsconfigMap = yield* Effect.succeed(
            HashMap.set(
              tsconfigMap,
              workspace,
              A.append(existing.value, optionalConfig),
            ),
          );
        } else {
          // This shouldn't happen since we just set it above, but handle it just in case
          tsconfigMap = HashMap.set(
            tsconfigMap,
            workspace,
            A.make(baseTsConfigPath, optionalConfig),
          );
        }
      }
    }
  }

  return tsconfigMap;
});
