import { CommonFields, IamAuthError } from "@beep/iam-domain/api/common";
import { $IamDomainId } from "@beep/identity/packages";
import * as HttpApiEndpoint from "@effect/platform/HttpApiEndpoint";
import * as S from "effect/Schema";

const $I = $IamDomainId.create("api/v1/core/send-verification-email");

/**
 * Payload for sending a verification email.
 *
 * @since 1.0.0
 * @category Schema
 */
export class Payload extends S.Class<Payload>($I`Payload`)(
  {
    /**
     * The email address to send the verification email to.
     */
    email: CommonFields.UserEmail,

    /**
     * Optional URL to use for the email verification callback link.
     */
    callbackURL: CommonFields.CallbackURL,
  },
  $I.annotations("SendVerificationEmailPayload", {
    description: "Payload for sending a verification email.",
  })
) {}

/**
 * Success response after sending a verification email.
 *
 * @since 1.0.0
 * @category Schema
 */
export class Success extends S.Class<Success>($I`Success`)(
  {
    /**
     * Indicates if the verification email was sent successfully.
     * Note: This may be true even if the email doesn't exist (for security).
     */
    status: S.optionalWith(S.Boolean, { as: "Option", exact: true }).annotations({
      description: "Indicates if the verification email was sent successfully.",
    }),
  },
  $I.annotations("SendVerificationEmailSuccess", {
    description: "Success response after sending a verification email.",
  })
) {}

/**
 * Send verification email endpoint contract.
 *
 * POST /send-verification-email
 *
 * Sends an email verification link to the specified email address.
 * The user must click the link to verify their email.
 *
 * @since 1.0.0
 * @category Contract
 */
export const Contract = HttpApiEndpoint.post("sendVerificationEmail", "/send-verification-email")
  .setPayload(Payload)
  .addError(
    IamAuthError.annotations(
      $I.annotations("IamAuthError", {
        description: "An error indicating a failure to send verification email.",
      })
    )
  )
  .addSuccess(Success);
