import { CommonFields, IamAuthError } from "@beep/iam-domain/api/common";
import { $IamDomainId } from "@beep/identity/packages";
import { BS } from "@beep/schema";
import * as HttpApiEndpoint from "@effect/platform/HttpApiEndpoint";
import * as S from "effect/Schema";

const $I = $IamDomainId.create("api/v1/core/request-password-reset");

/**
 * Payload for requesting a password reset email.
 *
 * @since 1.0.0
 * @category Schema
 */
export class Payload extends S.Class<Payload>($I`Payload`)(
  {
    /**
     * The email address of the user requesting a password reset.
     */
    email: CommonFields.UserEmail,

    /**
     * Optional URL to redirect the user to after clicking the reset link.
     */
    redirectTo: S.optionalWith(BS.URLPath, { as: "Option", exact: true }).annotations({
      description: "Optional URL to redirect the user to after clicking the reset link.",
    }),
  },
  $I.annotations("RequestPasswordResetPayload", {
    description: "Payload for requesting a password reset email.",
  })
) {}

/**
 * Success response after requesting a password reset.
 *
 * @since 1.0.0
 * @category Schema
 */
export class Success extends S.Class<Success>($I`Success`)(
  {
    /**
     * Indicates whether the password reset request was processed.
     * Note: This will be true even if the email doesn't exist (for security).
     */
    status: S.optionalWith(S.Boolean, { as: "Option", exact: true }).annotations({
      description: "Indicates whether the password reset request was processed.",
    }),

    /**
     * Optional message providing additional context about the request.
     */
    message: S.optionalWith(S.String, { as: "Option", exact: true }).annotations({
      description: "Optional message providing additional context about the request.",
    }),
  },
  $I.annotations("RequestPasswordResetSuccess", {
    description: "Success response after requesting a password reset.",
  })
) {}

/**
 * Request password reset endpoint contract.
 *
 * POST /request-password-reset
 *
 * Initiates a password reset flow by sending an email to the user
 * with a password reset link.
 *
 * @since 1.0.0
 * @category Contract
 */
export const Contract = HttpApiEndpoint.post("request-password-reset", "/request-password-reset")
  .setPayload(Payload)
  .addError(
    IamAuthError.annotations(
      $I.annotations("IamAuthError", {
        description: "An error indicating a failure to request password reset.",
      })
    )
  )
  .addSuccess(Success);
