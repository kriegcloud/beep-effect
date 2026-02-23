import { CommonFields, IamAuthError } from "@beep/iam-domain/api/common";
import { $IamDomainId } from "@beep/identity/packages";
import { User } from "@beep/shared-domain/entities";
import * as HttpApiEndpoint from "@effect/platform/HttpApiEndpoint";
import * as S from "effect/Schema";

const $I = $IamDomainId.create("api/v1/core/verify-email");

/**
 * URL parameters for email verification.
 *
 * @since 1.0.0
 * @category Schema
 */
export class UrlParams extends S.Class<UrlParams>($I`UrlParams`)(
  {
    /**
     * The verification token received in the email.
     */
    token: S.String.annotations({
      description: "The verification token received in the email.",
    }),

    /**
     * Optional URL to redirect the user to after successful verification.
     */
    callbackURL: CommonFields.CallbackURL,
  },
  $I.annotations("VerifyEmailUrlParams", {
    description: "URL parameters for email verification.",
  })
) {}

/**
 * Success response after verifying email.
 *
 * @since 1.0.0
 * @category Schema
 */
export class Success extends S.Class<Success>($I`Success`)(
  {
    /**
     * The user whose email was verified.
     */
    user: User.Model,

    /**
     * Indicates if the email was verified successfully.
     */
    status: S.Boolean.annotations({
      description: "Indicates if the email was verified successfully.",
    }),
  },
  $I.annotations("VerifyEmailSuccess", {
    description: "Success response after verifying email.",
  })
) {}

/**
 * Verify email endpoint contract.
 *
 * GET /verify-email
 *
 * Verifies a user's email address using a token sent via email.
 * The token is passed as a URL query parameter.
 *
 * @since 1.0.0
 * @category Contract
 */
export const Contract = HttpApiEndpoint.get("verifyEmail", "/verify-email")
  .setUrlParams(UrlParams)
  .addError(
    IamAuthError.annotations(
      $I.annotations("IamAuthError", {
        description: "An error indicating a failure to verify email.",
      })
    )
  )
  .addSuccess(Success);
