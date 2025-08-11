import * as S from "effect/Schema";

// Root package.json schema requiring a non-empty workspaces field.
// Other fields are allowed but not required.
export const RootPackageJson = S.Struct({
  workspaces: S.NonEmptyArray(S.NonEmptyTrimmedString),
});

export type RootPackageJson = typeof RootPackageJson.Type;
