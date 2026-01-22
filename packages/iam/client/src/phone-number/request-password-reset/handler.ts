/**
 * @fileoverview
 * Request password reset handler implementation.
 *
 * Implements the request password reset contract using Better Auth's phone number client.
 *
 * @module @beep/iam-client/phone-number/request-password-reset/handler
 * @category PhoneNumber/RequestPasswordReset
 * @since 0.1.0
 */
import * as Common from "@beep/iam-client/_internal";
import { client } from "@beep/iam-client/adapters";
import * as Contract from "./contract.ts";

/**
 * Request password reset handler that sends a reset OTP to a phone number.
 *
 * Calls Better Auth's phoneNumber.requestPasswordReset method and validates the response.
 * Does not mutate session state.
 *
 * @example
 * ```typescript
 * import * as Effect from "effect/Effect"
 * import { RequestPasswordReset } from "@beep/iam-client/phone-number"
 *
 * const program = Effect.gen(function* () {
 *   const result = yield* RequestPasswordReset.Handler({
 *     phoneNumber: "+1234567890"
 *   })
 *   console.log(`Reset OTP sent: ${result.success}`)
 * })
 * ```
 *
 * @category PhoneNumber/RequestPasswordReset/Handlers
 * @since 0.1.0
 */
export const Handler = Contract.Wrapper.implement(
  Common.wrapIamMethod({
    wrapper: Contract.Wrapper,
    mutatesSession: false,
  })((encodedPayload) => client.phoneNumber.requestPasswordReset(encodedPayload))
);
