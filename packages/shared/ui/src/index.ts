/**
 * Shared UI role package.
 *
 * @packageDocumentation
 * @since 0.0.0
 */

/**
 * Shared UI package version.
 *
 * @example
 * ```ts
 * import { VERSION } from "@beep/shared-ui"
 *
 * console.log(VERSION)
 * ```
 *
 * @since 0.0.0
 * @category configuration
 */
export const VERSION = "0.0.0" as const;

/**
 * Shared-kernel browser-safe entity contracts.
 *
 * @example
 * ```ts
 * import { Entities } from "@beep/shared-ui"
 *
 * console.log(Entities.Organization.primaryLabel({ name: "Acme" }))
 * ```
 *
 * @since 0.0.0
 * @category entities
 */
export * as Entities from "./entities/index.ts";
