/**
 * @fileoverview
 * Update OAuth2 consent handler implementation.
 *
 * @module @beep/iam-client/oauth2/update-consent/handler
 * @category OAuth2/UpdateConsent
 * @since 0.1.0
 */
import * as Common from "@beep/iam-client/_internal";
import { client } from "@beep/iam-client/adapters";
import * as Contract from "./contract.ts";

/**
 * Update OAuth2 consent handler.
 *
 * Calls Better Auth's oauth2.updateConsent method.
 *
 * @example
 * ```typescript
 * import * as Effect from "effect/Effect"
 * import { UpdateConsent } from "@beep/iam-client/oauth2"
 *
 * const program = Effect.gen(function* () {
 *   const updated = yield* UpdateConsent.Handler({
 *     consentId: "consent_123",
 *     scopes: ["read", "write"]
 *   })
 *   console.log(`Updated scopes: ${updated.scopes.join(", ")}`)
 * })
 * ```
 *
 * @category OAuth2/UpdateConsent/Handlers
 * @since 0.1.0
 */
export const Handler = Contract.Wrapper.implement(
  Common.wrapIamMethod({
    wrapper: Contract.Wrapper,
    mutatesSession: false,
  })((encodedPayload) => client.oauth2.updateConsent(encodedPayload))
);
