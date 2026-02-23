/**
 * @fileoverview
 * SSO register handler implementation.
 *
 * Implements the SSO register contract using Better Auth's SSO client.
 *
 * @module @beep/iam-client/sso/register/handler
 * @category SSO/Register
 * @since 0.1.0
 */
import * as Common from "@beep/iam-client/_internal";
import { client } from "@beep/iam-client/adapters";
import * as Contract from "./contract.ts";

/**
 * SSO register handler that creates a new SSO provider.
 *
 * Calls Better Auth's sso.register method and validates the response.
 * Does not mutate session state (admin configuration operation).
 *
 * @example
 * ```typescript
 * import * as Effect from "effect/Effect"
 * import * as Redacted from "effect/Redacted"
 * import { Register } from "@beep/iam-client/sso"
 *
 * const program = Effect.gen(function* () {
 *   const result = yield* Register.Handler({
 *     providerId: "acme-corp",
 *     issuer: "https://idp.acme.com",
 *     domain: "acme.com",
 *     oidcConfig: {
 *       clientId: "client123",
 *       clientSecret: Redacted.make("secret456")
 *     }
 *   })
 *   console.log(`Provider registered: ${result.providerId}`)
 * })
 * ```
 *
 * @category SSO/Register/Handlers
 * @since 0.1.0
 */
export const Handler = Contract.Wrapper.implement(
  Common.wrapIamMethod({
    wrapper: Contract.Wrapper,
    mutatesSession: false,
  })((encodedPayload) => client.sso.register(encodedPayload))
);
