/**
 * @fileoverview
 * Impersonate user contract schemas for the IAM admin client.
 *
 * Defines the payload and success response schemas for impersonating a user.
 *
 * @module @beep/iam-client/admin/impersonate-user/contract
 * @category Admin/ImpersonateUser
 * @since 0.1.0
 */
import * as Common from "@beep/iam-client/_internal";
import { $IamClientId } from "@beep/identity/packages";
import { SharedEntityIds } from "@beep/shared-domain";
import * as W from "@beep/wrap";
import * as S from "effect/Schema";

const $I = $IamClientId.create("admin/impersonate-user");

/**
 * Payload for impersonating a user.
 *
 * @example
 * ```typescript
 * import { ImpersonateUser } from "@beep/iam-client/admin"
 *
 * const payload = ImpersonateUser.Payload.make({
 *   userId: "shared_user__abc123"
 * })
 * ```
 *
 * @category Admin/ImpersonateUser/Schemas
 * @since 0.1.0
 */
export class Payload extends S.Class<Payload>($I`Payload`)({
  userId: SharedEntityIds.UserId,
}) {}

/**
 * Success response containing the impersonated user's session.
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
 * @category Admin/ImpersonateUser/Schemas
 * @since 0.1.0
 */
export class Success extends S.Class<Success>($I`Success`)(
  {
    session: Common.DomainSessionFromBetterAuthSession,
    user: Common.DomainUserFromBetterAuthUser,
  },
  $I.annotations("Success", {
    description: "Success response containing the impersonated user's session and user data.",
  })
) {}

/**
 * Contract wrapper for impersonate user operations.
 *
 * @example
 * ```typescript
 * import { ImpersonateUser } from "@beep/iam-client/admin"
 *
 * const handler = ImpersonateUser.Wrapper.implement((payload) => {
 *   // Implementation returns { data: Success } or { error: IamError }
 * })
 * ```
 *
 * @category Admin/ImpersonateUser/Contracts
 * @since 0.1.0
 */
export const Wrapper = W.Wrapper.make("ImpersonateUser", {
  payload: Payload,
  success: Success,
  error: Common.IamError,
});
