/**
 * @fileoverview
 * Revoke session handler implementation.
 *
 * Implements the revoke session contract using Better Auth's client and notifies
 * session watchers via `$sessionSignal` after successful revocation.
 *
 * @module @beep/iam-client/core/revoke-session/handler
 * @category Core/RevokeSession
 * @since 0.1.0
 */
import * as Common from "@beep/iam-client/_internal";
import { client } from "@beep/iam-client/adapters";
import * as Contract from "./contract.ts";

/**
 * Revoke session handler that terminates a specific session.
 *
 * Calls Better Auth's revokeSession method, validates the response, and notifies
 * session watchers via `$sessionSignal` after successful revocation.
 *
 * @example
 * ```typescript
 * import * as Effect from "effect/Effect"
 * import { RevokeSession } from "@beep/iam-client/core"
 *
 * const program = Effect.gen(function* () {
 *   const result = yield* RevokeSession.Handler({ token: "session-token" })
 *   console.log(result.success)  // true
 * })
 * ```
 *
 * @category Core/RevokeSession/Handlers
 * @since 0.1.0
 */
export const Handler = Contract.Wrapper.implement(
  Common.wrapIamMethod({
    wrapper: Contract.Wrapper,
    mutatesSession: true,
  })((encodedPayload) => client.revokeSession(encodedPayload))
);
