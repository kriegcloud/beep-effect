/**
 * @fileoverview
 * Change namespace export for password functionality.
 *
 * @module @beep/iam-client/password/change
 * @category Password/Change
 * @since 0.1.0
 */

/**
 * Change password namespace providing contract and handler.
 *
 * @example
 * ```typescript
 * import { Change } from "@beep/iam-client/password"
 *
 * const result = yield* Change.Handler({
 *   currentPassword: Redacted.make("old"),
 *   newPassword: Redacted.make("new")
 * })
 * ```
 *
 * @category Password/Change
 * @since 0.1.0
 */
export * as Change from "./mod.ts";
