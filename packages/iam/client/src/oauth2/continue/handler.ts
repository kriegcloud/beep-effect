/**
 * @fileoverview
 * Continue OAuth2 flow handler implementation.
 *
 * @module @beep/iam-client/oauth2/continue/handler
 * @category OAuth2/Continue
 * @since 0.1.0
 */
import * as Common from "@beep/iam-client/_internal";
import { client } from "@beep/iam-client/adapters";
import * as Contract from "./contract.ts";

/**
 * Continue OAuth2 flow handler.
 *
 * Calls Better Auth's oauth2.continue method to continue an authorization flow after consent.
 *
 * @example
 * ```typescript
 * import * as Effect from "effect/Effect"
 * import { Continue } from "@beep/iam-client/oauth2"
 *
 * const program = Effect.gen(function* () {
 *   const result = yield* Continue.Handler({ requestId: "auth_request_123" })
 *   window.location.href = result.redirectTo
 * })
 * ```
 *
 * @category OAuth2/Continue/Handlers
 * @since 0.1.0
 */
export const Handler = Contract.Wrapper.implement(
  Common.wrapIamMethod({
    wrapper: Contract.Wrapper,
    mutatesSession: false,
  })((encodedPayload) => client.oauth2.continue(encodedPayload))
);
