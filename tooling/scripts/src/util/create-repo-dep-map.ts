import * as FileSystem from "@effect/platform/FileSystem";
import * as Path from "@effect/platform/Path";
import * as A from "effect/Array";
import * as Effect from "effect/Effect";
import * as HashMap from "effect/HashMap";
import * as S from "effect/Schema";
import { NoSuchFileError } from "./errors";
import {
  extractPkgJsonDeps,
  RepoDepMapValue,
  WorkspacePkgKey,
} from "./extract-pkg-json-deps";
import { getRepoRoot } from "./getRepoRoot";
import { packageJsonMap } from "./packageJsonMap";

export const createRepoDepMap = Effect.gen(function* () {
  const path = yield* Path.Path;
  const fs = yield* FileSystem.FileSystem;
  const wPkgJsonMap = yield* packageJsonMap;
  const repoRoot = yield* getRepoRoot;

  const repoRootPkgJsonPath = path.join(repoRoot, "package.json");

  const repoRootExists = yield* fs.exists(repoRootPkgJsonPath);
  if (!repoRootExists) {
    return yield* Effect.fail(
      new NoSuchFileError({
        path: repoRootPkgJsonPath,
        message: "[createRepoDepMap] Invalid file path",
      }),
    );
  }

  const pkgJsonMap = HashMap.set(
    wPkgJsonMap,
    "@beep/root",
    repoRootPkgJsonPath,
  );
  let map = HashMap.empty<
    typeof WorkspacePkgKey.Type,
    typeof RepoDepMapValue.Type
  >();
  const entries = HashMap.entries(pkgJsonMap);

  for (const [k, pkgJsonPath] of A.fromIterable(entries)) {
    const pkgJsonDeps = yield* extractPkgJsonDeps(pkgJsonPath);

    map = HashMap.set(
      map,
      S.decodeUnknownSync(WorkspacePkgKey)(k),
      pkgJsonDeps,
    );
  }

  return map;
});
