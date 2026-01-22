/**
 * @fileoverview
 * Create user handler implementation.
 *
 * Implements the create user contract using Better Auth's admin client.
 *
 * @module @beep/iam-client/admin/create-user/handler
 * @category Admin/CreateUser
 * @since 0.1.0
 */
import * as Common from "@beep/iam-client/_internal";
import { client } from "@beep/iam-client/adapters";
import * as Contract from "./contract.ts";

/**
 * Create user handler that creates a new user as admin.
 *
 * Calls Better Auth's admin.createUser method and validates the response.
 * Does not mutate session state (admin operation).
 *
 * @example
 * ```typescript
 * import * as Effect from "effect/Effect"
 * import { CreateUser } from "@beep/iam-client/admin"
 *
 * const program = Effect.gen(function* () {
 *   const result = yield* CreateUser.Handler({
 *     email: "user@example.com",
 *     password: "secret123",
 *     name: "John Doe"
 *   })
 *   console.log(result.user.id)
 * })
 * ```
 *
 * @category Admin/CreateUser/Handlers
 * @since 0.1.0
 */
export const Handler = Contract.Wrapper.implement(
  Common.wrapIamMethod({
    wrapper: Contract.Wrapper,
    mutatesSession: false,
  })((encodedPayload) => client.admin.createUser(encodedPayload))
);
