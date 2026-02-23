/**
 * @fileoverview
 * Phone number sign-in contract schemas for the IAM client.
 *
 * Defines the payload and success response schemas for phone number authentication.
 *
 * @module @beep/iam-client/sign-in/phone-number/contract
 * @category SignIn/PhoneNumber
 * @since 0.1.0
 */
import * as Common from "@beep/iam-client/_internal";
import { formValuesAnnotation } from "@beep/iam-client/_internal";
import { $IamClientId } from "@beep/identity/packages";
import { BS } from "@beep/schema";
import * as W from "@beep/wrap";
import * as S from "effect/Schema";

const $I = $IamClientId.create("sign-in/phone-number");

/**
 * Payload for phone number sign-in.
 *
 * @example
 * ```typescript
 * import { PhoneNumber } from "@beep/iam-client/sign-in"
 * import * as Redacted from "effect/Redacted"
 *
 * const payload = PhoneNumber.Payload.make({
 *   phoneNumber: "+1234567890",
 *   password: Redacted.make("myPassword123")
 * })
 * ```
 *
 * @category SignIn/PhoneNumber/Schemas
 * @since 0.1.0
 */
export class Payload extends S.Class<Payload>($I`Payload`)(
  {
    phoneNumber: BS.Phone,
    password: BS.Password,
    rememberMe: S.optional(S.Boolean),
  },
  formValuesAnnotation({
    phoneNumber: "",
    password: "",
    rememberMe: true,
  })
) {}

/**
 * Success response containing the authenticated session.
 *
 * @example
 * ```typescript
 * import * as Effect from "effect/Effect"
 * import * as Redacted from "effect/Redacted"
 * import { PhoneNumber } from "@beep/iam-client/sign-in"
 *
 * const program = Effect.gen(function* () {
 *   const result = yield* PhoneNumber.Handler({
 *     phoneNumber: "+1234567890",
 *     password: Redacted.make("myPassword123")
 *   })
 *   console.log(`Signed in as ${result.user.name}`)
 * })
 * ```
 *
 * @category SignIn/PhoneNumber/Schemas
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
 * Contract wrapper for phone number sign-in operations.
 *
 * @example
 * ```typescript
 * import { PhoneNumber } from "@beep/iam-client/sign-in"
 *
 * const handler = PhoneNumber.Wrapper.implement((payload) => {
 *   // Implementation returns { data: Success } or { error: IamError }
 * })
 * ```
 *
 * @category SignIn/PhoneNumber/Contracts
 * @since 0.1.0
 */
export const Wrapper = W.Wrapper.make("SignInPhoneNumber", {
  payload: Payload,
  success: Success,
  error: Common.IamError,
});
