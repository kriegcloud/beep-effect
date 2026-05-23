/**
 * Schema-backed form builders, atom state graphs, and React bindings for
 * product-agnostic form experiences.
 *
 * @since 0.0.0
 * @packageDocumentation
 */

/**
 * Core form APIs.
 *
 * @category forms
 * @since 0.0.0
 */
export * from "./core.ts";

/**
 * Package version for `@beep/form`.
 *
 * @example
 * ```ts
 * import { VERSION } from "@beep/form"
 *
 * console.log(VERSION) // "0.0.0"
 * ```
 *
 * @since 0.0.0
 * @category configuration
 */
export const VERSION = "0.0.0" as const;
