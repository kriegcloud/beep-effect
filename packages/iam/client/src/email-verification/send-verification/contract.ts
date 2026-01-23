/**
 * @fileoverview
 * Send verification email contract schemas and wrapper for Better Auth integration.
 *
 * Defines the payload and success schemas for email verification requests.
 * The payload includes email and optional callback URL fields.
 *
 * @module @beep/iam-client/email-verification/send-verification/contract
 * @category EmailVerification/SendVerification
 * @since 0.1.0
 */

import * as Common from "@beep/iam-client/_internal";
import { formValuesAnnotation } from "@beep/iam-client/_internal";
import { $IamClientId } from "@beep/identity/packages";
import { BS } from "@beep/schema";
import * as W from "@beep/wrap";
import * as S from "effect/Schema";

const $I = $IamClientId.create("email-verification/send-verification");

/**
 * Payload for sending a verification email.
 *
 * @example
 * ```typescript
 * import { SendVerification } from "@beep/iam-client/email-verification"
 *
 * const payload = SendVerification.Payload.make({
 *   email: "user@example.com",
 *   callbackURL: "/verify-email"
 * })
 * ```
 *
 * @category EmailVerification/SendVerification/Schemas
 * @since 0.1.0
 */
export class Payload extends S.Class<Payload>($I`Payload`)(
  {
    email: BS.Email,
    callbackURL: S.optional(BS.URLString),
  },
  formValuesAnnotation({
    email: "",
    callbackURL: undefined,
  })
) {}

/**
 * Success response - verification email sent.
 *
 * Better Auth returns { status: boolean } on success.
 *
 * @example
 * ```typescript
 * import * as Effect from "effect/Effect"
 * import { SendVerification } from "@beep/iam-client/email-verification"
 *
 * const program = Effect.gen(function* () {
 *   const success = yield* SendVerification.Handler({ email: "user@example.com" })
 *   console.log(success.status) // true
 * })
 * ```
 *
 * @category EmailVerification/SendVerification/Schemas
 * @since 0.1.0
 */
export class Success extends S.Class<Success>($I`Success`)(
  {
    status: S.Boolean,
  },
  $I.annotations("Success", {
    description: "The success response for sending a verification email.",
  })
) {}

/**
 * Send verification email contract wrapper combining payload, success, and error schemas.
 *
 * @example
 * ```typescript
 * import { SendVerification } from "@beep/iam-client/email-verification"
 *
 * const handler = SendVerification.Wrapper.implement(
 *   (payload) => client.sendVerificationEmail(payload)
 * )
 * ```
 *
 * @category EmailVerification/SendVerification/Contracts
 * @since 0.1.0
 */
export const Wrapper = W.Wrapper.make("SendVerification", {
  payload: Payload,
  success: Success,
  error: Common.IamError,
});
