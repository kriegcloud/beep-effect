import { NoSuchFileError } from "@beep/tooling-utils/repo/Errors";
import { resolveWorkspaceDirs } from "@beep/tooling-utils/repo/Workspaces";
import * as FileSystem from "@effect/platform/FileSystem";
import * as Path from "@effect/platform/Path";
import * as Effect from "effect/Effect";
import * as HashMap from "effect/HashMap";

/**
 * Build a map of workspace package name -> absolute package.json path.
 *
 * Validates that each workspace has a package.json and fails fast with
 * {@link NoSuchFileError} if any is missing.
 */
export const mapWorkspaceToPackageJsonPath = Effect.gen(function* () {
  const fs = yield* FileSystem.FileSystem;
  const path_ = yield* Path.Path;
  const workspaceMap = yield* resolveWorkspaceDirs;

  let packageJsonMap = HashMap.empty<string, string>();

  for (const [workspace, dir] of HashMap.entries(workspaceMap)) {
    const basePackageJsonPath = path_.join(dir, "package.json");
    const baseExists = yield* fs.exists(basePackageJsonPath);
    if (!baseExists) {
      return yield* Effect.fail(
        new NoSuchFileError({
          path: basePackageJsonPath,
          message: "[mapWorkspaceToPackageJsonPath] Invalid file path",
        })
      );
    }
    packageJsonMap = HashMap.set(packageJsonMap, workspace, basePackageJsonPath);
  }

  return packageJsonMap;
});
