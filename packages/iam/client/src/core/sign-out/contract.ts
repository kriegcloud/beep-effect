/**
 * @fileoverview
 * Sign-out contract schemas for the IAM client.
 *
 * Defines the success response schema and contract wrapper for signing out users.
 *
 * @module @beep/iam-client/core/sign-out/contract
 * @category Core/SignOut
 * @since 0.1.0
 */
import * as Common from "@beep/iam-client/_internal";
import { $IamClientId } from "@beep/identity/packages";
import * as W from "@beep/wrap";
import * as S from "effect/Schema";

const $I = $IamClientId.create("core/sign-out");

/**
 * Success response for signing out the current user.
 *
 * @example
 * ```typescript
 * import { SignOut } from "@beep/iam-client/core"
 * import * as S from "effect/Schema"
 *
 * const response = { success: true }
 * const decoded = S.decodeUnknownSync(SignOut.Success)(response)
 * ```
 *
 * @category Core/SignOut/Schemas
 * @since 0.1.0
 */
export class Success extends S.Class<Success>($I`Success`)(
  {
    success: S.Boolean,
  },
  $I.annotations("Success", {
    description: "Success response for signing out the current user.",
  })
) {}

/**
 * Contract wrapper for sign-out operations.
 *
 * Wraps the sign-out flow with typed success and error schemas.
 *
 * @example
 * ```typescript
 * import { SignOut } from "@beep/iam-client/core"
 *
 * const handler = SignOut.Wrapper.implement((payload) => {
 *   // Implementation returns { data: Success } or { error: IamError }
 * })
 * ```
 *
 * @category Core/SignOut/Contracts
 * @since 0.1.0
 */
export const Wrapper = W.Wrapper.make("SignOut", {
  success: Success,
  error: Common.IamError,
});
