import { client } from "@beep/iam-client/adapters";
import * as Common from "../../_common";
import * as Contract from "./contract.ts";

/**
 * Handler for signing up with email and password.
 *
 * Features:
 * - Automatically encodes payload (firstName + lastName → name, validates passwords match)
 * - Properly checks for Better Auth errors before decoding response
 * - Notifies `$sessionSignal` after successful sign-up
 * - Uses consistent span naming: "sign-up/email/handler"
 *
 * The Payload schema's encode transform handles:
 * 1. Password confirmation validation (fails if passwords don't match)
 * 2. Computing `name` from firstName + lastName
 * 3. Mapping redirectTo → callbackURL for Better Auth API
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
