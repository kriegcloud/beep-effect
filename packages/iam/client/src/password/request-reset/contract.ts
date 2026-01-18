/**
 * @fileoverview
 * Request password reset contract schemas and wrapper for Better Auth integration.
 *
 * Defines the payload and success schemas for requesting a password reset email.
 *
 * @module @beep/iam-client/password/request-reset/contract
 * @category Password/RequestReset
 * @since 0.1.0
 */

import * as Common from "@beep/iam-client/_internal";
import { formValuesAnnotation } from "@beep/iam-client/_internal";
import { $IamClientId } from "@beep/identity/packages";
import * as W from "@beep/wrap";
import * as S from "effect/Schema";

const $I = $IamClientId.create("password/request-reset");

/**
 * Payload for requesting a password reset email.
 *
 * @example
 * ```typescript
 * import { RequestReset } from "@beep/iam-client/password"
 *
 * const payload = RequestReset.Payload.make({
 *   email: "user@example.com",
 *   redirectTo: "/reset-password"
 * })
 * ```
 *
 * @category Password/RequestReset/Schemas
 * @since 0.1.0
 */
export class Payload extends S.Class<Payload>($I`Payload`)(
  {
    email: S.String,
    redirectTo: S.optional(S.String),
  },
  formValuesAnnotation({
    email: "",
    redirectTo: "",
  })
) {}

/**
 * Success response - password reset email sent.
 *
 * Better Auth returns { status: boolean, message: string } on success.
 *
 * @example
 * ```typescript
 * import * as Effect from "effect/Effect"
 * import { RequestReset } from "@beep/iam-client/password"
 *
 * const program = Effect.gen(function* () {
 *   const result = yield* RequestReset.Handler({ email: "user@example.com" })
 *   console.log(result.status) // true
 * })
 * ```
 *
 * @category Password/RequestReset/Schemas
 * @since 0.1.0
 */
export class Success extends S.Class<Success>($I`Success`)(
  {
    status: S.Boolean,
    message: S.String,
  },
  $I.annotations("Success", {
    description: "The success response for requesting a password reset.",
  })
) {}

/**
 * Request password reset contract wrapper combining payload, success, and error schemas.
 *
 * @example
 * ```typescript
 * import { RequestReset } from "@beep/iam-client/password"
 *
 * const handler = RequestReset.Wrapper.implement(
 *   (payload) => client.requestPasswordReset(payload)
 * )
 * ```
 *
 * @category Password/RequestReset/Contracts
 * @since 0.1.0
 */
export const Wrapper = W.Wrapper.make("RequestReset", {
  payload: Payload,
  success: Success,
  error: Common.IamError,
});
