import { FileSystem, Path } from "@effect/platform";
import * as A from "effect/Array";
import * as Effect from "effect/Effect";
import * as F from "effect/Function";
import * as HashMap from "effect/HashMap";
import * as O from "effect/Option";
import * as S from "effect/Schema";
import { glob } from "glob";
import { PackageJsonNotFound } from "./errors";
import { PackageJson, RootPackageJson } from "./PackageJson";
import { RepoRootPath } from "./RepoRootPath";

export const RepoPackageMap = Effect.gen(function* () {
  const fs = yield* FileSystem.FileSystem;
  const path = yield* Path.Path;
  const rootPath = yield* RepoRootPath;

  // Read and parse the root package.json
  const repoPkgJsonStr = yield* fs.readFileString(`${rootPath}/package.json`);
  const pkgJson = yield* S.decode(S.parseJson(RootPackageJson.Schema))(
    repoPkgJsonStr,
  );
  const workspaces = pkgJson.workspaces;

  // Expand all workspace globs to actual package.json paths
  let allPkgJsonPaths: string[] = [];
  for (const pattern of workspaces) {
    // Make the pattern absolute
    const absPattern = path.join(rootPath, pattern, "package.json");
    // Use glob to expand the pattern (glob returns Promise<string[]>)
    const matches = yield* Effect.tryPromise({
      try: () =>
        glob(absPattern, {
          ignore: [
            "**/node_modules/**",
            "**/dist/**",
            "**/build/**",
            "**/.turbo/**",
            "**/.tsbuildinfo/**",
          ], // ignore any node_modules anywhere
        }),
      catch: (e) =>
        new PackageJsonNotFound({
          message: `Failed to find package.json for pattern ${pattern}`,
          cause: e,
        }),
    });
    if (A.isArray(matches)) {
      allPkgJsonPaths = allPkgJsonPaths.concat(matches);
    }
  }

  let map = HashMap.empty<string, string>();
  for (const pkgJsonPath of allPkgJsonPaths) {
    const content = yield* fs.readFileString(pkgJsonPath);
    const pkg = yield* S.decode(S.parseJson(PackageJson.Schema))(content);
    map = HashMap.set(map, pkg.name, path.dirname(pkgJsonPath));
  }

  return map;
});

export const getRepoWorkspace = Effect.fn("getRepoWorkspace")(function* (
  workspace: string,
) {
  const map = yield* RepoPackageMap;
  return yield* F.pipe(
    HashMap.get(map, workspace),
    O.match({
      onNone: () => Effect.fail(new Error("Workspace not found")),
      onSome: (dir) => Effect.succeed(dir),
    }),
  );
});
