/**
 * @fileoverview
 * SSO sign-in handler implementation.
 *
 * Implements the SSO sign-in contract using Better Auth's sign-in client.
 *
 * @module @beep/iam-client/sign-in/sso/handler
 * @category SignIn/SSO
 * @since 0.1.0
 */
import * as Common from "@beep/iam-client/_internal";
import { client } from "@beep/iam-client/adapters";
import * as Contract from "./contract.ts";

/**
 * SSO sign-in handler that initiates SSO authentication.
 *
 * Calls Better Auth's signIn.sso method and validates the response.
 * Mutates session state (authentication operation).
 *
 * @example
 * ```typescript
 * import * as Effect from "effect/Effect"
 * import { Sso } from "@beep/iam-client/sign-in"
 *
 * const program = Effect.gen(function* () {
 *   const result = yield* Sso.Handler({
 *     email: "user@acme.com",
 *     callbackURL: "/dashboard"
 *   })
 *   // Redirect user to SSO provider
 *   window.location.href = result.url
 * })
 * ```
 *
 * @category SignIn/SSO/Handlers
 * @since 0.1.0
 */
export const Handler = Contract.Wrapper.implement(
  Common.wrapIamMethod({
    wrapper: Contract.Wrapper,
    mutatesSession: true,
  })((encodedPayload) => client.signIn.sso(encodedPayload))
);
