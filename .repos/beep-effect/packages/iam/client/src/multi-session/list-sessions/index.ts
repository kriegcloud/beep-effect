/**
 * @fileoverview
 * ListSessions namespace export for multi-session functionality.
 *
 * @module @beep/iam-client/multi-session/list-sessions
 * @category MultiSession/ListSessions
 * @since 0.1.0
 */

/**
 * List sessions namespace providing contract and handler.
 *
 * @example
 * ```typescript
 * import { ListSessions } from "@beep/iam-client/multi-session"
 *
 * const sessions = yield* ListSessions.Handler
 * ```
 *
 * @category MultiSession/ListSessions
 * @since 0.1.0
 */
export * as ListSessions from "./mod.ts";
