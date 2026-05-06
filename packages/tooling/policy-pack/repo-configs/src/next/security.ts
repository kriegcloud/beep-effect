/**
 * Public secure-header entrypoint for `@beep/repo-configs/next/security`.
 *
 * @packageDocumentation
 * @since 0.0.0
 */

/**
 * Secure header helpers for shared Next.js configuration.
 *
 * @example
 * ```ts
 * import { withSecureHeaders } from "@beep/repo-configs/next/security"
 * const config = withSecureHeaders({ reactStrictMode: true })
 * void config
 * ```
 * @category configuration
 * @since 0.0.0
 */
export * from "./security/index.ts";
