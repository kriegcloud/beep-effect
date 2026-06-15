/**
 * Package entry point for `@beep/workspace-use-cases`.
 *
 * @packageDocumentation
 * @category use-cases
 * @since 0.0.0
 */

/**
 * Package version for the workspace use-case role.
 *
 * @example
 * ```ts
 * import { VERSION } from "@beep/workspace-use-cases"
 *
 * console.log(VERSION)
 * ```
 *
 * @category use-cases
 * @since 0.0.0
 */
export const VERSION = "0.0.0" as const;

/**
 * Public use-case exports for the workspace package.
 *
 * @category use-cases
 * @since 0.0.0
 */
export * from "./public.ts";
