/**
 * @module stop-impersonating
 *
 * Domain contract for stopping user impersonation.
 *
 * @category exports
 * @since 0.1.0
 */

import { IamAuthError } from "@beep/iam-domain/api/common";
import { $IamDomainId } from "@beep/identity/packages";
import * as HttpApiEndpoint from "@effect/platform/HttpApiEndpoint";
import * as S from "effect/Schema";

const $I = $IamDomainId.create("api/v1/admin/stop-impersonating");

/**
 * Success response after stopping impersonation.
 *
 * @since 0.1.0
 * @category Schema
 */
export class Success extends S.Class<Success>($I`Success`)(
  {
    /**
     * Whether impersonation was successfully stopped.
     */
    status: S.optionalWith(S.Boolean, { as: "Option", exact: true }).annotations({
      description: "Whether impersonation was successfully stopped.",
    }),
  },
  $I.annotations("StopImpersonatingSuccess", {
    description: "Success response after stopping impersonation.",
  })
) {}

/**
 * Stop impersonating endpoint contract.
 *
 * POST /admin/stop-impersonating
 *
 * Stops impersonating a user and returns to the admin's session.
 *
 * @since 0.1.0
 * @category Contract
 */
export const Contract = HttpApiEndpoint.post("stop-impersonating", "/admin/stop-impersonating")
  .addError(
    IamAuthError.annotations(
      $I.annotations("IamAuthError", {
        description: "An error indicating a failure to stop impersonating.",
      })
    )
  )
  .addSuccess(Success);
