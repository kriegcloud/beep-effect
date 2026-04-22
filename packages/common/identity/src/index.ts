/**
 * Barrel re-exports for `@beep/identity`.
 *
 * @example
 * ```typescript
 * import { make } from "@beep/identity"
 *
 * const { $MyPkgId } = make("my-pkg")
 * const id = $MyPkgId.make("Service")
 * void id // "@beep/my-pkg/Service"
 * ```
 *
 * @module @beep/identity
 * @since 0.0.0
 */

/**
 * Identity system core -- composers, annotations, and branded types.
 *
 * @example
 * ```typescript
 * import { make } from "@beep/identity"
 *
 * const { $MyPkgId } = make("my-pkg")
 * console.log($MyPkgId.make("Service"))
 * ```
 *
 * @category exports
 * @since 0.0.0
 */
export * from "./Id.ts";

/**
 * Pre-built identity composers for every `@beep/*` workspace package.
 *
 * @example
 * ```typescript
 * import { $DataId } from "@beep/identity"
 *
 * console.log($DataId.make("CurrencyCodes"))
 * ```
 *
 * @category exports
 * @since 0.0.0
 */
export * from "./packages.ts";
