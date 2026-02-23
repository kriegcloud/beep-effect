/**
 * @fileoverview
 * Revoke namespace export for multi-session functionality.
 *
 * @module @beep/iam-client/multi-session/revoke
 * @category MultiSession/Revoke
 * @since 0.1.0
 */

/**
 * Revoke session namespace providing contract and handler.
 *
 * @example
 * ```typescript
 * import { Revoke } from "@beep/iam-client/multi-session"
 *
 * const result = yield* Revoke.Handler({ sessionToken: "..." })
 * ```
 *
 * @category MultiSession/Revoke
 * @since 0.1.0
 */
export * as Revoke from "./mod.ts";
