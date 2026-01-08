/**
 * Repository-wide dependency index builder.
 *
 * Builds a complete dependency map for all workspaces including the repository root.
 *
 * @since 0.1.0
 */
import * as FileSystem from "@effect/platform/FileSystem";
import * as Path from "@effect/platform/Path";
import * as A from "effect/Array";
import * as Effect from "effect/Effect";
import * as HashMap from "effect/HashMap";
import * as S from "effect/Schema";
import type { RepoDepMapValue } from "../schemas/index.js";
import { WorkspacePkgKey } from "../schemas/index.js";
import { extractWorkspaceDependencies } from "./Dependencies.js";
import { NoSuchFileError } from "./Errors.js";
import { mapWorkspaceToPackageJsonPath } from "./PackageJsonMap.js";
import { findRepoRoot } from "./Root.js";

/**
 * Build a repository-wide dependency index for all workspaces plus `@beep/root`.
 *
 * Reads each workspace's package.json and extracts typed dependency sets using
 * {@link extractWorkspaceDependencies}. Also includes the root package.json under
 * the synthetic workspace key `@beep/root`.
 *
 * @returns HashMap of {@link WorkspacePkgKey} -> {@link RepoDepMapValue}
 * @throws Error if the root package.json does not exist
 *
 * @example
 * ```typescript
 * import { buildRepoDependencyIndex } from "@beep/tooling-utils"
 * import * as Effect from "effect/Effect"
 * import * as HashMap from "effect/HashMap"
 *
 * const program = Effect.gen(function* () {
 *   const depIndex = yield* buildRepoDependencyIndex
 *   const rootDeps = HashMap.get(depIndex, "@beep/root")
 *   console.log(rootDeps)
 *   // => Some({ dependencies: { workspace: ..., npm: ... }, devDependencies: ... })
 * })
 * ```
 *
 * @category Utils/Repo
 * @since 0.1.0
 */
export const buildRepoDependencyIndex = Effect.gen(function* () {
  const path_ = yield* Path.Path;
  const fs = yield* FileSystem.FileSystem;

  const repoRoot = yield* findRepoRoot;
  const repoRootPkgJsonPath = path_.join(repoRoot, "package.json");
  const repoRootExists = yield* fs.exists(repoRootPkgJsonPath);
  if (!repoRootExists) {
    return yield* new NoSuchFileError({
      path: repoRootPkgJsonPath,
      message: "[buildRepoDependencyIndex] Root package.json not found",
    });
  }

  const workspacePkgJsonMap = yield* mapWorkspaceToPackageJsonPath;
  // Add @beep/root explicitly
  const entries: Array<readonly [string, string]> = [
    ...A.fromIterable(HashMap.entries(workspacePkgJsonMap)),
    ["@beep/root", repoRootPkgJsonPath] as const,
  ];

  type WorkspacePkgKeyT = S.Schema.Type<typeof WorkspacePkgKey>;
  type RepoDepMapValueT = S.Schema.Type<typeof RepoDepMapValue>;
  let map = HashMap.empty<WorkspacePkgKeyT, RepoDepMapValueT>();

  for (const [name, pkgJsonPath] of entries) {
    const deps = yield* extractWorkspaceDependencies(pkgJsonPath);
    const key = S.decodeUnknownSync(WorkspacePkgKey)(name);
    map = HashMap.set(map, key, deps);
  }

  return map;
});
