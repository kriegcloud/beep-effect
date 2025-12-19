/**
 * @module organization/create-role
 *
 * Create a new role in an organization.
 *
 * @category Contract
 * @since 1.0.0
 */

import { IamAuthError } from "@beep/iam-domain/api/common";
import { OrganizationRole } from "@beep/iam-domain/entities";
import { $IamDomainId } from "@beep/identity/packages";
import * as HttpApiEndpoint from "@effect/platform/HttpApiEndpoint";
import * as S from "effect/Schema";

const $I = $IamDomainId.create("api/v1/organization/create-role");

/**
 * Additional fields for role creation.
 *
 * @since 1.0.0
 * @category Schema
 */
export const AdditionalFields = S.Record({ key: S.String, value: S.Unknown }).annotations({
  description: "Additional custom fields for the role.",
});

/**
 * Payload for creating a role.
 *
 * @since 1.0.0
 * @category Schema
 */
export class Payload extends S.Class<Payload>($I`Payload`)(
  {
    ...OrganizationRole.Model.insert.fields,
    additionalFields: S.optionalWith(AdditionalFields, { as: "Option", exact: true }).annotations({
      description: "Additional custom fields for the role.",
    }),
  },
  $I.annotations("CreateRolePayload", {
    description: "Payload for creating a role.",
  })
) {}

/**
 * Success response after creating a role.
 *
 * @since 1.0.0
 * @category Schema
 */
export class Success extends S.Class<Success>($I`Success`)(
  {
    role: OrganizationRole.Model.annotations({
      description: "The created role.",
    }),
  },
  $I.annotations("CreateRoleSuccess", {
    description: "Success response after creating a role.",
  })
) {}

/**
 * Create role endpoint contract.
 *
 * POST /organization/create-role
 *
 * @since 1.0.0
 * @category Contract
 */
export const Contract = HttpApiEndpoint.post("create-role", "/create-role")
  .setPayload(Payload)
  .addSuccess(Success)
  .addError(
    IamAuthError.annotations(
      $I.annotations("IamAuthError", {
        description: "An error indicating a failure to create the role.",
      })
    )
  );
