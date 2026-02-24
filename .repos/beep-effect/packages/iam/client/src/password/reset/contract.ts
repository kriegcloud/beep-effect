/**
 * @fileoverview
 * Reset password contract schemas and wrapper for Better Auth integration.
 *
 * Defines the payload and success schemas for resetting a password with a token.
 * Uses S.Redacted for password fields to prevent logging sensitive data.
 *
 * @module @beep/iam-client/password/reset/contract
 * @category Password/Reset
 * @since 0.1.0
 */

import * as Common from "@beep/iam-client/_internal";
import { formValuesAnnotation } from "@beep/iam-client/_internal";
import { $IamClientId } from "@beep/identity/packages";
import { BS } from "@beep/schema";
import * as W from "@beep/wrap";
import * as S from "effect/Schema";

const $I = $IamClientId.create("password/reset");

/**
 * Payload for resetting a password with a token.
 *
 * @example
 * ```typescript
 * import { Reset } from "@beep/iam-client/password"
 * import * as Redacted from "effect/Redacted"
 *
 * const payload = Reset.Payload.make({
 *   newPassword: Redacted.make("newSecurePassword123"),
 *   token: "reset-token-from-email"
 * })
 * ```
 *
 * @category Password/Reset/Schemas
 * @since 0.1.0
 */
export class Payload extends S.Class<Payload>($I`Payload`)(
  {
    newPassword: BS.Password,
    token: S.Redacted(S.String),
  },
  formValuesAnnotation({
    newPassword: "",
    token: "",
  })
) {}

/**
 * Success response - password reset completed.
 *
 * Better Auth returns { status: boolean } on success.
 *
 * @example
 * ```typescript
 * import * as Effect from "effect/Effect"
 * import { Reset } from "@beep/iam-client/password"
 * import * as Redacted from "effect/Redacted"
 *
 * const program = Effect.gen(function* () {
 *   const result = yield* Reset.Handler({
 *     newPassword: Redacted.make("newPassword"),
 *     token: "reset-token"
 *   })
 *   console.log(result.status) // true
 * })
 * ```
 *
 * @category Password/Reset/Schemas
 * @since 0.1.0
 */
export class Success extends S.Class<Success>($I`Success`)(
  {
    status: S.Boolean,
  },
  $I.annotations("Success", {
    description: "The success response for resetting a password.",
  })
) {}

/**
 * Reset password contract wrapper combining payload, success, and error schemas.
 *
 * @example
 * ```typescript
 * import { Reset } from "@beep/iam-client/password"
 *
 * const handler = Reset.Wrapper.implement(
 *   (payload) => client.resetPassword(payload)
 * )
 * ```
 *
 * @category Password/Reset/Contracts
 * @since 0.1.0
 */
export const Wrapper = W.Wrapper.make("Reset", {
  payload: Payload,
  success: Success,
  error: Common.IamError,
});
