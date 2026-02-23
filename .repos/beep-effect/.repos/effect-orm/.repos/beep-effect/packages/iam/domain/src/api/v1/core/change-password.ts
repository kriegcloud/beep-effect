import { CommonFields, IamAuthError } from "@beep/iam-domain/api/common";
import { $IamDomainId } from "@beep/identity/packages";
import { User } from "@beep/shared-domain/entities";
import * as HttpApiEndpoint from "@effect/platform/HttpApiEndpoint";
import * as S from "effect/Schema";

const $I = $IamDomainId.create("api/v1/core/change-password");

/**
 * Payload for changing a user's password.
 *
 * @since 1.0.0
 * @category Schema
 */
export class Payload extends S.Class<Payload>($I`Payload`)(
  {
    /**
     * The user's current password for verification.
     */
    currentPassword: CommonFields.UserPassword.annotations({
      description: "The user's current password for verification.",
    }),

    /**
     * The new password to set for the user.
     */
    newPassword: CommonFields.UserPassword.annotations({
      description: "The new password to set for the user.",
    }),

    /**
     * Whether to revoke all other active sessions after changing the password.
     * Defaults to false.
     */
    revokeOtherSessions: S.optionalWith(S.Boolean, { default: () => false }).annotations({
      description: "Whether to revoke all other active sessions after changing the password.",
    }),
  },
  $I.annotations("ChangePasswordPayload", {
    description: "Payload for changing a user's password.",
  })
) {}

/**
 * Success response after changing a user's password.
 *
 * @since 1.0.0
 * @category Schema
 */
export class Success extends S.Class<Success>($I`Success`)(
  {
    /**
     * The updated user object.
     */
    user: User.Model,

    /**
     * Optional new session token if session was refreshed.
     */
    token: S.optionalWith(S.String, { as: "Option", nullable: true }).annotations({
      description: "Optional new session token if session was refreshed.",
    }),
  },
  $I.annotations("ChangePasswordSuccess", {
    description: "Success response after changing a user's password.",
  })
) {}

/**
 * Change password endpoint contract.
 *
 * POST /change-password
 *
 * Changes the authenticated user's password after verifying their current password.
 *
 * @since 1.0.0
 * @category Contract
 */
export const Contract = HttpApiEndpoint.post("changePassword", "/change-password")
  .setPayload(Payload)
  .addError(
    IamAuthError.annotations(
      $I.annotations("IamAuthError", {
        description: "An error indicating a failure to change password.",
      })
    )
  )
  .addSuccess(Success);
