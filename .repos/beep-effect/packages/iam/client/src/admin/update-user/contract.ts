/**
 * @fileoverview
 * Admin update user contract schemas for the IAM admin client.
 *
 * Defines the payload and success response schemas for updating a user as admin.
 *
 * @module @beep/iam-client/admin/update-user/contract
 * @category Admin/UpdateUser
 * @since 0.1.0
 */
import * as Common from "@beep/iam-client/_internal";
import { formValuesAnnotation } from "@beep/iam-client/_internal";
import { $IamClientId } from "@beep/identity/packages";
import { SharedEntityIds } from "@beep/shared-domain";
import * as W from "@beep/wrap";
import * as S from "effect/Schema";

const $I = $IamClientId.create("admin/update-user");

/**
 * Payload for updating a user as admin.
 *
 * @example
 * ```typescript
 * import { UpdateUser } from "@beep/iam-client/admin"
 *
 * const payload = UpdateUser.Payload.make({
 *   userId: "shared_user__abc123",
 *   data: { name: "New Name", role: "admin" }
 * })
 * ```
 *
 * @category Admin/UpdateUser/Schemas
 * @since 0.1.0
 */
export class Payload extends S.Class<Payload>($I`Payload`)(
  {
    userId: SharedEntityIds.UserId,
    data: S.Record({ key: S.String, value: S.Unknown }),
  },
  formValuesAnnotation({
    userId: "",
    data: {},
  })
) {}

/**
 * Success response containing the updated user.
 *
 * @example
 * ```typescript
 * import * as Effect from "effect/Effect"
 * import { UpdateUser } from "@beep/iam-client/admin"
 *
 * const program = Effect.gen(function* () {
 *   const result = yield* UpdateUser.Handler({
 *     userId: "shared_user__abc123",
 *     data: { name: "Updated Name" }
 *   })
 *   console.log(result.user.name)
 * })
 * ```
 *
 * @category Admin/UpdateUser/Schemas
 * @since 0.1.0
 */
export class Success extends S.Class<Success>($I`Success`)(
  {
    user: Common.DomainUserFromBetterAuthUser,
  },
  $I.annotations("Success", {
    description: "Success response containing the updated user.",
  })
) {}

/**
 * Contract wrapper for admin update user operations.
 *
 * @example
 * ```typescript
 * import { UpdateUser } from "@beep/iam-client/admin"
 *
 * const handler = UpdateUser.Wrapper.implement((payload) => {
 *   // Implementation returns { data: Success } or { error: IamError }
 * })
 * ```
 *
 * @category Admin/UpdateUser/Contracts
 * @since 0.1.0
 */
export const Wrapper = W.Wrapper.make("AdminUpdateUser", {
  payload: Payload,
  success: Success,
  error: Common.IamError,
});
