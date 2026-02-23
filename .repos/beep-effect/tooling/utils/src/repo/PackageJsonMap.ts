/**
 * Workspace to package.json path mapping.
 *
 * Maps workspace package names to their package.json file paths.
 *
 * @since 0.1.0
 */
import * as FileSystem from "@effect/platform/FileSystem";
import * as Path from "@effect/platform/Path";
import * as Effect from "effect/Effect";
import * as HashMap from "effect/HashMap";
import { NoSuchFileError } from "./Errors.js";
import { resolveWorkspaceDirs } from "./Workspaces.js";

/**
 * Build a map of workspace package name -> absolute package.json path.
 *
 * Validates that each workspace has a package.json and fails fast with
 * {@link NoSuchFileError} if any is missing.
 *
 * @example
 * ```typescript
 * import { mapWorkspaceToPackageJsonPath } from "@beep/tooling-utils"
 * import * as Effect from "effect/Effect"
 * import * as HashMap from "effect/HashMap"
 *
 * const program = Effect.gen(function* () {
 *   const map = yield* mapWorkspaceToPackageJsonPath
 *   const path = HashMap.get(map, "@beep/schema")
 *   // => Some("/absolute/path/to/packages/common/schema/package.json")
 * })
 * ```
 *
 * @category Utils/Repo
 * @since 0.1.0
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
      return yield* new NoSuchFileError({
        path: basePackageJsonPath,
        message: "[mapWorkspaceToPackageJsonPath] Invalid file path",
      });
    }
    packageJsonMap = HashMap.set(packageJsonMap, workspace, basePackageJsonPath);
  }

  return packageJsonMap;
});
