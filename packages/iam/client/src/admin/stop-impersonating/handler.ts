/**
 * @fileoverview
 * Stop impersonating handler implementation.
 *
 * Implements the stop impersonating contract using Better Auth's admin client.
 *
 * @module @beep/iam-client/admin/stop-impersonating/handler
 * @category Admin/StopImpersonating
 * @since 0.1.0
 */
import * as Common from "@beep/iam-client/_internal";
import { client } from "@beep/iam-client/adapters";
import * as Contract from "./contract.ts";

/**
 * Stop impersonating handler that returns to the admin's original session.
 *
 * Calls Better Auth's admin.stopImpersonating method and validates the response.
 * Mutates session state by restoring the admin's original session.
 *
 * @example
 * ```typescript
 * import * as Effect from "effect/Effect"
 * import { StopImpersonating } from "@beep/iam-client/admin"
 *
 * const program = Effect.gen(function* () {
 *   const result = yield* StopImpersonating.Handler
 *   console.log(`Returned to admin account: ${result.user.name}`)
 * })
 * ```
 *
 * @category Admin/StopImpersonating/Handlers
 * @since 0.1.0
 */
export const Handler = Contract.Wrapper.implement(
  Common.wrapIamMethod({
    wrapper: Contract.Wrapper,
    mutatesSession: true,
  })(() => client.admin.stopImpersonating())
);
