/**
 * @module organization/update-role
 *
 * Update a role in an organization.
 *
 * @category Contract
 * @since 1.0.0
 */

import { IamAuthError } from "@beep/iam-domain/api/common";
import { OrganizationRole } from "@beep/iam-domain/entities";
import { $IamDomainId } from "@beep/identity/packages";
import { IamEntityIds, SharedEntityIds } from "@beep/shared-domain";
import * as HttpApiEndpoint from "@effect/platform/HttpApiEndpoint";
import * as S from "effect/Schema";

const $I = $IamDomainId.create("api/v1/organization/update-role");

/**
 * Payload for updating a role.
 *
 * @since 1.0.0
 * @category Schema
 */
export class Payload extends S.Class<Payload>($I`Payload`)(
  {
    roleId: IamEntityIds.OrganizationRoleId.annotations({
      description: "The ID of the role to update.",
    }),
    organizationId: S.optionalWith(SharedEntityIds.OrganizationId, { as: "Option", exact: true }).annotations({
      description: "The organization ID. Defaults to active organization.",
    }),
    role: S.optionalWith(S.String, { as: "Option", exact: true }).annotations({
      description: "The new name for the role.",
    }),
    permission: S.optionalWith(S.String, { as: "Option", exact: true }).annotations({
      description: "The new permission for the role.",
    }),
  },
  $I.annotations("UpdateRolePayload", {
    description: "Payload for updating a role.",
  })
) {}

/**
 * Success response after updating a role.
 *
 * @since 1.0.0
 * @category Schema
 */
export class Success extends S.Class<Success>($I`Success`)(
  {
    role: OrganizationRole.Model.annotations({
      description: "The updated role.",
    }),
  },
  $I.annotations("UpdateRoleSuccess", {
    description: "Success response after updating a role.",
  })
) {}

/**
 * Update role endpoint contract.
 *
 * POST /organization/update-role
 *
 * @since 1.0.0
 * @category Contract
 */
export const Contract = HttpApiEndpoint.post("update-role", "/update-role")
  .setPayload(Payload)
  .addSuccess(Success)
  .addError(
    IamAuthError.annotations(
      $I.annotations("IamAuthError", {
        description: "An error indicating a failure to update the role.",
      })
    )
  );
