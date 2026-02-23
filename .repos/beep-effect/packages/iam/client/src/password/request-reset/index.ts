/**
 * @fileoverview
 * RequestReset namespace export for password functionality.
 *
 * @module @beep/iam-client/password/request-reset
 * @category Password/RequestReset
 * @since 0.1.0
 */

/**
 * Request password reset namespace providing contract and handler.
 *
 * @example
 * ```typescript
 * import { RequestReset } from "@beep/iam-client/password"
 *
 * const result = yield* RequestReset.Handler({ email: "user@example.com" })
 * ```
 *
 * @category Password/RequestReset
 * @since 0.1.0
 */
export * as RequestReset from "./mod.ts";
