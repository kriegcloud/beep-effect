/**
 * Public schemas used by tooling-utils.
 *
 * Includes JSON primitives, package.json, tsconfig.json, and workspace
 * dependency schemas leveraged across repo utilities.
 *
 * @since 0.1.0
 */

/**
 * Re-exports .env file parsing schemas and utilities.
 *
 * @example
 * ```typescript
 * import { DotEnv } from "@beep/tooling-utils"
 * ```
 *
 * @category exports
 * @since 0.1.0
 */
export * from "./DotEnv.js";
/**
 * Re-exports environment variable schema.
 *
 * @example
 * ```typescript
 * import { EnvironmentVariableName } from "@beep/tooling-utils"
 * ```
 *
 * @category exports
 * @since 0.1.0
 */
export * from "./EnvironmentVariable.js";
/**
 * Re-exports JSON schema primitives and utilities.
 *
 * @example
 * ```typescript
 * import { Json } from "@beep/tooling-utils"
 * ```
 *
 * @category exports
 * @since 0.1.0
 */
export * from "./Json.js";
/**
 * Re-exports JSON literal schema utilities.
 *
 * @example
 * ```typescript
 * import { JsonLiteral } from "@beep/tooling-utils"
 * ```
 *
 * @category exports
 * @since 0.1.0
 */
export * from "./JsonLiteral.js";
/**
 * Re-exports package.json schema and types.
 *
 * @example
 * ```typescript
 * import { PackageJson } from "@beep/tooling-utils"
 * ```
 *
 * @category exports
 * @since 0.1.0
 */
export * from "./PackageJson.js";
/**
 * Re-exports root package.json schema and types.
 *
 * @example
 * ```typescript
 * import { RootPackageJson } from "@beep/tooling-utils"
 * ```
 *
 * @category exports
 * @since 0.1.0
 */
export * from "./RootPackageJson.js";
/**
 * Re-exports tsconfig.json schema and types.
 *
 * @example
 * ```typescript
 * import { TsConfigJson } from "@beep/tooling-utils"
 * ```
 *
 * @category exports
 * @since 0.1.0
 */
export * from "./TsConfigJson.js";
/**
 * Re-exports workspace dependencies schema and utilities.
 *
 * @example
 * ```typescript
 * import { WorkspaceDependencies } from "@beep/tooling-utils"
 * ```
 *
 * @category exports
 * @since 0.1.0
 */
export * from "./WorkspaceDependencies.js";
