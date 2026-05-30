/**
 * Version component.
 *
 * \@beep/ui — Shared UI component library.
 *
 * Provides shadcn components, theme tokens, and utilities
 * for consistent UI across the monorepo.
 *
 * Components and utilities are available via subpath imports:
 * - `@beep/ui/components/ui/button` — Button component
 * - `@beep/ui/lib/utils` — cn() utility
 * - `@beep/ui/styles/globals.css` — Theme tokens
 *
 * @example
 * ```ts
 * import { VERSION } from "@beep/ui"
 *
 * console.log(VERSION)
 * ```
 *
 * @category components
 * @since 0.0.0
 * @packageDocumentation
 */

/**
 * Version export.
 *
 * @example
 * ```ts
 * import { VERSION } from "@beep/ui"
 *
 * console.log(VERSION)
 * ```
 *
 * @category configuration
 * @since 0.0.0
 */
export const VERSION = "0.0.0" as const;
