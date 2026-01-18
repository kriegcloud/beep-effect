/**
 * @fileoverview
 * Email sign-in handler implementation using wrapIamMethod factory.
 *
 * Implements the email sign-in contract using Better Auth's signIn.email client.
 * Automatically encodes/decodes payloads, applies captcha middleware, checks for
 * errors, and notifies `$sessionSignal` after successful authentication.
 *
 * @module @beep/iam-client/sign-in/email/handler
 * @category SignIn/Email
 * @since 0.1.0
 */

import * as Common from "@beep/iam-client/_internal";
import { client } from "@beep/iam-client/adapters";
import * as Contract from "./contract.ts";

/**
 * Email sign-in handler that authenticates users via Better Auth.
 *
 * Automatically encodes/decodes payloads, runs captcha middleware before execution,
 * checks for Better Auth errors, and notifies `$sessionSignal` after successful sign-in.
 *
 * @example
 * ```typescript
 * import * as Effect from "effect/Effect"
 * import { Email } from "@beep/iam-client/sign-in"
 *
 * const program = Effect.gen(function* () {
 *   const result = yield* Email.Handler({
 *     email: "user@example.com",
 *     password: "securePassword123"
 *   })
 *   console.log(result.user.name)
 * })
 * ```
 *
 * @category SignIn/Email/Handlers
 * @since 0.1.0
 */
export const Handler = Contract.Wrapper.implement(
  Common.wrapIamMethod({
    wrapper: Contract.Wrapper,
    mutatesSession: true,
    before: Common.withCaptchaResponse,
  })((encodedPayload, captchaResponse) =>
    client.signIn.email({
      ...encodedPayload,
      fetchOptions: {
        headers: {
          "x-captcha-response": captchaResponse,
        },
      },
    })
  )
);
