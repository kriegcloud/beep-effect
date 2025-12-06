/**
 * Workspace and npm dependency schemas.
 *
 * Schema helpers for modeling workspace and npm dependency tuples and maps.
 * These are used by repo utilities to type-check and aggregate dependencies
 * across all workspaces in the monorepo.
 *
 * @since 0.1.0
 */
import * as S from "effect/Schema";

/**
 * Prefix for workspace package names.
 *
 * @example
 * ```typescript
 * import { WorkspacePkgKeyPrefix } from "@beep/tooling-utils"
 * import * as S from "effect/Schema"
 *
 * const decode = S.decodeUnknownSync(WorkspacePkgKeyPrefix)
 * decode("@beep/")  // => "@beep/"
 * ```
 *
 * @category Schemas/Dependencies
 * @since 0.1.0
 */
export const WorkspacePkgKeyPrefix = S.Literal("@beep/");

/**
 * Full workspace package name (e.g. "@beep/foo").
 *
 * @example
 * ```typescript
 * import { WorkspacePkgKey } from "@beep/tooling-utils"
 * import * as S from "effect/Schema"
 *
 * const decode = S.decodeUnknownSync(WorkspacePkgKey)
 * decode("@beep/common-schema")  // => "@beep/common-schema"
 * ```
 *
 * @category Schemas/Dependencies
 * @since 0.1.0
 */
export const WorkspacePkgKey = S.TemplateLiteral(WorkspacePkgKeyPrefix, S.String);

/**
 * Version specifiers for workspace dependencies (e.g. "workspace:^").
 *
 * @example
 * ```typescript
 * import { WorkspacePkgValue } from "@beep/tooling-utils"
 * import * as S from "effect/Schema"
 *
 * const decode = S.decodeUnknownSync(WorkspacePkgValue)
 * decode("workspace:^")  // => "workspace:^"
 * ```
 *
 * @category Schemas/Dependencies
 * @since 0.1.0
 */
export const WorkspacePkgValue = S.Literal("workspace:^", "workspace:^");

/**
 * Tuple containing a workspace package name and its version specifier.
 *
 * @example
 * ```typescript
 * import { WorkspaceDepTuple } from "@beep/tooling-utils"
 * import * as S from "effect/Schema"
 *
 * const decode = S.decodeUnknownSync(WorkspaceDepTuple)
 * decode(["@beep/common-schema", "workspace:^"])
 * ```
 *
 * @category Schemas/Dependencies
 * @since 0.1.0
 */
export const WorkspaceDepTuple = S.Tuple(WorkspacePkgKey, WorkspacePkgValue);

/**
 * Prefix for npm dependency version specifiers.
 *
 * @example
 * ```typescript
 * import { NpmDepValuePrefix } from "@beep/tooling-utils"
 * import * as S from "effect/Schema"
 *
 * const decode = S.decodeUnknownSync(NpmDepValuePrefix)
 * decode("^")  // => "^"
 * ```
 *
 * @category Schemas/Dependencies
 * @since 0.1.0
 */
export const NpmDepValuePrefix = S.Literal("^");

/**
 * Npm dependency version specifier (e.g. "^1.2.3").
 *
 * @example
 * ```typescript
 * import { NpmDepValue } from "@beep/tooling-utils"
 * import * as S from "effect/Schema"
 *
 * const decode = S.decodeUnknownSync(NpmDepValue)
 * decode("^3.0.0")  // => "^3.0.0"
 * ```
 *
 * @category Schemas/Dependencies
 * @since 0.1.0
 */
export const NpmDepValue = S.TemplateLiteral(NpmDepValuePrefix, S.String);

/**
 * Tuple containing an npm package name and its version specifier.
 *
 * @example
 * ```typescript
 * import { NpmDepTuple } from "@beep/tooling-utils"
 * import * as S from "effect/Schema"
 *
 * const decode = S.decodeUnknownSync(NpmDepTuple)
 * decode(["effect", "^3.0.0"])
 * ```
 *
 * @category Schemas/Dependencies
 * @since 0.1.0
 */
export const NpmDepTuple = S.Tuple(S.NonEmptyTrimmedString, NpmDepValue);

/**
 * Dependency sets split into workspace and npm names.
 *
 * @example
 * ```typescript
 * import { Dependencies } from "@beep/tooling-utils"
 * import * as S from "effect/Schema"
 * import * as HashSet from "effect/HashSet"
 *
 * const deps = S.decodeUnknownSync(Dependencies)({
 *   workspace: HashSet.fromIterable(["@beep/common-schema"]),
 *   npm: HashSet.fromIterable(["effect"])
 * })
 * ```
 *
 * @category Schemas/Dependencies
 * @since 0.1.0
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
 *
 * @example
 * ```typescript
 * import { RepoDepMapValue } from "@beep/tooling-utils"
 * import * as S from "effect/Schema"
 * import * as HashSet from "effect/HashSet"
 *
 * const value = S.decodeUnknownSync(RepoDepMapValue)({
 *   dependencies: {
 *     workspace: HashSet.fromIterable(["@beep/common-schema"]),
 *     npm: HashSet.fromIterable(["effect"])
 *   },
 *   devDependencies: {
 *     workspace: HashSet.empty(),
 *     npm: HashSet.fromIterable(["vitest"])
 *   }
 * })
 * ```
 *
 * @category Schemas/Dependencies
 * @since 0.1.0
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
 * Map from full workspace package name (e.g. "@beep/foo") to its dependency sets.
 *
 * @example
 * ```typescript
 * import { RepoDepMap } from "@beep/tooling-utils"
 * import * as S from "effect/Schema"
 * import * as HashMap from "effect/HashMap"
 * import * as HashSet from "effect/HashSet"
 *
 * const depMap = HashMap.make(
 *   ["@beep/common-schema", {
 *     dependencies: {
 *       workspace: HashSet.empty(),
 *       npm: HashSet.fromIterable(["effect"])
 *     },
 *     devDependencies: {
 *       workspace: HashSet.empty(),
 *       npm: HashSet.fromIterable(["vitest"])
 *     }
 *   }]
 * )
 * ```
 *
 * @category Schemas/Dependencies
 * @since 0.1.0
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
