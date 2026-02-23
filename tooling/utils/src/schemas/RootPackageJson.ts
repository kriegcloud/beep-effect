/**
 * Root package.json schema for monorepo root.
 *
 * Extends base PackageJson with required workspaces field.
 *
 * @since 0.1.0
 */
import * as S from "effect/Schema";

/**
 * Root package.json schema requiring a non-empty `workspaces` field.
 *
 * This is a minimal schema used by repo utilities to discover workspace
 * globs. All other fields are allowed but not required.
 *
 * @example
 * ```typescript
 * import { RootPackageJson } from "@beep/tooling-utils"
 * import * as S from "effect/Schema"
 *
 * const rootPkg = S.decodeUnknownSync(RootPackageJson)({
 *   workspaces: ["packages/*", "apps/*"]
 * })
 *
 * console.log(rootPkg.workspaces)
 * // => ["packages/*", "apps/*"]
 * ```
 *
 * @category Schemas/Package
 * @since 0.1.0
 */
export const RootPackageJson = S.Struct({
  workspaces: S.NonEmptyArray(S.NonEmptyTrimmedString),
});

/**
 * Type representing a root package.json with workspaces field.
 *
 * @example
 * ```typescript
 * import type { RootPackageJson } from "@beep/tooling-utils"
 *
 * const rootPkg: RootPackageJson = {
 *   workspaces: ["packages/*"]
 * }
 * ```
 *
 * @category Schemas/Package
 * @since 0.1.0
 */
export type RootPackageJson = typeof RootPackageJson.Type;
