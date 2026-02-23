/**
 * @fileoverview
 * Email sign-in contract schemas and wrapper for Better Auth integration.
 *
 * Defines the payload and success schemas for email-based authentication.
 * The payload includes email and password fields with validation.
 * The wrapper applies CaptchaMiddleware for bot protection.
 *
 * @module @beep/iam-client/sign-in/email/contract
 * @category SignIn/Email
 * @since 0.1.0
 */

import * as Common from "@beep/iam-client/_internal";
import { formValuesAnnotation } from "@beep/iam-client/_internal";
import { $IamClientId } from "@beep/identity/packages";
import { BS } from "@beep/schema";
import * as W from "@beep/wrap";
import * as S from "effect/Schema";

const $I = $IamClientId.create("sign-in/email");

/**
 * Email sign-in request payload containing user credentials.
 *
 * @example
 * ```typescript
 * import { Email } from "@beep/iam-client/sign-in"
 *
 * const payload = Email.Payload.make({
 *   email: "user@example.com",
 *   password: "securePassword123"
 * })
 * ```
 *
 * @category SignIn/Email/Schemas
 * @since 0.1.0
 */
export class Payload extends S.Class<Payload>($I`Payload`)(
  {
    email: Common.UserEmail,
    password: Common.UserPassword,
  },
  // Default form values use Encoded types (plain strings for Redacted fields, etc.)
  formValuesAnnotation({
    email: "",
    password: "",
  })
) {}

/**
 * Email sign-in success response from Better Auth.
 *
 * @example
 * ```typescript
 * import * as Effect from "effect/Effect"
 * import { Email } from "@beep/iam-client/sign-in"
 *
 * const program = Effect.gen(function* () {
 *   const success = yield* Email.Handler({ email: "...", password: "..." })
 *   console.log(success.user.id)
 * })
 * ```
 *
 * @category SignIn/Email/Schemas
 * @since 0.1.0
 */
export class Success extends S.Class<Success>($I`Success`)(
  {
    redirect: S.optionalWith(S.Boolean, { default: () => true }),
    token: S.optionalWith(S.Redacted(S.String), { as: "Option", nullable: true }),
    url: BS.OptionFromNullishOptionalProperty(BS.URLString, null),
    user: Common.DomainUserFromBetterAuthUser,
  },
  $I.annotations("Success", {
    description: "The success response for signing in with an email and password.",
  })
) {}

/**
 * Email sign-in contract wrapper combining payload, success, and error schemas with captcha middleware.
 *
 * @example
 * ```typescript
 * import { Email } from "@beep/iam-client/sign-in"
 *
 * const handler = Email.Wrapper.implement(
 *   (payload) => client.signIn.email(payload)
 * )
 * ```
 *
 * @category SignIn/Email/Contracts
 * @since 0.1.0
 */
export const Wrapper = W.Wrapper.make("Email", {
  payload: Payload,
  success: Success,
  error: Common.IamError,
}).middleware(Common.CaptchaMiddleware);
