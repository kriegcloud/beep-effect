import { FileSystem, Path } from "@effect/platform";
import * as A from "effect/Array";
import * as Effect from "effect/Effect";
import * as F from "effect/Function";
import * as HashMap from "effect/HashMap";
import * as O from "effect/Option";
import * as S from "effect/Schema";
import { glob } from "glob";
import { getRepoRoot } from "./getRepoRoot";
import {
  PkgJsonFromString,
  RootPkgJsonFromString,
} from "./package-json-schema";

export class PackageJsonNotFound extends S.TaggedError<PackageJsonNotFound>(
  "PackageJsonNotFound",
)("PackageJsonNotFound", {
  message: S.String,
  cause: S.Any,
}) {}

export const repoWorkspaceMap = Effect.gen(function* () {
  const fs = yield* FileSystem.FileSystem;
  const path = yield* Path.Path;
  const repoRoot = yield* getRepoRoot;

  // Read and parse the root package.json
  const repoPkgJsonStr = yield* fs.readFileString(`${repoRoot}/package.json`);
  const pkgJson = yield* S.decode(RootPkgJsonFromString)(repoPkgJsonStr);
  const workspaces = pkgJson.workspaces;

  // Expand all workspace globs to actual package.json paths
  let allPkgJsonPaths: string[] = [];
  for (const pattern of workspaces) {
    // Make the pattern absolute
    const absPattern = path.join(repoRoot, pattern, "package.json");
    // Use glob to expand the pattern (glob returns Promise<string[]>)
    const matches = yield* Effect.tryPromise({
      try: () => glob(absPattern),
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
    const pkg = yield* S.decode(PkgJsonFromString)(content);
    map = HashMap.set(map, pkg.name, path.dirname(pkgJsonPath));
  }

  return map;
});

export const getRepoWorkspace = Effect.fn("getRepoWorkspace")(function* (
  workspace: string,
) {
  const map = yield* repoWorkspaceMap;
  return yield* F.pipe(
    HashMap.get(map, workspace),
    O.match({
      onNone: () => Effect.fail(new Error("Workspace not found")),
      onSome: (dir) => Effect.succeed(dir),
    }),
  );
});
