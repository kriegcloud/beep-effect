import * as FileSystem from "@effect/platform/FileSystem";
import * as Path from "@effect/platform/Path";
import * as A from "effect/Array";
import * as Effect from "effect/Effect";
import * as F from "effect/Function";
import * as HashMap from "effect/HashMap";
import * as HashSet from "effect/HashSet";
import * as P from "effect/Predicate";
import * as S from "effect/Schema";
import * as Struct from "effect/Struct";
import {DomainError, NoSuchFileError,} from "./errors";
import {PackageJson} from "./PackageJson";
import { RepoPackageJsonMap } from "./RepoPackageJsonMap";
import { RepoRootPath } from "./RepoRootPath";
import {
  Dependencies,
  NpmDepTuple,
  RepoDepMapValue,
  WorkspaceDepTuple,
  WorkspacePkgKey,
} from "./RepoSchemas";

export const RepoDependencyMap = Effect.fn("extractPkgJsonDeps")(function* (
  pkgJsonPath: string,
) {
  const fs = yield* FileSystem.FileSystem;

  const exists = yield* fs.exists(pkgJsonPath);
  if (!exists) {
    return yield* Effect.fail(
      new NoSuchFileError({
        path: pkgJsonPath,
        message: "[GetPackageJsonDeps] Invalid file path",
      }),
    );
  }

  const content = yield* fs.readFileString(pkgJsonPath);

  const decodedPackageJson = yield* S.decode(S.parseJson(PackageJson.Schema))(content);

  if (P.isNullable(decodedPackageJson.devDependencies)) {
    // every pkg should have devDependencies
    return yield* Effect.fail(
      new DomainError({
        message: `[extractPkgJsonDependencies] Missing devDependencies: ${pkgJsonPath}`,
      }),
    );
  }

  if (P.isNullable(decodedPackageJson.dependencies)) {
    return yield* Effect.fail(
      new DomainError({
        message: "[extractPkgJsonDependencies] Missing dependencies",
      }),
    );
  }

  const isWorkspaceDep = S.is(WorkspaceDepTuple);
  const isNpmDep = S.is(NpmDepTuple);

  const devDeps = F.pipe(
    decodedPackageJson.devDependencies,
    Struct.entries,
    (entries) =>
      S.decodeSync(Dependencies)({
        workspace: F.pipe(
          A.filter(entries, isWorkspaceDep),
          A.map(([k]) => k),
          HashSet.fromIterable,
        ),
        npm: F.pipe(
          A.filter(entries, isNpmDep),
          A.map(([k]) => k),
          HashSet.fromIterable,
        ),
      }),
  );
  const deps = F.pipe(
    decodedPackageJson.dependencies,
    Struct.entries,
    (entries) =>
      S.decodeSync(Dependencies)({
        workspace: F.pipe(
          A.filter(entries, isWorkspaceDep),
          A.map(([k]) => k),
          HashSet.fromIterable,
        ),
        npm: F.pipe(
          A.filter(entries, isNpmDep),
          A.map(([k]) => k),
          HashSet.fromIterable,
        ),
      }),
  );

  return yield* S.decode(RepoDepMapValue)({
    devDependencies: devDeps,
    dependencies: deps,
  });
});

export const createRepoDepMap = Effect.gen(function* () {
  const path = yield* Path.Path;
  const fs = yield* FileSystem.FileSystem;
  const wPkgJsonMap = yield* RepoPackageJsonMap;
  const repoRoot = yield* RepoRootPath;

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
    const pkgJsonDeps = yield* RepoDependencyMap(pkgJsonPath);

    map = HashMap.set(
      map,
      S.decodeUnknownSync(WorkspacePkgKey)(k),
      pkgJsonDeps,
    );
  }

  return map;
});
