import { FsUtils } from "@beep/tooling-utils/FsUtils";
import { DomainError } from "@beep/tooling-utils/repo/Errors";
import { findRepoRoot } from "@beep/tooling-utils/repo/Root";
import { PackageJson, RootPackageJson } from "@beep/tooling-utils/schemas";
import type * as FileSystem from "@effect/platform/FileSystem";
import * as Path from "@effect/platform/Path";
import * as Cause from "effect/Cause";
import * as Effect from "effect/Effect";
import * as F from "effect/Function";
import * as HashMap from "effect/HashMap";
import * as O from "effect/Option";
import * as S from "effect/Schema";

const IGNORE = ["**/node_modules/**", "**/dist/**", "**/build/**", "**/.turbo/**", "**/.tsbuildinfo/**"] as const;

/**
 * Discover workspace directories from the repo root using the root
 * package.json "workspaces" field.
 *
 * Implementation notes:
 * - Reads and decodes the root package.json via FsUtils and RootPackageJson
 * - Expands workspace globs to absolute package.json paths, ignoring common
 *   build/artifact directories
 * - Returns a HashMap of package name -> absolute directory
 */
export const resolveWorkspaceDirs: Effect.Effect<
  HashMap.HashMap<string, string>,
  DomainError,
  Path.Path | FsUtils | FileSystem.FileSystem
> = Effect.gen(function* () {
  const path_ = yield* Path.Path;
  const utils = yield* FsUtils;
  const rootPath = yield* findRepoRoot;

  // Read and decode root package.json (only needs workspaces)
  const rootPkgJson = yield* utils.readJson(path_.join(rootPath, "package.json"));
  const rootDecoded = yield* S.decode(RootPackageJson)(rootPkgJson);
  const workspaces = rootDecoded.workspaces;

  // Expand to absolute package.json paths
  let allPkgJsonPaths: string[] = [];
  for (const pattern of workspaces) {
    const matches = yield* utils.glob(path_.join(pattern, "package.json"), {
      cwd: rootPath,
      absolute: true,
      ignore: IGNORE as unknown as string[],
      nodir: true,
    });
    allPkgJsonPaths = allPkgJsonPaths.concat(matches as string[]);
  }

  // Map package name -> dir
  let map = HashMap.empty<string, string>();
  for (const pkgJsonPath of allPkgJsonPaths) {
    const content = yield* utils.readJson(pkgJsonPath);
    const pkg = yield* S.decode(PackageJson)(content);
    map = HashMap.set(map, pkg.name, path_.dirname(pkgJsonPath));
  }

  return map;
}).pipe(Effect.mapError(DomainError.selfOrMap));

/**
 * Resolve a workspace's absolute directory by its package name.
 *
 * @param workspace Full workspace package name (e.g. "@beep/foo")
 * @throws DomainError when the workspace cannot be found
 */
export type GetWorkSpaceDir = (
  workspace: string
) => Effect.Effect<string, DomainError, Path.Path | FileSystem.FileSystem | FsUtils>;
export const getWorkspaceDir: GetWorkSpaceDir = Effect.fn("getWorkspaceDir")(function* (workspace: string) {
  const map = yield* resolveWorkspaceDirs;
  return yield* F.pipe(
    HashMap.get(map, workspace),
    O.match({
      onNone: () =>
        Effect.fail(
          new DomainError({
            cause: new Cause.NoSuchElementException(),
            message: `[getWorkspaceDir] Workspace ${workspace} not found`,
          })
        ),
      onSome: (dir) => Effect.succeed(dir),
    })
  );
});
