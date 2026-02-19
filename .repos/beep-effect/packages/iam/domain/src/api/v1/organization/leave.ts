/**
 * @module organization/leave
 *
 * Leave an organization.
 *
 * @category Contract
 * @since 1.0.0
 */

import { IamAuthError } from "@beep/iam-domain/api/common";
import { $IamDomainId } from "@beep/identity/packages";
import { SharedEntityIds } from "@beep/shared-domain";
import * as HttpApiEndpoint from "@effect/platform/HttpApiEndpoint";
import * as S from "effect/Schema";

const $I = $IamDomainId.create("api/v1/organization/leave");

/**
 * Payload for leaving an organization.
 *
 * @since 1.0.0
 * @category Schema
 */
export class Payload extends S.Class<Payload>($I`Payload`)(
  {
    organizationId: SharedEntityIds.OrganizationId.annotations({
      description: "The organization ID for the member to leave.",
    }),
  },
  $I.annotations("LeaveOrganizationPayload", {
    description: "Payload for leaving an organization.",
  })
) {}

/**
 * Success response after leaving an organization.
 *
 * @since 1.0.0
 * @category Schema
 */
export class Success extends S.Class<Success>($I`Success`)(
  {
    success: S.Boolean.annotations({
      description: "Whether the leave was successful.",
    }),
  },
  $I.annotations("LeaveOrganizationSuccess", {
    description: "Success response after leaving an organization.",
  })
) {}

/**
 * Leave organization endpoint contract.
 *
 * POST /organization/leave
 *
 * @since 1.0.0
 * @category Contract
 */
export const Contract = HttpApiEndpoint.post("leave", "/leave")
  .setPayload(Payload)
  .addSuccess(Success)
  .addError(
    IamAuthError.annotations(
      $I.annotations("IamAuthError", {
        description: "An error indicating a failure to leave the organization.",
      })
    )
  );
