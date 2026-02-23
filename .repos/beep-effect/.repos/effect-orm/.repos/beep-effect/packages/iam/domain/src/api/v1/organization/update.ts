/**
 * @module organization/update
 *
 * Update an organization.
 *
 * @category Contract
 * @since 1.0.0
 */

import { IamAuthError } from "@beep/iam-domain/api/common";
import { Organization } from "@beep/iam-domain/entities";
import { $IamDomainId } from "@beep/identity/packages";
import * as HttpApiEndpoint from "@effect/platform/HttpApiEndpoint";
import * as S from "effect/Schema";

const $I = $IamDomainId.create("api/v1/organization/update");

/**
 * Data object for updating organization fields.
 *
 * @since 1.0.0
 * @category Schema
 */
export class UpdateData extends S.Class<UpdateData>($I`UpdateData`)(
  Organization.Model.update,
  $I.annotations("UpdateData", {
    description: "Data for updating organization fields.",
  })
) {}

/**
 * Payload for updating an organization.
 *
 * @since 1.0.0
 * @category Schema
 */
export class Payload extends S.Class<Payload>($I`Payload`)(
  {
    data: UpdateData.annotations({
      description: "The data to update.",
    }),
    organizationId: S.optionalWith(S.String, { as: "Option", exact: true }).annotations({
      description: "The organization ID. Defaults to active organization.",
    }),
  },
  $I.annotations("UpdateOrganizationPayload", {
    description: "Payload for updating an organization.",
  })
) {}

/**
 * Update organization endpoint contract.
 *
 * POST /organization/update
 *
 * @since 1.0.0
 * @category Contract
 */
export const Contract = HttpApiEndpoint.post("update", "/update")
  .setPayload(Payload)
  .addSuccess(Organization.Model)
  .addError(
    IamAuthError.annotations(
      $I.annotations("IamAuthError", {
        description: "An error indicating a failure to update the organization.",
      })
    )
  );
