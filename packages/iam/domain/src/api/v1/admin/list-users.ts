/**
 * @module list-users
 *
 * Domain contract for listing users.
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

const $I = $IamDomainId.create("api/v1/admin/list-users");

/**
 * Query parameters for listing users.
 *
 * @since 0.1.0
 * @category Schema
 */
export class QueryParams extends S.Class<QueryParams>($I`QueryParams`)(
  {
    /**
     * The value to search for.
     */
    searchValue: S.optionalWith(S.String, { as: "Option", exact: true }).annotations({
      description: "The value to search for.",
    }),

    /**
     * The field to search in.
     */
    searchField: S.optionalWith(S.String, { as: "Option", exact: true }).annotations({
      description: "The field to search in.",
    }),

    /**
     * The search operator to use.
     */
    searchOperator: S.optionalWith(S.String, { as: "Option", exact: true }).annotations({
      description: "The search operator to use.",
    }),

    /**
     * The maximum number of users to return.
     */
    limit: S.optionalWith(S.String, { as: "Option", exact: true }).annotations({
      description: "The maximum number of users to return.",
    }),

    /**
     * The number of users to skip.
     */
    offset: S.optionalWith(S.String, { as: "Option", exact: true }).annotations({
      description: "The number of users to skip.",
    }),

    /**
     * The field to sort by.
     */
    sortBy: S.optionalWith(S.String, { as: "Option", exact: true }).annotations({
      description: "The field to sort by.",
    }),

    /**
     * The sort direction.
     */
    sortDirection: S.optionalWith(S.String, { as: "Option", exact: true }).annotations({
      description: "The sort direction (asc or desc).",
    }),

    /**
     * The field to filter by.
     */
    filterField: S.optionalWith(S.String, { as: "Option", exact: true }).annotations({
      description: "The field to filter by.",
    }),

    /**
     * The filter value.
     */
    filterValue: S.optionalWith(S.String, { as: "Option", exact: true }).annotations({
      description: "The filter value.",
    }),

    /**
     * The filter operator to use.
     */
    filterOperator: S.optionalWith(S.String, { as: "Option", exact: true }).annotations({
      description: "The filter operator to use.",
    }),
  },
  $I.annotations("ListUsersQueryParams", {
    description: "Query parameters for listing users.",
  })
) {}

/**
 * Success response after listing users.
 *
 * @since 0.1.0
 * @category Schema
 */
export class Success extends S.Class<Success>($I`Success`)(
  {
    /**
     * The list of users.
     */
    users: S.Array(User.Model).annotations({
      description: "The list of users.",
    }),

    /**
     * The total number of users.
     */
    total: S.Number.annotations({
      description: "The total number of users.",
    }),

    /**
     * The limit used for this query.
     */
    limit: S.optionalWith(S.Number, { as: "Option", exact: true }).annotations({
      description: "The limit used for this query.",
    }),

    /**
     * The offset used for this query.
     */
    offset: S.optionalWith(S.Number, { as: "Option", exact: true }).annotations({
      description: "The offset used for this query.",
    }),
  },
  $I.annotations("ListUsersSuccess", {
    description: "Success response after listing users.",
  })
) {}

/**
 * List users endpoint contract.
 *
 * GET /admin/list-users
 *
 * Lists all users with optional filtering, sorting, and pagination.
 *
 * @since 0.1.0
 * @category Contract
 */
export const Contract = HttpApiEndpoint.get("list-users", "/admin/list-users")
  .setUrlParams(QueryParams)
  .addSuccess(Success)
  .addError(
    IamAuthError.annotations(
      HttpApiSchema.annotations({
        status: BS.HttpStatusCode.DecodedEnum.UNAUTHORIZED,
      })
    )
  );
