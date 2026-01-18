/**
 * @fileoverview
 * Reset password handler implementation using wrapIamMethod factory.
 *
 * Implements the reset password contract using Better Auth's resetPassword client.
 * Automatically encodes/decodes payloads and checks for errors. Does NOT notify
 * `$sessionSignal` since the user must sign in after reset.
 *
 * @module @beep/iam-client/password/reset/handler
 * @category Password/Reset
 * @since 0.1.0
 */

import * as Common from "@beep/iam-client/_internal";
import { client } from "@beep/iam-client/adapters";
import * as Contract from "./contract.ts";

/**
 * Handler for resetting a password with a token.
 *
 * Automatically encodes/decodes payloads and checks for Better Auth errors.
 * Does NOT notify `$sessionSignal` since the user must sign in afterward.
 *
 * @example
 * ```typescript
 * import * as Effect from "effect/Effect"
 * import { Reset } from "@beep/iam-client/password"
 * import * as Redacted from "effect/Redacted"
 *
 * const program = Effect.gen(function* () {
 *   const result = yield* Reset.Handler({
 *     newPassword: Redacted.make("newSecurePassword123"),
 *     token: "reset-token-from-email"
 *   })
 *   console.log(result.status) // true
 * })
 * ```
 *
 * @category Password/Reset/Handlers
 * @since 0.1.0
 */
export const Handler = Contract.Wrapper.implement(
  Common.wrapIamMethod({
    wrapper: Contract.Wrapper,
    mutatesSession: false,
  })((encodedPayload) => client.resetPassword(encodedPayload))
);
