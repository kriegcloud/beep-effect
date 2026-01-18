/**
 * @fileoverview
 * Request password reset handler implementation using wrapIamMethod factory.
 *
 * Implements the request password reset contract using Better Auth's requestPasswordReset client.
 * Automatically encodes/decodes payloads and checks for errors. Does NOT notify
 * `$sessionSignal` since this is an email-only operation.
 *
 * @module @beep/iam-client/password/request-reset/handler
 * @category Password/RequestReset
 * @since 0.1.0
 */

import * as Common from "@beep/iam-client/_internal";
import { client } from "@beep/iam-client/adapters";
import * as Contract from "./contract.ts";

/**
 * Handler for requesting a password reset email.
 *
 * Automatically encodes/decodes payloads and checks for Better Auth errors.
 * Does NOT notify `$sessionSignal` since this is an email-only operation.
 *
 * @example
 * ```typescript
 * import * as Effect from "effect/Effect"
 * import { RequestReset } from "@beep/iam-client/password"
 *
 * const program = Effect.gen(function* () {
 *   const result = yield* RequestReset.Handler({
 *     email: "user@example.com",
 *     redirectTo: "/reset-password"
 *   })
 *   console.log(result.message)
 * })
 * ```
 *
 * @category Password/RequestReset/Handlers
 * @since 0.1.0
 */
export const Handler = Contract.Wrapper.implement(
  Common.wrapIamMethod({
    wrapper: Contract.Wrapper,
    mutatesSession: false,
  })((encodedPayload) => client.requestPasswordReset(encodedPayload))
);
