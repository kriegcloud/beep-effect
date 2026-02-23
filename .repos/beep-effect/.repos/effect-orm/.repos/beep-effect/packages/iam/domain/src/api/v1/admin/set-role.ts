/**
 * @module set-role
 *
 * Domain contract for setting a user's role.
 *
 * @category exports
 * @since 0.1.0
 */

import { IamAuthError } from "@beep/iam-domain/api/common";
import { $IamDomainId } from "@beep/identity/packages";
import { User } from "@beep/shared-domain/entities";
import * as HttpApiEndpoint from "@effect/platform/HttpApiEndpoint";
import * as S from "effect/Schema";

const $I = $IamDomainId.create("api/v1/admin/set-role");

/**
 * Payload for setting a user's role.
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
     * The role to assign to the user.
     */
    role: S.String.annotations({
      description: "The role to assign to the user.",
    }),
  },
  $I.annotations("SetRolePayload", {
    description: "Payload for setting a user's role.",
  })
) {}

/**
 * Success response after setting a user's role.
 *
 * @since 0.1.0
 * @category Schema
 */
export class Success extends S.Class<Success>($I`Success`)(
  {
    /**
     * The updated user object.
     */
    user: S.optionalWith(User.Model, { as: "Option", exact: true }).annotations({
      description: "The updated user object.",
    }),
  },
  $I.annotations("SetRoleSuccess", {
    description: "Success response after setting a user's role.",
  })
) {}

/**
 * Set role endpoint contract.
 *
 * POST /admin/set-role
 *
 * Sets a user's role.
 *
 * @since 0.1.0
 * @category Contract
 */
export const Contract = HttpApiEndpoint.post("set-role", "/admin/set-role")
  .setPayload(Payload)
  .addError(
    IamAuthError.annotations(
      $I.annotations("IamAuthError", {
        description: "An error indicating a failure to set user role.",
      })
    )
  )
  .addSuccess(Success);
