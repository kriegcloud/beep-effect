/**
 * @fileoverview
 * Revoke session handler implementation using wrapIamMethod factory.
 *
 * Implements the revoke session contract using Better Auth's multiSession plugin.
 * Automatically encodes/decodes payloads and checks for errors. Notifies
 * `$sessionSignal` after success since session state changes.
 *
 * @module @beep/iam-client/multi-session/revoke/handler
 * @category MultiSession/Revoke
 * @since 0.1.0
 */

import * as Common from "@beep/iam-client/_internal";
import { client } from "@beep/iam-client/adapters";
import * as Contract from "./contract.ts";

/**
 * Handler for revoking a specific session.
 *
 * Automatically encodes/decodes payloads and checks for Better Auth errors.
 * Notifies `$sessionSignal` after success since session state changes.
 *
 * @example
 * ```typescript
 * import * as Effect from "effect/Effect"
 * import { Revoke } from "@beep/iam-client/multi-session"
 *
 * const program = Effect.gen(function* () {
 *   const result = yield* Revoke.Handler({
 *     sessionToken: "session-token-to-revoke"
 *   })
 *   console.log(result.status) // true
 * })
 * ```
 *
 * @category MultiSession/Revoke/Handlers
 * @since 0.1.0
 */
export const Handler = Contract.Wrapper.implement(
  Common.wrapIamMethod({
    wrapper: Contract.Wrapper,
    mutatesSession: true,
  })((encodedPayload) => client.multiSession.revoke(encodedPayload))
);
