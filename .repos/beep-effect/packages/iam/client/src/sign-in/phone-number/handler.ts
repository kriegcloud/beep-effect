/**
 * @fileoverview
 * Phone number sign-in handler implementation.
 *
 * Implements the phone number sign-in contract using Better Auth's sign-in client.
 *
 * @module @beep/iam-client/sign-in/phone-number/handler
 * @category SignIn/PhoneNumber
 * @since 0.1.0
 */
import * as Common from "@beep/iam-client/_internal";
import { client } from "@beep/iam-client/adapters";
import * as Contract from "./contract.ts";

/**
 * Phone number sign-in handler that authenticates using phone and password.
 *
 * Calls Better Auth's signIn.phoneNumber method and validates the response.
 * Mutates session state (authentication operation).
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
 * @category SignIn/PhoneNumber/Handlers
 * @since 0.1.0
 */
export const Handler = Contract.Wrapper.implement(
  Common.wrapIamMethod({
    wrapper: Contract.Wrapper,
    mutatesSession: true,
  })((encodedPayload) => client.signIn.phoneNumber(encodedPayload))
);
