/**
 * @fileoverview
 * Change password contract schemas and wrapper for Better Auth integration.
 *
 * Defines the payload and success schemas for changing the user's password.
 * Uses S.Redacted for password fields to prevent logging sensitive data.
 *
 * @module @beep/iam-client/password/change/contract
 * @category Password/Change
 * @since 0.1.0
 */

import * as Common from "@beep/iam-client/_internal";
import { formValuesAnnotation } from "@beep/iam-client/_internal";
import { $IamClientId } from "@beep/identity/packages";
import * as W from "@beep/wrap";
import * as S from "effect/Schema";

const $I = $IamClientId.create("password/change");

/**
 * Payload for changing the current user's password.
 *
 * @example
 * ```typescript
 * import { Change } from "@beep/iam-client/password"
 * import * as Redacted from "effect/Redacted"
 *
 * const payload = Change.Payload.make({
 *   currentPassword: Redacted.make("oldPassword"),
 *   newPassword: Redacted.make("newPassword123"),
 *   revokeOtherSessions: true
 * })
 * ```
 *
 * @category Password/Change/Schemas
 * @since 0.1.0
 */
export class Payload extends S.Class<Payload>($I`Payload`)(
  {
    currentPassword: S.Redacted(S.String),
    newPassword: S.Redacted(S.String),
    revokeOtherSessions: S.optional(S.Boolean),
  },
  formValuesAnnotation({
    currentPassword: "",
    newPassword: "",
    revokeOtherSessions: false,
  })
) {}

/**
 * User shape returned by changePassword.
 *
 * @category Password/Change/Schemas
 * @since 0.1.0
 */
export class User extends S.Class<User>($I`User`)(
  {
    id: S.String,
    email: S.String,
    name: S.String,
    image: S.NullOr(S.String),
    emailVerified: S.Boolean,
    createdAt: S.Date,
    updatedAt: S.Date,
  },
  $I.annotations("User", {
    description: "The user object returned after password change.",
  })
) {}

/**
 * Success response - password change completed.
 *
 * Better Auth returns { token: string | null, user: User } on success.
 * Token is only present if revokeOtherSessions was true.
 *
 * @example
 * ```typescript
 * import * as Effect from "effect/Effect"
 * import { Change } from "@beep/iam-client/password"
 * import * as Redacted from "effect/Redacted"
 *
 * const program = Effect.gen(function* () {
 *   const result = yield* Change.Handler({
 *     currentPassword: Redacted.make("old"),
 *     newPassword: Redacted.make("new")
 *   })
 *   console.log(result.user.email)
 * })
 * ```
 *
 * @category Password/Change/Schemas
 * @since 0.1.0
 */
export class Success extends S.Class<Success>($I`Success`)(
  {
    token: S.NullOr(S.String),
    user: User,
  },
  $I.annotations("Success", {
    description: "The success response for changing a password.",
  })
) {}

/**
 * Change password contract wrapper combining payload, success, and error schemas.
 *
 * @example
 * ```typescript
 * import { Change } from "@beep/iam-client/password"
 *
 * const handler = Change.Wrapper.implement(
 *   (payload) => client.changePassword(payload)
 * )
 * ```
 *
 * @category Password/Change/Contracts
 * @since 0.1.0
 */
export const Wrapper = W.Wrapper.make("Change", {
  payload: Payload,
  success: Success,
  error: Common.IamError,
});
