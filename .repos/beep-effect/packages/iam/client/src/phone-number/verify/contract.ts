/**
 * @fileoverview
 * Verify phone number contract schemas for the IAM client.
 *
 * Defines the payload and success response schemas for verifying a phone number with OTP.
 *
 * @module @beep/iam-client/phone-number/verify/contract
 * @category PhoneNumber/Verify
 * @since 0.1.0
 */
import * as Common from "@beep/iam-client/_internal";
import { formValuesAnnotation } from "@beep/iam-client/_internal";
import { $IamClientId } from "@beep/identity/packages";
import { BS } from "@beep/schema";
import * as W from "@beep/wrap";
import * as S from "effect/Schema";

const $I = $IamClientId.create("phone-number/verify");

/**
 * Payload for verifying a phone number with OTP.
 *
 * @example
 * ```typescript
 * import { Verify } from "@beep/iam-client/phone-number"
 *
 * const payload = Verify.Payload.make({
 *   phoneNumber: "+1234567890",
 *   code: "123456"
 * })
 * ```
 *
 * @category PhoneNumber/Verify/Schemas
 * @since 0.1.0
 */
export class Payload extends S.Class<Payload>($I`Payload`)(
  {
    phoneNumber: BS.Phone,
    code: S.Redacted(S.String),
    disableSession: S.optional(S.Boolean),
    updatePhoneNumber: S.optional(S.Boolean),
  },
  formValuesAnnotation({
    phoneNumber: "",
    code: "",
  })
) {}

/**
 * Success response indicating phone verification.
 *
 * @example
 * ```typescript
 * import * as Effect from "effect/Effect"
 * import { Verify } from "@beep/iam-client/phone-number"
 *
 * const program = Effect.gen(function* () {
 *   const result = yield* Verify.Handler({
 *     phoneNumber: "+1234567890",
 *     code: "123456"
 *   })
 *   console.log(`Verified: ${result.success}`)
 * })
 * ```
 *
 * @category PhoneNumber/Verify/Schemas
 * @since 0.1.0
 */
export class Success extends S.Class<Success>($I`Success`)(
  {
    success: S.Boolean,
  },
  $I.annotations("Success", {
    description: "Success response indicating phone number was verified.",
  })
) {}

/**
 * Contract wrapper for phone number verify operations.
 *
 * @example
 * ```typescript
 * import { Verify } from "@beep/iam-client/phone-number"
 *
 * const handler = Verify.Wrapper.implement((payload) => {
 *   // Implementation returns { data: Success } or { error: IamError }
 * })
 * ```
 *
 * @category PhoneNumber/Verify/Contracts
 * @since 0.1.0
 */
export const Wrapper = W.Wrapper.make("VerifyPhoneNumber", {
  payload: Payload,
  success: Success,
  error: Common.IamError,
});
