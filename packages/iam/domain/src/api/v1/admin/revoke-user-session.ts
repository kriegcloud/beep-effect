/**
 * @module revoke-user-session
 *
 * Domain contract for revoking a user's session.
 *
 * @category exports
 * @since 0.1.0
 */

import { IamAuthError } from "@beep/iam-domain/api/common";
import { $IamDomainId } from "@beep/identity/packages";
import * as HttpApiEndpoint from "@effect/platform/HttpApiEndpoint";
import * as S from "effect/Schema";

const $I = $IamDomainId.create("api/v1/admin/revoke-user-session");

/**
 * Payload for revoking a user's session.
 *
 * @since 0.1.0
 * @category Schema
 */
export class Payload extends S.Class<Payload>($I`Payload`)(
  {
    /**
     * The session token to revoke.
     */
    sessionToken: S.String.annotations({
      description: "The session token to revoke.",
    }),
  },
  $I.annotations("RevokeUserSessionPayload", {
    description: "Payload for revoking a user's session.",
  })
) {}

/**
 * Success response after revoking a user's session.
 *
 * @since 0.1.0
 * @category Schema
 */
export class Success extends S.Class<Success>($I`Success`)(
  {
    /**
     * Whether the session was successfully revoked.
     */
    success: S.optionalWith(S.Boolean, { as: "Option", exact: true }).annotations({
      description: "Whether the session was successfully revoked.",
    }),
  },
  $I.annotations("RevokeUserSessionSuccess", {
    description: "Success response after revoking a user's session.",
  })
) {}

/**
 * Revoke user session endpoint contract.
 *
 * POST /admin/revoke-user-session
 *
 * Revokes a specific session by its token.
 *
 * @since 0.1.0
 * @category Contract
 */
export const Contract = HttpApiEndpoint.post("revoke-user-session", "/admin/revoke-user-session")
  .setPayload(Payload)
  .addError(
    IamAuthError.annotations(
      $I.annotations("IamAuthError", {
        description: "An error indicating a failure to revoke user session.",
      })
    )
  )
  .addSuccess(Success);
