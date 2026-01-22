/**
 * @fileoverview
 * List user sessions contract schemas for the IAM admin client.
 *
 * Defines the payload (query parameters) and success response schemas for listing a user's sessions.
 *
 * @module @beep/iam-client/admin/list-user-sessions/contract
 * @category Admin/ListUserSessions
 * @since 0.1.0
 */
import * as Common from "@beep/iam-client/_internal";
import { formValuesAnnotation } from "@beep/iam-client/_internal";
import { $IamClientId } from "@beep/identity/packages";
import * as W from "@beep/wrap";
import * as S from "effect/Schema";

const $I = $IamClientId.create("admin/list-user-sessions");

/**
 * Payload (query parameters) for listing a user's sessions.
 *
 * @example
 * ```typescript
 * import { ListUserSessions } from "@beep/iam-client/admin"
 *
 * const payload = ListUserSessions.Payload.make({
 *   userId: "shared_user__abc123"
 * })
 * ```
 *
 * @category Admin/ListUserSessions/Schemas
 * @since 0.1.0
 */
export class Payload extends S.Class<Payload>($I`Payload`)(
  {
    userId: S.String,
  },
  formValuesAnnotation({
    userId: "",
  })
) {}

/**
 * Success response - array of sessions for the specified user.
 *
 * @example
 * ```typescript
 * import * as Effect from "effect/Effect"
 * import { ListUserSessions } from "@beep/iam-client/admin"
 *
 * const program = Effect.gen(function* () {
 *   const sessions = yield* ListUserSessions.Handler({
 *     userId: "shared_user__abc123"
 *   })
 *   console.log(`User has ${sessions.length} active sessions`)
 * })
 * ```
 *
 * @category Admin/ListUserSessions/Schemas
 * @since 0.1.0
 */
export const Success = S.Array(Common.DomainSessionFromBetterAuthSession).annotations(
  $I.annotations("Success", {
    description: "Array of sessions for the specified user.",
  })
);

/**
 * Contract wrapper for list user sessions operations.
 *
 * @example
 * ```typescript
 * import { ListUserSessions } from "@beep/iam-client/admin"
 *
 * const handler = ListUserSessions.Wrapper.implement((payload) => {
 *   // Implementation returns { data: Success } or { error: IamError }
 * })
 * ```
 *
 * @category Admin/ListUserSessions/Contracts
 * @since 0.1.0
 */
export const Wrapper = W.Wrapper.make("ListUserSessions", {
  payload: Payload,
  success: Success,
  error: Common.IamError,
});
