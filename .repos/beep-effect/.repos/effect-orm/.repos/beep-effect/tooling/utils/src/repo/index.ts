/**
 * Repository utilities barrel.
 *
 * Re-exports workspace resolution, dependency indexing/collection,
 * tsconfig discovery, and typed error helpers.
 *
 * @since 0.1.0
 */

/**
 * Re-exports file URL to path conversion utilities.
 *
 * @example
 * ```typescript
 * import { fromFileUrl, CurrentFile, CurrentDirectory } from "@beep/tooling-utils"
 * ```
 *
 * @category exports
 * @since 0.1.0
 */
export * from "./CurrentFile.js";

/**
 * Re-exports workspace dependency utilities.
 *
 * @example
 * ```typescript
 * import { resolveWorkspaceDependencies } from "@beep/tooling-utils"
 * ```
 *
 * @category exports
 * @since 0.1.0
 */
export * from "./Dependencies.js";

/**
 * Re-exports dependency index for fast lookup.
 *
 * @example
 * ```typescript
 * import { buildDependencyIndex } from "@beep/tooling-utils"
 * ```
 *
 * @category exports
 * @since 0.1.0
 */
export * from "./DependencyIndex.js";

/**
 * Re-exports repository error types.
 *
 * @example
 * ```typescript
 * import { NoSuchFileError, DomainError } from "@beep/tooling-utils"
 * ```
 *
 * @category exports
 * @since 0.1.0
 */
export * from "./Errors.js";

/**
 * Re-exports nearest package.json discovery utilities.
 *
 * @example
 * ```typescript
 * import { NearestPackageJson, NearestPackageJsonName, dirHasPackageJson } from "@beep/tooling-utils"
 * ```
 *
 * @category exports
 * @since 0.1.0
 */
export * from "./NearestPackageJson.js";

/**
 * Re-exports package file path mapping utilities.
 *
 * @example
 * ```typescript
 * import { buildPackageFileMap } from "@beep/tooling-utils"
 * ```
 *
 * @category exports
 * @since 0.1.0
 */
export * from "./PackageFileMap.js";

/**
 * Re-exports package.json mapping utilities.
 *
 * @example
 * ```typescript
 * import { buildPackageJsonMap } from "@beep/tooling-utils"
 * ```
 *
 * @category exports
 * @since 0.1.0
 */
export * from "./PackageJsonMap.js";

/**
 * Re-exports repository root discovery utilities.
 *
 * @example
 * ```typescript
 * import { findRepoRoot } from "@beep/tooling-utils"
 * ```
 *
 * @category exports
 * @since 0.1.0
 */
export * from "./Root.js";

/**
 * Re-exports tsconfig index for TypeScript configuration lookup.
 *
 * @example
 * ```typescript
 * import { buildTsConfigIndex } from "@beep/tooling-utils"
 * ```
 *
 * @category exports
 * @since 0.1.0
 */
export * from "./TsConfigIndex.js";

/**
 * Re-exports unique dependency collection utilities.
 *
 * @example
 * ```typescript
 * import { getUniqueDeps } from "@beep/tooling-utils"
 * ```
 *
 * @category exports
 * @since 0.1.0
 */
export * from "./UniqueDependencies.js";

/**
 * Re-exports workspace resolution utilities.
 *
 * @example
 * ```typescript
 * import { resolveWorkspaces } from "@beep/tooling-utils"
 * ```
 *
 * @category exports
 * @since 0.1.0
 */
export * from "./Workspaces.js";
