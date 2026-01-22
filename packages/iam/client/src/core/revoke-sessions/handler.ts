/**
 * @fileoverview
 * Revoke all sessions handler implementation.
 *
 * Implements the revoke sessions contract using Better Auth's client and notifies
 * session watchers via `$sessionSignal` after successful revocation.
 *
 * @module @beep/iam-client/core/revoke-sessions/handler
 * @category Core/RevokeSessions
 * @since 0.1.0
 */
import * as Common from "@beep/iam-client/_internal";
import { client } from "@beep/iam-client/adapters";
import * as Contract from "./contract.ts";

/**
 * Revoke sessions handler that terminates ALL sessions for the current user.
 *
 * Calls Better Auth's revokeSessions method, validates the response, and notifies
 * session watchers via `$sessionSignal` after successful revocation.
 *
 * @example
 * ```typescript
 * import * as Effect from "effect/Effect"
 * import { RevokeSessions } from "@beep/iam-client/core"
 *
 * const program = Effect.gen(function* () {
 *   const result = yield* RevokeSessions.Handler
 *   console.log(result.success)  // true
 * })
 * ```
 *
 * @category Core/RevokeSessions/Handlers
 * @since 0.1.0
 */
export const Handler = Contract.Wrapper.implement(
  Common.wrapIamMethod({
    wrapper: Contract.Wrapper,
    mutatesSession: true,
  })(() => client.revokeSessions())
);
