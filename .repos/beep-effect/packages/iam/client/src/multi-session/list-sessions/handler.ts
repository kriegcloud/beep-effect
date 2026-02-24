/**
 * @fileoverview
 * List sessions handler implementation using wrapIamMethod factory.
 *
 * Implements the list sessions contract using Better Auth's multiSession plugin.
 * Automatically decodes responses and checks for errors. Does NOT notify
 * `$sessionSignal` since this is a read-only operation.
 *
 * @module @beep/iam-client/multi-session/list-sessions/handler
 * @category MultiSession/ListSessions
 * @since 0.1.0
 */

import * as Common from "@beep/iam-client/_internal";
import { client } from "@beep/iam-client/adapters";
import * as Contract from "./contract.ts";

/**
 * Handler for listing all device sessions for the current user.
 *
 * Automatically decodes responses and checks for Better Auth errors.
 * Does NOT notify `$sessionSignal` since this is a read-only operation.
 *
 * @example
 * ```typescript
 * import * as Effect from "effect/Effect"
 * import { ListSessions } from "@beep/iam-client/multi-session"
 *
 * const program = Effect.gen(function* () {
 *   const sessions = yield* ListSessions.Handler
 *   sessions.forEach(session => console.log(session.id))
 * })
 * ```
 *
 * @category MultiSession/ListSessions/Handlers
 * @since 0.1.0
 */
export const Handler = Contract.Wrapper.implement(
  Common.wrapIamMethod({
    wrapper: Contract.Wrapper,
    mutatesSession: false,
  })(() => client.multiSession.listDeviceSessions({}))
);
