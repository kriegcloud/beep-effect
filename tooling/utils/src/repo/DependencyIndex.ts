import * as FileSystem from "@effect/platform/FileSystem";
import * as Path from "@effect/platform/Path";
import * as A from "effect/Array";
import * as Effect from "effect/Effect";
import * as HashMap from "effect/HashMap";
import * as S from "effect/Schema";
import { RepoDepMapValue, WorkspacePkgKey } from "../schemas";
import { extractWorkspaceDependencies } from "./Dependencies";
import { mapWorkspaceToPackageJsonPath } from "./PackageJsonMap";
import { findRepoRoot } from "./Root";

export const buildRepoDependencyIndex = Effect.gen(function* () {
  const path_ = yield* Path.Path;
  const fs = yield* FileSystem.FileSystem;

  const repoRoot = yield* findRepoRoot;
  const repoRootPkgJsonPath = path_.join(repoRoot, "package.json");
  const repoRootExists = yield* fs.exists(repoRootPkgJsonPath);
  if (!repoRootExists) {
    return yield* Effect.fail(
      new Error(`[buildRepoDependencyIndex] Root package.json not found at ${repoRootPkgJsonPath}`),
    );
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
