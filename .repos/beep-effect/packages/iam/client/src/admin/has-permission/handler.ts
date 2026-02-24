/**
 * @fileoverview
 * Has permission handler implementation.
 *
 * Implements the has permission contract using Better Auth's admin client.
 *
 * @module @beep/iam-client/admin/has-permission/handler
 * @category Admin/HasPermission
 * @since 0.1.0
 */
import * as Common from "@beep/iam-client/_internal";
import { client } from "@beep/iam-client/adapters";
import * as Contract from "./contract.ts";

/**
 * Has permission handler that checks user/role permissions.
 *
 * Calls Better Auth's admin.hasPermission method and validates the response.
 * Does not mutate session state (read-only operation).
 *
 * @example
 * ```typescript
 * import * as Effect from "effect/Effect"
 * import { HasPermission } from "@beep/iam-client/admin"
 *
 * const program = Effect.gen(function* () {
 *   const result = yield* HasPermission.Handler({
 *     permission: { "documents": ["read", "write"] }
 *   })
 *   if (result.hasPermission) {
 *     console.log("Permission granted")
 *   }
 * })
 * ```
 *
 * @category Admin/HasPermission/Handlers
 * @since 0.1.0
 */
export const Handler = Contract.Wrapper.implement(
  Common.wrapIamMethod({
    wrapper: Contract.Wrapper,
    mutatesSession: false,
  })((encodedPayload) => client.admin.hasPermission(encodedPayload))
);
