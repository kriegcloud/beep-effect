/**
 * @fileoverview
 * Has permission contract schemas for the IAM admin client.
 *
 * Defines the payload and success response schemas for checking user permissions.
 *
 * @module @beep/iam-client/admin/has-permission/contract
 * @category Admin/HasPermission
 * @since 0.1.0
 */
import * as Common from "@beep/iam-client/_internal";
import { $IamClientId } from "@beep/identity/packages";
import { SharedEntityIds } from "@beep/shared-domain";
import * as W from "@beep/wrap";
import * as S from "effect/Schema";

const $I = $IamClientId.create("admin/has-permission");

/**
 * Payload for checking user permissions.
 *
 * @example
 * ```typescript
 * import { HasPermission } from "@beep/iam-client/admin"
 *
 * // Check if current user has permission
 * const payload1 = HasPermission.Payload.make({
 *   permission: { "documents": ["read", "write"] }
 * })
 *
 * // Check if specific user has permission
 * const payload2 = HasPermission.Payload.make({
 *   userId: "shared_user__abc123",
 *   permission: { "documents": ["read"] }
 * })
 *
 * // Check if role has permission
 * const payload3 = HasPermission.Payload.make({
 *   role: "admin",
 *   permission: { "users": ["manage"] }
 * })
 * ```
 *
 * @category Admin/HasPermission/Schemas
 * @since 0.1.0
 */
export class Payload extends S.Class<Payload>($I`Payload`)({
  userId: S.optional(SharedEntityIds.UserId),
  role: S.optional(S.Literal("user", "admin")),
  permission: S.optional(S.Record({ key: S.String, value: S.mutable(S.Array(S.String)) })),
}) {}

/**
 * Success response for permission check.
 *
 * @example
 * ```typescript
 * import * as Effect from "effect/Effect"
 * import { HasPermission } from "@beep/iam-client/admin"
 *
 * const program = Effect.gen(function* () {
 *   const result = yield* HasPermission.Handler({
 *     permission: { "documents": ["read"] }
 *   })
 *   if (result.hasPermission) {
 *     console.log("Permission granted")
 *   }
 * })
 * ```
 *
 * @category Admin/HasPermission/Schemas
 * @since 0.1.0
 */
export class Success extends S.Class<Success>($I`Success`)(
  {
    hasPermission: S.Boolean,
  },
  $I.annotations("Success", {
    description: "Success response indicating whether the permission check passed.",
  })
) {}

/**
 * Contract wrapper for has permission operations.
 *
 * @example
 * ```typescript
 * import { HasPermission } from "@beep/iam-client/admin"
 *
 * const handler = HasPermission.Wrapper.implement((payload) => {
 *   // Implementation returns { data: Success } or { error: IamError }
 * })
 * ```
 *
 * @category Admin/HasPermission/Contracts
 * @since 0.1.0
 */
export const Wrapper = W.Wrapper.make("HasPermission", {
  payload: Payload,
  success: Success,
  error: Common.IamError,
});
