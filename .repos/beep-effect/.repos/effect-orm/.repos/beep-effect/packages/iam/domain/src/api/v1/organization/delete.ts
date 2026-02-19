/**
 * @module organization/delete
 *
 * Delete an organization.
 *
 * @category Contract
 * @since 1.0.0
 */

import { IamAuthError } from "@beep/iam-domain/api/common";
import { $IamDomainId } from "@beep/identity/packages";
import { SharedEntityIds } from "@beep/shared-domain";
import * as HttpApiEndpoint from "@effect/platform/HttpApiEndpoint";
import * as S from "effect/Schema";

const $I = $IamDomainId.create("api/v1/organization/delete");

/**
 * Payload for deleting an organization.
 *
 * @since 1.0.0
 * @category Schema
 */
export class Payload extends S.Class<Payload>($I`Payload`)(
  {
    organizationId: SharedEntityIds.OrganizationId.annotations({
      description: "The organization ID to delete.",
    }),
  },
  $I.annotations("DeleteOrganizationPayload", {
    description: "Payload for deleting an organization.",
  })
) {}

/**
 * Success response after deleting an organization.
 *
 * @since 1.0.0
 * @category Schema
 */
export class Success extends S.Class<Success>($I`Success`)(
  {
    success: S.Boolean.annotations({
      description: "Whether the deletion was successful.",
    }),
  },
  $I.annotations("DeleteOrganizationSuccess", {
    description: "Success response after deleting an organization.",
  })
) {}

/**
 * Delete organization endpoint contract.
 *
 * POST /organization/delete
 *
 * @since 1.0.0
 * @category Contract
 */
export const Contract = HttpApiEndpoint.post("delete", "/delete")
  .setPayload(Payload)
  .addSuccess(Success)
  .addError(
    IamAuthError.annotations(
      $I.annotations("IamAuthError", {
        description: "An error indicating a failure to delete the organization.",
      })
    )
  );
