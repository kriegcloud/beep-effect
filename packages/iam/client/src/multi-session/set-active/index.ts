/**
 * @fileoverview
 * SetActive namespace export for multi-session functionality.
 *
 * @module @beep/iam-client/multi-session/set-active
 * @category MultiSession/SetActive
 * @since 0.1.0
 */

/**
 * Set active session namespace providing contract and handler.
 *
 * @example
 * ```typescript
 * import { SetActive } from "@beep/iam-client/multi-session"
 *
 * const result = yield* SetActive.Handler({ sessionToken: "..." })
 * ```
 *
 * @category MultiSession/SetActive
 * @since 0.1.0
 */
export * as SetActive from "./mod.ts";
