/**
 * @module unban-user
 *
 * Domain contract for unbanning a user.
 *
 * @category exports
 * @since 0.1.0
 */

import { IamAuthError } from "@beep/iam-domain/api/common";
import { $IamDomainId } from "@beep/identity/packages";
import { User } from "@beep/shared-domain/entities";
import * as HttpApiEndpoint from "@effect/platform/HttpApiEndpoint";
import * as S from "effect/Schema";

const $I = $IamDomainId.create("api/v1/admin/unban-user");

/**
 * Payload for unbanning a user.
 *
 * @since 0.1.0
 * @category Schema
 */
export class Payload extends S.Class<Payload>($I`Payload`)(
  {
    /**
     * The ID of the user to unban.
     */
    userId: S.String.annotations({
      description: "The ID of the user to unban.",
    }),
  },
  $I.annotations("UnbanUserPayload", {
    description: "Payload for unbanning a user.",
  })
) {}

/**
 * Success response after unbanning a user.
 *
 * @since 0.1.0
 * @category Schema
 */
export class Success extends S.Class<Success>($I`Success`)(
  {
    /**
     * The unbanned user object.
     */
    user: S.optionalWith(User.Model, { as: "Option", exact: true }).annotations({
      description: "The unbanned user object.",
    }),
  },
  $I.annotations("UnbanUserSuccess", {
    description: "Success response after unbanning a user.",
  })
) {}

/**
 * Unban user endpoint contract.
 *
 * POST /admin/unban-user
 *
 * Unbans a user from the system.
 *
 * @since 0.1.0
 * @category Contract
 */
export const Contract = HttpApiEndpoint.post("unban-user", "/admin/unban-user")
  .setPayload(Payload)
  .addError(
    IamAuthError.annotations(
      $I.annotations("IamAuthError", {
        description: "An error indicating a failure to unban user.",
      })
    )
  )
  .addSuccess(Success);
