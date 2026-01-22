/**
 * @fileoverview
 * Passkey sign-in contract schemas for the IAM client.
 *
 * Defines the payload and success response schemas for WebAuthn passkey authentication.
 *
 * @module @beep/iam-client/sign-in/passkey/contract
 * @category SignIn/Passkey
 * @since 0.1.0
 */
import * as Common from "@beep/iam-client/_internal";
import { formValuesAnnotation } from "@beep/iam-client/_internal";
import { $IamClientId } from "@beep/identity/packages";
import * as W from "@beep/wrap";
import * as S from "effect/Schema";

const $I = $IamClientId.create("sign-in/passkey");

/**
 * Payload for passkey sign-in.
 *
 * @example
 * ```typescript
 * import { Passkey } from "@beep/iam-client/sign-in"
 *
 * // Use browser autofill (default)
 * const payload1 = Passkey.Payload.make({})
 *
 * // Disable autofill
 * const payload2 = Passkey.Payload.make({
 *   autoFill: false
 * })
 * ```
 *
 * @category SignIn/Passkey/Schemas
 * @since 0.1.0
 */
export class Payload extends S.Class<Payload>($I`Payload`)(
  {
    autoFill: S.optional(S.Boolean),
  },
  formValuesAnnotation({})
) {}

/**
 * Success response containing the authenticated session.
 *
 * @example
 * ```typescript
 * import * as Effect from "effect/Effect"
 * import { Passkey } from "@beep/iam-client/sign-in"
 *
 * const program = Effect.gen(function* () {
 *   const result = yield* Passkey.Handler({})
 *   console.log(`Signed in as ${result.user.name}`)
 * })
 * ```
 *
 * @category SignIn/Passkey/Schemas
 * @since 0.1.0
 */
export class Success extends S.Class<Success>($I`Success`)(
  {
    session: Common.DomainSessionFromBetterAuthSession,
    user: Common.DomainUserFromBetterAuthUser,
  },
  $I.annotations("Success", {
    description: "Success response containing the authenticated session and user.",
  })
) {}

/**
 * Contract wrapper for passkey sign-in operations.
 *
 * @example
 * ```typescript
 * import { Passkey } from "@beep/iam-client/sign-in"
 *
 * const handler = Passkey.Wrapper.implement((payload) => {
 *   // Implementation returns { data: Success } or { error: IamError }
 * })
 * ```
 *
 * @category SignIn/Passkey/Contracts
 * @since 0.1.0
 */
export const Wrapper = W.Wrapper.make("SignInPasskey", {
  payload: Payload,
  success: Success,
  error: Common.IamError,
});
