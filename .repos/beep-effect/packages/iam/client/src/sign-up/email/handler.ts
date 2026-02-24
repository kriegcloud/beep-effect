/**
 * @fileoverview Email sign-up handler implementation.
 *
 * This module provides the handler for email-based user registration,
 * integrating the contract schemas with Better Auth's signUp.email client.
 *
 * The handler automatically:
 * - Encodes form input (firstName/lastName → name)
 * - Validates password matching
 * - Applies captcha middleware
 * - Notifies session signal after successful sign-up
 *
 * @module @beep/iam-client/sign-up/email/handler
 * @category SignUp/Email
 * @since 0.1.0
 */

import * as Common from "@beep/iam-client/_internal";
import { client } from "@beep/iam-client/adapters";
import * as Contract from "./contract.ts";

/**
 * Email sign-up handler with captcha validation and session management.
 *
 * This handler implements the email sign-up contract using the wrapIamMethod
 * utility pattern. It handles the complete sign-up flow from form submission
 * to session creation.
 *
 * @remarks
 * **Payload Transformation**:
 * The handler receives encoded payload with firstName + lastName already
 * combined into a name field (transformation happens in Payload schema).
 *
 * **Captcha Integration**:
 * The `before` hook (withCaptchaResponse) extracts the captcha token from
 * middleware context and passes it to the handler function.
 *
 * **Session Mutation**:
 * After successful sign-up, the handler notifies `$sessionSignal` to trigger
 * auth guards and UI state updates.
 *
 * @example
 * ```typescript
 * import * as Effect from "effect/Effect"
 * import { Email } from "@beep/iam-client/sign-up"
 *
 * const program = Effect.gen(function* () {
 *   const payload = Email.PayloadFrom.make({
 *     firstName: "John",
 *     lastName: "Doe",
 *     email: "john@example.com",
 *     password: "SecurePass123!",
 *     passwordConfirm: "SecurePass123!",
 *     rememberMe: true
 *   })
 *
 *   const result = yield* Email.Handler(payload)
 *   console.log(result.user.email) // "john@example.com"
 * })
 * ```
 *
 * @category SignUp/Email/Handlers
 * @since 0.1.0
 */
export const Handler = Contract.Wrapper.implement(
  Common.wrapIamMethod({
    wrapper: Contract.Wrapper,
    mutatesSession: true,
    before: Common.withCaptchaResponse,
  })((encodedPayload, captchaResponse) =>
    client.signUp.email({
      ...encodedPayload,
      fetchOptions: {
        headers: {
          "x-captcha-response": captchaResponse,
        },
      },
    })
  )
);
