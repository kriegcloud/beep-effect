/**
 * @fileoverview
 * Reset namespace export for password functionality.
 *
 * @module @beep/iam-client/password/reset
 * @category Password/Reset
 * @since 0.1.0
 */

/**
 * Reset password namespace providing contract and handler.
 *
 * @example
 * ```typescript
 * import { Reset } from "@beep/iam-client/password"
 *
 * const result = yield* Reset.Handler({
 *   newPassword: Redacted.make("new"),
 *   token: "reset-token"
 * })
 * ```
 *
 * @category Password/Reset
 * @since 0.1.0
 */
export * as Reset from "./mod.ts";
