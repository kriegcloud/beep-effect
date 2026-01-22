/**
 * @fileoverview
 * Delete OAuth2 consent handler implementation.
 *
 * @module @beep/iam-client/oauth2/delete-consent/handler
 * @category OAuth2/DeleteConsent
 * @since 0.1.0
 */
import * as Common from "@beep/iam-client/_internal";
import { client } from "@beep/iam-client/adapters";
import * as Contract from "./contract.ts";

/**
 * Delete OAuth2 consent handler (revoke consent).
 *
 * Calls Better Auth's oauth2.deleteConsent method.
 *
 * @example
 * ```typescript
 * import * as Effect from "effect/Effect"
 * import { DeleteConsent } from "@beep/iam-client/oauth2"
 *
 * const program = Effect.gen(function* () {
 *   const result = yield* DeleteConsent.Handler({ consentId: "consent_123" })
 *   console.log(`Revoked: ${result.success}`)
 * })
 * ```
 *
 * @category OAuth2/DeleteConsent/Handlers
 * @since 0.1.0
 */
export const Handler = Contract.Wrapper.implement(
  Common.wrapIamMethod({
    wrapper: Contract.Wrapper,
    mutatesSession: false,
  })((encodedPayload) => client.oauth2.deleteConsent(encodedPayload))
);
