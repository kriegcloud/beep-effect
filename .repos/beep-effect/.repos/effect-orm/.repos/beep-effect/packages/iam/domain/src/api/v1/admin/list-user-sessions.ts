/**
 * @module list-user-sessions
 *
 * Domain contract for listing a user's sessions.
 *
 * @category exports
 * @since 0.1.0
 */

import { IamAuthError } from "@beep/iam-domain/api/common";
import { $IamDomainId } from "@beep/identity/packages";
import { Session } from "@beep/shared-domain/entities";
import * as HttpApiEndpoint from "@effect/platform/HttpApiEndpoint";
import * as S from "effect/Schema";

const $I = $IamDomainId.create("api/v1/admin/list-user-sessions");

/**
 * Payload for listing a user's sessions.
 *
 * @since 0.1.0
 * @category Schema
 */
export class Payload extends S.Class<Payload>($I`Payload`)(
  {
    /**
     * The ID of the user to list sessions for.
     */
    userId: S.String.annotations({
      description: "The ID of the user to list sessions for.",
    }),
  },
  $I.annotations("ListUserSessionsPayload", {
    description: "Payload for listing a user's sessions.",
  })
) {}

/**
 * Success response after listing a user's sessions.
 *
 * @since 0.1.0
 * @category Schema
 */
export class Success extends S.Class<Success>($I`Success`)(
  {
    /**
     * The user's sessions.
     */
    sessions: S.optionalWith(S.Array(Session.Model), { as: "Option", exact: true }).annotations({
      description: "The user's sessions.",
    }),
  },
  $I.annotations("ListUserSessionsSuccess", {
    description: "Success response after listing a user's sessions.",
  })
) {}

/**
 * List user sessions endpoint contract.
 *
 * POST /admin/list-user-sessions
 *
 * Lists all sessions for a specific user.
 *
 * @since 0.1.0
 * @category Contract
 */
export const Contract = HttpApiEndpoint.post("list-user-sessions", "/admin/list-user-sessions")
  .setPayload(Payload)
  .addError(
    IamAuthError.annotations(
      $I.annotations("IamAuthError", {
        description: "An error indicating a failure to list user sessions.",
      })
    )
  )
  .addSuccess(Success);
