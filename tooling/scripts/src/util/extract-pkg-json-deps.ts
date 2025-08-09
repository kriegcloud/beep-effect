import * as FileSystem from "@effect/platform/FileSystem";
import * as A from "effect/Array";
import * as Effect from "effect/Effect";
import * as F from "effect/Function";
import * as HashSet from "effect/HashSet";
import * as P from "effect/Predicate";
import * as S from "effect/Schema";
import * as Struct from "effect/Struct";
import { NoSuchFileError, ProgramError } from "./errors";
import { PkgJsonFromString } from "./package-json-schema";

export const WorkspacePkgKeyPrefix = S.Literal("@beep/");
export const WorkspacePkgKey = S.TemplateLiteral(
  WorkspacePkgKeyPrefix,
  S.String,
);
export const WorkspacePkgValue = S.Literal("workspace:*", "workspace:^");
export const WorkspaceDepTuple = S.Tuple(WorkspacePkgKey, WorkspacePkgValue);

export const NpmDepValuePrefix = S.Literal("^");
export const NpmDepValue = S.TemplateLiteral(NpmDepValuePrefix, S.String);

export const NpmDepTuple = S.Tuple(S.NonEmptyTrimmedString, NpmDepValue);

export const Dependencies = S.Struct({
  workspace: S.HashSetFromSelf(WorkspacePkgKey),
  npm: S.HashSetFromSelf(S.NonEmptyTrimmedString),
});

export const RepoDepMapValue = S.Struct({
  devDependencies: Dependencies,
  dependencies: Dependencies,
});

export const RepoDepMap = S.HashMapFromSelf({
  key: WorkspacePkgKey,
  value: RepoDepMapValue,
});

export const extractPkgJsonDeps = Effect.fn("extractPkgJsonDeps")(function* (
  pkgJsonPath: string,
) {
  const fs = yield* FileSystem.FileSystem;

  const exists = yield* fs.exists(pkgJsonPath);
  if (!exists) {
    return yield* Effect.fail(
      new NoSuchFileError({
        path: pkgJsonPath,
        message: "[extractPkgJsonDependencies] Invalid file path",
      }),
    );
  }

  const content = yield* fs.readFileString(pkgJsonPath);

  const decodedPackageJson = yield* S.decode(PkgJsonFromString)(content);

  if (P.isNullable(decodedPackageJson.devDependencies)) {
    // every pkg should have devDependencies
    return yield* Effect.fail(
      new ProgramError({
        message: `[extractPkgJsonDependencies] Missing devDependencies: ${pkgJsonPath}`,
      }),
    );
  }

  if (P.isNullable(decodedPackageJson.dependencies)) {
    return yield* Effect.fail(
      new ProgramError({
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
