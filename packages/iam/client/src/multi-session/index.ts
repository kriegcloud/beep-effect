/**
 * @fileoverview
 * MultiSession namespace aggregating session management flows.
 *
 * @module @beep/iam-client/multi-session
 * @category MultiSession
 * @since 0.1.0
 */

/**
 * Multi-session namespace providing contracts, handlers, and atoms for session management.
 *
 * @example
 * ```typescript
 * import { MultiSession } from "@beep/iam-client"
 *
 * // Use atoms with toast feedback
 * const { listSessions, revoke, setActive } = MultiSession.Atoms.use()
 *
 * // Access list sessions contract directly
 * const sessions = yield* MultiSession.ListSessions.Handler
 * ```
 *
 * @category MultiSession
 * @since 0.1.0
 */
export * as MultiSession from "./mod.ts";
