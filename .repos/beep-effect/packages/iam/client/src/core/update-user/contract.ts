/**
 * @fileoverview
 * Update user contract schemas for the IAM client.
 *
 * Defines the payload and success response schemas for updating user profile information.
 *
 * @module @beep/iam-client/core/update-user/contract
 * @category Core/UpdateUser
 * @since 0.1.0
 */
import * as Common from "@beep/iam-client/_internal";
import { formValuesAnnotation } from "@beep/iam-client/_internal";
import { $IamClientId } from "@beep/identity/packages";
import * as W from "@beep/wrap";
import * as S from "effect/Schema";

const $I = $IamClientId.create("core/update-user");

/**
 * Payload for updating user profile information.
 *
 * @example
 * ```typescript
 * import { UpdateUser } from "@beep/iam-client/core"
 *
 * const payload = UpdateUser.Payload.make({
 *   name: "New Name",
 *   image: "https://example.com/avatar.png"
 * })
 * ```
 *
 * @category Core/UpdateUser/Schemas
 * @since 0.1.0
 */
export class Payload extends S.Class<Payload>($I`Payload`)(
  {
    name: S.optional(S.String),
    image: S.optional(S.String),
  },
  formValuesAnnotation({
    name: "",
    image: "",
  })
) {}

/**
 * Success response containing the updated user.
 *
 * @example
 * ```typescript
 * import * as Effect from "effect/Effect"
 * import { UpdateUser } from "@beep/iam-client/core"
 *
 * const program = Effect.gen(function* () {
 *   const result = yield* UpdateUser.Handler({ name: "New Name" })
 *   console.log(result.user.name)
 * })
 * ```
 *
 * @category Core/UpdateUser/Schemas
 * @since 0.1.0
 */
export class Success extends S.Class<Success>($I`Success`)(
  {
    user: Common.DomainUserFromBetterAuthUser,
  },
  $I.annotations("Success", {
    description: "Success response containing the updated user profile.",
  })
) {}

/**
 * Contract wrapper for update user operations.
 *
 * @example
 * ```typescript
 * import { UpdateUser } from "@beep/iam-client/core"
 *
 * const handler = UpdateUser.Wrapper.implement((payload) => {
 *   // Implementation returns { data: Success } or { error: IamError }
 * })
 * ```
 *
 * @category Core/UpdateUser/Contracts
 * @since 0.1.0
 */
export const Wrapper = W.Wrapper.make("UpdateUser", {
  payload: Payload,
  success: Success,
  error: Common.IamError,
});
