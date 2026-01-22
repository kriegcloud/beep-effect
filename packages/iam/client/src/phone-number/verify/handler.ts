/**
 * @fileoverview
 * Verify phone number handler implementation.
 *
 * Implements the verify phone number contract using Better Auth's phone number client.
 *
 * @module @beep/iam-client/phone-number/verify/handler
 * @category PhoneNumber/Verify
 * @since 0.1.0
 */
import * as Common from "@beep/iam-client/_internal";
import { client } from "@beep/iam-client/adapters";
import * as Contract from "./contract.ts";

/**
 * Verify phone number handler that verifies a phone with an OTP code.
 *
 * Calls Better Auth's phoneNumber.verify method and validates the response.
 * Does not mutate session state by default.
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
 * @category PhoneNumber/Verify/Handlers
 * @since 0.1.0
 */
export const Handler = Contract.Wrapper.implement(
  Common.wrapIamMethod({
    wrapper: Contract.Wrapper,
    mutatesSession: false,
  })((encodedPayload) => client.phoneNumber.verify(encodedPayload))
);
