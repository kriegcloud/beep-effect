/**
 * @fileoverview
 * Admin update user handler implementation.
 *
 * Implements the admin update user contract using Better Auth's admin client.
 *
 * @module @beep/iam-client/admin/update-user/handler
 * @category Admin/UpdateUser
 * @since 0.1.0
 */
import * as Common from "@beep/iam-client/_internal";
import { client } from "@beep/iam-client/adapters";
import * as Contract from "./contract.ts";

/**
 * Admin update user handler that updates a user's data as admin.
 *
 * Calls Better Auth's admin.updateUser method and validates the response.
 * Does not mutate session state (admin operation).
 *
 * @example
 * ```typescript
 * import * as Effect from "effect/Effect"
 * import { UpdateUser } from "@beep/iam-client/admin"
 *
 * const program = Effect.gen(function* () {
 *   const result = yield* UpdateUser.Handler({
 *     userId: "shared_user__abc123",
 *     data: { name: "Updated Name", role: "admin" }
 *   })
 *   console.log(result.user.name)
 * })
 * ```
 *
 * @category Admin/UpdateUser/Handlers
 * @since 0.1.0
 */
export const Handler = Contract.Wrapper.implement(
  Common.wrapIamMethod({
    wrapper: Contract.Wrapper,
    mutatesSession: false,
  })((encodedPayload) => client.admin.updateUser(encodedPayload))
);
