/**
 * @fileoverview
 * Send verification email handler implementation using wrapIamMethod factory.
 *
 * Implements the send verification contract using Better Auth's sendVerificationEmail client.
 * Automatically encodes/decodes payloads, checks for errors, and does NOT notify
 * `$sessionSignal` since this is an email-only operation.
 *
 * @module @beep/iam-client/email-verification/send-verification/handler
 * @category EmailVerification/SendVerification
 * @since 0.1.0
 */

import * as Common from "@beep/iam-client/_internal";
import { client } from "@beep/iam-client/adapters";
import * as Contract from "./contract.ts";

/**
 * Handler for sending a verification email.
 *
 * Automatically encodes/decodes payloads and checks for Better Auth errors.
 * Does NOT notify `$sessionSignal` since this is an email-only operation
 * that works with or without an active session.
 *
 * @example
 * ```typescript
 * import * as Effect from "effect/Effect"
 * import { SendVerification } from "@beep/iam-client/email-verification"
 *
 * const program = Effect.gen(function* () {
 *   const result = yield* SendVerification.Handler({
 *     email: "user@example.com",
 *     callbackURL: "/verify-email"
 *   })
 *   console.log(result.status) // true
 * })
 * ```
 *
 * @category EmailVerification/SendVerification/Handlers
 * @since 0.1.0
 */
export const Handler = Contract.Wrapper.implement(
  Common.wrapIamMethod({
    wrapper: Contract.Wrapper,
    mutatesSession: false,
  })((encodedPayload) => client.sendVerificationEmail(encodedPayload))
);
