/**
 * @fileoverview
 * Stop impersonating contract schemas for the IAM admin client.
 *
 * Defines the success response schema for stopping user impersonation.
 *
 * @module @beep/iam-client/admin/stop-impersonating/contract
 * @category Admin/StopImpersonating
 * @since 0.1.0
 */
import * as Common from "@beep/iam-client/_internal";
import { $IamClientId } from "@beep/identity/packages";
import * as W from "@beep/wrap";
import * as S from "effect/Schema";

const $I = $IamClientId.create("admin/stop-impersonating");

/**
 * Success response containing the admin's restored session.
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
 * @category Admin/StopImpersonating/Schemas
 * @since 0.1.0
 */
export class Success extends S.Class<Success>($I`Success`)(
  {
    session: Common.DomainSessionFromBetterAuthSession,
    user: Common.DomainUserFromBetterAuthUser,
  },
  $I.annotations("Success", {
    description: "Success response containing the admin's restored session and user data.",
  })
) {}

/**
 * Contract wrapper for stop impersonating operations.
 *
 * No payload required - stops impersonation and returns to admin account.
 *
 * @example
 * ```typescript
 * import { StopImpersonating } from "@beep/iam-client/admin"
 *
 * const handler = StopImpersonating.Wrapper.implement(() => {
 *   // Implementation returns { data: Success } or { error: IamError }
 * })
 * ```
 *
 * @category Admin/StopImpersonating/Contracts
 * @since 0.1.0
 */
export const Wrapper = W.Wrapper.make("StopImpersonating", {
  success: Success,
  error: Common.IamError,
});
