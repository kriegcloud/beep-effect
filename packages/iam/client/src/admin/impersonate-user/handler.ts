/**
 * @fileoverview
 * Impersonate user handler implementation.
 *
 * Implements the impersonate user contract using Better Auth's admin client.
 *
 * @module @beep/iam-client/admin/impersonate-user/handler
 * @category Admin/ImpersonateUser
 * @since 0.1.0
 */
import * as Common from "@beep/iam-client/_internal";
import { client } from "@beep/iam-client/adapters";
import * as Contract from "./contract.ts";

/**
 * Impersonate user handler that switches the session to a target user.
 *
 * Calls Better Auth's admin.impersonateUser method and validates the response.
 * Mutates session state by switching to the impersonated user's session.
 *
 * @example
 * ```typescript
 * import * as Effect from "effect/Effect"
 * import { ImpersonateUser } from "@beep/iam-client/admin"
 *
 * const program = Effect.gen(function* () {
 *   const result = yield* ImpersonateUser.Handler({
 *     userId: "shared_user__abc123"
 *   })
 *   console.log(`Now impersonating ${result.user.name}`)
 * })
 * ```
 *
 * @category Admin/ImpersonateUser/Handlers
 * @since 0.1.0
 */
export const Handler = Contract.Wrapper.implement(
  Common.wrapIamMethod({
    wrapper: Contract.Wrapper,
    mutatesSession: true,
  })((encodedPayload) => client.admin.impersonateUser(encodedPayload))
);
