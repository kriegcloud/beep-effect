/**
 * @fileoverview
 * List OAuth2 consents handler implementation.
 *
 * @module @beep/iam-client/oauth2/get-consents/handler
 * @category OAuth2/GetConsents
 * @since 0.1.0
 */
import * as Common from "@beep/iam-client/_internal";
import { client } from "@beep/iam-client/adapters";
import * as Contract from "./contract.ts";

/**
 * List OAuth2 consents handler that retrieves all consent records for the current user.
 *
 * Calls Better Auth's oauth2.getConsents method.
 *
 * @example
 * ```typescript
 * import * as Effect from "effect/Effect"
 * import { GetConsents } from "@beep/iam-client/oauth2"
 *
 * const program = Effect.gen(function* () {
 *   const consents = yield* GetConsents.Handler
 *   console.log(`Found ${consents.length} consent records`)
 * })
 * ```
 *
 * @category OAuth2/GetConsents/Handlers
 * @since 0.1.0
 */
export const Handler = Contract.Wrapper.implement(
  Common.wrapIamMethod({
    wrapper: Contract.Wrapper,
    mutatesSession: false,
  })(() => client.oauth2.getConsents())
);
