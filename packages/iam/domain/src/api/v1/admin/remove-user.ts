/**
 * @module remove-user
 *
 * Domain contract for removing a user.
 *
 * @category exports
 * @since 0.1.0
 */

import { IamAuthError } from "@beep/iam-domain/api/common";
import { $IamDomainId } from "@beep/identity/packages";
import * as HttpApiEndpoint from "@effect/platform/HttpApiEndpoint";
import * as S from "effect/Schema";

const $I = $IamDomainId.create("api/v1/admin/remove-user");

/**
 * Payload for removing a user.
 *
 * @since 0.1.0
 * @category Schema
 */
export class Payload extends S.Class<Payload>($I`Payload`)(
  {
    /**
     * The ID of the user to remove.
     */
    userId: S.String.annotations({
      description: "The ID of the user to remove.",
    }),
  },
  $I.annotations("RemoveUserPayload", {
    description: "Payload for removing a user.",
  })
) {}

/**
 * Success response after removing a user.
 *
 * @since 0.1.0
 * @category Schema
 */
export class Success extends S.Class<Success>($I`Success`)(
  {
    /**
     * Whether the user was successfully removed.
     */
    success: S.optionalWith(S.Boolean, { as: "Option", exact: true }).annotations({
      description: "Whether the user was successfully removed.",
    }),
  },
  $I.annotations("RemoveUserSuccess", {
    description: "Success response after removing a user.",
  })
) {}

/**
 * Remove user endpoint contract.
 *
 * POST /admin/remove-user
 *
 * Removes a user from the system.
 *
 * @since 0.1.0
 * @category Contract
 */
export const Contract = HttpApiEndpoint.post("remove-user", "/admin/remove-user")
  .setPayload(Payload)
  .addError(
    IamAuthError.annotations(
      $I.annotations("IamAuthError", {
        description: "An error indicating a failure to remove user.",
      })
    )
  )
  .addSuccess(Success);
