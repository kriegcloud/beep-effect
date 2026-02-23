/**
 * @module impersonate-user
 *
 * Domain contract for impersonating a user.
 *
 * @category exports
 * @since 0.1.0
 */

import { IamAuthError } from "@beep/iam-domain/api/common";
import { $IamDomainId } from "@beep/identity/packages";
import { Session, User } from "@beep/shared-domain/entities";
import * as HttpApiEndpoint from "@effect/platform/HttpApiEndpoint";
import * as S from "effect/Schema";

const $I = $IamDomainId.create("api/v1/admin/impersonate-user");

/**
 * Payload for impersonating a user.
 *
 * @since 0.1.0
 * @category Schema
 */
export class Payload extends S.Class<Payload>($I`Payload`)(
  {
    /**
     * The ID of the user to impersonate.
     */
    userId: S.String.annotations({
      description: "The ID of the user to impersonate.",
    }),
  },
  $I.annotations("ImpersonateUserPayload", {
    description: "Payload for impersonating a user.",
  })
) {}

/**
 * Success response after impersonating a user.
 *
 * @since 0.1.0
 * @category Schema
 */
export class Success extends S.Class<Success>($I`Success`)(
  {
    /**
     * The impersonation session.
     */
    session: S.optionalWith(Session.Model, { as: "Option", exact: true }).annotations({
      description: "The impersonation session.",
    }),

    /**
     * The impersonated user.
     */
    user: S.optionalWith(User.Model, { as: "Option", exact: true }).annotations({
      description: "The impersonated user.",
    }),
  },
  $I.annotations("ImpersonateUserSuccess", {
    description: "Success response after impersonating a user.",
  })
) {}

/**
 * Impersonate user endpoint contract.
 *
 * POST /admin/impersonate-user
 *
 * Allows an admin to impersonate a user.
 *
 * @since 0.1.0
 * @category Contract
 */
export const Contract = HttpApiEndpoint.post("impersonate-user", "/admin/impersonate-user")
  .setPayload(Payload)
  .addError(
    IamAuthError.annotations(
      $I.annotations("IamAuthError", {
        description: "An error indicating a failure to impersonate user.",
      })
    )
  )
  .addSuccess(Success);
