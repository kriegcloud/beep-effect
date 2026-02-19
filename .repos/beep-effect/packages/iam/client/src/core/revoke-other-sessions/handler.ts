/**
 * @fileoverview
 * Revoke other sessions handler implementation.
 *
 * Implements the revoke other sessions contract using Better Auth's client and notifies
 * session watchers via `$sessionSignal` after successful revocation.
 *
 * @module @beep/iam-client/core/revoke-other-sessions/handler
 * @category Core/RevokeOtherSessions
 * @since 0.1.0
 */
import * as Common from "@beep/iam-client/_internal";
import { client } from "@beep/iam-client/adapters";
import * as Contract from "./contract.ts";

/**
 * Revoke other sessions handler that terminates all sessions except the current one.
 *
 * Calls Better Auth's revokeOtherSessions method, validates the response, and notifies
 * session watchers via `$sessionSignal` after successful revocation.
 *
 * @example
 * ```typescript
 * import * as Effect from "effect/Effect"
 * import { RevokeOtherSessions } from "@beep/iam-client/core"
 *
 * const program = Effect.gen(function* () {
 *   const result = yield* RevokeOtherSessions.Handler
 *   console.log(result.success)  // true
 * })
 * ```
 *
 * @category Core/RevokeOtherSessions/Handlers
 * @since 0.1.0
 */
export const Handler = Contract.Wrapper.implement(
  Common.wrapIamMethod({
    wrapper: Contract.Wrapper,
    mutatesSession: true,
  })(() => client.revokeOtherSessions())
);
