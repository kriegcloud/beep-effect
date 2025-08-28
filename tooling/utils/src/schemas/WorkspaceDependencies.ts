import * as S from "effect/Schema";

/**
 * Schema helpers for modeling workspace and npm dependency tuples and maps.
 *
 * These are used by repo utilities to type-check and aggregate dependencies
 * across all workspaces in the monorepo.
 */

/**
 * Prefix for workspace package names.
 */
export const WorkspacePkgKeyPrefix = S.Literal("@beep/");

/**
 * Full workspace package name (e.g. "@beep/foo").
 */
export const WorkspacePkgKey = S.TemplateLiteral(WorkspacePkgKeyPrefix, S.String);

/**
 * Version specifiers for workspace dependencies (e.g. "workspace:^", "workspace:^").
 */
export const WorkspacePkgValue = S.Literal("workspace:^", "workspace:^");

/**
 * Tuple containing a workspace package name and its version specifier.
 */
export const WorkspaceDepTuple = S.Tuple(WorkspacePkgKey, WorkspacePkgValue);

/**
 * Prefix for npm dependency version specifiers.
 */
export const NpmDepValuePrefix = S.Literal("^");

/**
 * Npm dependency version specifier (e.g. "^1.2.3").
 */
export const NpmDepValue = S.TemplateLiteral(NpmDepValuePrefix, S.String);

/**
 * Tuple containing an npm package name and its version specifier.
 */
export const NpmDepTuple = S.Tuple(S.NonEmptyTrimmedString, NpmDepValue);

/**
 * Dependency sets split into workspace and npm names.
 */
export const Dependencies = S.Struct({
  /**
   * Set of workspace package names.
   */
  workspace: S.HashSetFromSelf(WorkspacePkgKey),
  /**
   * Set of npm package names.
   */
  npm: S.HashSetFromSelf(S.NonEmptyTrimmedString),
});

/**
 * Value type stored for each workspace: its dev and prod dependency sets.
 */
export const RepoDepMapValue = S.Struct({
  /**
   * Dev dependencies for the workspace.
   */
  devDependencies: Dependencies,
  /**
   * Prod dependencies for the workspace.
   */
  dependencies: Dependencies,
});

/**
 * Map from full workspace package name (e.g. "@beep/foo") to its
 * {@link RepoDepMapValue}.
 */
export const RepoDepMap = S.HashMapFromSelf({
  /**
   * Full workspace package name.
   */
  key: WorkspacePkgKey,
  /**
   * Value type stored for each workspace.
   */
  value: RepoDepMapValue,
});
