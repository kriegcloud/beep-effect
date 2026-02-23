/**
 * @fileoverview Handler implementation for username-based sign-in with captcha middleware.
 *
 * Implements the username sign-in contract using Better Auth's signIn.username client.
 * Automatically encodes/decodes payloads, applies captcha middleware, checks for
 * errors, and notifies `$sessionSignal` after successful authentication.
 *
 * @module @beep/iam-client/sign-in/username/handler
 * @category SignIn/Username
 * @since 0.1.0
 */

import * as Common from "@beep/iam-client/_internal";
import { client } from "@beep/iam-client/adapters";
import * as Contract from "./contract.ts";

/**
 * Handler for username sign-in operations with integrated captcha verification.
 *
 * Automatically encodes payloads, validates captcha responses, checks for Better Auth errors,
 * and notifies session state after successful authentication.
 *
 * @example
 * ```typescript
 * import * as Effect from "effect/Effect"
 * import { Username } from "@beep/iam-client/sign-in"
 *
 * const program = Effect.gen(function* () {
 *   const result = yield* Username.Handler({
 *     username: "alice",
 *     password: "secure-password"
 *   })
 * })
 * ```
 *
 * @category SignIn/Username/Handlers
 * @since 0.1.0
 */
export const Handler = Contract.Wrapper.implement(
  Common.wrapIamMethod({
    wrapper: Contract.Wrapper,
    mutatesSession: true,
    before: Common.withCaptchaResponse,
  })((encodedPayload, captchaResponse) =>
    client.signIn.username({
      ...encodedPayload,
      fetchOptions: {
        headers: {
          "x-captcha-response": captchaResponse,
        },
      },
    })
  )
);
