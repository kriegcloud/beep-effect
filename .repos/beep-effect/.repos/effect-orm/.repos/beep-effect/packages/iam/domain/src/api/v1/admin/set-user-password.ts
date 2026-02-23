/**
 * @module set-user-password
 *
 * Domain contract for setting a user's password.
 *
 * @category exports
 * @since 0.1.0
 */

import { IamAuthError } from "@beep/iam-domain/api/common";
import { $IamDomainId } from "@beep/identity/packages";
import * as HttpApiEndpoint from "@effect/platform/HttpApiEndpoint";
import * as S from "effect/Schema";

const $I = $IamDomainId.create("api/v1/admin/set-user-password");

/**
 * Payload for setting a user's password.
 *
 * @since 0.1.0
 * @category Schema
 */
export class Payload extends S.Class<Payload>($I`Payload`)(
  {
    /**
     * The ID of the user to update.
     */
    userId: S.String.annotations({
      description: "The ID of the user to update.",
    }),

    /**
     * The new password for the user.
     */
    newPassword: S.String.annotations({
      description: "The new password for the user.",
    }),
  },
  $I.annotations("SetUserPasswordPayload", {
    description: "Payload for setting a user's password.",
  })
) {}

/**
 * Success response after setting a user's password.
 *
 * @since 0.1.0
 * @category Schema
 */
export class Success extends S.Class<Success>($I`Success`)(
  {
    /**
     * Whether the password was successfully set.
     */
    status: S.optionalWith(S.Boolean, { as: "Option", exact: true }).annotations({
      description: "Whether the password was successfully set.",
    }),
  },
  $I.annotations("SetUserPasswordSuccess", {
    description: "Success response after setting a user's password.",
  })
) {}

/**
 * Set user password endpoint contract.
 *
 * POST /admin/set-user-password
 *
 * Sets a user's password.
 *
 * @since 0.1.0
 * @category Contract
 */
export const Contract = HttpApiEndpoint.post("set-user-password", "/admin/set-user-password")
  .setPayload(Payload)
  .addError(
    IamAuthError.annotations(
      $I.annotations("IamAuthError", {
        description: "An error indicating a failure to set user password.",
      })
    )
  )
  .addSuccess(Success);
