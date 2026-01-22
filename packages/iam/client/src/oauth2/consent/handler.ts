/**
 * @fileoverview
 * Grant OAuth2 consent handler implementation.
 *
 * @module @beep/iam-client/oauth2/consent/handler
 * @category OAuth2/Consent
 * @since 0.1.0
 */
import * as Common from "@beep/iam-client/_internal";
import { client } from "@beep/iam-client/adapters";
import * as Contract from "./contract.ts";

/**
 * Grant OAuth2 consent handler.
 *
 * Calls Better Auth's oauth2.consent method to grant consent for an OAuth2 client.
 *
 * @example
 * ```typescript
 * import * as Effect from "effect/Effect"
 * import { Consent } from "@beep/iam-client/oauth2"
 *
 * const program = Effect.gen(function* () {
 *   const result = yield* Consent.Handler({
 *     clientId: "my-oauth-client",
 *     scopes: ["read", "write"]
 *   })
 *   console.log(`Consent granted: ${result.consentGiven}`)
 * })
 * ```
 *
 * @category OAuth2/Consent/Handlers
 * @since 0.1.0
 */
export const Handler = Contract.Wrapper.implement(
  Common.wrapIamMethod({
    wrapper: Contract.Wrapper,
    mutatesSession: false,
  })((encodedPayload) => client.oauth2.consent(encodedPayload))
);
