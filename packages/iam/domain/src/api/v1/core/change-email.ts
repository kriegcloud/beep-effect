/**
 * @module change-email
 *
 * Domain contract for changing a user's email address.
 *
 * @category API/V1/Core
 * @since 0.1.0
 */

import { CommonFields, IamAuthError } from "@beep/iam-domain/api/common";
import { $IamDomainId } from "@beep/identity/packages";
import { User } from "@beep/shared-domain/entities";
import * as HttpApiEndpoint from "@effect/platform/HttpApiEndpoint";
import * as S from "effect/Schema";

const $I = $IamDomainId.create("api/v1/core/change-email");

/**
 * Payload for changing a user's email address.
 *
 * @since 0.1.0
 * @category Schema
 */
export class Payload extends S.Class<Payload>($I`Payload`)(
  {
    /**
     * The new email address for the user.
     */
    newEmail: CommonFields.UserEmail.annotations({
      description: "The new email address for the user.",
    }),

    /**
     * The URL to redirect to after email verification.
     */
    callbackURL: CommonFields.CallbackURL.annotations({
      description: "The URL to redirect to after email verification.",
    }),
  },
  $I.annotations("ChangeEmailPayload", {
    description: "Payload for changing a user's email address.",
  })
) {}

/**
 * Success response after initiating an email change.
 *
 * @since 0.1.0
 * @category Schema
 */
export class Success extends S.Class<Success>($I`Success`)(
  {
    /**
     * The updated user object (if email was changed immediately).
     */
    user: S.optionalWith(User.Model, { as: "Option", nullable: true }).annotations({
      description: "The updated user object (if email was changed immediately).",
    }),

    /**
     * Indicates if the request was successful.
     */
    status: S.Boolean.annotations({
      description: "Indicates if the request was successful.",
    }),

    /**
     * Status message (e.g., "Email updated" or "Verification email sent").
     */
    message: S.optionalWith(S.String, { as: "Option", nullable: true }).annotations({
      description: 'Status message (e.g., "Email updated" or "Verification email sent").',
    }),
  },
  $I.annotations("ChangeEmailSuccess", {
    description: "Success response after initiating an email change.",
  })
) {}

/**
 * Change email endpoint contract.
 *
 * POST /change-email
 *
 * Initiates an email change for the authenticated user. If email verification
 * is enabled, sends a verification email to the new address. Otherwise,
 * updates the email immediately.
 *
 * @since 0.1.0
 * @category Contract
 */
export const Contract = HttpApiEndpoint.post("change-email", "/change-email")
  .setPayload(Payload)
  .addError(
    IamAuthError.annotations(
      $I.annotations("IamAuthError", {
        description: "An error indicating a failure to change the email address.",
      })
    )
  )
  .addSuccess(Success);
