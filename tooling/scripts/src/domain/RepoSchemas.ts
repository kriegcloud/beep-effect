import * as S from "effect/Schema";

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