/**
 * @module ban-user
 *
 * Domain contract for banning a user.
 *
 * @category exports
 * @since 0.1.0
 */

import { IamAuthError } from "@beep/iam-domain/api/common";
import { $IamDomainId } from "@beep/identity/packages";
import { User } from "@beep/shared-domain/entities";
import * as HttpApiEndpoint from "@effect/platform/HttpApiEndpoint";
import * as S from "effect/Schema";

const $I = $IamDomainId.create("api/v1/admin/ban-user");

/**
 * Payload for banning a user.
 *
 * @since 0.1.0
 * @category Schema
 */
export class Payload extends S.Class<Payload>($I`Payload`)(
  {
    /**
     * The ID of the user to ban.
     */
    userId: S.String.annotations({
      description: "The ID of the user to ban.",
    }),

    /**
     * The reason for the ban.
     */
    banReason: S.optionalWith(S.String, { as: "Option", exact: true }).annotations({
      description: "The reason for the ban.",
    }),

    /**
     * The number of seconds until the ban expires.
     */
    banExpiresIn: S.optionalWith(S.Number, { as: "Option", exact: true }).annotations({
      description: "The number of seconds until the ban expires.",
    }),
  },
  $I.annotations("BanUserPayload", {
    description: "Payload for banning a user.",
  })
) {}

/**
 * Success response after banning a user.
 *
 * @since 0.1.0
 * @category Schema
 */
export class Success extends S.Class<Success>($I`Success`)(
  {
    /**
     * The banned user object.
     */
    user: S.optionalWith(User.Model, { as: "Option", exact: true }).annotations({
      description: "The banned user object.",
    }),
  },
  $I.annotations("BanUserSuccess", {
    description: "Success response after banning a user.",
  })
) {}

/**
 * Ban user endpoint contract.
 *
 * POST /admin/ban-user
 *
 * Bans a user from the system.
 *
 * @since 0.1.0
 * @category Contract
 */
export const Contract = HttpApiEndpoint.post("ban-user", "/admin/ban-user")
  .setPayload(Payload)
  .addError(
    IamAuthError.annotations(
      $I.annotations("IamAuthError", {
        description: "An error indicating a failure to ban user.",
      })
    )
  )
  .addSuccess(Success);
