/**
 * @fileoverview
 * Delete user contract schemas for the IAM client.
 *
 * Defines the success response schema for deleting the current user's account.
 *
 * @module @beep/iam-client/core/delete-user/contract
 * @category Core/DeleteUser
 * @since 0.1.0
 */
import * as Common from "@beep/iam-client/_internal";
import { $IamClientId } from "@beep/identity/packages";
import * as W from "@beep/wrap";
import * as S from "effect/Schema";

const $I = $IamClientId.create("core/delete-user");

/**
 * Success response for deleting the current user.
 *
 * @example
 * ```typescript
 * import { DeleteUser } from "@beep/iam-client/core"
 * import * as S from "effect/Schema"
 *
 * const response = { success: true }
 * const decoded = S.decodeUnknownSync(DeleteUser.Success)(response)
 * ```
 *
 * @category Core/DeleteUser/Schemas
 * @since 0.1.0
 */
export class Success extends S.Class<Success>($I`Success`)(
  {
    success: S.Boolean,
  },
  $I.annotations("Success", {
    description: "Success response for deleting the current user's account.",
  })
) {}

/**
 * Contract wrapper for delete user operations.
 *
 * No payload required - user must be signed in.
 *
 * @example
 * ```typescript
 * import { DeleteUser } from "@beep/iam-client/core"
 *
 * const handler = DeleteUser.Wrapper.implement(() => {
 *   // Implementation returns { data: Success } or { error: IamError }
 * })
 * ```
 *
 * @category Core/DeleteUser/Contracts
 * @since 0.1.0
 */
export const Wrapper = W.Wrapper.make("DeleteUser", {
  success: Success,
  error: Common.IamError,
});
