/**
 * @module organization/get-role
 *
 * Get a role by ID.
 *
 * @category Contract
 * @since 1.0.0
 */

import { IamAuthError } from "@beep/iam-domain/api/common";
import { OrganizationRole } from "@beep/iam-domain/entities";
import { $IamDomainId } from "@beep/identity/packages";
import { BS } from "@beep/schema";
import { IamEntityIds } from "@beep/shared-domain";
import * as HttpApiEndpoint from "@effect/platform/HttpApiEndpoint";
import * as HttpApiSchema from "@effect/platform/HttpApiSchema";
import * as S from "effect/Schema";

const $I = $IamDomainId.create("api/v1/organization/get-role");

/**
 * Query parameters for getting a role.
 *
 * @since 1.0.0
 * @category Schema
 */
export class Query extends S.Class<Query>($I`Query`)(
  {
    roleId: S.optionalWith(IamEntityIds.OrganizationRoleId, { as: "Option", exact: true }).annotations({
      description: "The ID of the role to retrieve.",
    }),
  },
  $I.annotations("GetRoleQuery", {
    description: "Query parameters for getting a role.",
  })
) {}

/**
 * Get role endpoint contract.
 *
 * GET /organization/get-role
 *
 * @since 1.0.0
 * @category Contract
 */
export const Contract = HttpApiEndpoint.get("get-role", "/get-role")
  .setUrlParams(Query)
  .addSuccess(OrganizationRole.Model)
  .addError(
    IamAuthError.annotations(
      HttpApiSchema.annotations({
        status: BS.HttpStatusCode.DecodedEnum.UNAUTHORIZED,
      })
    )
  );
