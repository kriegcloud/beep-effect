import * as S from "effect/Schema";

/**
 * Root package.json schema requiring a non-empty `workspaces` field.
 *
 * This is a minimal schema used by repo utilities to discover workspace
 * globs. All other fields are allowed but not required.
 */
export const RootPackageJson = S.Struct({
  workspaces: S.NonEmptyArray(S.NonEmptyTrimmedString),
});

export type RootPackageJson = typeof RootPackageJson.Type;
