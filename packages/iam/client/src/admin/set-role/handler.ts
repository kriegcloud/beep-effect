/**
 * @fileoverview
 * Set role handler implementation.
 *
 * Implements the set role contract using Better Auth's admin client.
 *
 * @module @beep/iam-client/admin/set-role/handler
 * @category Admin/SetRole
 * @since 0.1.0
 */
import * as Common from "@beep/iam-client/_internal";
import { client } from "@beep/iam-client/adapters";
import * as Contract from "./contract.ts";

/**
 * Set role handler that updates a user's role.
 *
 * Calls Better Auth's admin.setRole method and validates the response.
 * Does not mutate session state (admin operation).
 *
 * @example
 * ```typescript
 * import * as Effect from "effect/Effect"
 * import { SetRole } from "@beep/iam-client/admin"
 *
 * const program = Effect.gen(function* () {
 *   const result = yield* SetRole.Handler({
 *     userId: "shared_user__abc123",
 *     role: "admin"
 *   })
 *   console.log(result.user.role)
 * })
 * ```
 *
 * @category Admin/SetRole/Handlers
 * @since 0.1.0
 */
export const Handler = Contract.Wrapper.implement(
  Common.wrapIamMethod({
    wrapper: Contract.Wrapper,
    mutatesSession: false,
  })((encodedPayload) => client.admin.setRole(encodedPayload))
);
