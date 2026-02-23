/**
 * @fileoverview
 * Passkey sign-in handler implementation.
 *
 * Implements the passkey sign-in contract using Better Auth's sign-in client.
 *
 * @module @beep/iam-client/sign-in/passkey/handler
 * @category SignIn/Passkey
 * @since 0.1.0
 */
import * as Common from "@beep/iam-client/_internal";
import { client } from "@beep/iam-client/adapters";
import * as Contract from "./contract.ts";

/**
 * Passkey sign-in handler that authenticates using WebAuthn.
 *
 * Calls Better Auth's signIn.passkey method and validates the response.
 * Mutates session state (authentication operation).
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
 * @category SignIn/Passkey/Handlers
 * @since 0.1.0
 */
export const Handler = Contract.Wrapper.implement(
  Common.wrapIamMethod({
    wrapper: Contract.Wrapper,
    mutatesSession: true,
  })((encodedPayload) => client.signIn.passkey(encodedPayload))
);
