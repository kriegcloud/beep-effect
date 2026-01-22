/**
 * @fileoverview
 * Get OAuth2 consent handler implementation.
 *
 * @module @beep/iam-client/oauth2/get-consent/handler
 * @category OAuth2/GetConsent
 * @since 0.1.0
 */
import * as Common from "@beep/iam-client/_internal";
import { client } from "@beep/iam-client/adapters";
import * as Contract from "./contract.ts";

/**
 * Get OAuth2 consent handler that retrieves a consent record.
 *
 * Calls Better Auth's oauth2.getConsent method with query-wrapped payload.
 *
 * @example
 * ```typescript
 * import * as Effect from "effect/Effect"
 * import { GetConsent } from "@beep/iam-client/oauth2"
 *
 * const program = Effect.gen(function* () {
 *   const consent = yield* GetConsent.Handler({ consentId: "consent_123" })
 *   console.log(`Scopes: ${consent.scopes.join(", ")}`)
 * })
 * ```
 *
 * @category OAuth2/GetConsent/Handlers
 * @since 0.1.0
 */
export const Handler = Contract.Wrapper.implement(
  Common.wrapIamMethod({
    wrapper: Contract.Wrapper,
    mutatesSession: false,
  })((encodedPayload) => client.oauth2.getConsent({ query: encodedPayload }))
);
