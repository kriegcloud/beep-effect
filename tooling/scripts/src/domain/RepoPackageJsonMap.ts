import * as FileSystem from "@effect/platform/FileSystem";
import * as Path from "@effect/platform/Path";
import * as Effect from "effect/Effect";
import * as HashMap from "effect/HashMap";
import { NoSuchFileError } from "./errors";
import {RepoPackageMap} from "./RepoPackageMap";


export const RepoPackageJsonMap = Effect.gen(function* () {
  const fs = yield* FileSystem.FileSystem;
  const path = yield* Path.Path;

  const workspaceMap = yield* RepoPackageMap;

  let packageJsonMap = HashMap.empty<string, string>();

  for (const [workspace, dir] of HashMap.entries(workspaceMap)) {
    const basePackageJsonPath = path.join(dir, "package.json");

    const baseExists = yield* fs.exists(basePackageJsonPath);
    if (!baseExists) {
      return yield* Effect.fail(
        new NoSuchFileError({
          path: basePackageJsonPath,
          message: "[packageJsonMap] Invalid file path",
        }),
      );
    }

    packageJsonMap = HashMap.set(
      packageJsonMap,
      workspace,
      basePackageJsonPath,
    );
  }

  return packageJsonMap;
});
