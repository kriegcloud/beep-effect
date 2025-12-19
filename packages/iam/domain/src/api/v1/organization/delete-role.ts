/**
 * @module organization/delete-role
 *
 * Delete a role from an organization.
 *
 * @category Contract
 * @since 1.0.0
 */

import { IamAuthError } from "@beep/iam-domain/api/common";
import { $IamDomainId } from "@beep/identity/packages";
import { IamEntityIds, SharedEntityIds } from "@beep/shared-domain";
import * as HttpApiEndpoint from "@effect/platform/HttpApiEndpoint";
import * as S from "effect/Schema";

const $I = $IamDomainId.create("api/v1/organization/delete-role");

/**
 * Payload for deleting a role.
 *
 * @since 1.0.0
 * @category Schema
 */
export class Payload extends S.Class<Payload>($I`Payload`)(
  {
    roleId: IamEntityIds.OrganizationRoleId.annotations({
      description: "The ID of the role to delete.",
    }),
    organizationId: S.optionalWith(SharedEntityIds.OrganizationId, { as: "Option", exact: true }).annotations({
      description: "The organization ID. Defaults to active organization.",
    }),
  },
  $I.annotations("DeleteRolePayload", {
    description: "Payload for deleting a role.",
  })
) {}

/**
 * Success response after deleting a role.
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
  $I.annotations("DeleteRoleSuccess", {
    description: "Success response after deleting a role.",
  })
) {}

/**
 * Delete role endpoint contract.
 *
 * POST /organization/delete-role
 *
 * @since 1.0.0
 * @category Contract
 */
export const Contract = HttpApiEndpoint.post("delete-role", "/delete-role")
  .setPayload(Payload)
  .addSuccess(Success)
  .addError(
    IamAuthError.annotations(
      $I.annotations("IamAuthError", {
        description: "An error indicating a failure to delete the role.",
      })
    )
  );
