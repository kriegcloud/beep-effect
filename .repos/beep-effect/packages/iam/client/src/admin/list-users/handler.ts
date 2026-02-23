/**
 * @fileoverview
 * List users handler implementation.
 *
 * Implements the list users contract using Better Auth's admin client.
 *
 * @module @beep/iam-client/admin/list-users/handler
 * @category Admin/ListUsers
 * @since 0.1.0
 */
import * as Common from "@beep/iam-client/_internal";
import { client } from "@beep/iam-client/adapters";
import * as Contract from "./contract.ts";

/**
 * List users handler that retrieves a paginated list of users.
 *
 * Calls Better Auth's admin.listUsers method with query-wrapped payload and validates the response.
 * Does not mutate session state (admin read operation).
 *
 * Note: This uses the query-wrapped pattern - payload is passed as `{ query: encoded }`.
 *
 * @example
 * ```typescript
 * import * as Effect from "effect/Effect"
 * import { ListUsers } from "@beep/iam-client/admin"
 *
 * const program = Effect.gen(function* () {
 *   const result = yield* ListUsers.Handler({
 *     searchValue: "john",
 *     limit: 20
 *   })
 *   console.log(`Found ${result.total} users`)
 * })
 * ```
 *
 * @category Admin/ListUsers/Handlers
 * @since 0.1.0
 */
export const Handler = Contract.Wrapper.implement(
  Common.wrapIamMethod({
    wrapper: Contract.Wrapper,
    mutatesSession: false,
  })((encodedPayload) => client.admin.listUsers({ query: encodedPayload }))
);
