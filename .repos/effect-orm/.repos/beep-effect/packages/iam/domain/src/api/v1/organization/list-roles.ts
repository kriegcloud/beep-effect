/**
 * @module organization/list-roles
 *
 * List all roles in an organization.
 *
 * @category Contract
 * @since 1.0.0
 */

import { IamAuthError } from "@beep/iam-domain/api/common";
import { OrganizationRole } from "@beep/iam-domain/entities";
import { $IamDomainId } from "@beep/identity/packages";
import { BS } from "@beep/schema";
import * as HttpApiEndpoint from "@effect/platform/HttpApiEndpoint";
import * as HttpApiSchema from "@effect/platform/HttpApiSchema";
import * as S from "effect/Schema";

const $I = $IamDomainId.create("api/v1/organization/list-roles");

/**
 * Success response with list of roles.
 *
 * @since 1.0.0
 * @category Schema
 */
export class Success extends S.Class<Success>($I`Success`)(
  {
    roles: S.Array(OrganizationRole.Model).annotations({
      description: "List of roles in the organization.",
    }),
  },
  $I.annotations("ListRolesSuccess", {
    description: "Success response with list of roles.",
  })
) {}

/**
 * List roles endpoint contract.
 *
 * GET /organization/list-roles
 *
 * @since 1.0.0
 * @category Contract
 */
export const Contract = HttpApiEndpoint.get("list-roles", "/list-roles")
  .addSuccess(Success)
  .addError(
    IamAuthError.annotations(
      HttpApiSchema.annotations({
        status: BS.HttpStatusCode.DecodedEnum.UNAUTHORIZED,
      })
    )
  );
