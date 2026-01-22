/**
 * @fileoverview
 * List users contract schemas for the IAM admin client.
 *
 * Defines the payload (query parameters) and success response schemas for listing users.
 *
 * @module @beep/iam-client/admin/list-users/contract
 * @category Admin/ListUsers
 * @since 0.1.0
 */
import * as Common from "@beep/iam-client/_internal";
import { formValuesAnnotation } from "@beep/iam-client/_internal";
import { $IamClientId } from "@beep/identity/packages";
import * as W from "@beep/wrap";
import * as S from "effect/Schema";

const $I = $IamClientId.create("admin/list-users");

/**
 * Payload (query parameters) for listing users.
 *
 * Supports search, filter, sort, and pagination options.
 *
 * @example
 * ```typescript
 * import { ListUsers } from "@beep/iam-client/admin"
 *
 * const payload = ListUsers.Payload.make({
 *   searchValue: "john",
 *   searchField: "name",
 *   limit: 20,
 *   offset: 0
 * })
 * ```
 *
 * @category Admin/ListUsers/Schemas
 * @since 0.1.0
 */
export class Payload extends S.Class<Payload>($I`Payload`)(
  {
    searchValue: S.optional(S.String),
    searchField: S.optional(S.Literal("email", "name")),
    searchOperator: S.optional(S.Literal("contains", "starts_with", "ends_with")),
    limit: S.optional(S.Union(S.String, S.Number)),
    offset: S.optional(S.Union(S.String, S.Number)),
    sortBy: S.optional(S.String),
    sortDirection: S.optional(S.Literal("asc", "desc")),
    filterField: S.optional(S.String),
    filterValue: S.optional(S.Union(S.String, S.Number, S.Boolean)),
    filterOperator: S.optional(S.Literal("eq", "ne", "lt", "lte", "gt", "gte")),
  },
  formValuesAnnotation({
    searchValue: "",
    limit: 100,
    offset: 0,
  })
) {}

/**
 * Success response containing paginated user list.
 *
 * @example
 * ```typescript
 * import * as Effect from "effect/Effect"
 * import { ListUsers } from "@beep/iam-client/admin"
 *
 * const program = Effect.gen(function* () {
 *   const result = yield* ListUsers.Handler({ limit: 20 })
 *   console.log(`Found ${result.total} users`)
 *   result.users.forEach(user => console.log(user.name))
 * })
 * ```
 *
 * @category Admin/ListUsers/Schemas
 * @since 0.1.0
 */
export class Success extends S.Class<Success>($I`Success`)(
  {
    users: S.Array(Common.DomainUserFromBetterAuthUser),
    total: S.Number,
    limit: S.optional(S.Number),
    offset: S.optional(S.Number),
  },
  $I.annotations("Success", {
    description: "Success response containing paginated list of users.",
  })
) {}

/**
 * Contract wrapper for list users operations.
 *
 * Note: This uses query-wrapped pattern - handler must pass `{ query: encoded }`.
 *
 * @example
 * ```typescript
 * import { ListUsers } from "@beep/iam-client/admin"
 *
 * const handler = ListUsers.Wrapper.implement((payload) => {
 *   // Implementation returns { data: Success } or { error: IamError }
 * })
 * ```
 *
 * @category Admin/ListUsers/Contracts
 * @since 0.1.0
 */
export const Wrapper = W.Wrapper.make("ListUsers", {
  payload: Payload,
  success: Success,
  error: Common.IamError,
});
