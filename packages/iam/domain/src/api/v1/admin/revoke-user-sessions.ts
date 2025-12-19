/**
 * @module revoke-user-sessions
 *
 * Domain contract for revoking all sessions for a user.
 *
 * @category exports
 * @since 0.1.0
 */

import { IamAuthError } from "@beep/iam-domain/api/common";
import { $IamDomainId } from "@beep/identity/packages";
import * as HttpApiEndpoint from "@effect/platform/HttpApiEndpoint";
import * as S from "effect/Schema";

const $I = $IamDomainId.create("api/v1/admin/revoke-user-sessions");

/**
 * Payload for revoking all sessions for a user.
 *
 * @since 0.1.0
 * @category Schema
 */
export class Payload extends S.Class<Payload>($I`Payload`)(
  {
    /**
     * The ID of the user whose sessions to revoke.
     */
    userId: S.String.annotations({
      description: "The ID of the user whose sessions to revoke.",
    }),
  },
  $I.annotations("RevokeUserSessionsPayload", {
    description: "Payload for revoking all sessions for a user.",
  })
) {}

/**
 * Success response after revoking all sessions for a user.
 *
 * @since 0.1.0
 * @category Schema
 */
export class Success extends S.Class<Success>($I`Success`)(
  {
    /**
     * Whether the sessions were successfully revoked.
     */
    success: S.optionalWith(S.Boolean, { as: "Option", exact: true }).annotations({
      description: "Whether the sessions were successfully revoked.",
    }),
  },
  $I.annotations("RevokeUserSessionsSuccess", {
    description: "Success response after revoking all sessions for a user.",
  })
) {}

/**
 * Revoke user sessions endpoint contract.
 *
 * POST /admin/revoke-user-sessions
 *
 * Revokes all sessions for a specific user.
 *
 * @since 0.1.0
 * @category Contract
 */
export const Contract = HttpApiEndpoint.post("revoke-user-sessions", "/admin/revoke-user-sessions")
  .setPayload(Payload)
  .addError(
    IamAuthError.annotations(
      $I.annotations("IamAuthError", {
        description: "An error indicating a failure to revoke user sessions.",
      })
    )
  )
  .addSuccess(Success);
