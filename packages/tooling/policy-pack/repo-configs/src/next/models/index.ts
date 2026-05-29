/**
 * Module containing schemas for Next.js configuration.
 *
 * @packageDocumentation
 * @since 0.0.0
 */

/**
 * AllowedDevOrigin schema.
 *
 * @example
 * ```ts
 * import { AllowedDevOrigin } from "@beep/repo-configs/next"
 * const schema = AllowedDevOrigin
 * console.log(schema)
 * ```
 * @category models
 * @since 0.0.0
 */
export * from "./AllowedDevOrigin.schema.ts";
/**
 * Compiler configuration schemas.
 *
 * @example
 * ```ts
 * import { CompilerConfig } from "@beep/repo-configs/next"
 * const schema = CompilerConfig
 * console.log(schema)
 * ```
 * @category models
 * @since 0.0.0
 */
export * from "./Compiler.schema.ts";
/**
 * Shared named Next.js configuration schemas.
 *
 * @example
 * ```ts
 * import { TypeScriptConfig } from "@beep/repo-configs/next"
 * const schema = TypeScriptConfig
 * console.log(schema)
 * ```
 * @category models
 * @since 0.0.0
 */
export * from "./ConfigPrimitives.schema.ts";
/**
 * Experimental Next.js configuration schemas.
 *
 * @example
 * ```ts
 * import { ExperimentalConfig } from "@beep/repo-configs/next"
 * const schema = ExperimentalConfig
 * console.log(schema)
 * ```
 * @category models
 * @since 0.0.0
 */
export * from "./ExperimentalConfig.schema.ts";
/**
 * Image configuration schemas.
 *
 * @example
 * ```ts
 * import { ImageConfig } from "@beep/repo-configs/next"
 * const schema = ImageConfig
 * console.log(schema)
 * ```
 * @category models
 * @since 0.0.0
 */
export * from "./ImageConfig.schema.ts";
/**
 * PrefetchInliningConfig schema.
 *
 * @example
 * ```ts
 * import { PrefetchInliningConfig } from "@beep/repo-configs/next"
 * const schema = PrefetchInliningConfig
 * console.log(schema)
 * ```
 * @category models
 * @since 0.0.0
 */
export * from "./PrefetchInliningConfig.schema.ts";
/**
 * Route configuration schemas.
 *
 * @example
 * ```ts
 * import { Rewrite } from "@beep/repo-configs/next"
 * const schema = Rewrite
 * console.log(schema)
 * ```
 * @category models
 * @since 0.0.0
 */
export * from "./Routes.schema.ts";
/**
 * Shared Next.js config helper schemas.
 *
 * @example
 * ```ts
 * import { SizeLimit } from "@beep/repo-configs/next"
 * const schema = SizeLimit
 * console.log(schema)
 * ```
 * @category models
 * @since 0.0.0
 */
export * from "./Shared.schema.ts";
/**
 * Subresource Integrity plugin schemas.
 *
 * @example
 * ```ts
 * import { SubresourceIntegrityAlgorithm } from "@beep/repo-configs/next"
 * const schema = SubresourceIntegrityAlgorithm
 * console.log(schema)
 * ```
 * @category models
 * @since 0.0.0
 */
export * from "./SubresourceIntegrityPlugin.schema.ts";
/**
 * Turbopack configuration schemas.
 *
 * @example
 * ```ts
 * import { TurbopackOptions } from "@beep/repo-configs/next"
 * const schema = TurbopackOptions
 * console.log(schema)
 * ```
 * @category models
 * @since 0.0.0
 */
export * from "./Turbopack.schema.ts";
