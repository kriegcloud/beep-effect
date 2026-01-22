/**
 * @fileoverview
 * Set role contract schemas for the IAM admin client.
 *
 * Defines the payload and success response schemas for setting a user's role.
 *
 * @module @beep/iam-client/admin/set-role/contract
 * @category Admin/SetRole
 * @since 0.1.0
 */
import * as Common from "@beep/iam-client/_internal";
import { formValuesAnnotation } from "@beep/iam-client/_internal";
import { $IamClientId } from "@beep/identity/packages";
import * as W from "@beep/wrap";
import * as S from "effect/Schema";

const $I = $IamClientId.create("admin/set-role");

/**
 * Payload for setting a user's role.
 *
 * @example
 * ```typescript
 * import { SetRole } from "@beep/iam-client/admin"
 *
 * const payload = SetRole.Payload.make({
 *   userId: "shared_user__abc123",
 *   role: "admin"
 * })
 * ```
 *
 * @category Admin/SetRole/Schemas
 * @since 0.1.0
 */
/**
 * Role type matching Better Auth's admin role options.
 *
 * @category Admin/SetRole/Schemas
 * @since 0.1.0
 */
export const UserRole = S.Union(S.Literal("user", "admin"), S.mutable(S.Array(S.Literal("user", "admin"))));

export class Payload extends S.Class<Payload>($I`Payload`)(
  {
    userId: S.String,
    role: UserRole,
  },
  formValuesAnnotation({
    userId: "",
    role: "user" as const,
  })
) {}

/**
 * Success response containing the updated user.
 *
 * @example
 * ```typescript
 * import * as Effect from "effect/Effect"
 * import { SetRole } from "@beep/iam-client/admin"
 *
 * const program = Effect.gen(function* () {
 *   const result = yield* SetRole.Handler({ userId: "user_123", role: "admin" })
 *   console.log(result.user.role)
 * })
 * ```
 *
 * @category Admin/SetRole/Schemas
 * @since 0.1.0
 */
export class Success extends S.Class<Success>($I`Success`)(
  {
    user: Common.DomainUserFromBetterAuthUser,
  },
  $I.annotations("Success", {
    description: "Success response containing the user with updated role.",
  })
) {}

/**
 * Contract wrapper for set role operations.
 *
 * @example
 * ```typescript
 * import { SetRole } from "@beep/iam-client/admin"
 *
 * const handler = SetRole.Wrapper.implement((payload) => {
 *   // Implementation returns { data: Success } or { error: IamError }
 * })
 * ```
 *
 * @category Admin/SetRole/Contracts
 * @since 0.1.0
 */
export const Wrapper = W.Wrapper.make("SetRole", {
  payload: Payload,
  success: Success,
  error: Common.IamError,
});
