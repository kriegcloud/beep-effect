/**
 * @module get-user
 *
 * Domain contract for admin getting a user.
 *
 * @category exports
 * @since 0.1.0
 */

import { IamAuthError } from "@beep/iam-domain/api/common";
import { $IamDomainId } from "@beep/identity/packages";
import { BS } from "@beep/schema";
import { User } from "@beep/shared-domain/entities";
import * as HttpApiEndpoint from "@effect/platform/HttpApiEndpoint";
import * as HttpApiSchema from "@effect/platform/HttpApiSchema";
import * as S from "effect/Schema";

const $I = $IamDomainId.create("api/v1/admin/get-user");

/**
 * Query parameters for getting a user.
 *
 * @since 0.1.0
 * @category Schema
 */
export class QueryParams extends S.Class<QueryParams>($I`QueryParams`)(
  {
    /**
     * The ID of the user to get.
     */
    id: S.optionalWith(S.String, { as: "Option", exact: true }).annotations({
      description: "The ID of the user to get.",
    }),
  },
  $I.annotations("GetUserQueryParams", {
    description: "Query parameters for getting a user.",
  })
) {}

/**
 * Success response after getting a user.
 *
 * @since 0.1.0
 * @category Schema
 */
export class Success extends S.Class<Success>($I`Success`)(
  {
    /**
     * The user object.
     */
    user: S.optionalWith(User.Model, { as: "Option", exact: true }).annotations({
      description: "The user object.",
    }),
  },
  $I.annotations("GetUserSuccess", {
    description: "Success response after getting a user.",
  })
) {}

/**
 * Admin get user endpoint contract.
 *
 * GET /admin/get-user
 *
 * Gets a user by ID as an admin.
 *
 * @since 0.1.0
 * @category Contract
 */
export const Contract = HttpApiEndpoint.get("get-user", "/admin/get-user")
  .setUrlParams(QueryParams)
  .addSuccess(Success)
  .addError(
    IamAuthError.annotations(
      HttpApiSchema.annotations({
        status: BS.HttpStatusCode.DecodedEnum.UNAUTHORIZED,
      })
    )
  );
