import { NoSuchFileError } from "@beep/tooling-utils/repo/Errors";
import { findRepoRoot } from "@beep/tooling-utils/repo/Root";
import { resolveWorkspaceDirs } from "@beep/tooling-utils/repo/Workspaces";
import * as FileSystem from "@effect/platform/FileSystem";
import * as Path from "@effect/platform/Path";
import * as A from "effect/Array";
import * as Effect from "effect/Effect";
import * as HashMap from "effect/HashMap";
import * as O from "effect/Option";

/**
 * Collect tsconfig.json related paths for root and each workspace.
 *
 * Validates existence of required tsconfig files at the repo root and under
 * every workspace. Optionally includes known variant configs when present
 * (e.g. tsconfig.build.json, tsconfig.test.json, tsconfig.src.json, etc.).
 *
 * @returns HashMap of package name (including "@beep/root") -> non-empty array
 *          of tsconfig paths ordered: base first, then optional variants.
 * @throws NoSuchFileError if any required tsconfig is missing
 */
export const collectTsConfigPaths = Effect.gen(function* () {
  const fs = yield* FileSystem.FileSystem;
  const path_ = yield* Path.Path;

  const repoRoot = yield* findRepoRoot;
  const workspaceMap = yield* resolveWorkspaceDirs;

  const rootTsConfigPath = path_.join(repoRoot, "tsconfig.json");
  const rootBuildTsConfigPath = path_.join(repoRoot, "tsconfig.build.json");
  const rootBaseTsConfigPath = path_.join(repoRoot, "tsconfig.base.json");

  for (const rootTsConfig of [rootTsConfigPath, rootBuildTsConfigPath, rootBaseTsConfigPath]) {
    const exists = yield* fs.exists(rootTsConfig);
    if (!exists) {
      return yield* Effect.fail(
        new NoSuchFileError({
          path: rootTsConfig,
          message: "[collectTsConfigPaths] Invalid file path",
        })
      );
    }
  }

  let tsconfigMap = HashMap.empty<string, A.NonEmptyReadonlyArray<string>>();

  tsconfigMap = HashMap.set(
    tsconfigMap,
    "@beep/root",
    A.make(rootTsConfigPath, rootBuildTsConfigPath, rootBaseTsConfigPath)
  );

  for (const [workspace, dir] of HashMap.entries(workspaceMap)) {
    const baseTsConfigPath = path_.join(dir, "tsconfig.json");

    const baseExists = yield* fs.exists(baseTsConfigPath);
    if (!baseExists) {
      return yield* Effect.fail(
        new NoSuchFileError({
          path: baseTsConfigPath,
          message: "[collectTsConfigPaths] Invalid file path",
        })
      );
    }

    const optionalConfigs = A.make(
      path_.join(dir, "tsconfig.build.json"),
      path_.join(dir, "tsconfig.test.json"),
      path_.join(dir, "tsconfig.src.json"),
      path_.join(dir, "tsconfig.drizzle.json"),
      path_.join(dir, "tsconfig.tsx.json")
    );

    tsconfigMap = HashMap.set(tsconfigMap, workspace, A.make(baseTsConfigPath));

    for (const optionalConfig of optionalConfigs) {
      const exists = yield* fs.exists(optionalConfig);
      if (exists) {
        const existing = HashMap.get(tsconfigMap, workspace);
        if (O.isSome(existing)) {
          tsconfigMap = HashMap.set(tsconfigMap, workspace, A.append(existing.value, optionalConfig));
        } else {
          tsconfigMap = HashMap.set(tsconfigMap, workspace, A.make(baseTsConfigPath, optionalConfig));
        }
      }
    }
  }

  return tsconfigMap;
});
